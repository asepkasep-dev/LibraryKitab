import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  judul,
  deskripsi,
  tautan,
  className,
  align = "left",
}: {
  eyebrow?: string
  judul: string
  deskripsi?: string
  tautan?: { href: string; label: string }
  className?: string
  align?: "left" | "center"
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold/80">
          <span className="h-px w-6 bg-gold/50" />
          {eyebrow}
        </span>
      )}
      <div
        className={cn(
          "flex flex-wrap items-end gap-3",
          align === "center" ? "justify-center" : "justify-between",
        )}
      >
        <h2 className="max-w-2xl text-3xl font-bold text-balance">{judul}</h2>
        {tautan && (
          <Link
            href={tautan.href}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-gold transition-colors hover:text-gold-hover"
          >
            {tautan.label}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      {deskripsi && (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {deskripsi}
        </p>
      )}
    </div>
  )
}
