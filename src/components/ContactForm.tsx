"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle, PaperPlaneTilt, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";

type Errors = Partial<Record<"reach" | "message", string>>;

const field =
  "w-full rounded-[12px] border border-line bg-bg px-4 py-3 text-[16px] text-ink placeholder:text-muted/80 transition-colors focus:border-accent focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[invalid=true]:border-[#b42318] dark:aria-[invalid=true]:border-[#f97066]";

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const reach = String(data.get("reach") ?? "").trim();
    const safe = String(data.get("safe") ?? "unsure");
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (!reach) next.reach = "Let us know a phone number or email we can use.";
    if (message.length < 2) next.message = "Write a short message so we know how to help.";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`);
      first?.focus();
      return;
    }

    const body = [
      `Name: ${name || "(not given)"}`,
      `Best way to reach me: ${reach}`,
      `Safe to leave a message: ${safe}`,
      "",
      message,
    ].join("\n");
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      "Message from the DoeNation website",
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="rounded-[20px] border border-line bg-surface p-8">
        <CheckCircle size={36} weight="duotone" className="text-accent" aria-hidden />
        <h2 className="display mt-4 text-2xl font-semibold text-ink">Your email app should now be open.</h2>
        <p className="mt-2 text-[16px] leading-relaxed text-muted">
          Press send there to reach us. If nothing opened, email{" "}
          <a href={`mailto:${site.email}`} className="font-semibold text-accent">
            {site.email}
          </a>{" "}
          or call{" "}
          <a href={site.phoneHref} className="font-semibold whitespace-nowrap text-accent">
            {site.phone}
          </a>
          .
        </p>
        <button type="button" onClick={() => setSent(false)} className="btn-secondary mt-6">
          Write another message
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="space-y-6 rounded-[20px] border border-line bg-surface p-6 sm:p-8"
      aria-describedby="form-note"
    >
      <div className="grid gap-2">
        <label htmlFor="name" className="text-[15px] font-semibold text-ink">
          What should we call you? <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="name" name="name" autoComplete="off" className={field} />
        <p className="text-sm text-muted">A first name or nickname is fine.</p>
      </div>

      <div className="grid gap-2">
        <label htmlFor="reach" className="text-[15px] font-semibold text-ink">
          Safest way to reach you
        </label>
        <input
          id="reach"
          name="reach"
          autoComplete="off"
          placeholder="Phone number or email"
          aria-invalid={Boolean(errors.reach)}
          aria-describedby={errors.reach ? "reach-error" : undefined}
          className={field}
        />
        {errors.reach && (
          <p id="reach-error" className="flex items-center gap-1.5 text-sm font-medium text-[#b42318] dark:text-[#fda29b]">
            <WarningCircle size={16} weight="bold" aria-hidden /> {errors.reach}
          </p>
        )}
      </div>

      <fieldset className="grid gap-3">
        <legend className="text-[15px] font-semibold text-ink">Is it safe for us to leave a message?</legend>
        <div className="flex flex-wrap gap-2">
          {[
            ["yes", "Yes"],
            ["no", "No"],
            ["unsure", "Not sure"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="cursor-pointer rounded-full border border-line bg-bg px-4 py-2 text-[15px] font-medium text-ink transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
            >
              <input type="radio" name="safe" value={value} defaultChecked={value === "unsure"} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-2">
        <label htmlFor="message" className="text-[15px] font-semibold text-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`${field} resize-y`}
        />
        {errors.message && (
          <p id="message-error" className="flex items-center gap-1.5 text-sm font-medium text-[#b42318] dark:text-[#fda29b]">
            <WarningCircle size={16} weight="bold" aria-hidden /> {errors.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="form-note" className="text-sm text-muted sm:max-w-[36ch]">
          This opens your email app with your message ready to send. A sent email may stay in your sent folder.
        </p>
        <button type="submit" className="btn-primary">
          <PaperPlaneTilt size={18} weight="bold" aria-hidden /> Send message
        </button>
      </div>
    </form>
  );
}
