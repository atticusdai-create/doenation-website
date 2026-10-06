import type { CSSProperties, ReactNode } from "react";

/**
 * Fades content up as it enters the viewport, using CSS scroll-driven animation.
 * No JS: content is always visible where the feature is unsupported or motion is reduced.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`reveal ${className}`} style={{ "--reveal-delay": `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}
