pub use super::tags::{set_tags, tags_for};
use rusqlite::{Connection, OptionalExtension, params};
use uuid::Uuid;

use crate::{
    error::{AppError, AppResult},
    models::Note,
};

pub fn create(
    connection: &Connection,
    notebook_id: &str,
    title: &str,
    body: &str,
) -> AppResult<Note> {
    validate_text(title, body)?;
    let exists: bool = connection.query_row(
        "SELECT EXISTS(SELECT 1 FROM notebooks WHERE id = ?1)",
        [notebook_id],
        |row| row.get(0),
    )?;
    if !exists {
        return Err(AppError::NotFound("Notebook".into()));
    }
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    connection.execute(
        "INSERT INTO notes(id, notebook_id, title, body, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?5)",
        params![id, notebook_id, title.trim(), body, now],
    )?;
    get(connection, &id)
}

pub fn get(connection: &Connection, id: &str) -> AppResult<Note> {
    let mut note = connection
        .query_row(
            "SELECT n.id, n.notebook_id, b.name, n.title, n.body, n.pinned, n.trashed,
                n.created_at, n.updated_at
         FROM notes n JOIN notebooks b ON b.id = n.notebook_id WHERE n.id = ?1",
            [id],
            |row| {
                Ok(Note {
                    id: row.get(0)?,
                    notebook_id: row.get(1)?,
                    notebook_name: row.get(2)?,
                    title: row.get(3)?,
                    body: row.get(4)?,
                    pinned: row.get(5)?,
                    trashed: row.get(6)?,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                    tags: Vec::new(),
                })
            },
        )
        .optional()?
        .ok_or_else(|| AppError::NotFound("Note".into()))?;
    note.tags = tags_for(connection, id)?;
    Ok(note)
}

pub fn list(
    connection: &Connection,
    notebook_id: Option<&str>,
    trashed: bool,
) -> AppResult<Vec<Note>> {
    let mut statement = connection.prepare(
        "SELECT n.id FROM notes n
         WHERE n.trashed = ?1 AND (?2 IS NULL OR n.notebook_id = ?2)
         ORDER BY n.pinned DESC, n.updated_at DESC",
    )?;
    let ids = statement
        .query_map(params![trashed, notebook_id], |row| row.get::<_, String>(0))?
        .collect::<Result<Vec<_>, _>>()?;
    ids.iter().map(|id| get(connection, id)).collect()
}

pub fn update(connection: &Connection, id: &str, title: &str, body: &str) -> AppResult<Note> {
    validate_text(title, body)?;
    let changed = connection.execute(
        "UPDATE notes SET title = ?1, body = ?2, updated_at = ?3 WHERE id = ?4 AND trashed = 0",
        params![title.trim(), body, chrono::Utc::now().to_rfc3339(), id],
    )?;
    if changed == 0 {
        return Err(AppError::NotFound("Active note".into()));
    }
    get(connection, id)
}

pub fn set_trashed(connection: &Connection, id: &str, trashed: bool) -> AppResult<Note> {
    let changed = connection.execute(
        "UPDATE notes SET trashed = ?1, updated_at = ?2 WHERE id = ?3",
        params![trashed, chrono::Utc::now().to_rfc3339(), id],
    )?;
    if changed == 0 {
        return Err(AppError::NotFound("Note".into()));
    }
    get(connection, id)
}

pub fn empty_trash(connection: &Connection) -> AppResult<usize> {
    Ok(connection.execute("DELETE FROM notes WHERE trashed = 1", [])?)
}

pub fn set_pinned(connection: &Connection, id: &str, pinned: bool) -> AppResult<Note> {
    let changed = connection.execute(
        "UPDATE notes SET pinned = ?1, updated_at = ?2 WHERE id = ?3 AND trashed = 0",
        params![pinned, chrono::Utc::now().to_rfc3339(), id],
    )?;
    if changed == 0 {
        return Err(AppError::NotFound("Active note".into()));
    }
    get(connection, id)
}

fn validate_text(title: &str, body: &str) -> AppResult<()> {
    if title.trim().chars().count() > 200 || body.chars().count() > 100_000 {
        return Err(AppError::Validation(
            "Title or note body is too long".into(),
        ));
    }
    Ok(())
}
