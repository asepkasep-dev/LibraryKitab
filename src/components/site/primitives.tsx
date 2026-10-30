import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function ProgresBar({
  nilai,
  label,
  className,
  tone = "gold",
  size = "default",
}: {
  nilai: number
  label?: string
  className?: string
  tone?: "gold" | "teal" | "sukses"
  size?: "default" | "thin"
}) {
  const aman = Math.min(100, Math.max(0, nilai))
  const warna =
    tone === "teal"
      ? "bg-teal-400"
      : tone === "sukses" || aman >= 100
        ? "bg-emerald-400"
        : "bg-gold"

  return (
    <div className={cn("space-y-1.5", className)}>
      {label !== undefined && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-heading font-semibold text-foreground tabular-nums">
            {aman}%
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={aman}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progres membaca"}
        className={cn(
          "w-full overflow-hidden rounded-full bg-white/10",
          size === "thin" ? "h-1.5" : "h-2",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            warna,
            "shadow-[0_0_12px_-2px_currentColor]",
          )}
          style={{ width: `${aman}%` }}
        />
      </div>
    </div>
  )
}

export function StatCard({
  label,
  nilai,
  keterangan,
  ikon,
  tone = "gold",
  className,
}: {
  label: string
  nilai: ReactNode
  keterangan?: string
  ikon?: ReactNode
  tone?: "gold" | "teal" | "sukses" | "netral"
  className?: string
}) {
  const aksen =
    tone === "teal"
      ? "text-teal-300 bg-teal-500/15 ring-teal-500/20"
      : tone === "sukses"
        ? "text-emerald-300 bg-emerald-500/15 ring-emerald-500/20"
        : tone === "netral"
          ? "text-sky-300 bg-sky-500/15 ring-sky-500/20"
          : "text-gold bg-gold/15 ring-gold/20"

  return (
    <div className={cn("surface-card surface-card-hover p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        {ikon && (
          <span
            className={cn(
              "grid size-9 place-items-center rounded-xl ring-1 ring-inset",
              aksen,
            )}
          >
            {ikon}
          </span>
        )}
      </div>
      <p className="mt-3 font-heading text-2xl font-bold tabular-nums sm:text-3xl">
        {nilai}
      </p>
      {keterangan && (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {keterangan}
        </p>
      )}
    </div>
  )
}

export function EmptyState({
  ikon,
  judul,
  pesan,
  aksi,
  className,
}: {
  ikon?: ReactNode
  judul: string
  pesan: string
  aksi?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("surface-card flex flex-col items-center gap-3 p-10 text-center", className)}>
      {ikon && (
        <span className="grid size-12 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10 text-gold">
          {ikon}
        </span>
      )}
      <h3 className="font-heading text-lg font-semibold">{judul}</h3>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        {pesan}
      </p>
      {aksi}
    </div>
  )
}
