import type { KitabVe } from "@/db/queries"

/** Sentinel filter "semua"; sengaja diduplikasi per modul admin supaya saringan kitab dan pengguna tidak saling bergantung. */
export const SEMUA = "semua"

export type SaringanKitab = { kata: string; status: string; kategori: string }

/**
 * Penyaringan sisi klien atas daftar kitab yang sudah dibawa dari server.
 * Urut newest-first dikunci di sini supaya tabel dan test memakai aturan sama.
 */
export function saringKitab(awal: KitabVe[], s: SaringanKitab): KitabVe[] {
  const q = s.kata.trim().toLowerCase()
  return awal
    .filter((kitab) => (s.status === SEMUA ? true : kitab.status === s.status))
    .filter((kitab) => (s.kategori === SEMUA ? true : kitab.kategoriId === s.kategori))
    .filter((kitab) => {
      if (!q) return true
      return [
        kitab.judulLatin,
        kitab.judulArab,
        kitab.pengarang.namaLatin,
        kitab.kategori.nama,
        kitab.slug,
      ].some((teks) => teks.toLowerCase().includes(q))
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

/** Pasangan [id, nama] untuk pilihan fan, tanpa duplikat, urut locale Indonesia. */
export function opsiFilterKategori(awal: KitabVe[]): [string, string][] {
  const peta = new Map<string, string>()
  for (const kitab of awal) peta.set(kitab.kategoriId, kitab.kategori.nama)
  return [...peta.entries()].sort((a, b) => a[1].localeCompare(b[1], "id"))
}

export function hitungStatusKitab(awal: KitabVe[]) {
  return {
    total: awal.length,
    tayang: awal.filter((k) => k.status === "published").length,
    draf: awal.filter((k) => k.status === "draft").length,
    arsip: awal.filter((k) => k.status === "archived").length,
  }
}
