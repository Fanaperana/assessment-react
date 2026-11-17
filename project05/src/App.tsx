import { api } from "./lib/api";
import { Sidebar } from "./components/Sidebar";
import { NoteList } from "./components/NoteList";
import { NoteEditor } from "./components/NoteEditor";
import { QuickCapture } from "./components/QuickCapture";
import { Toolbar } from "./components/Toolbar";
import { AppDialog } from "./components/AppDialog";
import { useWorkspace } from "./hooks/useWorkspace";
import "./App.css";

function Workspace() {
  const {
    message,
    setMessage,
    timer,
    setTimer,
    collapsed,
    setCollapsed,
    notes,
    theme,
    run,
    focusSearch,
    actions,
    createNotebook,
    renameNotebook,
    deleteNotebook,
    shortcuts,
    searchKeys,
    dialog,
    emptyTrash,
  } = useWorkspace();
  return (
    <main
      className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}
      onKeyDown={shortcuts}
    >
      {!collapsed && (
        <Sidebar
          notebooks={notes.notebooks}
          selected={notes.notebookId}
          onSelect={(id) => run(() => notes.navigate(id))}
          onCreate={() => run(createNotebook)}
          onSearch={focusSearch}
          onTrash={() => run(() => notes.navigate(notes.notebookId, true))}
          onRename={(id) => run(() => renameNotebook(id))}
          onDelete={(id) => run(() => deleteNotebook(id))}
        />
      )}
      <NoteList
        title={notes.trash ? "Trash" : notes.query ? "Search results" : "Notes"}
        notes={notes.notes}
        selected={notes.selectedId}
        onSelect={(id) => run(() => notes.select(id))}
        onCreate={actions["new-note"]}
        query={notes.query}
        onQuery={notes.setQuery}
        onSearchKeyDown={searchKeys}
        snippets={notes.results}
        activeIndex={notes.searchIndex}
      >
        <label className="tag-filter">
          Tag{" "}
          <select
            aria-label="Filter by tag"
            value={notes.tag}
            onChange={(event) => notes.setTag(event.target.value)}
          >
            <option value="">All tags</option>
            {notes.tags.map((tag) => (
              <option key={tag}>{tag}</option>
            ))}
          </select>
        </label>
        {notes.trash && (
          <button
            className="text-button danger"
            onClick={() => run(emptyTrash)}
          >
            Empty trash
          </button>
        )}
      </NoteList>
      <NoteEditor
        note={notes.selected}
        onChange={notes.change}
        onTags={(tags) =>
          run(() => notes.mutate((note) => api.setTags(note.id, tags)))
        }
        onTrash={actions.trash}
        onPin={() =>
          run(() =>
            notes.mutate((note) => api.setPinned(note.id, !note.pinned)),
          )
        }
        onRestore={() =>
          run(() => notes.mutate((note) => api.restoreNote(note.id)))
        }
        saving={notes.saving}
      />
      <Toolbar
        timer={timer}
        onTimer={() =>
          run(async () =>
            setTimer(
              timer?.running
                ? await api.stopTimer()
                : await api.startTimer(timer?.mode ?? "focus"),
            ),
          )
        }
        onMode={(mode) =>
          run(async () => {
            await api.stopTimer();
            setTimer(await api.startTimer(mode));
          })
        }
        onImport={actions.import}
        onExport={actions.export}
        onExportNotebook={actions["export-notebook"]}
        onCreate={actions["new-note"]}
        onSidebar={() => setCollapsed(!collapsed)}
        dark={theme.dark}
        onTheme={theme.toggle}
      />
      <AppDialog request={dialog.request} finish={dialog.finish} />
      {message && (
        <button role="status" className="toast" onClick={() => setMessage("")}>
          {message} <span>×</span>
        </button>
      )}
    </main>
  );
}

export default function App() {
  return new URLSearchParams(location.search).has("quickCapture") ? (
    <QuickCapture />
  ) : (
    <Workspace />
  );
}
