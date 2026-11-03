"use client"

import { useState } from "react"
import { History } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Anjuran melanjutkan dari halaman terakhir; hanya untuk pembaca yang datang dari riwayat. */
export function SaranLanjutBaca({
  sumberAwal,
  halamanAwal,
  onMulaiDariAwal,
}: {
  sumberAwal: "riwayat" | "tautan"
  halamanAwal: number
  onMulaiDariAwal: () => void
}) {
  const [ditutup, setDitutup] = useState(false)

  if (sumberAwal !== "riwayat" || halamanAwal <= 2 || ditutup) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-20 z-30 flex justify-center px-4">
      <div className="surface-card pointer-events-auto flex max-w-full flex-wrap items-center gap-2 rounded-2xl px-3 py-2 text-xs">
        <History className="size-4 shrink-0 text-gold" strokeWidth={1.75} />
        <span className="text-foreground">
          Melanjutkan dari halaman {halamanAwal} sesuai riwayat baca Anda.
        </span>
        <Button
          variant="ghost"
          size="xs"
          className="text-gold hover:bg-gold/10 hover:text-gold"
          onClick={() => {
            onMulaiDariAwal()
            setDitutup(true)
          }}
        >
          Mulai dari awal
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="text-muted-foreground"
          onClick={() => setDitutup(true)}
        >
          Tutup
        </Button>
      </div>
    </div>
  )
}
