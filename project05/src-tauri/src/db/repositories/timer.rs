use rusqlite::{Connection, params};

use crate::error::AppResult;
use crate::models::TimerMode;

pub fn completed_today(connection: &Connection) -> AppResult<u32> {
    Ok(connection.query_row(
        "SELECT COUNT(*) FROM focus_sessions
         WHERE kind = 'focus' AND date(completed_at, 'localtime') = date('now', 'localtime')",
        [],
        |row| row.get(0),
    )?)
}

pub fn record_completion(connection: &Connection, mode: TimerMode, minutes: u32) -> AppResult<()> {
    let kind = match mode {
        TimerMode::Focus => "focus",
        TimerMode::Break => "break",
    };
    connection.execute(
        "INSERT INTO focus_sessions(id, kind, duration_minutes, completed_at)
         VALUES (?1, ?2, ?3, ?4)",
        params![
            uuid::Uuid::new_v4().to_string(),
            kind,
            minutes,
            chrono::Utc::now().to_rfc3339(),
        ],
    )?;
    Ok(())
}
