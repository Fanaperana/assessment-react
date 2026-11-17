use rusqlite::{Connection, params};

use crate::{error::AppResult, models::SearchResult};

use super::notes;

pub fn search(connection: &Connection, input: &str) -> AppResult<Vec<SearchResult>> {
    let query = input
        .split_whitespace()
        .filter(|word| word.chars().any(char::is_alphanumeric))
        .take(12)
        .map(|word| format!("\"{}\"*", word.replace('"', "")))
        .collect::<Vec<_>>()
        .join(" AND ");
    if query.is_empty() {
        return Ok(Vec::new());
    }

    let mut statement = connection.prepare(
        "SELECT f.note_id, snippet(notes_fts, -1, '<mark>', '</mark>', '…', 12)
         FROM notes_fts f JOIN notes n ON n.id = f.note_id
         WHERE notes_fts MATCH ?1 AND n.trashed = 0
         ORDER BY bm25(notes_fts) LIMIT 100",
    )?;
    let rows = statement
        .query_map(params![query], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })?
        .collect::<Result<Vec<_>, _>>()?;
    rows.into_iter()
        .map(|(id, snippet)| {
            Ok(SearchResult {
                note: notes::get(connection, &id)?,
                snippet,
            })
        })
        .collect()
}
