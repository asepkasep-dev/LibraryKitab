import type { PenggunaVe } from "@/db/queries"

/** Sentinel filter "semua"; sengaja diduplikasi per modul admin supaya saringan kitab dan pengguna tidak saling bergantung. */
export const SEMUA = "semua"

export type BarisPengguna = {
  pengguna: PenggunaVe
  jumlahBookmark: number
  jumlahCatatan: number
  jumlahRiwayat: number
}

export type SaringanPengguna = { kata: string; peran: string; akses: string }

export function saringPengguna(awal: BarisPengguna[], s: SaringanPengguna): BarisPengguna[] {
  const q = s.kata.trim().toLowerCase()
  return awal.filter((baris) => {
    if (s.peran !== SEMUA) {
      const nilai = baris.pengguna.jenisPeran ?? "belum-diisi"
      if (nilai !== s.peran) return false
    }
    if (s.akses !== SEMUA && baris.pengguna.role !== s.akses) return false
    if (!q) return true
    return [baris.pengguna.namaLengkap, baris.pengguna.email, baris.pengguna.kelas].some((teks) =>
      teks.toLowerCase().includes(q),
    )
  })
}

export function hitungPengguna(awal: BarisPengguna[]) {
  return {
    total: awal.length,
    nonaktif: awal.filter((b) => b.pengguna.status === "nonaktif").length,
    pengelola: awal.filter((b) => b.pengguna.role === "admin").length,
  }
}
