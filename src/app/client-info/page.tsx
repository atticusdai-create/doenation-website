import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  DeviceMobile,
  ClockCounterClockwise,
  Keyhole,
  ArrowRight,
  Phone,
  EnvelopeSimple,
  PaperPlaneTilt,
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
    body: "Press the Esc key at any time to jump straight to a weather page.",
  },
];

export default function GetHelp() {
  return (
    <>
      <PageHero
        title={
          <>
            DoeNation: <span className="text-accent">empowering communities.</span>
          </>
        }
        intro="Our main objective is helping women come out of battered and abusive homes, and putting them somewhere they can live without fear of their attackers finding them."
        image="/images/warm-lights.jpg"
        imageAlt="Warm Edison light bulbs glowing against a dark ceiling."
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

      {/* Contact us (original site copy) */}
      <section className="container-x grid gap-12 py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:py-32">
        <Reveal>
          <h2 className="display text-4xl leading-[1.08] font-semibold text-ink sm:text-5xl">
            Have a question or want to get in touch?
          </h2>
          <p className="prose-body mt-6">
            We&apos;d love to hear from you. Contact us today and we&apos;ll get back to you as soon as possible. Let us
            know the safest way to reach you, and whether it is safe to leave a message.
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <ul className="space-y-4">
            {[
              { icon: Phone, t: "Call or text", value: site.phone, href: site.phoneHref },
              { icon: EnvelopeSimple, t: "Email", value: site.email, href: `mailto:${site.email}` },
              { icon: PaperPlaneTilt, t: "Drop us a line", value: "Use our contact form", href: "/contact" },
            ].map(({ icon: Icon, t, value, href }) => (
              <li key={t}>
                <a
                  href={href}
                  className="group flex items-center gap-5 rounded-[20px] border border-line bg-surface p-6 transition-colors hover:border-accent"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Icon size={22} weight="duotone" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm text-muted">{t}</span>
                    <span className="block text-lg font-semibold break-all text-ink group-hover:text-accent">{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
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
          <Link
            href="/resources"
            className="mt-10 inline-flex items-center gap-2 font-semibold text-accent underline-offset-4 hover:underline"
          >
            More hotlines and how to make a safety plan <ArrowRight size={18} weight="bold" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="container-x pt-24 lg:pt-32">
        <Reveal>
          <div className="flex flex-col gap-6 border-t border-line pt-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="display text-3xl font-semibold text-ink">There are many ways to get involved.</h2>
              <p className="mt-2 text-[17px] text-muted">Attend one of our events, become a member, or volunteer your time.</p>
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
