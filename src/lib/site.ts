export const site = {
  name: "DoeNation",
  url: "https://doenation.godaddysites.com",
  description:
    "DoeNation is a guest house in Aurora, Colorado for women leaving abusive homes. A confidential place to rest, plan and rebuild.",
  phone: "720-341-8844",
  phoneHref: "tel:+17203418844",
  email: "doenation720@gmail.com",
  location: "Aurora, Colorado",
};

export const crisisLines = [
  {
    label: "Emergency",
    value: "911",
    href: "tel:911",
    note: "If you are in immediate danger.",
  },
  {
    label: "National Domestic Violence Hotline",
    value: "1-800-799-7233",
    href: "tel:+18007997233",
    note: "Free and confidential, 24/7. Or text START to 88788.",
  },
  {
    label: "DoeNation",
    value: site.phone,
    href: site.phoneHref,
    note: "Call or text us about a stay or support.",
  },
];

export const nav = [
  { href: "/", label: "Home" },
  { href: "/client-info", label: "Get help" },
  { href: "/get-involved", label: "Get involved" },
  { href: "/contact", label: "Contact" },
];

/** Where the quick-exit control sends the visitor. Neutral, common pages. */
export const quickExitUrl = "https://www.google.com/search?q=weather+today";
