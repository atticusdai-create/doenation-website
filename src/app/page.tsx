import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  HandHeart,
  House,
  Lifebuoy,
  BookOpenText,
  UsersThree,
  CalendarHeart,
  IdentificationCard,
} from "@phosphor-icons/react/dist/ssr";
import { CrisisLines } from "@/components/CrisisLines";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="container-x grid items-center gap-10 pt-10 pb-16 md:grid-cols-[1.05fr_1fr] md:gap-12 md:pt-16 lg:pt-20 lg:pb-24">
        <Reveal>
          <h1 className="display text-[44px] leading-[1.02] font-bold text-ink sm:text-6xl lg:text-[72px]">
            A safe place to <span className="text-accent italic">begin again.</span>
          </h1>
          <p className="prose-body mt-6 text-lg sm:text-xl">
            DoeNation is a guest house in Aurora, Colorado for women leaving abusive homes. Rest, plan and rebuild
            without fear.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/client-info" className="btn-primary">
              Get help <ArrowRight size={18} weight="bold" aria-hidden />
            </Link>
            <Link href="/get-involved#donate" className="btn-secondary">
              Donate
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] sm:aspect-[5/4] md:aspect-[4/5] lg:aspect-[5/6]">
            <Image
              src="/images/hero.jpg"
              alt="A woman with a backpack stands on a mountain trail looking out over a valley in warm morning light."
              fill
              preload
              sizes="(min-width: 768px) 48vw, 100vw"
              className="object-cover object-[60%_center]"
            />
          </div>
        </Reveal>
      </section>

      <Reveal>
        <CrisisLines />
      </Reveal>

      {/* Story */}
      <section className="container-x grid items-center gap-10 py-24 md:grid-cols-[0.8fr_1.2fr] md:gap-16 lg:py-32">
        <Reveal className="mx-auto w-full max-w-[340px] md:mx-0">
          <figure>
            <div className="relative aspect-[104/142.5] -rotate-2 overflow-hidden rounded-[20px] bg-white shadow-[0_24px_60px_-28px_rgb(var(--shadow)/0.6)] ring-1 ring-line">
              <Image
                src="/images/doenation-sketch.jpg"
                alt="Hand-drawn pencil sketch of the words A DOE NATION, with the O drawn as a cracked, hatching egg."
                fill
                sizes="340px"
                className="scale-[1.06] object-cover"
              />
            </div>
            <figcaption className="mt-5 text-center text-sm text-muted">The first DoeNation logo, drawn by hand.</figcaption>
          </figure>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display text-4xl leading-[1.08] font-semibold text-ink sm:text-5xl">
            Every new start needs somewhere safe to happen.
          </h2>
          <div className="prose-body mt-6 space-y-5">
            <p>
              DoeNation exists to help women come out of battered and abusive homes. We give them a place to stay where
              they can live without fear of their attackers finding them.
            </p>
            <p>
              Our name began as a pencil sketch, with the O drawn as an egg starting to hatch. That is what we hope to
              offer: protection while something new begins.
            </p>
          </div>
          <Link
            href="/client-info"
            className="mt-8 inline-flex items-center gap-2 font-semibold text-accent underline-offset-4 hover:underline"
          >
            How we can help <ArrowRight size={18} weight="bold" aria-hidden />
          </Link>
        </Reveal>
      </section>

      {/* What we do: bento */}
      <section aria-labelledby="work-title" className="container-x">
        <Reveal>
          <p className="text-sm font-semibold tracking-[0.14em] text-accent uppercase">What we do</p>
          <h2 id="work-title" className="display mt-3 max-w-[18ch] text-4xl leading-[1.08] font-semibold text-ink sm:text-5xl">
            Shelter first. Then everything that helps you stay safe.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-6 md:grid-rows-[auto_auto]">
          <Reveal className="md:col-span-4 md:row-span-2">
            <article className="relative flex h-full min-h-[420px] flex-col justify-end overflow-hidden rounded-[20px] p-7 sm:p-9">
              <Image
                src="/images/bloom.jpg"
                alt=""
                fill
                sizes="(min-width: 768px) 66vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1d1729]/90 via-[#1d1729]/45 to-transparent" />
              <div className="relative max-w-md text-[#fbf9ff]">
                <House size={32} weight="duotone" aria-hidden />
                <h3 className="display mt-4 text-3xl font-semibold">A confidential place to stay</h3>
                <p className="mt-3 text-[17px] leading-relaxed text-[#fbf9ff]/85">
                  A private guest house where women can rest and plan their next step without being found.
                </p>
              </div>
            </article>
          </Reveal>
          <Reveal delay={0.05} className="md:col-span-2">
            <article className="h-full rounded-[20px] bg-accent p-7 text-on-accent">
              <Lifebuoy size={30} weight="duotone" aria-hidden />
              <h3 className="display mt-4 text-2xl font-semibold">Community outreach</h3>
              <p className="mt-2 text-[16px] leading-relaxed opacity-85">
                We reach women who need help, and the neighbors who can stand beside them.
              </p>
            </article>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-2">
            <article className="h-full rounded-[20px] border border-line bg-accent-soft p-7">
              <BookOpenText size={30} weight="duotone" className="text-accent" aria-hidden />
              <h3 className="display mt-4 text-2xl font-semibold text-ink">Education</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-muted">
                Programs that help people recognize abuse and know where to turn.
              </p>
            </article>
          </Reveal>
          <Reveal delay={0.05} className="md:col-span-6">
            <article className="flex h-full flex-col gap-4 rounded-[20px] border border-line bg-surface p-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <HandHeart size={30} weight="duotone" className="mt-1 shrink-0 text-accent" aria-hidden />
                <div>
                  <h3 className="display text-2xl font-semibold text-ink">Health and wellbeing</h3>
                  <p className="mt-1 text-[16px] leading-relaxed text-muted">
                    We support health care initiatives so recovery includes body and mind.
                  </p>
                </div>
              </div>
              <Link href="/client-info" className="btn-secondary self-start sm:self-auto">
                Get help
              </Link>
            </article>
          </Reveal>
        </div>
      </section>

      {/* Get involved: full-bleed image band */}
      <section aria-labelledby="involve-title" className="container-x pt-24 lg:pt-32">
        <div className="relative overflow-hidden rounded-[20px]">
          <Image src="/images/sunrise.jpg" alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[#1d1729]/60" />
          <div className="relative grid gap-10 p-7 py-12 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:p-16">
            <Reveal className="text-[#fbf9ff]">
              <h2 id="involve-title" className="display text-4xl leading-[1.08] font-semibold sm:text-5xl">
                Join DoeNation in making a difference.
              </h2>
              <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-[#fbf9ff]/85">
                Your time and gifts keep the doors open for the next woman who needs them.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/get-involved#donate" className="btn bg-[#fbf9ff] text-[#3d1d66] hover:bg-white">
                  Donate
                </Link>
                <Link
                  href="/get-involved"
                  className="btn border border-[#fbf9ff]/40 text-[#fbf9ff] hover:border-[#fbf9ff] hover:bg-[#fbf9ff]/10"
                >
                  Get involved
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="space-y-3">
                {[
                  { icon: UsersThree, title: "Volunteer your time", body: "Help with outreach, events and the house." },
                  { icon: CalendarHeart, title: "Come to an event", body: "Meet the community behind DoeNation." },
                  { icon: IdentificationCard, title: "Become a member", body: "Stay close to our work all year." },
                ].map(({ icon: Icon, title, body }) => (
                  <li
                    key={title}
                    className="flex items-start gap-4 rounded-[20px] border border-white/15 bg-white/10 p-5 text-[#fbf9ff] backdrop-blur-md"
                  >
                    <Icon size={26} weight="duotone" className="mt-0.5 shrink-0" aria-hidden />
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="mt-0.5 text-[15px] text-[#fbf9ff]/80">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="container-x pt-24 text-center lg:pt-32">
        <Reveal>
          <h2 className="display mx-auto max-w-[20ch] text-4xl leading-[1.1] font-semibold text-ink sm:text-5xl">
            Not sure where to start? Start with a call.
          </h2>
          <p className="prose-body mx-auto mt-5">
            Call or text{" "}
            <a href={site.phoneHref} className="font-semibold whitespace-nowrap text-accent">
              {site.phone}
            </a>
            . We would love to hear from you.
          </p>
          <Link href="/contact" className="btn-primary mt-8">
            Contact us
          </Link>
        </Reveal>
      </section>
    </>
  );
}
