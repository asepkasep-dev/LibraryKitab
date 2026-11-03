"use client"

import { useEffect, useState } from "react"
import { KUNCI_PREFERENSI_BACA, ZOOM_BAKU, langkahZoom } from "@/lib/baca"
import { bacaPreferensiBaca, tulisPreferensiBaca } from "@/lib/baca-alur"

/** Zoom dan Sepia Malam: dipulihkan dari localStorage, ditulis ulang tiap berubah. */
export function usePreferensiBaca() {
  const [zoom, setZoom] = useState(ZOOM_BAKU)
  const [sepia, setSepia] = useState(false)

  /* Preferensi zoom dan Sepia Malam dipulihkan dari localStorage (Bab 6.C). */
  useEffect(() => {
    const hasil = bacaPreferensiBaca(localStorage.getItem(KUNCI_PREFERENSI_BACA))
    if (hasil.rusak) localStorage.removeItem(KUNCI_PREFERENSI_BACA)
    setZoom(hasil.zoom)
    setSepia(hasil.sepia)
  }, [])

  useEffect(() => {
    localStorage.setItem(KUNCI_PREFERENSI_BACA, tulisPreferensiBaca({ zoom, sepia }))
  }, [zoom, sepia])

  function ubahZoom(arah: 1 | -1) {
    setZoom((sekarang) => langkahZoom(sekarang, arah))
  }

  return {
    zoom,
    sepia,
    ubahZoom,
    aturZoomBaku: () => setZoom(ZOOM_BAKU),
    beralihSepia: () => setSepia((s) => !s),
  }
}
