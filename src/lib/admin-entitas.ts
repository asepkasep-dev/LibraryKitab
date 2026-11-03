import type { ReactNode } from "react"
import { slugify } from "@/lib/format"

export type EntitasNilai = Record<string, string>

export type EntitasBaris = {
  id: string
  nilai: EntitasNilai
  /** Jumlah kitab yang masih memakai entitas ini; dipakai untuk proteksi hapus. */
  terkait?: number
}

export type BidangEntitas = {
  kunci: string
  label: string
  jenis: "teks" | "arab" | "textarea" | "slug"
  petunjuk?: string
  /** Kunci bidang sumber otomatis untuk bidang slug. */
  slugDari?: string
  baris?: number
}

export type KolomEntitas = {
  label: string
  sel: (baris: EntitasBaris) => ReactNode
  className?: string
}

export function saringEntitas(barisAwal: EntitasBaris[], kata: string): EntitasBaris[] {
  const q = kata.trim().toLowerCase()
  if (!q) return barisAwal
  return barisAwal.filter((baris) =>
    Object.values(baris.nilai).some((nilai) => nilai.toLowerCase().includes(q)),
  )
}

/**
 * Bidang slug mengikuti bidang sumber selama pengelola belum mengetik slug sendiri.
 * Mengembalikan kunci target plus nilai hasil slugify, atau null bila tidak ada bidang slug.
 */
export function hitungSlugOtomatis(
  bidang: BidangEntitas[],
  nilaiSumber: unknown,
): { kunci: string; nilai: string } | null {
  const target = bidang.find((item) => item.jenis === "slug")
  if (!target?.slugDari) return null
  return { kunci: target.kunci, nilai: slugify(String(nilaiSumber ?? "")) }
}
