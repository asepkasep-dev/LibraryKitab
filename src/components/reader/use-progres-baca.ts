"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { simpanProgresBacaAksi } from "@/actions/baca"
import { JEDA_SIMPAN_PROGRES_MS } from "@/lib/baca"
import type { StatusProgres } from "@/lib/baca-alur"

/** Progres baca dikirim dengan jeda 2 detik; status dan halaman tersimpan dipakai pil header. */
export function useProgresBaca({
  kitabId,
  halaman,
  masuk,
  halamanAwal,
}: {
  kitabId: string
  halaman: number
  masuk: boolean
  halamanAwal: number
}) {
  const [statusProgres, setStatusProgres] = useState<StatusProgres>("diam")
  const [halamanTersimpan, setHalamanTersimpan] = useState(halamanAwal)

  /* Progres dikirim dengan jeda 2 detik setiap kali halaman berpindah. */
  useEffect(() => {
    if (!masuk || halaman === halamanTersimpan) return
    setStatusProgres("menyimpan")
    const jeda = setTimeout(() => {
      void simpanProgresBacaAksi({ kitabId, halaman }).then((hasil) => {
        if (hasil.ok) {
          setHalamanTersimpan(halaman)
          setStatusProgres("tersimpan")
        } else {
          setStatusProgres("gagal")
          toast.error(hasil.pesan)
        }
      })
    }, JEDA_SIMPAN_PROGRES_MS)
    return () => clearTimeout(jeda)
  }, [halaman, masuk, halamanTersimpan, kitabId])

  return { statusProgres, halamanTersimpan }
}
