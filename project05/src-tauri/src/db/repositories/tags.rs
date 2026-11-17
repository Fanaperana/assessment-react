use crate::{
    error::{AppError, AppResult},
    models::Note,
};
use rusqlite::{Connection, params};
use uuid::Uuid;

pub fn set_tags(connection: &mut Connection, note_id: &str, names: &[String]) -> AppResult<Note> {
    let transaction = connection.transaction()?;
    let exists: bool = transaction.query_row(
        "SELECT EXISTS(SELECT 1 FROM notes WHERE id = ?1 AND trashed = 0)",
        [note_id],
        |row| row.get(0),
    )?;
    if !exists {
        return Err(AppError::NotFound("Active note".into()));
    }
    transaction.execute("DELETE FROM note_tags WHERE note_id = ?1", [note_id])?;
    for name in names
        .iter()
        .map(|name| name.trim())
        .filter(|name| !name.is_empty())
    {
        if name.chars().count() > 40 {
            return Err(AppError::Validation(
                "Tags may be at most 40 characters".into(),
            ));
        }
        transaction.execute(
            "INSERT OR IGNORE INTO tags(id, name) VALUES (?1, ?2)",
            params![Uuid::new_v4().to_string(), name],
        )?;
        transaction.execute(
            "INSERT OR IGNORE INTO note_tags(note_id, tag_id)
             SELECT ?1, id FROM tags WHERE name = ?2 COLLATE NOCASE",
            params![note_id, name],
        )?;
    }
    transaction.commit()?;
    super::notes::get(connection, note_id)
}

pub fn tags_for(connection: &Connection, note_id: &str) -> AppResult<Vec<String>> {
    let mut statement = connection.prepare(
        "SELECT t.name FROM tags t JOIN note_tags nt ON nt.tag_id = t.id
         WHERE nt.note_id = ?1 ORDER BY t.name COLLATE NOCASE",
    )?;
    let rows = statement.query_map([note_id], |row| row.get(0))?;
    rows.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}
