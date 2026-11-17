use serde::Serializer;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("File operation failed: {0}")]
    Io(#[from] std::io::Error),
    #[error("Item not found: {0}")]
    NotFound(String),
    #[error("Invalid input: {0}")]
    Validation(String),
    #[error("This operation conflicts with existing data: {0}")]
    Conflict(String),
    #[error("Application setup failed: {0}")]
    Setup(String),
}

impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type AppResult<T> = Result<T, AppError>;
