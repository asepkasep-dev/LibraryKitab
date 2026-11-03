"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  hapusCatatanId,
  tambahCatatan as tambahCatatanAksi,
  ubahCatatanIsi,
} from "@/actions/baca"
import type { CatatanVe } from "@/db/queries"
import { urutCatatan } from "@/lib/baca-alur"

/** Daftar catatan satu kitab; mutasinya optimistik dan membawa urungan. */
export function useCatatanBaca({
  kitabId,
  penggunaId,
  halaman,
  catatanAwal,
}: {
  kitabId: string
  penggunaId: string
  halaman: number
  catatanAwal: CatatanVe[]
}) {
  const [catatan, setCatatan] = useState(() => urutCatatan(catatanAwal))

  async function tambahCatatan(isi: string) {
    const hasil = await tambahCatatanAksi({ kitabId, halaman, isi })
    if (!hasil.ok) {
      toast.error(hasil.pesan)
      return
    }
    const sekarang = new Date()
    const baru: CatatanVe = {
      id: hasil.id ?? "",
      userId: penggunaId,
      kitabId,
      halaman,
      isi,
      createdAt: sekarang,
      updatedAt: sekarang,
    }
    setCatatan((daftar) => urutCatatan([baru, ...daftar]))
    toast.success(`Catatan tersimpan di halaman ${halaman}`)
  }

  async function ubahCatatan(id: string, isi: string) {
    const hasil = await ubahCatatanIsi(id, isi)
    if (!hasil.ok) {
      toast.error(hasil.pesan)
      return
    }
    setCatatan((daftar) =>
      urutCatatan(daftar.map((c) => (c.id === id ? { ...c, isi, updatedAt: new Date() } : c))),
    )
    toast.success("Catatan diperbarui")
  }

  async function hapusCatatan(id: string) {
    const tersimpan = catatan.find((c) => c.id === id)
    if (!tersimpan) return
    setCatatan((daftar) => urutCatatan(daftar.filter((c) => c.id !== id)))
    const hasil = await hapusCatatanId(id)
    if (!hasil.ok) {
      setCatatan((daftar) => urutCatatan([tersimpan, ...daftar]))
      toast.error(hasil.pesan)
      return
    }
    toast.success("Catatan dihapus", {
      action: {
        label: "Urungkan",
        onClick: () => void pulihkanCatatan(tersimpan),
      },
    })
  }

  async function pulihkanCatatan(item: CatatanVe) {
    const hasil = await tambahCatatanAksi({
      kitabId,
      halaman: item.halaman,
      isi: item.isi,
    })
    if (!hasil.ok) {
      toast.error(hasil.pesan)
      return
    }
    setCatatan((daftar) => urutCatatan([{ ...item, id: hasil.id ?? item.id }, ...daftar]))
  }

  return { catatan, tambahCatatan, ubahCatatan, hapusCatatan }
}
