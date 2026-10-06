"use client";

import { useEffect } from "react";
import { SignOut } from "@phosphor-icons/react/dist/ssr";
import { quickExitUrl } from "@/lib/site";

function leave() {
  // Open a neutral page in a new tab and replace this one, so the Back button
  // does not return to DoeNation.
  window.open(quickExitUrl, "_blank", "noopener");
  window.location.replace(quickExitUrl);
}

export function QuickExit() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.repeat) leave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <button
      type="button"
      onClick={leave}
      className="fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[15px] font-semibold text-bg shadow-[0_12px_32px_-12px_rgb(var(--shadow)/0.7)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-px sm:right-6 sm:bottom-6"
    >
      <SignOut size={18} weight="bold" aria-hidden />
      Quick exit
      <span className="sr-only">, leave this site now. Shortcut: Escape key.</span>
      <kbd aria-hidden className="hidden rounded-md border border-bg/30 px-1.5 py-0.5 font-sans text-xs font-medium opacity-80 sm:inline">
        Esc
      </kbd>
    </button>
  );
}
