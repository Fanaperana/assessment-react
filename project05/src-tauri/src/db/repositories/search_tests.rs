use rusqlite::Connection;

use crate::db::{
    connection::open_memory_database,
    repositories::{notebooks, notes, search, timer},
};
use crate::models::TimerMode;

fn database() -> Connection {
    open_memory_database().unwrap()
}

#[test]
fn search_finds_title_and_body() {
    let db = database();
    notes::create(&db, "inbox", "Rust", "ownership").unwrap();
    assert_eq!(search::search(&db, "ownership").unwrap().len(), 1);
}
#[test]
fn search_orders_matches_by_rank() {
    let db = database();
    notes::create(&db, "inbox", "rust rust", "").unwrap();
    notes::create(&db, "inbox", "other", "rust").unwrap();
    assert_eq!(
        search::search(&db, "rust").unwrap()[0].note.title,
        "rust rust"
    );
}
#[test]
fn search_ignores_trashed_notes() {
    let db = database();
    let note = notes::create(&db, "inbox", "Hidden", "secretword").unwrap();
    notes::set_trashed(&db, &note.id, true).unwrap();
    assert!(search::search(&db, "secretword").unwrap().is_empty());
}
#[test]
fn search_returns_highlighted_snippet() {
    let db = database();
    notes::create(&db, "inbox", "Title", "highlightme").unwrap();
    assert!(
        search::search(&db, "highlightme").unwrap()[0]
            .snippet
            .contains("<mark>")
    );
}
#[test]
fn empty_search_returns_no_results() {
    assert!(search::search(&database(), "!!!").unwrap().is_empty());
}
#[test]
fn timer_records_focus_completion() {
    let db = database();
    timer::record_completion(&db, TimerMode::Focus, 25).unwrap();
    assert_eq!(timer::completed_today(&db).unwrap(), 1);
}
#[test]
fn timer_counts_only_focus_sessions() {
    let db = database();
    timer::record_completion(&db, TimerMode::Break, 5).unwrap();
    assert_eq!(timer::completed_today(&db).unwrap(), 0);
}
#[test]
fn notebook_delete_moves_notes_to_inbox() {
    let mut db = database();
    let book = notebooks::create(&db, "Work").unwrap();
    let note = notes::create(&db, &book.id, "Task", "").unwrap();
    notebooks::delete(&mut db, &book.id).unwrap();
    assert_eq!(notes::get(&db, &note.id).unwrap().notebook_id, "inbox");
}
