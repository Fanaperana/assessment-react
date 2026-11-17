use std::sync::{Arc, Mutex};

use rusqlite::Connection;

use crate::error::AppResult;
use crate::timer::TimerService;

pub struct AppState {
    pub database: Arc<Mutex<Connection>>,
    pub timer: TimerService,
}

impl AppState {
    pub fn new(database: Connection) -> AppResult<Self> {
        let completed_today = crate::db::repositories::timer::completed_today(&database)?;
        Ok(Self {
            database: Arc::new(Mutex::new(database)),
            timer: TimerService::new(completed_today),
        })
    }
}
