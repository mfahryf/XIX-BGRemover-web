// Product copy and public configuration for the XIX-BGRemover desktop page.

export const SITE = Object.freeze({
  name: "XIXLabs",
  product: "XIX BGRemover",
  shortName: "BGRemover",
  path: "/bgremover/",
  byline: "by XIXLabs.net",
  title: "Remove backgrounds cleanly, in batches",
  accentTitle: "on your own computer",
});

// The desktop app is the source of these engines: the id it uses, the name it
// shows, and the mode suffix it prints beside that name. The page must not
// invent its own labels, because the preview exists to mirror the real window.
export const ENGINES = Object.freeze([
  { id: "remove-bg", name: "Remove-BG", mode: "(Online)" },
  { id: "remove-bg-rmbg-webgpu", name: "Remove-BG", mode: "(Offline)" },
]);

// One engine printed the way the app prints it: name and mode, so a mode suffix
// that is already part of the name is never written twice.
export function engineLabel(engine) {
  return engine ? [engine.name, engine.mode].filter(Boolean).join(" ") : "";
}

export const CATALOG = Object.freeze({
  productId: "xix-bgremover",
  // The gateway catalog stays the source of truth for the price; when it
  // changes there, match it here. The page states the amount itself instead of
  // deferring to the checkout page, so the price is visible before the visitor
  // commits to leaving the site.
  priceAmount: 39000,
  currency: "IDR",
  mayarProductId: "52fda859-7c24-4a16-9bd5-acb54bf11fae",
  durationDays: 30,
  trialQuota: 10,
  maxActiveDevices: 1,
  engines: ENGINES.map(engineLabel),
});

// Coolify supplies VITE_CHECKOUT_URL after the production Mayar product exists.
export const CHECKOUT_URL = (import.meta.env?.VITE_CHECKOUT_URL || "https://xixlabs.net/buy/bgremover").trim();
export const DOWNLOAD_URL = (
  import.meta.env?.VITE_DOWNLOAD_URL ||
  "https://xixlabs.net/download/bgremover"
).trim();

export const PLAN_LABEL = (() => {
  const amount = CATALOG.priceAmount.toLocaleString("en-US");
  return CATALOG.currency + " " + amount + " / month";
})();
export const PLAN_POINTS = [
  `${CATALOG.trialQuota} successful files total before a licence is required`,
  `Valid for ${CATALOG.durationDays} days from payment`,
  `One licence active on ${CATALOG.maxActiveDevices} device`,
  "Online and offline background removal engines",
];

export const HERO_HIGHLIGHTS = [
  "Remove backgrounds from product photos, portraits, and graphics",
  "Online engine for fast, high-quality results",
  "Offline engine that processes files without uploading them",
  "Batch processing with PNG output and transparent backgrounds",
  "Runs on Windows 10 or newer",
  "Choose your own output folder and clear finished rows from the list",
  "Per-file status and a running total while a batch runs",
  "Optional proxy settings for the online engine",
  "Update check that asks before installing a new version",
  "A compact Winamp-style desktop shell with a modern glass finish",
];

// No sample image is shipped with the page. Every trial starts from a file the
// visitor chooses.
export const DEMO_LIMITS = {
  fileBytes: 5 * 1024 * 1024,
  maxPixels: 2_000_000,
  accepted: "PNG, JPG, or WebP",
};

export const PREVIEW = Object.freeze({
  palette: { accent: "#f5d76e", accent2: "#ff9f43", accent3: "#ffe6a0", bgOne: "#c9962e", bgTwo: "#9b3e63", bgThree: "#f1c453", bgBase: "#30200f" },
  brand: "BGREMOVER",
  count: "8/9",
  totalFiles: 9,
  format: "PNG",
  fit: null,
  timer: "1:24",
  status: "PROCESSING 38%",
  progress: 62,
  selectedEngine: "remove-bg",
  engines: ENGINES,
  advancedRows: [{ id: "format", label: "FORMAT", value: "PNG", percent: 0 }, { id: "quality", label: "QUALITY", value: "100", percent: 80 }],
  files: [
    ["portrait-studio.jpg", "done", "OK"], ["product-shoe.png", "done", "OK"], ["ecommerce-jacket.webp", "done", "OK"],
    ["leather-bag.jpg", "done", "OK"], ["perfume-bottle.png", "done", "OK"], ["wooden-table.jpg", "done", "OK"],
    ["wristwatch.png", "done", "OK"], ["cute-cat.png", "processing", "38%"], ["shop-logo.png", "queued", "210.5 KB"],
  ],
});

export const FOOTER_LINKS = Object.freeze({
  social: [],
  main: [{ href: "#download", label: "Download" }, { href: "https://wa.me/6281395192226", label: "Support" }],
  legal: [{ href: "https://chat.whatsapp.com/LjygdVs4fZqHQHq3ME0FaV", label: "Community" }, { href: "https://xixlabs.net", label: "XIXLabs" }],
});

export const COPYRIGHT = Object.freeze({ text: "© " + new Date().getFullYear() + " XIXLabs", license: "All rights reserved" });


// Required verbatim by the offline engine's licence whenever the library is
// used in a user interface: "in user interfaces, websites, or documentation".
// Do not reword or drop it.
export const ATTRIBUTION = "Background Removal Library provided by www.rembg.com";