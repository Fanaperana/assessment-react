use rusqlite::Connection;
use tauri::{AppHandle, Manager};

use crate::error::{AppError, AppResult};

pub fn open_app_database(app: &AppHandle) -> AppResult<Connection> {
    let directory = app
        .path()
        .app_data_dir()
        .map_err(|error| AppError::Setup(error.to_string()))?;
    std::fs::create_dir_all(&directory)?;
    let connection = Connection::open(directory.join("focusnotes.sqlite"))?;
    configure(&connection)?;
    super::migrations::migrate(&connection)?;
    Ok(connection)
}

#[cfg(test)]
pub fn open_memory_database() -> AppResult<Connection> {
    let connection = Connection::open_in_memory()?;
    configure(&connection)?;
    super::migrations::migrate(&connection)?;
    Ok(connection)
}

fn configure(connection: &Connection) -> AppResult<()> {
    connection.pragma_update(None, "foreign_keys", true)?;
    connection.busy_timeout(std::time::Duration::from_secs(5))?;
    Ok(())
}
