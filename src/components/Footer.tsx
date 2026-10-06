import Link from "next/link";
import { nav, site } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            A guest house in {site.location} for women leaving abusive homes. Our location is kept confidential for the
            safety of the women we serve.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ink">Pages</h2>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-muted transition-colors hover:text-accent">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ink">Reach us</h2>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            <li>
              <a href={site.phoneHref} className="text-muted transition-colors hover:text-accent">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="break-all text-muted transition-colors hover:text-accent">
                {site.email}
              </a>
            </li>
            <li className="text-muted">{site.location}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="container-x py-5 pr-40 text-[13px] text-muted">
          © 2026 DoeNation. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
