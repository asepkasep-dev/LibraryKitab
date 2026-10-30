import Link from "next/link"
import { BookMarked } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({
  className,
  href = "/",
  compact = false,
}: {
  className?: string
  href?: string | null
  compact?: boolean
}) {
  const isi = (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold/15 ring-1 ring-gold/30">
        <BookMarked className="size-5 text-gold" strokeWidth={1.75} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-[15px] font-bold tracking-tight text-foreground">
          KitabKu
        </span>
        {!compact && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold/80">
            Pesantren
          </span>
        )}
      </span>
    </span>
  )

  return href === null ? isi : <Link href={href}>{isi}</Link>
}
