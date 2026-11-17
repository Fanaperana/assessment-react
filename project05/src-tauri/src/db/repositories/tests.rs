use rusqlite::Connection;

use crate::db::{
    connection::open_memory_database,
    repositories::{notebooks, notes},
};
use crate::error::AppError;

fn database() -> Connection {
    open_memory_database().unwrap()
}

#[test]
fn migration_creates_inbox() {
    assert_eq!(notebooks::list(&database()).unwrap()[0].name, "Inbox");
}
#[test]
fn migration_sets_schema_version() {
    assert_eq!(
        database()
            .pragma_query_value(None, "user_version", |row| row.get::<_, i64>(0))
            .unwrap(),
        1
    );
}
#[test]
fn notebook_create_trims_name() {
    assert_eq!(
        notebooks::create(&database(), "  Work  ").unwrap().name,
        "Work"
    );
}
#[test]
fn notebook_create_rejects_empty_name() {
    assert!(matches!(
        notebooks::create(&database(), " "),
        Err(AppError::Validation(_))
    ));
}
#[test]
fn notebook_create_rejects_duplicate_name() {
    let db = database();
    notebooks::create(&db, "Work").unwrap();
    assert!(matches!(
        notebooks::create(&db, "Work"),
        Err(AppError::Conflict(_))
    ));
}
#[test]
fn inbox_cannot_be_renamed() {
    assert!(matches!(
        notebooks::rename(&database(), "inbox", "Home"),
        Err(AppError::Conflict(_))
    ));
}
#[test]
fn inbox_cannot_be_deleted() {
    assert!(matches!(
        notebooks::delete(&mut database(), "inbox"),
        Err(AppError::Conflict(_))
    ));
}
#[test]
fn note_create_trims_title() {
    assert_eq!(
        notes::create(&database(), "inbox", " Note ", "body")
            .unwrap()
            .title,
        "Note"
    );
}
#[test]
fn note_create_rejects_unknown_notebook() {
    assert!(matches!(
        notes::create(&database(), "missing", "Note", ""),
        Err(AppError::NotFound(_))
    ));
}
#[test]
fn note_update_changes_body() {
    let db = database();
    let note = notes::create(&db, "inbox", "A", "old").unwrap();
    assert_eq!(
        notes::update(&db, &note.id, "A", "new").unwrap().body,
        "new"
    );
}
#[test]
fn note_pin_is_persisted() {
    let db = database();
    let note = notes::create(&db, "inbox", "A", "").unwrap();
    assert!(notes::set_pinned(&db, &note.id, true).unwrap().pinned);
}
#[test]
fn note_trash_hides_from_active_list() {
    let db = database();
    let note = notes::create(&db, "inbox", "A", "").unwrap();
    notes::set_trashed(&db, &note.id, true).unwrap();
    assert!(notes::list(&db, None, false).unwrap().is_empty());
}
#[test]
fn note_restore_returns_to_active_list() {
    let db = database();
    let note = notes::create(&db, "inbox", "A", "").unwrap();
    notes::set_trashed(&db, &note.id, true).unwrap();
    notes::set_trashed(&db, &note.id, false).unwrap();
    assert_eq!(notes::list(&db, None, false).unwrap().len(), 1);
}
#[test]
fn empty_trash_deletes_only_trashed_notes() {
    let db = database();
    let active = notes::create(&db, "inbox", "Active", "").unwrap();
    let old = notes::create(&db, "inbox", "Old", "").unwrap();
    notes::set_trashed(&db, &old.id, true).unwrap();
    assert_eq!(notes::empty_trash(&db).unwrap(), 1);
    assert_eq!(notes::get(&db, &active.id).unwrap().title, "Active");
}
#[test]
fn tags_are_saved_and_case_insensitive() {
    let mut db = database();
    let note = notes::create(&db, "inbox", "A", "").unwrap();
    let tagged = notes::set_tags(&mut db, &note.id, &["Work".into(), "work".into()]).unwrap();
    assert_eq!(tagged.tags.len(), 1);
}
