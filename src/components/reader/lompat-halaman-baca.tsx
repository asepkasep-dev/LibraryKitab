"use client"

import { useEffect, useState } from "react"
import { tujuanLompatBaca } from "@/lib/baca-alur"

/** Kolom nomor halaman: teks bebas di layar, tujuan terbates saat dikirim. */
export function LompatHalamanBaca({
  halaman,
  totalHalaman,
  onLompat,
}: {
  halaman: number
  totalHalaman: number
  onLompat: (halaman: number) => void
}) {
  const [teksLompat, setTeksLompat] = useState(String(halaman))

  useEffect(() => {
    setTeksLompat(String(halaman))
  }, [halaman])

  function kirimLompat(berkas: React.FormEvent) {
    berkas.preventDefault()
    const tujuan = tujuanLompatBaca(teksLompat, totalHalaman)
    if (tujuan === null) {
      setTeksLompat(String(halaman))
      return
    }
    onLompat(tujuan)
  }

  return (
    <form onSubmit={kirimLompat} className="flex items-center gap-1 px-1">
      <label htmlFor="lompat-halaman" className="sr-only">
        Nomor halaman
      </label>
      <input
        id="lompat-halaman"
        value={teksLompat}
        onChange={(e) => setTeksLompat(e.target.value.replace(/\D/g, ""))}
        onBlur={() => setTeksLompat(String(halaman))}
        inputMode="numeric"
        className="h-9 w-12 rounded-lg border border-white/10 bg-white/5 text-center font-heading text-sm font-semibold tabular-nums outline-none focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/40"
      />
      <span className="text-sm text-muted-foreground tabular-nums">
        / {totalHalaman}
      </span>
    </form>
  )
}
