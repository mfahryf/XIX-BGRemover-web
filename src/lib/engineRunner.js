// Runs the offline background removal engine in the visitor's browser.
//
// The engine is the same one the desktop app ships for its Remove-BG (Offline)
// entry: the `rembg-webgpu` package, which is the desktop app's own dependency.
// Nothing is uploaded, so the page keeps working with no server behind it.
//
// Progress labels are the stages the engine actually reports, translated for
// display. The engine names its phases `downloading`, `building`, and `ready`;
// the desktop app shows the same three steps.

import { getCapabilities, removeBackground, subscribeToProgress } from "rembg-webgpu";
import { imageDataToDataUrl } from "./image";

function backendLabel(capability) {
  if (capability?.device === "webgpu" && capability?.dtype === "fp16") return "WebGPU FP16";
  if (capability?.device === "webgpu") return "WebGPU FP32";
  return "WASM CPU";
}

// Fraction of the bar the model load is allowed to occupy; the rest belongs to
// the removal itself, which reports progress only as a single step.
const LOAD_FROM = 0.03;
const LOAD_TO = 0.45;

export async function removeBackgroundFromImage(image, { onProgress = () => {} } = {}) {
  const capability = await getCapabilities();
  const backend = backendLabel(capability);
  onProgress({ label: "Loading model...", fraction: LOAD_FROM });

  let failure = null;
  const unsubscribe = subscribeToProgress(({ phase, progress, errorMsg }) => {
    if (phase === "error") {
      failure = errorMsg || "The offline model could not be loaded.";
      return;
    }
    // The backend name is deliberately left out of these labels: which device
    // the engine picked is a technical detail, not something to read while a
    // model loads.
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
    onProgress({ label: "Assembling PNG (" + backend + ")", fraction: 0.95 });
    return {
      blobUrl: result.blobUrl,
      width: result.width,
      height: result.height,
      backend,
    };
  } finally {
    unsubscribe();
  }
}

