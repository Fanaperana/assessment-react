# Project 09 — HabitLoop 📱 (Expo + React Native)

Build **HabitLoop**, an offline-first **mobile** habit tracker for Android and iOS, with **Expo** and **React Native**.

Your React knowledge transfers, but the platform is different: native components instead of the DOM, navigation stacks, gestures, animations on the UI thread, local databases, notifications, and devices of every size.

- **Level:** Advanced (new platform)
- **Suggested time:** 3 weeks
- **Run it on a real phone** with the Expo Go app (or a development build). Test on Android **and** iOS if you can (or one phone + one emulator).

---

## 1. What you are building

A user can:

1. Create habits: name, icon, color, schedule (every day / specific weekdays / X times per week), optional daily reminder time.
2. See **Today**: the habits due today, and check them off with a tap or a **swipe**.
3. See the **streak**, the best streak, and a calendar heat map per habit.
4. See **Stats**: completion rate per week and per month with charts.
5. Get a **local notification** at the reminder time if the habit is not done.
6. Archive, edit and reorder habits.
7. Export all data to a JSON file and import it again.

Everything works **offline**. There is no server.

---

## 2. Rules

- ✅ Expo SDK (latest) + **Expo Router** + TypeScript (already set up).
- ✅ Allowed: `expo-sqlite`, `expo-notifications`, `expo-haptics`, `expo-file-system`, `expo-sharing`, `expo-document-picker`, `react-native-reanimated`, `react-native-gesture-handler`, `react-native-svg`, `date-fns`.
- ✅ Styling: `StyleSheet` or NativeWind. Your choice.
- ❌ No web views for screens. No chart libraries — draw the charts with `react-native-svg`.
- ❌ No state libraries. React state + context + the database are enough.

---

## 3. Requirements

### Part A — Navigation (Expo Router)

- **A1** Tabs: **Today**, **Habits**, **Stats**, **Settings**.
- **A2** Stack screens: habit details `/habit/[id]`, edit `/habit/[id]/edit`. A **modal** route for "New habit".
- **A3** Typed routes (`href` types) and deep links: `habitloop://habit/123` opens the habit.

### Part B — Local database

- **B1** `expo-sqlite` with a **migration** system (`PRAGMA user_version`).
- **B2** Tables: `habits`, `completions` (habit, date, time), `settings`. Indexes for the queries you run.
- **B3** A data layer in `src/db/` with typed functions. Screens never write SQL.
- **B4** Use `SQLiteProvider` + `useSQLiteContext`, and update screens when data changes (a small event emitter or `addDatabaseChangeListener`).

### Part C — Habit logic (pure functions)

- **C1** `isDue(habit, date)`, `currentStreak(habit, completions, today)`, `bestStreak(...)`, `completionRate(...)` as pure functions in `src/domain/`.
- **C2** Correct handling of time zones and day boundaries (a completion at 23:59 counts for that day). Use the device's local date, not UTC.
- **C3** "X times per week" habits count streaks in weeks, not days.

### Part D — UI and interaction

- **D1** **Swipe to complete** on Today (Reanimated + Gesture Handler), with haptic feedback and an undo snackbar.
- **D2** A completion **animation** that runs on the UI thread (Reanimated shared values / layout animations).
- **D3** Heat-map calendar and weekly bar chart drawn with `react-native-svg`.
- **D4** Reorder habits with drag and drop (long press).
- **D5** Light and dark theme from the system, with a manual override in Settings.

### Part E — Notifications

- **E1** Ask for notification permission at the right moment (when the user sets a reminder), and handle "denied".
- **E2** Schedule a daily (or weekday) local notification per habit. Cancel / reschedule when the habit changes.
- **E3** Tapping the notification opens the habit (deep link).

### Part F — Files

- **F1** Export: write a JSON file and open the share sheet (`expo-sharing`).
- **F2** Import: pick a file, **validate it with Zod**, show a summary, and merge or replace.

### Part G — Quality on devices

- **G1** Works on small (iPhone SE size) and large screens, in portrait. Respects safe areas and the keyboard (`KeyboardAvoidingView`).
- **G2** Accessibility: `accessibilityLabel`, `accessibilityRole`, `accessibilityState` on interactive elements; supports large system font sizes.
- **G3** Lists use `FlatList` / `FlashList` with stable keys. No jank when you scroll 200 habits (add a dev-only "seed 200 habits" button).

### Part H — Testing

- **H1** Jest (`jest-expo`) unit tests for all functions in `src/domain/` (table-driven, with time-zone cases).
- **H2** React Native Testing Library tests for at least 4 screens/components (mock the database layer).
- **H3** At least **35** tests.
- **H4** A short screen recording of the app on a phone in the PR.

---

## 4. Bonus (up to +15)

- **X1** Build an installable APK / IPA with **EAS Build** and share the link.
- **X2** A home-screen widget (Android with `react-native-android-widget`, or iOS with Expo's widget support).
- **X3** End-to-end tests with **Maestro**.
- **X4** Sync between two devices through a tiny API (you can reuse Project 10 later).
- **X5** Localization (2 languages) with `expo-localization`.

---

## 5. Grading (100 points)

| Area | Points |
| --- | --- |
| A — Navigation and deep links | 10 |
| B — SQLite, migrations, data layer | 15 |
| C — Habit logic and dates | 15 |
| D — Gestures, animations, charts, theme | 20 |
| E — Notifications | 10 |
| F — Export / import | 5 |
| G — Devices, accessibility, list performance | 10 |
| H — Tests | 10 |
| Code quality (Q1–Q5) | 5 |

Passing grade: 70. See the [general rules](../README.md#general-rules-for-every-project) and [how to submit](../README.md#how-to-submit-your-work).
