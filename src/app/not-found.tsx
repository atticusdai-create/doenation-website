import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[60dvh] flex-col items-start justify-center py-20">
      <h1 className="display text-5xl font-bold text-ink sm:text-6xl">This page is not here.</h1>
      <p className="prose-body mt-5 text-lg">The link may be old, or the page may have moved.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
        <Link href="/client-info" className="btn-secondary">
          Get help
        </Link>
      </div>
    </section>
  );
}
