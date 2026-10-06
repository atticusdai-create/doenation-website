import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="DoeNation home">
      <span className="relative size-9 overflow-hidden rounded-full bg-white ring-1 ring-line">
        <Image src="/images/egg-mark.png" alt="" fill sizes="36px" className="object-cover" />
      </span>
      <span className="display text-[22px] font-bold text-ink">
        Doe<span className="text-accent">Nation</span>
      </span>
    </Link>
  );
}
