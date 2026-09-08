"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TaskForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    // Ensure price is sent as a field (FormData already has it)
    const res = await fetch("/api/tasks", {
      method: "POST",
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to create task");
      return;
    }
    router.push(`/dashboard/tasks/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" encType="multipart/form-data">
      {error && (
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Title</label>
        <input
          name="title"
          required
          className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 shadow-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          placeholder="e.g. Draft product FAQ from our docs"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Description</label>
        <textarea
          name="description"
          required
          rows={3}
          className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 shadow-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          placeholder="What should the agent accomplish?"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Instructions</label>
        <textarea
          name="instructions"
          required
          rows={5}
          className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 shadow-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 font-mono text-sm"
          placeholder={"Step-by-step instructions the agent must follow.\nOne item per line."}
        />
        <p className="mt-1 text-xs text-ink-500">
          Only client-submitted work from your instructions. No survey farming, CAPTCHA bypass, or account theft.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">
          Context <span className="text-ink-400 font-normal">(optional)</span>
        </label>
        <textarea
          name="context"
          rows={3}
          className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 shadow-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          placeholder="Paste notes, excerpts, or constraints the agent should use."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">
          Attachment <span className="text-ink-400 font-normal">(optional, max 5MB)</span>
        </label>
        <input
          name="attachment"
          type="file"
          accept=".pdf,.txt,.md,.csv,.jpg,.jpeg,.png,.gif,.webp,application/pdf,text/plain,text/markdown,text/csv,image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setFileName(f ? f.name : null);
          }}
          className="block w-full text-sm text-ink-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-800 hover:file:bg-brand-100"
        />
        <p className="mt-1 text-xs text-ink-500">
          PDF, txt, md, csv, or images. Text is passed to the completer; PDFs are text-extracted when possible.
          {fileName ? ` Selected: ${fileName}` : ""}
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Price (USD)</label>
        <input
          name="priceUsd"
          type="number"
          min={1}
          step={0.01}
          required
          defaultValue={25}
          className="w-40 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 shadow-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Creating…" : "Submit task"}
      </button>
    </form>
  );
}
