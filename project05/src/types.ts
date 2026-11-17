export type Notebook = {
  id: string;
  name: string;
  position: number;
  createdAt: string;
  noteCount: number;
};
export type Note = {
  id: string;
  notebookId: string;
  notebookName: string;
  title: string;
  body: string;
  pinned: boolean;
  trashed: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
};
export type SearchResult = { note: Note; snippet: string };
export type TimerMode = "focus" | "break";
export type TimerSnapshot = {
  mode: TimerMode;
  running: boolean;
  remainingSeconds: number;
  completedToday: number;
};
export type ImportProgress = {
  completed: number;
  total: number;
  filename: string;
};
export type ExportedMarkdown = { filename: string; content: string };
