import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { api } from "./api";

export async function importFiles() {
  const paths = await open({
    multiple: true,
    filters: [{ name: "Markdown", extensions: ["md"] }],
  });
  if (!paths) return false;
  const files = await Promise.all(
    (Array.isArray(paths) ? paths : [paths]).map(async (path) => ({
      filename: path.split(/[\\/]/).pop() ?? "note.md",
      content: await readTextFile(path),
    })),
  );
  await api.importMarkdown(files);
  return true;
}

export async function exportFiles(noteId: string | null, notebookId: string) {
  const files = await api.exportMarkdown(noteId, noteId ? null : notebookId);
  if (noteId) {
    const path = await save({
      defaultPath: files[0]?.filename,
      filters: [{ name: "Markdown", extensions: ["md"] }],
    });
    if (path && files[0]) await writeTextFile(path, files[0].content);
    return;
  }
  const directory = await open({
    directory: true,
    multiple: false,
    recursive: true,
  });
  if (typeof directory !== "string") return;
  for (const file of files)
    await writeTextFile(await join(directory, file.filename), file.content);
}
