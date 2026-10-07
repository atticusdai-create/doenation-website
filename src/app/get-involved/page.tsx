import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { UsersThree, CalendarHeart, IdentificationCard, EnvelopeSimple, Phone } from "@phosphor-icons/react/dist/ssr";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Get involved",
  description:
    "Volunteer, attend an event, become a member or donate to help DoeNation shelter women leaving abusive homes in Aurora, Colorado.",
};

const ways = [
  {
    icon: UsersThree,
    title: "Volunteer",
    body: "Give your time to help improve the lives of those in need in our community.",
    subject: "Volunteering with DoeNation",
  },
  {
    icon: CalendarHeart,
    title: "Attend an event",
    body: "Come to one of our events and meet the people behind DoeNation.",
    subject: "DoeNation events",
  },
  {
    icon: IdentificationCard,
    title: "Become a member",
    body: "Join our community and help us create lasting change.",
    subject: "Becoming a DoeNation member",
  },
];

export default function GetInvolved() {
  return (
    <>
      <PageHero
        title={
          <>
            Join DoeNation in <span className="text-accent">making a difference.</span>
          </>
        }
        intro="There are many ways to get involved with DoeNation. Attend one of our events, become a member, or volunteer your time. We'd love to have you on board!"
        image="/images/welcome-home.jpg"
        imageAlt="A round wooden sign hanging in a window that reads Welcome to our home."
      />

      {/* Ways to help */}
      <section aria-labelledby="ways-title" className="container-x">
        <Reveal>
          <h2 id="ways-title" className="display text-4xl font-semibold text-ink sm:text-5xl">
            Ways to get involved
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-[1.25fr_1fr_1fr]">
          {ways.map(({ icon: Icon, title, body, subject }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <article
                className={`flex h-full flex-col rounded-[20px] p-7 sm:p-8 ${
                  i === 0 ? "bg-accent text-on-accent lg:min-h-[320px]" : "border border-line bg-surface"
                }`}
              >
                <Icon size={32} weight="duotone" className={i === 0 ? "" : "text-accent"} aria-hidden />
                <h3 className={`display mt-5 text-2xl font-semibold ${i === 0 ? "" : "text-ink"}`}>{title}</h3>
                <p className={`mt-2 text-[16px] leading-relaxed ${i === 0 ? "opacity-85" : "text-muted"}`}>{body}</p>
                <a
                  href={`mailto:${site.email}?subject=${encodeURIComponent(subject)}`}
                  className={`mt-auto inline-flex items-center gap-2 pt-6 font-semibold underline-offset-4 hover:underline ${
                    i === 0 ? "" : "text-accent"
                  }`}
                >
                  <EnvelopeSimple size={18} weight="bold" aria-hidden /> Email us about this
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Donate */}
      <section id="donate" aria-labelledby="donate-title" className="container-x scroll-mt-28 pt-24 lg:pt-32">
        <div className="grid overflow-hidden rounded-[20px] border border-line bg-surface md:grid-cols-[1fr_1.1fr]">
          <div className="relative min-h-[260px]">
            <Image
              src="/images/room-quiet.jpg"
              alt="A calm bedroom with a wooden bedside table, a lamp and books beside a window."
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <Reveal className="p-7 sm:p-10 lg:p-14">
            <h2 id="donate-title" className="display text-4xl leading-[1.08] font-semibold text-ink sm:text-5xl">
              Help our cause.
            </h2>
            <p className="prose-body mt-5">
              Your support and contributions will enable us to meet our goals and fund our mission. Your contribution can
              make a big difference in the lives of those we serve.
            </p>
            <p className="prose-body mt-4">
              Donate today to help support our mission of empowering communities. To give, call or email us and we&apos;ll
              help you donate in the way that works for you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${site.email}?subject=${encodeURIComponent("I would like to donate")}`} className="btn-primary">
                <EnvelopeSimple size={18} weight="bold" aria-hidden /> Donate
              </a>
              <a href={site.phoneHref} className="btn-secondary">
                <Phone size={18} weight="bold" aria-hidden /> {site.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-x pt-24 text-center lg:pt-32">
        <Reveal>
          <h2 className="display mx-auto max-w-[22ch] text-3xl font-semibold text-ink sm:text-4xl">
            Have a question about getting involved?
          </h2>
          <Link href="/contact" className="btn-secondary mt-7">
            Contact us
          </Link>
        </Reveal>
      </section>
    </>
  );
}
