use rusqlite::{Connection, params};
use uuid::Uuid;

use crate::{
    error::{AppError, AppResult},
    models::Notebook,
};

pub fn list(connection: &Connection) -> AppResult<Vec<Notebook>> {
    let mut statement = connection.prepare(
        "SELECT b.id, b.name, b.position, b.created_at,
                COUNT(n.id) AS note_count
         FROM notebooks b LEFT JOIN notes n ON n.notebook_id = b.id AND n.trashed = 0
         GROUP BY b.id ORDER BY b.position, b.name COLLATE NOCASE",
    )?;
    let rows = statement.query_map([], |row| {
        Ok(Notebook {
            id: row.get(0)?,
            name: row.get(1)?,
            position: row.get(2)?,
            created_at: row.get(3)?,
            note_count: row.get(4)?,
        })
    })?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}

pub fn create(connection: &Connection, name: &str) -> AppResult<Notebook> {
    let name = validate_name(name)?;
    let id = Uuid::new_v4().to_string();
    let created_at = chrono::Utc::now().to_rfc3339();
    connection
        .execute(
            "INSERT INTO notebooks(id, name, position, created_at)
         VALUES (?1, ?2, (SELECT COALESCE(MAX(position), 0) + 1 FROM notebooks), ?3)",
            params![id, name, created_at],
        )
        .map_err(map_unique)?;
    get(connection, &id)
}

pub fn rename(connection: &Connection, id: &str, name: &str) -> AppResult<Notebook> {
    let name = validate_name(name)?;
    if id == "inbox" {
        return Err(AppError::Conflict(
            "The Inbox notebook cannot be renamed".into(),
        ));
    }
    let changed = connection
        .execute(
            "UPDATE notebooks SET name = ?1 WHERE id = ?2",
            params![name, id],
        )
        .map_err(map_unique)?;
    if changed == 0 {
        return Err(AppError::NotFound("Notebook".into()));
    }
    get(connection, id)
}

pub fn delete(connection: &mut Connection, id: &str) -> AppResult<()> {
    if id == "inbox" {
        return Err(AppError::Conflict(
            "The Inbox notebook cannot be deleted".into(),
        ));
    }
    let transaction = connection.transaction()?;
    transaction.execute(
        "UPDATE notes SET notebook_id = 'inbox', updated_at = ?1 WHERE notebook_id = ?2",
        params![chrono::Utc::now().to_rfc3339(), id],
    )?;
    let deleted = transaction.execute("DELETE FROM notebooks WHERE id = ?1", [id])?;
    if deleted == 0 {
        return Err(AppError::NotFound("Notebook".into()));
    }
    transaction.commit()?;
    Ok(())
}

fn get(connection: &Connection, id: &str) -> AppResult<Notebook> {
    connection
        .query_row(
            "SELECT b.id, b.name, b.position, b.created_at,
                COUNT(n.id) AS note_count
         FROM notebooks b LEFT JOIN notes n ON n.notebook_id = b.id AND n.trashed = 0
         WHERE b.id = ?1 GROUP BY b.id",
            [id],
            |row| {
                Ok(Notebook {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    position: row.get(2)?,
                    created_at: row.get(3)?,
                    note_count: row.get(4)?,
                })
            },
        )
        .optional()?
        .ok_or_else(|| AppError::NotFound("Notebook".into()))
}

fn validate_name(name: &str) -> AppResult<String> {
    let name = name.trim();
    if name.is_empty() || name.chars().count() > 80 {
        return Err(AppError::Validation(
            "Notebook names must be 1–80 characters".into(),
        ));
    }
    Ok(name.to_owned())
}

fn map_unique(error: rusqlite::Error) -> AppError {
    if matches!(&error, rusqlite::Error::SqliteFailure(code, _)
        if code.code == rusqlite::ErrorCode::ConstraintViolation)
    {
        AppError::Conflict("A notebook with this name already exists".into())
    } else {
        AppError::Database(error)
    }
}

use rusqlite::OptionalExtension;
