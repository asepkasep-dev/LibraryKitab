"use client"

import { useRef, type TouchEvent } from "react"
import { HalamanPdf } from "@/components/reader/halaman-pdf"
import { arahGeser } from "@/lib/baca-alur"

/** Kanvas baca: wadah gulir, gestur geser kiri/kanan, dan halaman PDF yang dirender. */
export function KanvasBaca({
  url,
  slug,
  judul,
  halaman,
  zoom,
  sepia,
  onLompat,
}: {
  url: string | null
  slug: string
  judul: string
  halaman: number
  zoom: number
  sepia: boolean
  onLompat: (tujuan: number) => void
}) {
  const sentuhan = useRef<{ x: number; y: number } | null>(null)

  function padaSentuhanAkhir(e: TouchEvent) {
    const awal = sentuhan.current
    sentuhan.current = null
    const titik = e.changedTouches[0]
    const arah = arahGeser(awal, titik ? { x: titik.clientX, y: titik.clientY } : null)
    if (arah === null) return
    onLompat(arah === 1 ? halaman + 1 : halaman - 1)
  }

  return (
    <div
      className="min-h-0 flex-1 overflow-auto px-4 pt-8 pb-32 sm:px-6"
      onTouchStart={(e) => {
        const titik = e.touches[0]
        sentuhan.current = titik ? { x: titik.clientX, y: titik.clientY } : null
      }}
      onTouchEnd={padaSentuhanAkhir}
    >
      <div className="flex min-h-full justify-center">
        <HalamanPdf
          url={url}
          slug={slug}
          judul={judul}
          halaman={halaman}
          zoom={zoom}
          sepia={sepia}
        />
      </div>
    </div>
  )
}
