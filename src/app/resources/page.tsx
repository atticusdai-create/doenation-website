import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowSquareOut,
  ChatCircleText,
  CheckCircle,
  MapTrifold,
  Phone,
  ShieldCheck,
  Translate,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/Reveal";
import { coloradoResources, hotlines, safetyPlan, spanishHelp } from "@/lib/resources";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Free, confidential hotlines for domestic violence, sexual assault and crisis support, Colorado programs, and how to start a safety plan.",
};

const [featured, ...others] = hotlines;

export default function Resources() {
  return (
    <>
      <section className="container-x pt-10 pb-12 md:pt-16 lg:pb-16">
        <Reveal>
          <h1 className="display max-w-[16ch] text-[40px] leading-[1.04] font-semibold text-ink sm:text-5xl lg:text-6xl">
            Help is there, <span className="text-accent">day or night.</span>
          </h1>
          <p className="prose-body mt-5 text-lg">
            These services are free and confidential. You do not have to give your name, and you can hang up at any time.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-[15px] font-medium text-accent">
            <Translate size={18} weight="bold" aria-hidden />
            <span>
              Ayuda en español:{" "}
              <a href={spanishHelp.href} lang="es" className="font-semibold underline underline-offset-2">
                {spanishHelp.label}
              </a>
            </span>
          </p>
        </Reveal>
      </section>

      {/* Hotlines */}
      <section aria-labelledby="hotlines-title" className="container-x">
        <h2 id="hotlines-title" className="sr-only">
          Hotlines
        </h2>
        <Reveal>
          <article className="grid gap-6 rounded-[20px] bg-accent p-7 text-on-accent sm:p-10 md:grid-cols-[1.3fr_1fr] md:items-end">
            <div>
              <h3 className="display text-3xl font-semibold sm:text-4xl">{featured.name}</h3>
              <p className="mt-3 max-w-[48ch] text-[17px] leading-relaxed opacity-90">{featured.forWhom}</p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <a
                href={featured.call.href}
                className="btn bg-on-accent text-accent hover:opacity-90"
              >
                <Phone size={18} weight="bold" aria-hidden /> Call {featured.call.label}
              </a>
              <p className="flex items-center gap-2 text-[15px] opacity-90">
                <ChatCircleText size={18} weight="bold" aria-hidden /> {featured.text}
              </p>
              <a href={featured.site.href} className="inline-flex items-center gap-1.5 py-1.5 text-[15px] font-semibold underline underline-offset-4">
                Chat online at {featured.site.label} <ArrowSquareOut size={16} weight="bold" aria-hidden />
              </a>
            </div>
          </article>
        </Reveal>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {others.map((h, i) => (
            <Reveal key={h.name} delay={(i % 2) * 0.05}>
              <article className="flex h-full flex-col rounded-[20px] border border-line bg-surface p-7">
                <h3 className="display text-2xl font-semibold text-ink">{h.name}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-muted">{h.forWhom}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6">
                  <a
                    href={h.call.href}
                    className="display inline-flex items-center gap-2 text-2xl font-semibold text-accent tabular-nums hover:text-accent-hover"
                  >
                    <Phone size={20} weight="duotone" aria-hidden /> {h.call.label}
                  </a>
                  {h.text && <span className="text-[15px] text-muted">{h.text}</span>}
                </div>
                <a
                  href={h.site.href}
                  className="mt-2 inline-flex items-center gap-1.5 self-start py-1.5 text-[15px] font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
                >
                  {h.site.label} <ArrowSquareOut size={15} weight="bold" aria-hidden />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Colorado */}
      <section aria-labelledby="co-title" className="container-x grid gap-10 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-32">
        <Reveal>
          <h2 id="co-title" className="display text-4xl leading-[1.08] font-semibold text-ink sm:text-5xl">
            Help closer to home
          </h2>
          <p className="prose-body mt-5">Programs for people living in Colorado.</p>
        </Reveal>
        <div className="divide-y divide-line border-y border-line">
          {coloradoResources.map((r, i) => {
            const Icon = i === 0 ? MapTrifold : ShieldCheck;
            return (
              <Reveal key={r.name} delay={i * 0.05}>
                <div className="flex gap-5 py-7">
                  <Icon size={30} weight="duotone" className="mt-1 shrink-0 text-accent" aria-hidden />
                  <div>
                    <h3 className="text-xl font-semibold text-ink">{r.name}</h3>
                    <p className="mt-2 text-[16px] leading-relaxed text-muted">{r.body}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                      <a
                        href={r.link.href}
                        className="inline-flex items-center gap-1.5 py-1 font-semibold text-accent underline-offset-4 hover:underline"
                      >
                        {r.link.label} <ArrowSquareOut size={16} weight="bold" aria-hidden />
                      </a>
                      {"call" in r && r.call && (
                        <a
                          href={r.call.href}
                          className="inline-flex items-center gap-1.5 py-1 font-semibold text-ink tabular-nums hover:text-accent"
                        >
                          <Phone size={16} weight="bold" aria-hidden /> {r.call.label}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Safety plan */}
      <section aria-labelledby="plan-title" className="container-x">
        <div className="rounded-[20px] bg-accent-soft p-7 sm:p-10 lg:p-14">
          <Reveal>
            <h2 id="plan-title" className="display max-w-[20ch] text-3xl leading-[1.1] font-semibold text-ink sm:text-4xl">
              Start a safety plan, even a small one
            </h2>
            <p className="prose-body mt-4">
              A few things you can do now that make leaving safer. An advocate can help you build a plan that fits your
              situation.
            </p>
          </Reveal>
          <ul className="mt-10 grid gap-x-10 gap-y-7 md:grid-cols-2">
            {safetyPlan.steps.map((s, i) => (
              <li key={s.title}>
                <Reveal delay={(i % 2) * 0.05} className="flex gap-4">
                  <CheckCircle size={26} weight="duotone" className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                    <p className="mt-1 text-[16px] leading-relaxed text-muted">{s.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
          <a href={safetyPlan.tool.href} className="btn-primary mt-10">
            {safetyPlan.tool.label} <ArrowSquareOut size={18} weight="bold" aria-hidden />
          </a>
        </div>
      </section>

      <section className="container-x pt-24 lg:pt-32">
        <Reveal>
          <div className="flex flex-col gap-6 border-t border-line pt-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="display text-3xl font-semibold text-ink">Looking for a safe place to stay?</h2>
              <p className="mt-2 text-[17px] text-muted">
                Call or text DoeNation at{" "}
                <a href={site.phoneHref} className="font-semibold whitespace-nowrap text-accent">
                  {site.phone}
                </a>
                .
              </p>
            </div>
            <Link href="/client-info" className="btn-secondary self-start md:self-auto">
              Get help
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
