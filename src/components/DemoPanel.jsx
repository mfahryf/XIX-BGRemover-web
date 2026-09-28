
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Eye, RotateCcw } from "lucide-react";
import { BeforeAfterSlider, DISPLAY_MAX_HEIGHT } from "./BeforeAfterSlider";
import {
  ImageInputError,
  checkFile,
  formatBytes,
  imageDataToDataUrl,
  loadImage,
} from "../lib/image";
import { DEMO_LIMITS } from "../content/site";

// The offline engine pulls in the runtime and its WASM binary, which is tens
// of megabytes. It is therefore loaded only when a visitor actually starts a
// trial, so the page itself stays light for everyone who is just reading.
function loadEngine() {
  return import("../lib/engineRunner");
}

// Revoking a result URL needs no engine code, and clearing a result must work
// even when no engine was ever loaded.
function releaseResult(result) {
  if (result?.blobUrl) URL.revokeObjectURL(result.blobUrl);
}

// Width of the image prepared for display. It is derived from the display
// height limit rather than the panel width, so the result is never rendered far
// larger than what can actually be seen.
const PREVIEW_MAX_WIDTH = 1200;
const PREVIEW_MIN_WIDTH = 320;
// Keeps the preview sharp on high-density screens without making it heavy.
const PREVIEW_SHARPNESS = 1.5;

function previewWidthFor(ratio) {
  if (!(ratio > 0)) return PREVIEW_MIN_WIDTH;
  const byHeight = Math.round(DISPLAY_MAX_HEIGHT * ratio * PREVIEW_SHARPNESS);
  return Math.min(PREVIEW_MAX_WIDTH, Math.max(PREVIEW_MIN_WIDTH, byHeight));
}

function outputName(originalName) {
  const base = String(originalName || "image").replace(/\.[^.]+$/, "") || "image";
  return base + "-nobg.png";
}

