// Runs the offline background removal engine in the visitor's browser.
//
// The engine is the same one the desktop app ships for its Remove-BG (Offline)
// entry. Nothing is uploaded, so the page keeps working with no server behind it.
//
// Model files are fetched through a same-origin path rather than the vendor's
// public host, so neither the address bar nor the Network panel shows where they
// come from. `VITE_MODEL_HOST` can point the same path at an own mirror; the
// nginx block for this page forwards it either way (see deploy/nginx.conf).
//
// Progress labels are the stages the engine actually reports, translated for
// display. The engine names its phases `downloading`, `building`, and `ready`;
// the desktop app shows the same three steps.

import { env } from "@huggingface/transformers";
import { removeBackground, subscribeToProgress } from "rembg-webgpu";
import { imageDataToDataUrl } from "./image";

// Served by this page's own nginx block, which proxies it to the model host.
const MODEL_HOST = (
  import.meta.env?.VITE_MODEL_HOST ||
  new URL(import.meta.env.BASE_URL + "m/", window.location.origin).href
).trim();
// The vendor's default template puts the repository name in the path; keeping
// only the revision drops it.
const MODEL_PATH_TEMPLATE = "{revision}/";

env.remoteHost = MODEL_HOST;
env.remotePathTemplate = MODEL_PATH_TEMPLATE;

// Fraction of the bar the model load is allowed to occupy; the rest belongs to
// the removal itself, which reports progress only as a single step.
const LOAD_FROM = 0.03;
const LOAD_TO = 0.45;

export async function removeBackgroundFromImage(image, { onProgress = () => {} } = {}) {
  onProgress({ label: "Loading model...", fraction: LOAD_FROM });

  let failure = null;
  const unsubscribe = subscribeToProgress(({ phase, progress, errorMsg }) => {
    if (phase === "error") {
      failure = errorMsg || "The offline model could not be loaded.";
      return;
    }
    const stage =
      phase === "downloading"
        ? "Downloading model..."
        : phase === "building"
          ? "Preparing model"
          : "Loading model...";
    const share = LOAD_FROM + (Math.max(0, Math.min(100, progress)) / 100) * (LOAD_TO - LOAD_FROM);
    onProgress({ label: stage, fraction: share });
  });

  try {
    // The engine takes a URL. The image is sent as a data URL of the pixels that
    // were actually prepared, so a downscaled photo is the one that gets
    // processed, and transparent sources are flattened onto white first.
    const source = imageDataToDataUrl(image, image.width);
    const result = await removeBackground(source);
    if (failure) throw new Error(failure);
    onProgress({ label: "Assembling PNG", fraction: 0.95 });
    return {
      blobUrl: result.blobUrl,
      width: result.width,
      height: result.height,
    };
  } finally {
    unsubscribe();
  }
}
