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

export const CATALOG = Object.freeze({
  productId: "xix-bgremover",
  mayarProductId: "52fda859-7c24-4a16-9bd5-acb54bf11fae",
  durationDays: 30,
  trialQuota: 10,
  maxActiveDevices: 1,
  engines: ["Remove-BG Online", "Remove-BG Offline"],
});

// Coolify supplies VITE_CHECKOUT_URL after the production Mayar product exists.
export const CHECKOUT_URL = (import.meta.env?.VITE_CHECKOUT_URL || "https://xix-apps.myr.id/pl/xix-bgremover-monthly-license").trim();
export const DOWNLOAD_URL = (
  import.meta.env?.VITE_DOWNLOAD_URL ||
  "https://github.com/mfahryf/XIX-BGRemover-release/releases/latest/download/BGRemover-latest-x64-setup.exe"
).trim();

export const PLAN_LABEL = "Price shown at checkout";
export const PLAN_POINTS = [
  `${CATALOG.trialQuota} successful files total before a licence is required`,
  `Valid for ${CATALOG.durationDays} days from payment`,
  `One licence active on ${CATALOG.maxActiveDevices} device`,
  "Online and offline background removal engines",
];

export const HERO_HIGHLIGHTS = [
  "Remove backgrounds from product photos, portraits, and graphics",
  "Online PhotoRoom engine for fast, high-quality results",
  "Offline RMBG engine for local processing without uploading files",
  "Batch processing with PNG output and transparent backgrounds",
  "A compact Winamp-style desktop shell with a modern glass finish",
];

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
  selectedEngine: "Remove-BG Online",
  engines: [{ name: "Remove-BG Online", mode: "online" }, { name: "Remove-BG Offline", mode: "offline" }],
  advancedRows: [{ id: "format", label: "FORMAT", value: "PNG", percent: 0 }, { id: "quality", label: "QUALITY", value: "100", percent: 80 }],
  files: [
    ["portret-studio.jpg", "done", "OK"], ["sepatu-produk.png", "done", "OK"], ["jaket-ecommerce.webp", "done", "OK"],
    ["tas-kulit.jpg", "done", "OK"], ["botol-parfum.png", "done", "OK"], ["meja-kayu.jpg", "done", "OK"],
    ["jam-tangan.png", "done", "OK"], ["kucing-lucu.png", "processing", "38%"], ["logo-toko.png", "queued", "210.5 KB"],
  ],
});

export const FOOTER_LINKS = Object.freeze({
  social: [],
  main: [{ href: "#download", label: "Download" }, { href: "mailto:hello@xixlabs.net", label: "Support" }],
  legal: [{ href: "/healthz", label: "Service status" }, { href: "https://xixlabs.net", label: "XIXLabs" }],
});

export const COPYRIGHT = Object.freeze({ text: "© " + new Date().getFullYear() + " XIXLabs", license: "All rights reserved" });
