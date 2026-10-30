const tanggalPanjang = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

const tanggalSingkat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

const tanggalWaktu = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const angka = new Intl.NumberFormat("id-ID")

/** Kolom timestamp Drizzle berupa `Date`, data dummy dan API berupa ISO string. */
export type WaktuInput = string | Date

function menjadiTanggal(waktu: WaktuInput) {
  return waktu instanceof Date ? waktu : new Date(waktu)
}

export function formatTanggal(waktu: WaktuInput) {
  return tanggalPanjang.format(menjadiTanggal(waktu))
}

export function formatTanggalSingkat(waktu: WaktuInput) {
  return tanggalSingkat.format(menjadiTanggal(waktu))
}

export function formatTanggalWaktu(waktu: WaktuInput) {
  return tanggalWaktu.format(menjadiTanggal(waktu))
}

export function formatAngka(nilai: number) {
  return angka.format(nilai)
}

export function formatUkuranBerkas(byte: number) {
  if (byte < 1024) return `${byte} B`
  const mb = byte / 1024 / 1024
  return mb >= 10 ? `${mb.toFixed(0)} MB` : `${mb.toFixed(1)} MB`
}

export function waktuRelatif(waktu: WaktuInput, sekarang = Date.now()) {
  const menit = Math.round((sekarang - menjadiTanggal(waktu).getTime()) / 60_000)
  if (menit < 1) return "baru saja"
  if (menit < 60) return `${menit} menit lalu`
  const jam = Math.round(menit / 60)
  if (jam < 24) return `${jam} jam lalu`
  const hari = Math.round(jam / 24)
  if (hari === 1) return "kemarin"
  if (hari < 30) return `${hari} hari lalu`
  return formatTanggalSingkat(waktu)
}

export function inisialNama(nama: string | null | undefined) {
  if (!nama) return "K"
  return nama
    .replace(/^(ustadz|ustadzah|kh\.|u\.)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? "")
    .join("")
}

export function potongTeks(teks: string | null | undefined, batas = 140) {
  if (!teks) return ""
  return teks.length <= batas ? teks : `${teks.slice(0, batas - 1).trimEnd()}…`
}

export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

/** Persentase progres baca: halaman terakhir dibagi total halaman (Bab 6.C). */
export function hitungPersentase(halaman: number, totalHalaman: number) {
  if (totalHalaman <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((halaman / totalHalaman) * 100)))
}
