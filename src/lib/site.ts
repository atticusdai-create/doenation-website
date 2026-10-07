export const site = {
  name: "DoeNation",
  // Update when a custom domain is connected.
  url: "https://doenation.vercel.app",
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

/**
 * Donations: DoeNation's GoDaddy Payments "Online payment" checkout (donor enters any amount).
 * Same link as the original site's "Pay Now" button. The original "Donate" button pointed at a
 * fixed $150 "Individual assessment" checkout instead, which is why it isn't used here.
 * The checkout currently shows the account name "Bruce Feaster" and tip options; both are
 * set in GoDaddy Payments, not in this code.
 */
export const donateUrl =
  "https://poynt.godaddy.com/checkout/af1db2d3-9620-4070-a2f4-e97ec6e0c0b9/e0743927-d43c-4637-9ae1-4df?sourceApp=wam.paybutton";

export const nav = [
  { href: "/", label: "Home" },
  { href: "/client-info", label: "Get help" },
  { href: "/resources", label: "Resources" },
  { href: "/get-involved", label: "Get involved" },
  { href: "/contact", label: "Contact" },
];

/** Where the Esc safety shortcut sends the visitor. A neutral, common page. */
export const quickExitUrl = "https://www.google.com/search?q=weather+today";
