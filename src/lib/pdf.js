import { extractText, getDocumentProxy } from "unpdf";

/** Extract plain text from a PDF buffer. Returns "" for image-only PDFs. */
export async function extractPdfText(buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return (text || "").trim();
}