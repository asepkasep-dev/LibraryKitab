import { z } from "zod"
import { OPSI_URUT, type UrutanKatalog } from "@/lib/site"

export const SEMUA = "semua"

const PANJANG_KATA_MAKS = 80

export type QueryKatalog = {
  q: string
  kategori: string
  pengarang: string
  syarah: string
  urut: UrutanKatalog
  halaman: number
}

export type ParamSearch = Record<string, string | string[] | undefined>

export function ambilString(nilai: string | string[] | undefined): string {
  return typeof nilai === "string" ? nilai : ""
}

/**
 * Filter pengarang dan syarah dipakai sebagai pembanding kolom uuid, jadi nilai
 * apa pun yang bukan uuid dibuang sebelum sempat masuk ke query.
 */
function ambilUuid(nilai: string | string[] | undefined): string {
  const raw = ambilString(nilai)
  if (!raw || raw === SEMUA) return SEMUA
  return z.uuid().safeParse(raw).success ? raw : SEMUA
}

/**
 * Nomor halaman dari address bar bisa berupa apa pun, termasuk "2.7" dan
 * "Infinity". Offset dihitung dari nilai ini, jadi hanya bilangan bulat positif
 * yang diteruskan; selain itu kembali ke halaman satu.
 */
function nomorHalaman(nilai: string): number {
  const nomor = Number(nilai)
  return Number.isFinite(nomor) ? Math.max(1, Math.trunc(nomor)) : 1
}

export function bacaQuery(sp: ParamSearch): QueryKatalog {
  const urut = ambilString(sp.urut)
  return {
    q: ambilString(sp.q).slice(0, PANJANG_KATA_MAKS),
    kategori: ambilString(sp.kategori) || SEMUA,
    pengarang: ambilUuid(sp.pengarang),
    syarah: ambilUuid(sp.syarah),
    urut: OPSI_URUT.find((o) => o.nilai === urut)?.nilai ?? "terbaru",
    halaman: nomorHalaman(ambilString(sp.halaman)),
  }
}
