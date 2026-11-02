/**
 * Kontrak reader: rentang zoom, jeda simpan progres, dan skema Zod untuk
 * nomor halaman, label bookmark, serta isi catatan.
 */

import { z } from "zod"
import { PESAN_TIPE, skemaId } from "@/lib/validasi"

/** Rentang zoom sesuai Bab 6.C: 50% sampai 250%. */
export const ZOOM_MIN = 50
export const ZOOM_MAX = 250
export const ZOOM_BAKU = 100
export const ZOOM_LANGKAH = [50, 60, 75, 90, 100, 110, 125, 150, 175, 200, 250]

export const KUNCI_PREFERENSI_BACA = "kitabku:pembaca"
export const MAKS_LABEL_BOOKMARK = 80
export const MAKS_ISI_CATATAN = 2000
export const JEDA_SIMPAN_PROGRES_MS = 2000

export const skemaLabelBookmark = z
  .string({ error: PESAN_TIPE })
  .trim()
  .max(MAKS_LABEL_BOOKMARK, `Label bookmark maksimal ${MAKS_LABEL_BOOKMARK} karakter.`)

export const skemaIsiCatatan = z
  .string({ error: PESAN_TIPE })
  .trim()
  .min(3, "Tulis minimal 3 karakter agar catatannya berguna nanti.")
  .max(MAKS_ISI_CATATAN, `Catatan maksimal ${MAKS_ISI_CATATAN} karakter.`)

/** Nomor halaman dan id kitab dari reader wajib masuk dalam bentuk yang sah. */
export const skemaKitabHalaman = z.object({
  kitabId: skemaId,
  halaman: z
    .number({ error: PESAN_TIPE })
    .int("Nomor halaman memakai bilangan bulat.")
    .min(1, "Nomor halaman dimulai dari 1."),
})

export function batasiZoom(nilai: number) {
  // Preferensi zoom bisa mendarat kembali dari localStorage yang sudah rusak;
  // nilai non-hingga harus jatuh ke bawaan, bukan merambat sebagai NaN ke style.
  if (!Number.isFinite(nilai)) return ZOOM_BAKU
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(nilai)))
}

/** Naik/turun satu langkah pada daftar ZOOM_LANGKAH. */
export function langkahZoom(zoomSaatIni: number, arah: 1 | -1) {
  if (arah === 1) {
    return ZOOM_LANGKAH.find((z) => z > zoomSaatIni) ?? ZOOM_MAX
  }
  const sebelum = ZOOM_LANGKAH.filter((z) => z < zoomSaatIni)
  return sebelum[sebelum.length - 1] ?? ZOOM_MIN
}

/** Lebar wadah minimum supaya halaman tablet/laptop kecil tidak terpotong aneh. */
export const LEBAR_MIN_WADAH = 280

/** Skala render: halaman dilebarkan seukuran wadah lalu dikalikan persentase zoom. */
export function skalaHalaman(lebarWadah: number, lebarDasar: number, zoom: number) {
  if (!Number.isFinite(lebarWadah) || !Number.isFinite(lebarDasar) || lebarDasar <= 0) {
    return zoom / 100
  }
  const ruang = Math.max(LEBAR_MIN_WADAH, lebarWadah)
  return Math.max(0.1, (ruang / lebarDasar) * (zoom / 100))
}

/** Rasio piksel kanvas; dibatasi 2x agar memori di layar 3x tidak membengkak. */
export function rasioKanvas(devicePixelRatio: number) {
  if (!Number.isFinite(devicePixelRatio) || devicePixelRatio < 1) return 1
  return Math.min(2, devicePixelRatio)
}
