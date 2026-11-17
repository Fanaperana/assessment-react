use crate::models::{TimerMode, TimerSnapshot};
use std::time::{Duration, Instant};

pub fn duration_for(mode: TimerMode) -> u32 {
    match mode {
        TimerMode::Focus => 25 * 60,
        TimerMode::Break => 5 * 60,
    }
}

pub fn format_remaining(seconds: u32) -> String {
    format!("{:02}:{:02}", seconds / 60, seconds % 60)
}

pub struct TimerState {
    pub mode: TimerMode,
    pub running: bool,
    pub remaining_seconds: u32,
    pub completed_today: u32,
    pub generation: u64,
    deadline: Option<Instant>,
}

impl TimerState {
    pub fn new(completed_today: u32) -> Self {
        Self {
            mode: TimerMode::Focus,
            running: false,
            remaining_seconds: duration_for(TimerMode::Focus),
            completed_today,
            generation: 0,
            deadline: None,
        }
    }
    pub fn start(&mut self, mode: TimerMode, now: Instant) {
        self.mode = mode;
        self.running = true;
        self.remaining_seconds = duration_for(mode);
        self.deadline = Some(now + Duration::from_secs(u64::from(self.remaining_seconds)));
        self.generation += 1;
    }
    pub fn stop(&mut self) {
        self.running = false;
        self.deadline = None;
        self.remaining_seconds = duration_for(self.mode);
        self.generation += 1;
    }
    pub fn tick(&mut self, now: Instant) -> bool {
        if !self.running {
            return false;
        }
        if let Some(deadline) = self.deadline {
            self.remaining_seconds =
                deadline.saturating_duration_since(now).as_secs_f64().ceil() as u32;
        }
        if self.remaining_seconds > 0 {
            return false;
        }
        self.running = false;
        self.deadline = None;
        if self.mode == TimerMode::Focus {
            self.completed_today += 1;
        }
        true
    }
    pub fn snapshot(&self) -> TimerSnapshot {
        TimerSnapshot {
            mode: self.mode,
            running: self.running,
            remaining_seconds: self.remaining_seconds,
            completed_today: self.completed_today,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn focus_duration() {
        assert_eq!(duration_for(TimerMode::Focus), 1500);
    }
    #[test]
    fn break_duration() {
        assert_eq!(duration_for(TimerMode::Break), 300);
    }
    #[test]
    fn formats_time() {
        assert_eq!(format_remaining(1509), "25:09");
    }
    #[test]
    fn formats_zero() {
        assert_eq!(format_remaining(0), "00:00");
    }
    #[test]
    fn starts_with_persisted_count() {
        assert_eq!(TimerState::new(4).snapshot().completed_today, 4);
    }
    #[test]
    fn elapsed_time_accounts_for_delayed_ticks() {
        let now = Instant::now();
        let mut state = TimerState::new(0);
        state.start(TimerMode::Focus, now);
        assert!(!state.tick(now + Duration::from_secs(90)));
        assert_eq!(state.remaining_seconds, 1410);
    }
    #[test]
    fn focus_completion_increments_count_once() {
        let now = Instant::now();
        let mut state = TimerState::new(2);
        state.start(TimerMode::Focus, now);
        assert!(state.tick(now + Duration::from_secs(1500)));
        assert!(!state.tick(now + Duration::from_secs(1600)));
        assert_eq!(state.completed_today, 3);
    }
    #[test]
    fn break_completion_does_not_increment_focus_count() {
        let now = Instant::now();
        let mut state = TimerState::new(2);
        state.start(TimerMode::Break, now);
        assert!(state.tick(now + Duration::from_secs(300)));
        assert_eq!(state.completed_today, 2);
    }
    #[test]
    fn stop_invalidates_previous_generation() {
        let mut state = TimerState::new(0);
        state.start(TimerMode::Focus, Instant::now());
        let generation = state.generation;
        state.stop();
        assert!(state.generation > generation);
        assert!(!state.running);
        assert_eq!(state.remaining_seconds, 1500);
    }
    #[test]
    fn stopped_timer_never_finishes() {
        let now = Instant::now();
        let mut state = TimerState::new(0);
        state.start(TimerMode::Break, now);
        state.stop();
        assert!(!state.tick(now + Duration::from_secs(1000)));
        assert_eq!(state.remaining_seconds, 300);
    }
}
