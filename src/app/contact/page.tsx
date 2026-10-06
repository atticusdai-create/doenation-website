import type { Metadata } from "next";
import { Phone, EnvelopeSimple, MapPin } from "@phosphor-icons/react/dist/ssr";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call, text or email DoeNation in Aurora, Colorado. We would love to hear from you.",
};

const methods = [
  { icon: Phone, label: "Call or text", value: site.phone, href: site.phoneHref },
  { icon: EnvelopeSimple, label: "Email", value: site.email, href: `mailto:${site.email}` },
  { icon: MapPin, label: "Where we are", value: site.location },
];

export default function Contact() {
  return (
    <section className="container-x grid gap-12 pt-10 md:pt-16 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
      <Reveal>
        <h1 className="display text-[40px] leading-[1.04] font-semibold text-ink sm:text-5xl lg:text-6xl">
          Drop us a <span className="text-accent">line.</span>
        </h1>
        <p className="prose-body mt-5 text-lg">
          Have a question or want to get in touch? We would love to hear from you, and we will get back to you as soon as
          we can.
        </p>
        <ul className="mt-10 space-y-6">
          {methods.map(({ icon: Icon, label, value, href }) => (
            <li key={label} className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Icon size={22} weight="duotone" aria-hidden />
              </span>
              <div>
                <p className="text-sm text-muted">{label}</p>
                {href ? (
                  <a href={href} className="text-lg font-semibold break-all text-ink transition-colors hover:text-accent">
                    {value}
                  </a>
                ) : (
                  <p className="text-lg font-semibold text-ink">{value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-[46ch] rounded-[20px] border border-line bg-surface p-5 text-[15px] leading-relaxed text-muted">
          For the safety of the women we serve, our guest house address is not public. If you are in danger right now,
          call <a href="tel:911" className="font-semibold text-ink">911</a>.
        </p>
      </Reveal>
      <Reveal delay={0.08}>
        <ContactForm />
      </Reveal>
    </section>
  );
}
