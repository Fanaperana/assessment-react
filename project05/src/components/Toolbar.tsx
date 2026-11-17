import {
  FileDown,
  FileUp,
  Moon,
  PanelLeft,
  Plus,
  Sun,
  Timer,
} from "lucide-react";
import type { TimerMode, TimerSnapshot } from "../types";

type Props = {
  timer: TimerSnapshot | null;
  onTimer: () => void;
  onMode: (mode: TimerMode) => void;
  onImport: () => void;
  onExport: () => void;
  onExportNotebook: () => void;
  onCreate: () => void;
  onSidebar: () => void;
  dark: boolean;
  onTheme: () => void;
};
export function Toolbar(props: Props) {
  const seconds = props.timer?.remainingSeconds ?? 1500;
  return (
    <div className="top-actions">
      <button
        className="icon-button"
        aria-label="Toggle sidebar"
        onClick={props.onSidebar}
      >
        <PanelLeft size={16} />
      </button>
      <button
        className="icon-button"
        title="Import Markdown"
        onClick={props.onImport}
      >
        <FileUp size={16} />
      </button>
      <button
        className="icon-button"
        title="Export note"
        onClick={props.onExport}
      >
        <FileDown size={16} />
      </button>
      <button className="text-button" onClick={props.onExportNotebook}>
        Export notebook
      </button>
      <select
        aria-label="Timer mode"
        value={props.timer?.mode ?? "focus"}
        onChange={(event) => props.onMode(event.target.value as TimerMode)}
      >
        <option value="focus">Focus 25m</option>
        <option value="break">Break 5m</option>
      </select>
      <button
        className="timer-button"
        aria-label={props.timer?.running ? "Stop timer" : "Start timer"}
        onClick={props.onTimer}
      >
        <Timer size={15} />
        {String(Math.floor(seconds / 60)).padStart(2, "0")}:
        {String(seconds % 60).padStart(2, "0")}
      </button>
      <span className="completion-count">
        {props.timer?.completedToday ?? 0} today
      </span>
      <button
        className="icon-button"
        aria-label="Toggle theme"
        onClick={props.onTheme}
      >
        {props.dark ? <Sun size={17} /> : <Moon size={17} />}
      </button>
      <button className="new-note-top" onClick={props.onCreate}>
        <Plus size={15} />
        New note
      </button>
    </div>
  );
}
