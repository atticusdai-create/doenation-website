import { site } from "@/lib/site";

export function SafetyBar() {
  return (
    <aside aria-label="Crisis lines" className="bg-accent text-on-accent">
      <p className="container-x py-2 text-center text-[13px] leading-snug sm:text-sm">
        In danger right now? Call{" "}
        <a href="tel:911" className="font-semibold underline underline-offset-2">
          911
        </a>
        . National DV Hotline{" "}
        <a href="tel:+18007997233" className="font-semibold whitespace-nowrap underline underline-offset-2">
          1-800-799-7233
        </a>
        <span className="hidden sm:inline">
          {" "}or DoeNation{" "}
          <a href={site.phoneHref} className="font-semibold underline underline-offset-2">
            {site.phone}
          </a>
        </span>
      </p>
    </aside>
  );
}
