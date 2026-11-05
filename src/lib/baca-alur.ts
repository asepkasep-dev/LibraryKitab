/**
 * Keputusan murni reader: urutan daftar, batas halaman, arah geseran, tombol
 * navigasi, lompat halaman, preferensi tersimpan, dan kalimat pil progres.
 * Tidak ada React dan tidak ada DOM di sini, jadi semuanya bisa diuji tanpa
 * perender. State dan efeknya tetap di komponen.
 */

import { ZOOM_BAKU, batasiZoom } from "@/lib/baca"
import { hitungPersentase } from "@/lib/format"
import type { BookmarkVe, CatatanVe } from "@/db/queries"

/** Status kirim progres baca di pil header reader. */
export type StatusProgres = "diam" | "menyimpan" | "tersimpan" | "gagal"

/** Titik sentuh pada layar, tanpa membungkus Touch. */
export type Titik = { x: number; y: number }

/** Tujuan mentah dari tombol navigasi; yang membatasi adalah `pindah`, seperti hari ini. */
export type AksiTombolBaca = { jenis: "halaman"; tujuan: number } | null

/** Preferensi baca di localStorage; `rusak` menandai JSON yang tidak bisa dibaca. */
export type PreferensiBacaTersimpan = { zoom: number; sepia: boolean; rusak: boolean }

/** Bookmark dibaca dari halaman paling depan. */
export function urutBookmark(daftar: BookmarkVe[]) {
  return [...daftar].sort((a, b) => a.halaman - b.halaman)
}

/** Catatan terbaru lebih dulu, mengikuti halaman terakhir yang ditulis. */
export function urutCatatan(daftar: CatatanVe[]) {
  return [...daftar].sort((a, b) => b.halaman - a.halaman)
}

/** Nomor halaman jatuh ke rentang 1..batas, dibulatkan ke terdekat. */
export function batasiHalaman(nilai: number, batas: number) {
  return Math.min(batas, Math.max(1, Math.round(nilai)))
}

/** Jarak horizontal minimum supaya sentuhan biasa tidak berpindah halaman. */
export const AMBANG_GESER_X_PX = 64

/** Lari vertikal maksimum; lebih dari ini pengguna sedang menggulir, bukan menggeser. */
export const MAKS_LARI_GESER_Y_PX = 90

/** Arah halaman dari dua titik sentuh; null berarti geseran diabaikan. */
export function arahGeser(awal: Titik | null, akhir: Titik | null): 1 | -1 | null {
  if (!awal || !akhir) return null
  const geserX = akhir.x - awal.x
  const geserY = akhir.y - awal.y
  if (Math.abs(geserX) < AMBANG_GESER_X_PX || Math.abs(geserY) > MAKS_LARI_GESER_Y_PX) return null
  return geserX < 0 ? 1 : -1
}

export function aksiTombolBaca(kunci: string, halaman: number, total: number): AksiTombolBaca {
  if (kunci === "ArrowRight") return { jenis: "halaman", tujuan: halaman + 1 }
  if (kunci === "ArrowLeft") return { jenis: "halaman", tujuan: halaman - 1 }
  if (kunci === "Home") return { jenis: "halaman", tujuan: 1 }
  if (kunci === "End") return { jenis: "halaman", tujuan: total }
  return null
}

/** Nomor dari kolom lompat halaman; null berarti teksnya tidak dipakai. */
export function tujuanLompatBaca(teks: string, total: number): number | null {
  const tujuan = Number.parseInt(teks, 10)
  if (Number.isNaN(tujuan)) return null
  return batasiHalaman(tujuan, total)
}

export function bacaPreferensiBaca(mentah: string | null): PreferensiBacaTersimpan {
  const bawaan = { zoom: ZOOM_BAKU, sepia: false }
  if (!mentah) return { ...bawaan, rusak: false }
  try {
    const data = JSON.parse(mentah) as { zoom?: unknown; sepia?: unknown }
    return {
      zoom: typeof data.zoom === "number" ? batasiZoom(data.zoom) : ZOOM_BAKU,
      sepia: typeof data.sepia === "boolean" ? data.sepia : false,
      rusak: false,
    }
  } catch {
    return { ...bawaan, rusak: true }
  }
}

export function tulisPreferensiBaca(p: { zoom: number; sepia: boolean }) {
  return JSON.stringify({ zoom: p.zoom, sepia: p.sepia })
}

/** Satu kalimat pil progres di header; persen ikut dihitung di sini. */
export function teksPillProgres(
  status: StatusProgres,
  halamanTersimpan: number,
  total: number,
) {
  if (status === "menyimpan") return "Menyimpan progres…"
  if (status === "gagal") return "Progres belum tersimpan"
  return `Progres di halaman ${halamanTersimpan} · ${hitungPersentase(halamanTersimpan, total)}%`
}

export type KeputusanSegarkanUrl =
  | { tindak: "tukar"; url: string }
  | { tindak: "diam" }

/**
 * Menentukan apakah URL baca hasil penanda-tanganan ulang layak dipasang.
 *
 * Tiga alasan untuk diam: server menolak, kitab memang tidak punya PDF, atau URL
 * yang kembali sama dengan yang sedang aktif. Alasan keempat adalah penjaga loop:
 * penyegaran otomatis hanya boleh sekali sampai dokumen berhasil dimuat, sebab
 * pdf.js mengunduh ulang seluruh berkas setiap kali URL berganti.
 */
export function putuskanSegarkanUrl({
  sudahOtomatis,
  urlAktif,
  hasil,
}: {
  sudahOtomatis: boolean
  urlAktif: string | null
  hasil: { ok: boolean; url: string | null }
}): KeputusanSegarkanUrl {
  if (!hasil.ok || hasil.url === null) return { tindak: "diam" }
  if (hasil.url === urlAktif) return { tindak: "diam" }
  if (sudahOtomatis) return { tindak: "diam" }
  return { tindak: "tukar", url: hasil.url }
}
