import { createHmac } from "node:crypto"

/**
 * Bunny Storage (unggah/hapus berkas) + Bunny CDN bertanda tangan (signed URL).
 * Semua kunci dibaca dari environment dan tidak pernah dikirim ke klien.
 */

const HOST_STORAGE = "storage.bunnycdn.com"

type Konfigurasi = {
  zona: string
  kunci: string
  wilayah: string
  hostname: string
  token: string
  kedaluwarsaDetik: number
}

function angkaLingkungan(nama: string, baku: number) {
  const nilai = Number(process.env[nama])
  return Number.isFinite(nilai) && nilai > 0 ? nilai : baku
}

function bacaKonfigurasi(): Konfigurasi {
  const zona = process.env.BUNNY_STORAGE_ZONE_NAME ?? ""
  const kunci = process.env.BUNNY_STORAGE_ACCESS_KEY ?? ""
  const hostname = process.env.BUNNY_CDN_HOSTNAME ?? ""
  if (!zona || !kunci || !hostname) {
    throw new Error(
      "Konfigurasi Bunny belum lengkap. Isi BUNNY_STORAGE_ZONE_NAME, BUNNY_STORAGE_ACCESS_KEY, dan BUNNY_CDN_HOSTNAME."
    )
  }
  return {
    zona,
    kunci,
    wilayah: process.env.BUNNY_STORAGE_REGION ?? "sg",
    hostname,
    token: process.env.BUNNY_CDN_TOKEN_KEY ?? "",
    kedaluwarsaDetik: angkaLingkungan("BUNNY_SIGNED_URL_EXPIRY_SECONDS", 900),
  }
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
  const { zona, kunci, wilayah } = bacaKonfigurasi()
  const respons = await fetch(`${hostStorage(wilayah)}/${zona}/${encodeURIComponentPath(path)}`, {
    method: "PUT",
    headers: { AccessKey: kunci, "Content-Type": tipeIsi },
    // lib.dom tidak memetakan Uint8Array ke BodyInit, padahal undici mendukungnya.
    body: isi as unknown as BodyInit,
    cache: "no-store",
  })

  if (!respons.ok) {
    const teks = await respons.text().catch(() => "")
    throw new Error(`Bunny menolak unggahan (${respons.status}). ${teks.slice(0, 200)}`)
  }
}

export async function hapusBerkas(path: string) {
  const { zona, kunci, wilayah } = bacaKonfigurasi()
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
  const { hostname, token, kedaluwarsaDetik } = bacaKonfigurasi()
  const bersih = path.replace(/^\/+/, "")
  if (!token) return `https://${hostname}/${encodeURIComponentPath(bersih)}`

  // Bunny: "/<expiry-hex>/<path>" lalu HMAC-SHA256 atas seluruh jalur tersebut.
  const kedaluwarsa = Math.floor(sekarang / 1000) + kedaluwarsaDetik
  const jalur = `/${kedaluwarsa.toString(16)}/${encodeURIComponentPath(bersih)}`
  return `https://${hostname}${jalur}?token=${tandaTangan(jalur, token)}`
}

/** URL tanpa tanda tangan; inilah yang disimpan di kolom url_pdf. */
export function urlPublik(path: string) {
  const { hostname } = bacaKonfigurasi()
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

/** Path per-segmen, supaya `pdf/nama.pdf` tidak berubah menjadi `pdf%2Fnama.pdf`. */
function encodeURIComponentPath(path: string) {
  return path
    .split("/")
    .map((segmen) => encodeURIComponent(segmen))
    .join("/")
}
