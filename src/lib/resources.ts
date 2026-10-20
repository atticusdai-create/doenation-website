/**
 * Outside resources listed on /resources.
 * Verified 2026-10-07 against each organization's own site (RAINN via its published outreach material).
 * Re-check numbers before changing them; a wrong crisis number is worse than none.
 */

export type Hotline = {
  name: string;
  forWhom: string;
  call: { label: string; href: string };
  text?: string;
  site: { label: string; href: string };
};

export const hotlines: Hotline[] = [
  {
    name: "National Domestic Violence Hotline",
    forWhom: "Anyone affected by abuse. Free, confidential and open 24/7, with advocates who can help you plan your next step.",
    call: { label: "1-800-799-7233", href: "tel:+18007997233" },
    text: "Text START to 88788",
    site: { label: "thehotline.org", href: "https://www.thehotline.org/" },
  },
  {
    name: "National Sexual Assault Hotline (RAINN)",
    forWhom: "Survivors of sexual assault and the people supporting them. 24/7, in English and Spanish.",
    call: { label: "1-800-656-4673", href: "tel:+18006564673" },
    text: "Text HOPE to 64673",
    site: { label: "rainn.org", href: "https://www.rainn.org/" },
  },
  {
    name: "Love is Respect",
    forWhom: "Teens and young adults with questions about dating, relationships or abuse. 24/7.",
    call: { label: "1-866-331-9474", href: "tel:+18663319474" },
    text: "Text LOVEIS to 22522",
    site: { label: "loveisrespect.org", href: "https://www.loveisrespect.org/" },
  },
  {
    name: "StrongHearts Native Helpline",
    forWhom: "Native Americans and Alaska Natives facing domestic or sexual violence. 24/7, culturally grounded support.",
    call: { label: "1-844-762-8483", href: "tel:+18447628483" },
    text: "Text START to 1-844-762-8483",
    site: { label: "strongheartshelpline.org", href: "https://strongheartshelpline.org/" },
  },
  {
    name: "988 Suicide & Crisis Lifeline",
    forWhom: "If you are thinking about suicide or are in emotional crisis. 24/7, with text and chat in Spanish.",
    call: { label: "988", href: "tel:988" },
    text: "Text 988",
    site: { label: "988lifeline.org", href: "https://988lifeline.org/" },
  },
];

export const coloradoResources = [
  {
    name: "Violence Free Colorado",
    body: "Colorado's domestic violence coalition. Its map lists local programs in every county. Available in English and Spanish.",
    link: { label: "Find a program near you", href: "https://violencefreecolorado.org/find-help/survivor-resources/" },
  },
  {
    name: "Colorado Address Confidentiality Program",
    body: "A state program that gives survivors of domestic violence, sexual assault and stalking a substitute address, so their real one stays off public records. You apply with help from a certified victim advocate.",
    link: { label: "Learn about the ACP", href: "https://dcs.colorado.gov/acp" },
    // The state is migrating this website in October 2026 and warned the URL may change. Phone verified on that page 2026-10-07.
    call: { label: "303-866-2208", href: "tel:+13038662208" },
  },
];

export const spanishHelp = { label: "espanol.thehotline.org", href: "https://espanol.thehotline.org/" };

export const safetyPlan = {
  steps: [
    { title: "Keep key papers together", body: "IDs, birth certificates, insurance cards, bank details and any protection orders, or copies of them." },
    { title: "Pack a small bag", body: "Clothes, medicine, a phone charger and some cash. Keep it hidden or with someone you trust." },
    { title: "Memorize a few numbers", body: "In case your phone is taken or checked: someone you trust, DoeNation and a hotline." },
    { title: "Choose a code word", body: "Agree on a word with a friend or family member that means “call for help.”" },
    { title: "Know where you would go", body: "Think through where you could stay and how you would get there, at any time of day." },
  ],
  tool: { label: "Build a personal safety plan", href: "https://www.thehotline.org/plan-for-safety/create-your-personal-safety-plan/" },
};
