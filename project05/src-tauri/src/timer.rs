use std::sync::Arc;
use std::time::{Duration, Instant};

use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_notification::NotificationExt;
use tokio::sync::Mutex;

use crate::models::{TimerMode, TimerSnapshot};
use crate::state::AppState;

use crate::timer_logic::{TimerState, duration_for, format_remaining};

#[derive(Clone)]
pub struct TimerService {
    state: Arc<Mutex<TimerState>>,
}

impl TimerService {
    pub fn new(completed_today: u32) -> Self {
        Self {
            state: Arc::new(Mutex::new(TimerState::new(completed_today))),
        }
    }

    pub async fn snapshot(&self) -> TimerSnapshot {
        self.state.lock().await.snapshot()
    }

    pub async fn start(&self, app: AppHandle, mode: TimerMode) -> TimerSnapshot {
        let mut state = self.state.lock().await;
        if state.running {
            return state.snapshot();
        }
        state.start(mode, Instant::now());
        let generation = state.generation;
        let snapshot = state.snapshot();
        drop(state);
        emit_tick(&app, &snapshot);
        self.spawn_ticks(app, generation);
        snapshot
    }

    pub async fn stop(&self, app: &AppHandle) -> TimerSnapshot {
        let mut state = self.state.lock().await;
        state.stop();
        let snapshot = state.snapshot();
        drop(state);
        emit_tick(app, &snapshot);
        snapshot
    }

    pub async fn toggle(&self, app: AppHandle) -> TimerSnapshot {
        let snapshot = self.snapshot().await;
        if snapshot.running {
            self.stop(&app).await
        } else {
            self.start(app, snapshot.mode).await
        }
    }

    fn spawn_ticks(&self, app: AppHandle, generation: u64) {
        let shared = Arc::clone(&self.state);
        tauri::async_runtime::spawn(async move {
            loop {
                tokio::time::sleep(Duration::from_secs(1)).await;
                let (snapshot, completed) = {
                    let mut state = shared.lock().await;
                    if !state.running || state.generation != generation {
                        break;
                    }
                    state.completed_today = daily_count(&app).unwrap_or(state.completed_today);
                    let completed = state.tick(Instant::now());
                    (state.snapshot(), completed)
                };
                emit_tick(&app, &snapshot);
                if completed {
                    record_and_notify(&app, snapshot.mode);
                    break;
                }
            }
        });
    }
}

fn emit_tick(app: &AppHandle, snapshot: &TimerSnapshot) {
    let _ = app.emit("timer://tick", snapshot);
    if let Some(tray) = app.tray_by_id("focusnotes") {
        let label = if snapshot.running {
            format_remaining(snapshot.remaining_seconds)
        } else {
            "FocusNotes".to_owned()
        };
        let _ = tray.set_title(Some(&label));
        let _ = tray.set_tooltip(Some(format!("FocusNotes ? {label}")));
    }
}

fn record_and_notify(app: &AppHandle, mode: TimerMode) {
    if let Some(state) = app.try_state::<AppState>() {
        if let Ok(database) = state.database.lock() {
            let minutes = duration_for(mode) / 60;
            let _ = crate::db::repositories::timer::record_completion(&database, mode, minutes);
        }
    }
    let (title, body) = match mode {
        TimerMode::Focus => ("Focus session complete", "Time for a short break."),
        TimerMode::Break => ("Break complete", "Ready for another focus session?"),
    };
    let _ = app.notification().builder().title(title).body(body).show();
}

fn daily_count(app: &AppHandle) -> Option<u32> {
    let state = app.try_state::<AppState>()?;
    let database = state.database.lock().ok()?;
    crate::db::repositories::timer::completed_today(&database).ok()
}
