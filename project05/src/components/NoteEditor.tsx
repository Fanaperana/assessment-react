import { Eye, EyeOff, Pin, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Note } from "../types";

type Props = {
  note: Note | null;
  onChange: (title: string, body: string) => void;
  onTags: (tags: string[]) => void;
  onTrash: () => void;
  onPin: () => void;
  onRestore: () => void;
  saving: boolean;
};
export function NoteEditor({
  note,
  onChange,
  onTags,
  onTrash,
  onPin,
  onRestore,
  saving,
}: Props) {
  const [preview, setPreview] = useState(true);
  const [tags, setTags] = useState("");
  const tagText = note?.tags.join(", ") ?? "";
  useEffect(() => setTags(tagText), [note?.id, tagText]);
  if (!note)
    return (
      <section className="editor-empty">
        <div className="empty-mark">✦</div>
        <h2>Your thoughts, in focus.</h2>
        <p>Select a note or create something new to get started.</p>
      </section>
    );
  return (
    <section className="editor-pane">
      <header className="editor-toolbar">
        <span className="save-status">
          <i className={saving ? "saving" : "saved"} />
          {saving ? "Saving changes…" : "All changes saved"}
        </span>
        <div>
          <button
            className="icon-button"
            aria-label={preview ? "Hide preview" : "Show preview"}
            onClick={() => setPreview(!preview)}
          >
            {preview ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
          <button
            className="icon-button"
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
            onClick={onPin}
          >
            <Pin size={17} />
          </button>
          <button
            className="icon-button danger"
            aria-label={note.trashed ? "Restore note" : "Move to trash"}
            onClick={note.trashed ? onRestore : onTrash}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </header>
      <div className="editor-content">
        <div className="write-pane">
          <input
            className="title-input"
            aria-label="Note title"
            value={note.title}
            maxLength={200}
            readOnly={note.trashed}
            onChange={(event) => onChange(event.target.value, note.body)}
            placeholder="Untitled"
          />
          <input
            className="tags-input"
            aria-label="Tags"
            value={tags}
            readOnly={note.trashed}
            onChange={(event) => setTags(event.target.value)}
            onBlur={() =>
              !note.trashed &&
              tags !== tagText &&
              onTags(
                tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              )
            }
            placeholder="Add tags, separated by commas"
          />
          <textarea
            aria-label="Note body"
            value={note.body}
            maxLength={100000}
            readOnly={note.trashed}
            onChange={(event) => onChange(note.title, event.target.value)}
            placeholder="Start writing in Markdown…"
          />
        </div>
        {preview && (
          <div className="preview-pane" aria-label="Markdown preview">
            <span className="eyebrow">PREVIEW</span>
            <article className="markdown">
              <Markdown skipHtml remarkPlugins={[remarkGfm]}>
                {note.body}
              </Markdown>
            </article>
          </div>
        )}
      </div>
    </section>
  );
}
