import { Book, Plus, Search, Trash2, Pencil } from "lucide-react";
import type { Notebook } from "../types";

type Props = {
  notebooks: Notebook[];
  selected: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onSearch: () => void;
  onTrash: () => void;
  onRename?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function Sidebar({
  notebooks,
  selected,
  onSelect,
  onCreate,
  onSearch,
  onTrash,
  onRename,
  onDelete,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-icon">✦</span>
        <span>FocusNotes</span>
      </div>
      <button className="side-action" onClick={onSearch}>
        <Search size={16} /> Search <kbd>⌘ F</kbd>
      </button>
      <div className="section-heading">
        <span>LIBRARY</span>
        <button aria-label="New notebook" onClick={onCreate}>
          <Plus size={15} />
        </button>
      </div>
      <nav aria-label="Notebooks">
        {notebooks.map((book) => (
          <div className="notebook-row" key={book.id}>
            <button
              className={`nav-item ${selected === book.id ? "active" : ""}`}
              onClick={() => onSelect(book.id)}
            >
              <Book size={16} />
              <span>{book.name}</span>
              <small>{book.noteCount}</small>
            </button>
            {book.id !== "inbox" && (
              <>
                <button
                  className="icon-button"
                  aria-label={`Rename ${book.name}`}
                  onClick={() => onRename?.(book.id)}
                >
                  <Pencil size={12} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Delete ${book.name}`}
                  onClick={() => onDelete?.(book.id)}
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="nav-item" onClick={onTrash}>
          <Trash2 size={16} /> Trash
        </button>
      </div>
    </aside>
  );
}