// Free trial panel. One file per run, processed on the visitor's own computer by
// the offline engine, with progress shown honestly from the stages the engine
// reports.
export function DemoPanel({
  authenticated = true,
  authChecking = false,
  onRequireLogin = () => {},
}) {
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  const [stage, setStage] = useState("");
  const [fraction, setFraction] = useState(0);
  const [result, setResult] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [dropping, setDropping] = useState(false);
  const inputRef = useRef(null);
  const runRef = useRef(0);

  useEffect(() => () => { runRef.current += 1; }, []);

  const reset = useCallback(() => {
    runRef.current += 1;
    setResult((previous) => {
      releaseResult(previous);
      return null;
    });
    setState("idle");
    setMessage("");
    setStage("");
    setFraction(0);
    setShowOriginal(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFile = useCallback(async (file) => {
    const run = (runRef.current += 1);
    const alive = () => run === runRef.current;
    setResult((previous) => {
      releaseResult(previous);
      return null;
    });
    setMessage("");
    setShowOriginal(false);
    setStage("");
    setFraction(0);

    try {
      checkFile(file);
      setState("reading");
      const image = await loadImage(file);
      if (!alive()) return;

      setState("processing");
      setStage("Preparing file");
      const { removeBackgroundFromImage } = await loadEngine();
      if (!alive()) return;
      const output = await removeBackgroundFromImage(image, {
        onProgress: ({ label, fraction: value }) => {
          if (!alive()) return;
          setStage(label);
          setFraction(Number.isFinite(value) ? value : 0);
        },
      });
      if (!alive()) {
        releaseResult(output);
        return;
      }

      const size = { width: output.width || image.width, height: output.height || image.height };
      const previewWidth = previewWidthFor(size.width / size.height);
      const beforeSrc = imageDataToDataUrl(image, previewWidth);

      setResult({
        beforeSrc,
        afterSrc: output.blobUrl,
        blobUrl: output.blobUrl,
        width: size.width,
        height: size.height,
        sourceName: file.name,
      });
      setFraction(1);
      setState("done");
    } catch (error) {
      if (!alive()) return;
      const text =
        error instanceof ImageInputError || typeof error?.message === "string"
          ? error.message
          : "The file could not be processed.";
      setMessage(text);
      setState("error");
    }
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      setDropping(false);
      const file = event.dataTransfer?.files?.[0];
      if (!file) return;
      if (authChecking) return;
      if (!authenticated) {
        onRequireLogin();
        return;
      }
      handleFile(file);
    },
    [authChecking, authenticated, handleFile, onRequireLogin]
  );

  const openFilePicker = useCallback(() => {
    if (authChecking) return;
    if (!authenticated) {
      onRequireLogin();
      return;
    }
    inputRef.current?.click();
  }, [authChecking, authenticated, onRequireLogin]);

  const busy = state === "reading" || state === "processing";

  return (
    <section className="panel demo" id="try" aria-labelledby="demo-title">
      {/* This section carries no visible heading of its own: the page heading
          above it already explains the contents, and one upload button is
          enough — the one inside the drop zone, where visitors look for it. */}
      <h2 id="demo-title" className="visually-hidden">
        Remove one background
      </h2>

      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (authChecking) {
            event.target.value = "";
            return;
          }
          if (!authenticated) {
            event.target.value = "";
            onRequireLogin();
            return;
          }
          handleFile(file);
        }}
      />

      {state === "idle" && (
        <div
          className="dropzone"
          data-dropping={dropping ? "true" : "false"}
          onDragOver={(event) => {
            event.preventDefault();
            setDropping(true);
          }}
          onDragLeave={() => setDropping(false)}
          onDrop={onDrop}
        >
          <span className="dropzone-mark" aria-hidden="true">PNG</span>
          <p className="dropzone-title">Drop one image here</p>
          <p className="dropzone-detail">
            {DEMO_LIMITS.accepted}, up to {formatBytes(DEMO_LIMITS.fileBytes)}.
          </p>
          <button
            type="button"
            className="button button-primary button-compact"
            onClick={openFilePicker}
          >
            Choose image
          </button>
        </div>
      )}

      {busy && (
        <div className="progress" role="status" aria-live="polite">
          <div className="progress-head">
            <span className="progress-stage">{state === "reading" ? "Reading file" : stage}</span>
            <span className="progress-value">
              {state === "reading" ? "" : Math.round(fraction * 100) + "%"}
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-bar"
              data-indeterminate={state === "reading" ? "true" : "false"}
              style={state === "reading" ? undefined : { width: Math.round(fraction * 100) + "%" }}
            />
          </div>
          <p className="progress-note">
            The first run downloads the offline model, about 40 MB, and your browser caches it
            afterwards. Keep this page open until it finishes.
          </p>
        </div>
      )}

      {state === "error" && (
        <div className="alert" role="alert">
          <strong>The image could not be processed.</strong>
          <p>{message}</p>
          <button type="button" className="button button-secondary" onClick={reset}>
            <RotateCcw className="nav-icon" aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      {state === "done" && result && (
        <div className="result">
          <BeforeAfterSlider
            beforeSrc={result.beforeSrc}
            afterSrc={result.afterSrc}
            width={result.width}
            height={result.height}
            showOriginal={showOriginal}
            transparent
            hint={
              <>
                <a className="compare-hint-link" href="#download">
                  <strong>Download XIX BGRemover Desktop</strong>
                </a>{" "}
                — full-resolution batches, online and offline engines, and no browser upload.
              </>
            }
          />
          <div className="result-actions">
            <a
              className="button button-primary"
              href={result.blobUrl}
              download={outputName(result.sourceName)}
            >
              <Download className="nav-icon" aria-hidden="true" />
              Save PNG
            </a>
            <button
              type="button"
              className="button button-secondary"
              onPointerDown={() => setShowOriginal(true)}
              onPointerUp={() => setShowOriginal(false)}
              onPointerLeave={() => setShowOriginal(false)}
              onKeyDown={(event) => {
                if (event.key === " " || event.key === "Enter") setShowOriginal(true);
              }}
              onKeyUp={(event) => {
                if (event.key === " " || event.key === "Enter") setShowOriginal(false);
              }}
              onBlur={() => setShowOriginal(false)}
            >
              <Eye className="nav-icon" aria-hidden="true" />
              Hold to see original
            </button>
            <button type="button" className="button button-secondary" onClick={reset}>
              <RotateCcw className="nav-icon" aria-hidden="true" />
              Start over
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default DemoPanel;
