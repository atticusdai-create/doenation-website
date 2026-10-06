import { Phone } from "@phosphor-icons/react/dist/ssr";
import { crisisLines } from "@/lib/site";

export function CrisisLines({ title = "Reach someone now" }: { title?: string }) {
  return (
    <section aria-labelledby="crisis-title" className="container-x">
      <div className="rounded-[20px] border border-line bg-surface p-6 sm:p-8 lg:p-10">
        <h2 id="crisis-title" className="display text-2xl font-semibold text-ink sm:text-[28px]">
          {title}
        </h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-[0.7fr_1.3fr_1fr] md:gap-0 md:divide-x md:divide-line">
          {crisisLines.map((line) => (
            <li key={line.label} className="md:px-8 md:first:pl-0 md:last:pr-0">
              <p className="text-sm font-medium text-muted">{line.label}</p>
              <a
                href={line.href}
                className="display mt-1 inline-flex items-center gap-2 text-[26px] font-semibold text-accent tabular-nums transition-colors hover:text-accent-hover sm:text-3xl"
              >
                <Phone size={22} weight="duotone" aria-hidden />
                {line.value}
              </a>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{line.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
