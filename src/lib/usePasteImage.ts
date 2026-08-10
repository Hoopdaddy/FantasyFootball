import { useEffect } from "react";

/** Lets the user paste a screenshot (e.g. from Snipping Tool) with Ctrl+V anywhere on the page. */
export function usePasteImage(onImage: (file: File) => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            onImage(file);
            e.preventDefault();
          }
          break;
        }
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [onImage, enabled]);
}
