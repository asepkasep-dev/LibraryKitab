import { Archive, CheckCircle2, EyeOff } from "lucide-react"
import type { StatusKitab } from "@/db/queries"
import { cn } from "@/lib/utils"

const LABEL: Record<StatusKitab, { teks: string; kelas: string; ikon: typeof EyeOff }> = {
  published: {
    teks: "Tayang",
    kelas: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25",
    ikon: CheckCircle2,
  },
  draft: {
    teks: "Draf",
    kelas: "bg-gold/15 text-gold ring-gold/25",
    ikon: EyeOff,
  },
  archived: {
    teks: "Arsip",
    kelas: "bg-white/10 text-muted-foreground ring-white/15",
    ikon: Archive,
  },
}

export function StatusKitabBadge({
  status,
  className,
}: {
  status: StatusKitab
  className?: string
}) {
  const { teks, kelas, ikon: Ikon } = LABEL[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        kelas,
        className,
      )}
    >
      <Ikon className="size-3.5" strokeWidth={1.75} />
      {teks}
    </span>
  )
}

export function StatusPenggunaBadge({
  status,
}: {
  status: "aktif" | "nonaktif"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        status === "aktif"
          ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25"
          : "bg-red-500/15 text-red-300 ring-red-500/25",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "aktif" ? "bg-emerald-400" : "bg-red-400",
        )}
      />
      {status === "aktif" ? "Aktif" : "Nonaktif"}
    </span>
  )
}
