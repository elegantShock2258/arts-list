"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export default function UploadForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const form = event.currentTarget;
      const response = await fetch("/api/upload", {
        method: "POST",
        body: new FormData(form),
      });
      const result = (await response.json()) as { message?: string; folder?: string };

      if (!response.ok) {
        throw new Error(result.message || "Upload failed.");
      }

      setMessage(`Article uploaded successfully to ${result.folder}.`);
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
      <div className="space-y-2">
        <label htmlFor="title" className="block font-medium">Article title</label>
        <input id="title" name="title" required maxLength={160} className="w-full rounded border p-2" />
      </div>

      <div className="space-y-2">
        <label htmlFor="markdown" className="block font-medium">Markdown article (.md)</label>
        <input id="markdown" name="markdown" type="file" required accept=".md,.markdown,text/markdown,text/plain" className="block w-full" />
      </div>

      <div className="space-y-2">
        <label htmlFor="images" className="block font-medium">Article images</label>
        <input id="images" name="images" type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" className="block w-full" />
        <p className="text-sm opacity-70">Optional. PNG, JPEG, WebP, or GIF. These are saved in the article's images folder.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="thumbnail" className="block font-medium">Thumbnail (PNG only)</label>
        <input id="thumbnail" name="thumbnail" type="file" required accept="image/png,.png" className="block w-full" />
      </div>

      <div className="space-y-2">
        <label htmlFor="tags" className="block font-medium">Technique tags</label>
        <input id="tags" name="tags" required placeholder="e.g. ikat, block-printing, kalamkari" className="w-full rounded border p-2" />
        <p className="text-sm opacity-70">Separate tags with commas. They will be stored as a JSON string array in metadata.json.</p>
      </div>

      <button type="submit" disabled={busy} className="rounded border px-4 py-2 disabled:opacity-50">
        {busy ? "Uploading…" : "Upload article"}
      </button>

      {message && <p role="status" aria-live="polite">{message}</p>}
    </form>
  );
}
