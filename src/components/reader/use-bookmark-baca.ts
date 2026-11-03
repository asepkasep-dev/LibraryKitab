"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  hapusBookmarkHalaman,
  hapusBookmarkId,
  tambahBookmark,
} from "@/actions/baca"
import type { BookmarkVe } from "@/db/queries"
import { urutBookmark } from "@/lib/baca-alur"
import type { PanelBaca } from "@/components/reader/toolbar-baca"

/**
 * Daftar bookmark satu kitab beserta mutasinya. Perubahan langsung tampil dan
 * dikembalikan kalau server menolak; keberhasilan menghapus membawa urungan yang
 * ikut tersimpan di server, bukan hanya di layar.
 */
export function useBookmarkBaca({
  kitabId,
  penggunaId,
  halaman,
  masuk,
  bookmarkAwal,
  onPilihPanel,
}: {
  kitabId: string
  penggunaId: string
  halaman: number
  masuk: boolean
  bookmarkAwal: BookmarkVe[]
  onPilihPanel: (tab: PanelBaca) => void
}) {
  const router = useRouter()
  const [bookmark, setBookmark] = useState(() => urutBookmark(bookmarkAwal))
  const bookmarkHalamanIni = bookmark.find((b) => b.halaman === halaman)

  async function tandaiHalaman() {
    if (!masuk) {
      toast.info("Masuk untuk menyimpan bookmark", {
        description:
          "Reader tetap bisa dipakai tanpa akun, tetapi tandanya tidak tersimpan.",
        action: { label: "Masuk", onClick: () => router.push("/sign-in") },
      })
      return
    }
    const yangAda = bookmarkHalamanIni
    if (yangAda) {
      setBookmark((daftar) => urutBookmark(daftar.filter((b) => b.id !== yangAda.id)))
      const hasil = await hapusBookmarkHalaman({ kitabId, halaman })
      if (hasil.ok) {
        toast.success(`Bookmark halaman ${halaman} dihapus`, {
          action: {
            label: "Urungkan",
            onClick: () => void pulihkanBookmark(yangAda),
          },
        })
      } else {
        setBookmark((daftar) => urutBookmark([yangAda, ...daftar]))
        toast.error(hasil.pesan)
      }
      return
    }
    const hasil = await tambahBookmark({ kitabId, halaman })
    if (!hasil.ok) {
      toast.error(hasil.pesan)
      return
    }
    const baru: BookmarkVe = {
      id: hasil.id ?? "",
      userId: penggunaId,
      kitabId,
      halaman,
      label: null,
      createdAt: new Date(),
    }
    setBookmark((daftar) => urutBookmark([baru, ...daftar]))
    onPilihPanel("bookmark")
    toast.success(`Halaman ${halaman} ditandai`, {
      description: "Beri label lewat panel bookmark agar mudah ditemukan saat muraja'ah.",
    })
  }

  /** Urungan bookmark harus ikut tersimpan di server, bukan hanya di layar. */
  async function pulihkanBookmark(item: BookmarkVe) {
    const hasil = await tambahBookmark({
      kitabId,
      halaman: item.halaman,
      label: item.label,
    })
    if (!hasil.ok) {
      toast.error(hasil.pesan)
      return
    }
    setBookmark((daftar) => urutBookmark([{ ...item, id: hasil.id ?? item.id }, ...daftar]))
  }

  async function gantiLabel(id: string, label: string) {
    const tersimpan = bookmark.find((b) => b.id === id)
    if (!tersimpan) return
    const baru = label === "" ? null : label
    setBookmark((daftar) =>
      daftar.map((b) => (b.id === id ? { ...b, label: baru } : b)),
    )
    const hasil = await tambahBookmark({
      kitabId,
      halaman: tersimpan.halaman,
      label: baru,
    })
    if (!hasil.ok) {
      setBookmark((daftar) =>
        daftar.map((b) => (b.id === id ? { ...b, label: tersimpan.label } : b)),
      )
      toast.error(hasil.pesan)
      return
    }
    toast.success("Label bookmark diperbarui")
  }

  async function hapusBookmark(id: string) {
    const tersimpan = bookmark.find((b) => b.id === id)
    if (!tersimpan) return
    setBookmark((daftar) => urutBookmark(daftar.filter((b) => b.id !== id)))
    const hasil = await hapusBookmarkId(id)
    if (!hasil.ok) {
      setBookmark((daftar) => urutBookmark([tersimpan, ...daftar]))
      toast.error(hasil.pesan)
      return
    }
    toast.success(`Bookmark halaman ${tersimpan.halaman} dihapus`, {
      action: {
        label: "Urungkan",
        onClick: () => void pulihkanBookmark(tersimpan),
      },
    })
  }

  return { bookmark, bookmarkHalamanIni, tandaiHalaman, gantiLabel, hapusBookmark }
}
