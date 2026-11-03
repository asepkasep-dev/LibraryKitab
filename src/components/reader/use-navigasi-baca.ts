"use client"

import { useCallback, useEffect, useState } from "react"
import { aksiTombolBaca, batasiHalaman } from "@/lib/baca-alur"
import type { PanelBaca } from "@/components/reader/toolbar-baca"

/** Halaman aktif plus navigasi keyboard; Escape menutup panel lewat callback pemanggil. */
export function useNavigasiBaca({
  halamanAwal,
  total,
  panel,
  onTutupPanel,
}: {
  halamanAwal: number
  total: number
  panel: PanelBaca | null
  onTutupPanel: () => void
}) {
  const [halaman, setHalaman] = useState(() => batasiHalaman(halamanAwal, total))

  const pindah = useCallback(
    (tujuan: number) => {
      setHalaman((sekarang) => {
        const aman = batasiHalaman(tujuan, total)
        return aman === sekarang ? sekarang : aman
      })
    },
    [total],
  )

  useEffect(() => {
    function padaTombol(e: KeyboardEvent) {
      const sasaran = e.target as HTMLElement | null
      if (sasaran?.closest("input, textarea, select, [contenteditable='true']")) return
      if (e.key === "Escape") {
        if (panel) onTutupPanel()
        return
      }
      const aksi = aksiTombolBaca(e.key, halaman, total)
      if (!aksi) return
      e.preventDefault()
      pindah(aksi.tujuan)
    }
    window.addEventListener("keydown", padaTombol)
    return () => window.removeEventListener("keydown", padaTombol)
  }, [halaman, total, panel, pindah, onTutupPanel])

  return { halaman, pindah }
}
