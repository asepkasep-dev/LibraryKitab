"use client"

import { cn } from "@/lib/utils"

/** Nomor halaman yang bisa diklik; dipakai daftar bookmark dan daftar catatan. */
export function ChipHalaman({
  nomor,
  aktif,
  onClick,
}: {
  nomor: number
  aktif?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Pergi ke halaman ${nomor}`}
      className={cn(
        "grid h-7 min-w-9 shrink-0 place-items-center rounded-lg px-1.5 font-heading text-xs font-semibold tabular-nums ring-1 ring-inset transition-colors",
        aktif
          ? "bg-gold/20 text-gold ring-gold/30"
          : "bg-white/5 text-muted-foreground ring-white/10 hover:bg-white/10 hover:text-white",
      )}
    >
      {nomor}
    </button>
  )
}
