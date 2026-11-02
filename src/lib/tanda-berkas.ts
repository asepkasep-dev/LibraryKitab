import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Bukti hasil unggah PDF. Route unggah membaca jumlah halaman dan ukuran berkas
 * di server, lalu menandatangani meta datanya; aksi tulis hanya mau menerima
 * bilangan halaman dari bukti ini, supaya nilai turunan tidak bisa dikarang klien.
 */

export type MetaBerkasPdf = {
  /**
   * Kitab sasaran bukti; null untuk unggahan yang terjadi sebelum kitabnya
   * dibuat. Route unggah menandatangani nilai ini sehingga bukti milik A tidak
   * bisa ditukar untuk menempelkan berkas A ke kitab B.
   */
  kitabId: string | null
  path: string
  byte: number
  halaman: number
}

type Muatan = MetaBerkasPdf & { kedaluwarsa: number }

/** Sama dengan batas `skemaKitab.jumlahHalaman`, dipakai menyaring nilai dari bukti. */
const MAKS_HALAMAN = 5000

function masaTandaDetik() {
  const nilai = Number(process.env.TANDA_BERKAS_MASA_DETIK)
  return Number.isFinite(nilai) && nilai > 0 ? nilai : 3 * 60 * 60
}

/** Kunci yang sama dengan penyimpanan berkas: bukti hanya lahir dari unggahan sungguhan. */
function kunciRahasia(): string | null {
  const kunci = process.env.BUNNY_STORAGE_ACCESS_KEY
  return kunci && kunci.length >= 16 ? kunci : null
}

function tandaBase64Url(payload: string, kunciRahasia: string) {
  return createHmac("sha256", kunciRahasia).update(payload).digest("base64url")
}

export function buatTandaBerkas(meta: MetaBerkasPdf, sekarang = Date.now()): string {
  const kunci = kunciRahasia()
  if (!kunci) {
    throw new Error(
      "BUNNY_STORAGE_ACCESS_KEY belum diisi, jadi bukti unggahan tidak dapat dibuat."
    )
  }
  const muatan: Muatan = {
    kitabId: meta.kitabId,
    path: meta.path,
    byte: meta.byte,
    halaman: meta.halaman,
    kedaluwarsa: Math.floor(sekarang / 1000) + masaTandaDetik(),
  }
  const payload = Buffer.from(JSON.stringify(muatan), "utf8").toString("base64url")
  return `${payload}.${tandaBase64Url(payload, kunci)}`
}

/**
 * Membaca dan memeriksa bukti untuk kitab `kitabId`. Nilai apa pun yang
 * meragukan (tanda tidak cocok, kedaluwarsa, jalur di luar `pdf/`, bilangan di
 * luar rentang, atau bukti milik kitab lain) menghasilkan null agar pemanggil
 * jatuh ke penolakan, bukan ke data klien.
 */
export function bacaTandaBerkas(
  token: string,
  kitabId: string | null,
  sekarang = Date.now()
): MetaBerkasPdf | null {
  const kunci = kunciRahasia()
  if (!kunci) return null

  const bagian = token.split(".")
  if (bagian.length !== 2) return null
  const [payload, tanda] = bagian
  if (!payload || !tanda) return null

  const harapan = tandaBase64Url(payload, kunci)
  const terkirim = Buffer.from(tanda)
  const semestinya = Buffer.from(harapan)
  if (terkirim.length !== semestinya.length || !timingSafeEqual(terkirim, semestinya)) return null

  let muatan: Partial<Muatan>
  try {
    muatan = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<Muatan>
  } catch {
    return null
  }

  const { path, byte, halaman, kedaluwarsa, kitabId: idBukti } = muatan
  if (typeof idBukti !== "string" && idBukti !== null) return null
  if ((idBukti ?? null) !== kitabId) return null
  if (typeof path !== "string" || !/^pdf\/[A-Za-z0-9._-]+\.pdf$/.test(path)) return null
  if (typeof byte !== "number" || !Number.isFinite(byte) || byte <= 0) return null
  if (typeof halaman !== "number" || !Number.isInteger(halaman) || halaman < 1 || halaman > MAKS_HALAMAN) {
    return null
  }
  if (typeof kedaluwarsa !== "number" || kedaluwarsa * 1000 <= sekarang) return null

  return { kitabId: idBukti, path, byte, halaman }
}
