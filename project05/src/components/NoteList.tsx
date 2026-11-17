import { FilePlus2, Pin, Search } from "lucide-react";
import type { Note, SearchResult } from "../types";
import type { ReactNode } from "react";

type Props = {
  title: string;
  notes: Note[];
  selected: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  query: string;
  onQuery: (value: string) => void;
  onSearchKeyDown: (
    event: import("react").KeyboardEvent<HTMLInputElement>,
  ) => void;
  children?: ReactNode;
  snippets?: SearchResult[] | null;
  activeIndex?: number;
};
export function NoteList({
  title,
  notes,
  selected,
  onSelect,
  onCreate,
  query,
  onQuery,
  onSearchKeyDown,
  children,
  snippets,
  activeIndex,
}: Props) {
  return (
    <section className="note-list-pane">
      <div className="list-header">
        <div>
          <span className="eyebrow">YOUR SPACE</span>
          <h1>{title}</h1>
        </div>
        <button
          className="icon-button accent"
          aria-label="Create note"
          onClick={onCreate}
        >
          <FilePlus2 size={18} />
        </button>
      </div>
      <label className="search-field">
        <Search size={15} />
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          onKeyDown={onSearchKeyDown}
          placeholder="Filter notes..."
        />
      </label>
      {children}
      <div className="notes-scroll" role="listbox" aria-label="Notes">
        {notes.map((note, index) => (
          <button
            key={note.id}
            role="option"
            aria-selected={selected === note.id}
            className={`note-card ${selected === note.id ? "selected" : ""} ${query && activeIndex === index ? "keyboard-active" : ""}`}
            onClick={() => onSelect(note.id)}
          >
            <div className="note-card-title">
              {note.pinned && <Pin size={12} />} {note.title || "Untitled"}
            </div>
            <p>
              {snippets
                ?.find((row) => row.note.id === note.id)
                ?.snippet.split(/(<mark>.*?<\/mark>)/g)
                .map((part, index) =>
                  part.startsWith("<mark>") ? (
                    <mark key={index}>{part.slice(6, -7)}</mark>
                  ) : (
                    part
                  ),
                ) ??
                (note.body
                  .replace(/[#*`>]/g, "")
                  .replace(/\[|\]/g, "")
                  .slice(0, 100) ||
                  "No additional text")}
            </p>
            <div className="note-meta">
              <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
              <span>{note.tags.slice(0, 2).join(" · ")}</span>
            </div>
          </button>
        ))}
        {notes.length === 0 && (
          <div className="empty-list">
            <FilePlus2 size={22} />
            <p>No notes yet</p>
            <button onClick={onCreate}>Create your first note</button>
          </div>
        )}
      </div>
    </section>
  );
}
