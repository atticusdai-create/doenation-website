import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What the DoeNation website collects (very little) and how to keep your visit private.",
};

const sections = [
  {
    title: "What this site collects",
    body: [
      "This site has no accounts, no advertising and no analytics or tracking tools. It does not set its own cookies.",
      "Our fonts are served from this site, so your visit does not contact Google Fonts. Links you follow from here do not tell the next site that you came from DoeNation.",
      "Like almost every website, our hosting provider (Vercel) keeps basic technical logs, such as IP addresses and the pages requested, to keep the site running and secure.",
    ],
  },
  {
    title: "The contact form",
    body: [
      "The form does not send or store anything on our website. When you press Send, it opens your own email app with your message filled in, and nothing goes anywhere until you send it there.",
      "Emails, calls and texts to DoeNation can show up in your sent folder, call log or message history. If someone checks your devices, consider deleting them after you reach us, or contact us from a device they cannot see.",
    ],
  },
  {
    title: "Donations",
    body: [
      "When you donate, you leave this site for a secure checkout run by GoDaddy Payments. Your payment details go to GoDaddy, not to this website, and are handled under GoDaddy's privacy policy.",
    ],
  },
  {
    title: "Keeping your visit private",
    body: [
      "Use a private or incognito window, or clear your browsing history afterwards. Pressing the Esc key takes you to a weather page right away.",
      "The Esc shortcut replaces only the page you are on. If you visited several pages in the same tab, the Back button can still reach the earlier ones, so a private window is the safest choice.",
    ],
  },
  {
    title: "Other websites",
    body: [
      "Our Resources page links to hotlines and programs run by other organizations. Their websites have their own privacy practices.",
    ],
  },
];

export default function Privacy() {
  return (
    <section className="container-x pt-10 md:pt-16">
      <Reveal>
        <h1 className="display max-w-[18ch] text-[40px] leading-[1.04] font-semibold text-ink sm:text-5xl lg:text-6xl">
          Your privacy on this site
        </h1>
        <p className="prose-body mt-5 text-lg">
          The short version: we collect as little as possible, because some of our visitors need to stay hidden.
        </p>
        <p className="mt-3 text-sm text-muted">Last updated October 2026</p>
      </Reveal>

      <div className="mt-14 max-w-[760px] space-y-12">
        {sections.map((s) => (
          <Reveal key={s.title}>
            <h2 className="display text-2xl font-semibold text-ink sm:text-[28px]">{s.title}</h2>
            <div className="prose-body mt-4 space-y-4">
              {s.body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
        ))}
        <Reveal>
          <h2 className="display text-2xl font-semibold text-ink sm:text-[28px]">Questions</h2>
          <p className="prose-body mt-4">
            Email{" "}
            <a href={`mailto:${site.email}`} className="font-semibold text-accent">
              {site.email}
            </a>{" "}
            or call{" "}
            <a href={site.phoneHref} className="font-semibold whitespace-nowrap text-accent">
              {site.phone}
            </a>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
