/**
 * pdf.js butuh berkas worker yang dilayani dari origin yang sama. Bundler Next
 * (Turbopack maupun webpack) tidak bisa memetakan specifier paket di dalam
 * `new URL(..., import.meta.url)`, jadi worker disalin ke public/pdfjs.
 */

import { copyFileSync, existsSync, mkdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const akar = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const sumber = join(akar, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs")
const tujuan = join(akar, "public", "pdfjs", "pdf.worker.min.mjs")

if (!existsSync(sumber)) {
  console.error("Worker pdf.js belum ada di node_modules. Jalankan npm install lebih dulu.")
  process.exit(1)
}

mkdirSync(dirname(tujuan), { recursive: true })
copyFileSync(sumber, tujuan)
console.log("Worker pdf.js siap di public/pdfjs/.")
