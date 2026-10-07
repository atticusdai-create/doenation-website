"use client";

import { useEffect } from "react";
import { quickExitUrl } from "@/lib/site";

/**
 * Safety shortcut: pressing Esc leaves the site for a neutral page.
 * Opens it in a new tab and replaces this one, so Back does not return to DoeNation.
 * Renders nothing; the Get help and Privacy pages tell visitors about it.
 */
export function EscapeExit() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.repeat) return;
      window.open(quickExitUrl, "_blank", "noopener");
      window.location.replace(quickExitUrl);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
