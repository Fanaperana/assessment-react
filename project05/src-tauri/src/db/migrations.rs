use rusqlite::Connection;

use crate::error::{AppError, AppResult};

const INITIAL_SCHEMA: &str = r#"
CREATE TABLE notebooks (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE notes (
  id TEXT PRIMARY KEY NOT NULL,
  notebook_id TEXT NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  pinned INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0, 1)),
  trashed INTEGER NOT NULL DEFAULT 0 CHECK (trashed IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX notes_notebook_updated ON notes(notebook_id, trashed, updated_at DESC);
CREATE TABLE tags (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL COLLATE NOCASE UNIQUE);
CREATE TABLE note_tags (
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY(note_id, tag_id)
);
CREATE TABLE focus_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('focus', 'break')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  completed_at TEXT NOT NULL
);
CREATE INDEX focus_sessions_completed ON focus_sessions(completed_at);
CREATE VIRTUAL TABLE notes_fts USING fts5(note_id UNINDEXED, title, body);
CREATE TRIGGER notes_fts_insert AFTER INSERT ON notes BEGIN
  INSERT INTO notes_fts(note_id, title, body) VALUES (new.id, new.title, new.body);
END;
CREATE TRIGGER notes_fts_update AFTER UPDATE OF title, body ON notes BEGIN
  DELETE FROM notes_fts WHERE note_id = old.id;
  INSERT INTO notes_fts(note_id, title, body) VALUES (new.id, new.title, new.body);
END;
CREATE TRIGGER notes_fts_delete AFTER DELETE ON notes BEGIN
  DELETE FROM notes_fts WHERE note_id = old.id;
END;
INSERT INTO notebooks(id, name, position, created_at)
VALUES ('inbox', 'Inbox', 0, CURRENT_TIMESTAMP);
"#;

pub fn migrate(connection: &Connection) -> AppResult<()> {
    let version: i64 = connection.pragma_query_value(None, "user_version", |row| row.get(0))?;
    if version > 1 {
        return Err(AppError::Setup(format!(
            "Database version {version} is newer than this app supports"
        )));
    }
    if version == 0 {
        let transaction = connection.unchecked_transaction()?;
        transaction.execute_batch(INITIAL_SCHEMA)?;
        transaction.pragma_update(None, "user_version", 1)?;
        transaction.commit()?;
    }
    Ok(())
}
