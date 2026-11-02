import { createHmac } from "node:crypto"

/**
 * Bunny Storage (unggah/hapus berkas) + Bunny CDN bertanda tangan (signed URL).
 * Semua kunci dibaca dari environment dan tidak pernah dikirim ke klien.
 */

const HOST_STORAGE = "storage.bunnycdn.com"

type KonfigurasiCdn = {
  hostname: string
  token: string
  kedaluwarsaDetik: number
}

type KonfigurasiStorage = {
  zona: string
  kunci: string
  wilayah: string
}

function angkaLingkungan(nama: string, baku: number) {
  const nilai = Number(process.env[nama])
  return Number.isFinite(nilai) && nilai > 0 ? nilai : baku
}

/**
 * Permukaan baca: menampilkan atau menanda-tangani URL hanya butuh hostname CDN.
 * Dulu satu pemeriksa menuntut kredensial storage zone juga, sehingga katalog
 * dan reader ikut gagal saat hanya penyimpanan yang belum dikonfigurasi,
 * padahal tidak ada satu bait berkas pun yang ditulis.
 */
function bacaKonfigurasiCdn(): KonfigurasiCdn {
  const hostname = process.env.BUNNY_CDN_HOSTNAME ?? ""
  if (!hostname) {
    throw new Error("BUNNY_CDN_HOSTNAME belum diisi, jadi URL berkas tidak dapat dibentuk.")
  }
  return {
    hostname,
    token: process.env.BUNNY_CDN_TOKEN_KEY ?? "",
    kedaluwarsaDetik: angkaLingkungan("BUNNY_SIGNED_URL_EXPIRY_SECONDS", 900),
  }
}

/**
 * Diperiksa sebelum berkas naik ke penyimpanan. Setelah terpisah dari kredensial
 * storage, unggah bisa saja berhasil padahal alamat tayangnya belum ada; kitab
 * yang menyimpannya akan gagal dan berkasnya jadi yatim.
 */
export function cdnSiapPublikasi() {
  return (process.env.BUNNY_CDN_HOSTNAME ?? "").trim().length > 0
}

/** Permukaan tulis: hanya dipanggil oleh unggah dan hapus berkas. */
function bacaKonfigurasiStorage(): KonfigurasiStorage {
  const zona = process.env.BUNNY_STORAGE_ZONE_NAME ?? ""
  const kunci = process.env.BUNNY_STORAGE_ACCESS_KEY ?? ""
  if (!zona || !kunci) {
    throw new Error(
      "Konfigurasi Bunny Storage belum lengkap. Isi BUNNY_STORAGE_ZONE_NAME dan BUNNY_STORAGE_ACCESS_KEY."
    )
  }
  return { zona, kunci, wilayah: process.env.BUNNY_STORAGE_REGION ?? "sg" }
}

/** `pdf/tafsir-al-jalalain.pdf` — path di dalam storage zone sekaligus kunci CDN. */
export function jalurPdf(slug: string) {
  return `pdf/${slug}.pdf`
}

export function jalurSampul(slug: string) {
  return `sampul/${slug}.jpg`
}

function hostStorage(wilayah: string) {
  return `https://${wilayah}.${HOST_STORAGE}`
}

export async function unggahBerkas(path: string, isi: Uint8Array, tipeIsi: string) {
  const { zona, kunci, wilayah } = bacaKonfigurasiStorage()
  const respons = await fetch(`${hostStorage(wilayah)}/${zona}/${encodeURIComponentPath(path)}`, {
    method: "PUT",
    headers: { AccessKey: kunci, "Content-Type": tipeIsi },
    // lib.dom tidak memetakan Uint8Array ke BodyInit, padahal undici mendukungnya.
    body: isi as unknown as BodyInit,
    cache: "no-store",
  })

  if (!respons.ok) {
    const teks = await respons.text().catch(() => "")
    // Balasan Bunny memuat detail storage zone; hanya dicatat di server agar tidak sampai ke klien.
    console.error(`[bunny] unggahan ditolak (${respons.status}) untuk ${path}:`, teks.slice(0, 300))
    throw new Error(
      `Bunny menolak unggahan dengan status ${respons.status}. Periksa konfigurasi storage zone.`
    )
  }
}

export async function hapusBerkas(path: string) {
  const { zona, kunci, wilayah } = bacaKonfigurasiStorage()
  const respons = await fetch(`${hostStorage(wilayah)}/${zona}/${encodeURIComponentPath(path)}`, {
    method: "DELETE",
    headers: { AccessKey: kunci },
    cache: "no-store",
  })
  // 404 berarti berkas memang tidak ada; bukan kegagalan pembersihan.
  return respons.ok || respons.status === 404
}

/** Tanda tangan Bunny: HMAC-SHA256 atas path yang sudah memuat masa berlaku. */
function tandaTangan(jalur: string, token: string) {
  return createHmac("sha256", token).update(jalur).digest("hex")
}

/**
 * URL CDN berbatas waktu. Tanpa BUNNY_CDN_TOKEN_KEY zona dianggap publik dan
 * URL dikembalikan apa adanya — konfigurasi ini hanya layak untuk pengembangan.
 */
export function urlTtd(path: string, sekarang = Date.now()) {
  const { hostname, token, kedaluwarsaDetik } = bacaKonfigurasiCdn()
  const bersih = path.replace(/^\/+/, "")
  if (!token) return `https://${hostname}/${encodeURIComponentPath(bersih)}`

  // Bunny: "/<expiry-hex>/<path>" lalu HMAC-SHA256 atas seluruh jalur tersebut.
  const kedaluwarsa = Math.floor(sekarang / 1000) + kedaluwarsaDetik
  const jalur = `/${kedaluwarsa.toString(16)}/${encodeURIComponentPath(bersih)}`
  return `https://${hostname}${jalur}?token=${tandaTangan(jalur, token)}`
}

/** URL tanpa tanda tangan; inilah yang disimpan di kolom url_pdf. */
export function urlPublik(path: string) {
  const { hostname } = bacaKonfigurasiCdn()
  return `https://${hostname}/${encodeURIComponentPath(path.replace(/^\/+/, ""))}`
}

/** Mengambil path CDN dari url_pdf agar dapat ditanda-tangani ulang. */
export function pathDariUrl(url: string) {
  try {
    return decodeURIComponent(new URL(url).pathname.replace(/^\/+/, ""))
  } catch {
    return url.replace(/^https?:\/\/[^/]+\//, "").replace(/^\/+/, "")
  }
}

function hostDariUrl(url: string) {
  try {
    return new URL(url).host
  } catch {
    return ""
  }
}

/**
 * URL baca berbatas waktu dari isi kolom url_pdf, untuk reader.
 * Nilai kosong (kitab tanpa PDF) jadi null. URL dari host lain atau saat
 * BUNNY_CDN_HOSTNAME belum diisi dikembalikan apa adanya, supaya reader tetap
 * punya sesuatu yang bisa dicoba alih-alih crash.
 */
export function urlBaca(urlSimpan: string, sekarang?: number): string | null {
  const url = urlSimpan.trim()
  if (!url) return null

  const hostname = process.env.BUNNY_CDN_HOSTNAME ?? ""
  const path = pathDariUrl(url)
  if (!hostname || !path || hostDariUrl(url) !== hostname) return url

  return urlTtd(path, sekarang)
}

/** Path per-segmen, supaya `pdf/nama.pdf` tidak berubah menjadi `pdf%2Fnama.pdf`. */
function encodeURIComponentPath(path: string) {
  return path
    .split("/")
    .map((segmen) => encodeURIComponent(segmen))
    .join("/")
}
