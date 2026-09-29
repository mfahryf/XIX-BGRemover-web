import { beforeEach, describe, expect, it, vi } from "vitest";

// Pustaka model dan engine dimatikan: yang diuji hanya arah dan bentuk
// permintaan berkas model, bukan inferensinya.
vi.mock("@huggingface/transformers", () => ({ env: {} }));
vi.mock("rembg-webgpu", () => ({
  removeBackground: vi.fn(),
  subscribeToProgress: vi.fn(() => () => {}),
}));

async function loadConfiguredEnv() {
  vi.resetModules();
  const { env } = await import("@huggingface/transformers");
  await import("./engineRunner");
  return env;
}

describe("engineRunner model host", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("mengarahkan berkas model ke jalur milik halaman sendiri", async () => {
    const env = await loadConfiguredEnv();
    expect(env.remoteHost).toMatch(/\/models\/$/);
    expect(env.remoteHost.startsWith(window.location.origin)).toBe(true);
  });

  it("mempertahankan segmen repositori di jalur berkas model", async () => {
    const env = await loadConfiguredEnv();
    const path = env.remotePathTemplate
      .replaceAll("{model}", "briaai/RMBG-1.4")
      .replaceAll("{revision}", "main");

    // Proxy meneruskan ke host vendor yang menaruh repositori di depan:
    // /<repo>/resolve/<revisi>/<berkas>. Tanpa segmen itu seluruh berkas 404.
    expect(path).toBe("briaai/RMBG-1.4/resolve/main/");
    expect(path.split("/")[0]).toBe("briaai");
  });

  it("memakai host model lain saat VITE_MODEL_HOST diisi", async () => {
    vi.stubEnv("VITE_MODEL_HOST", "https://mirror.example/models/");
    const env = await loadConfiguredEnv();
    expect(env.remoteHost).toBe("https://mirror.example/models/");
  });
});
