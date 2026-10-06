import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function PageHero({
  title,
  intro,
  image,
  imageAlt,
  children,
}: {
  title: ReactNode;
  intro: string;
  image: string;
  imageAlt: string;
  children?: ReactNode;
}) {
  return (
    <section className="container-x grid items-end gap-8 pt-10 pb-14 md:grid-cols-[1.2fr_1fr] md:gap-12 md:pt-16 lg:pb-20">
      <Reveal>
        <h1 className="display text-[40px] leading-[1.04] font-bold text-ink sm:text-5xl lg:text-6xl">{title}</h1>
        <p className="prose-body mt-5 text-lg">{intro}</p>
        {children}
      </Reveal>
      <Reveal delay={0.08}>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[20px]">
          <Image src={image} alt={imageAlt} fill preload sizes="(min-width: 768px) 42vw, 100vw" className="object-cover" />
        </div>
      </Reveal>
    </section>
  );
}
