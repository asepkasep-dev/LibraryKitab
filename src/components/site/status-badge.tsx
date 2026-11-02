import { Archive, CheckCircle2, EyeOff } from "lucide-react"
import type { StatusKitab } from "@/db/queries"
import { cn } from "@/lib/utils"

const LABEL: Record<StatusKitab, { teks: string; kelas: string; ikon: typeof EyeOff }> = {
  published: {
    teks: "Tayang",
    kelas: "bg-sukses/15 text-sukses ring-sukses/25",
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
          ? "bg-sukses/15 text-sukses ring-sukses/25"
          : "bg-destructive/15 text-destructive ring-destructive/25",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "aktif" ? "bg-sukses" : "bg-destructive",
        )}
      />
      {status === "aktif" ? "Aktif" : "Nonaktif"}
    </span>
  )
}
