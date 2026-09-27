# XIX-BGRemover-web

Halaman publik untuk aplikasi desktop XIX BGRemover di
`https://xixlabs.net/bgremover/`.

Halaman ini menjelaskan aplikasi, menampilkan pratinjau non-interaktif,
menyediakan percobaan gratis di peramban, menyediakan unduhan installer Windows,
serta mengarahkan pembelian ke checkout Mayar produksi. Aktivasi lisensi dan
pemrosesan batch tetap berjalan di aplikasi desktop.

## Percobaan di peramban

Bagian `#try` menghapus latar satu gambar di komputer pengunjung memakai mesin
offline yang sama dengan entri **Remove-BG (Offline)** di aplikasi desktop, yaitu
paket `rembg-webgpu` — juga ketergantungan aplikasi desktop. WebGPU dipakai bila
tersedia, dengan WebGPU FP32 lalu WASM sebagai cadangan; halaman menampilkan
backend yang akhirnya dipakai.

Mesinnya dimuat saat dipakai, bukan saat halaman dibuka: paket itu menarik
onnxruntime-web beserta berkas wasm-nya, dan pengunjung yang hanya membaca
seharusnya tidak menanggungnya. Model sekitar 40 MB diunduh pada percobaan
pertama dan di-cache peramban setelahnya.

## Konfigurasi

Atur variabel berikut di Coolify:

| Variabel | Kegunaan |
| --- | --- |
| `VITE_CHECKOUT_URL` | Opsional; mengganti checkout URL produksi BGRemover yang sudah disediakan |
| `VITE_DOWNLOAD_URL` | Opsional; mengganti URL installer stabil dari GitHub Releases |

Tidak ada API key Mayar atau token rahasia di halaman ini. Harga sengaja tidak
ditulis di bundle; harga yang benar selalu ditampilkan oleh halaman checkout.

## Menjalankan dan memeriksa

```powershell
npm install
npm run dev       # http://localhost:5173/bgremover/
npm test
npm run build
```

Tidak ada berkas mesin yang disimpan di repo ini. Model dan runtime berasal dari
paket `rembg-webgpu` dan `@huggingface/transformers`.

## Rilis dan deploy

Repo ini terpisah dari aplikasi desktop `XIX-BGRemover`. Publikasikan installer
desktop dari repo release publik `mfahryf/XIX-BGRemover-release`, lalu gunakan
nama aset stabil `BGRemover-latest-x64-setup.exe` agar tombol unduh tidak perlu
diubah setiap versi.

Di Coolify, buat satu aplikasi frontend untuk repo ini dan pasang domain atau
proxy path `/bgremover/`. Pengaturan nginx di `deploy/` sudah mengatur redirect
trailing slash, health check, dan fallback SPA tanpa menyamarkan 404 aset.
Pada deployment production saat ini resource bernama `bgremover-web`, memakai
GitHub App `fahry-github`, branch `main`, port `80`, dan route publik
`https://xixlabs.net/bgremover/`. Push ke `main` memicu deployment otomatis.

## Dokumentasi

`docs/DESKTOP-WEB-PAGE-STANDARD.md` adalah standar bersama untuk halaman publik
semua aplikasi desktop XIXLabs.
