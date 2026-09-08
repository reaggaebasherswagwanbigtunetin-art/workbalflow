import { readFile } from "fs/promises";
import path from "path";

const TEXT_MIMES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/csv",
  "text/x-markdown",
]);

export const ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/csv",
  "text/x-markdown",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export const ALLOWED_EXT = new Set([
  ".pdf",
  ".txt",
  ".md",
  ".csv",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
]);

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

export function uploadsRoot() {
  return path.join(process.cwd(), "uploads");
}

export function guessMime(filename: string, provided?: string | null): string {
  if (provided && provided !== "application/octet-stream") return provided;
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".csv": "text/csv",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return map[ext] || "application/octet-stream";
}

export function isAllowedUpload(filename: string, mime: string) {
  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return false;
  const resolved = guessMime(filename, mime);
  return ALLOWED_MIME.has(resolved) || ALLOWED_MIME.has(mime);
}

/**
 * Extract text context from an uploaded attachment for the completer.
 */
export async function readAttachmentText(opts: {
  attachmentPath: string | null | undefined;
  attachmentName: string | null | undefined;
  attachmentMime: string | null | undefined;
}): Promise<string | null> {
  if (!opts.attachmentPath || !opts.attachmentName) return null;

  const abs = path.isAbsolute(opts.attachmentPath)
    ? opts.attachmentPath
    : path.join(process.cwd(), opts.attachmentPath);

  const mime = opts.attachmentMime || guessMime(opts.attachmentName);

  try {
    if (TEXT_MIMES.has(mime) || /\.(txt|md|csv)$/i.test(opts.attachmentName)) {
      const buf = await readFile(abs);
      const text = buf.toString("utf8").slice(0, 80_000);
      return `### Uploaded file: ${opts.attachmentName}\n\n${text}`;
    }

    if (mime === "application/pdf" || opts.attachmentName.toLowerCase().endsWith(".pdf")) {
      try {
        const { PDFParse } = await import("pdf-parse");
        const data = await readFile(abs);
        const parser = new PDFParse({ data });
        const result = await parser.getText();
        const text = (result?.text || "").slice(0, 80_000);
        if (typeof (parser as { destroy?: () => Promise<void> }).destroy === "function") {
          await (parser as { destroy: () => Promise<void> }).destroy();
        }
        return `### Uploaded PDF: ${opts.attachmentName}\n\n${text || "(no extractable text)"}`;
      } catch (err) {
        console.warn("PDF text extraction failed:", err);
        return `### Uploaded file: ${opts.attachmentName} (PDF; text extraction unavailable)`;
      }
    }

    if (mime.startsWith("image/")) {
      return `### Uploaded image: ${opts.attachmentName} (${mime}) — binary image; filename noted for context only.`;
    }

    return `### Uploaded file: ${opts.attachmentName} (${mime}) — binary; filename noted for context only.`;
  } catch (err) {
    console.warn("Could not read attachment:", err);
    return `### Uploaded file: ${opts.attachmentName} — could not read file contents.`;
  }
}
