/** Copy text even on HTTP (Clipboard API needs HTTPS). */
export async function copyToClipboard(text: string): Promise<void> {
  const value = text.trim();
  if (!value) {
    throw new Error("Nothing to copy");
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall through to the execCommand path (common on http:// IP hosts).
    }
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.top = "0";
  input.style.left = "0";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.focus();
  input.select();
  input.setSelectionRange(0, value.length);

  const ok = document.execCommand("copy");
  document.body.removeChild(input);
  if (!ok) {
    throw new Error("Copy command was rejected");
  }
}
