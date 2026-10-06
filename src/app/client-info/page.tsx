import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  DeviceMobile,
  ClockCounterClockwise,
  Keyhole,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/PageHero";
import { CrisisLines } from "@/components/CrisisLines";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Get help",
  description:
    "If you are leaving an abusive home, DoeNation can help. How to reach us safely, crisis lines, and tips for staying safe online.",
};

const safetyTips = [
  {
    icon: DeviceMobile,
    title: "Use a device they cannot check",
    body: "A friend's phone, a work computer or a library computer is safer than a shared device.",
  },
  {
    icon: Keyhole,
    title: "Browse privately",
    body: "A private or incognito window does not save the pages you visit to your history.",
  },
  {
    icon: ClockCounterClockwise,
    title: "Clear your history",
    body: "If you could not browse privately, delete this site from your history when you are done.",
  },
  {
    icon: ShieldCheck,
    title: "Leave fast if you need to",
    body: "The Quick exit button, or the Esc key, takes you to a weather page right away.",
  },
];

export default function GetHelp() {
  return (
    <>
      <PageHero
        title={
          <>
            You do not have to <span className="text-accent">do this alone.</span>
          </>
        }
        intro="DoeNation helps women leave battered and abusive homes, with a confidential place to stay where their attackers cannot find them."
        image="/images/bloom.jpg"
        imageAlt="Purple petunias in bloom with drops of water on their petals."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={site.phoneHref} className="btn-primary">
            Call {site.phone}
          </a>
          <Link href="/contact" className="btn-secondary">
            Contact us
          </Link>
        </div>
      </PageHero>

      <Reveal>
        <CrisisLines title="If you need help now" />
      </Reveal>

      {/* How it works */}
      <section className="container-x grid gap-12 py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:py-32">
        <Reveal>
          <h2 className="display text-4xl leading-[1.08] font-semibold text-ink sm:text-5xl">
            Reaching out is the first step. We will take the next one with you.
          </h2>
          <p className="prose-body mt-6">
            Tell us as much or as little as you are comfortable with. Let us know the safest way and time to reach you,
            and whether it is safe to leave a message.
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <ol className="space-y-4">
            {[
              {
                t: "Get in touch",
                b: `Call or text ${site.phone}, or email ${site.email}.`,
              },
              {
                t: "Talk through what you need",
                b: "We listen, answer your questions and talk about what a stay could look like.",
              },
              {
                t: "Move somewhere safe",
                b: "Our guest house location stays confidential, so you can rest without looking over your shoulder.",
              },
            ].map((s, i) => (
              <li key={s.t} className="flex gap-5 rounded-[20px] border border-line bg-surface p-6">
                <span
                  aria-hidden
                  className="display flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-accent"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-ink">{s.t}</h3>
                  <p className="mt-1 text-[16px] leading-relaxed text-muted">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* Online safety */}
      <section aria-labelledby="safety-title" className="container-x">
        <div className="rounded-[20px] bg-accent-soft p-7 sm:p-10 lg:p-14">
          <Reveal>
            <h2 id="safety-title" className="display max-w-[22ch] text-3xl leading-[1.1] font-semibold text-ink sm:text-4xl">
              Staying safe while you look for help online
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {safetyTips.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.05}>
                <div className="flex gap-4">
                  <Icon size={28} weight="duotone" className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{title}</h3>
                    <p className="mt-1 text-[16px] leading-relaxed text-muted">{body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x pt-24 lg:pt-32">
        <Reveal>
          <div className="flex flex-col gap-6 border-t border-line pt-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="display text-3xl font-semibold text-ink">Want to help other women find safety?</h2>
              <p className="mt-2 text-[17px] text-muted">There are many ways to help, from volunteering to giving.</p>
            </div>
            <Link href="/get-involved" className="btn-secondary self-start md:self-auto">
              Get involved <ArrowRight size={18} weight="bold" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
