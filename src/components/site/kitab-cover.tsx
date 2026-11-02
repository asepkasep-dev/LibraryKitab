import type { KitabVe } from "@/db/queries"
import { cn } from "@/lib/utils"

/** Nada warna sampul ditentukan per fan agar katalog mudah dipindai mata. */
const WARNA_SAMPUL: Record<string, [string, string]> = {
  nahwu: ["222", "43"],
  sharaf: ["172", "210"],
  fiqih: ["142", "190"],
  tauhid: ["268", "222"],
  tafsir: ["38", "24"],
  hadis: ["190", "222"],
  "akhlak-tasawuf": ["330", "262"],
  "ushul-fiqih": ["210", "45"],
}

export function KitabCover({
  kitab,
  className,
  sizes = "portrait",
}: {
  kitab: KitabVe
  className?: string
  sizes?: "portrait" | "wide" | "micro"
}) {
  const [hueA, hueB] = WARNA_SAMPUL[kitab.kategori.slug] ?? ["222", "43"]

  if (sizes === "micro") {
    return (
      <div
        aria-hidden
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-lg ring-1 ring-white/10",
          className,
        )}
        style={{
          backgroundImage: `linear-gradient(140deg, hsl(${hueA} 45% 22%), hsl(${hueB} 55% 16%))`,
        }}
      >
        <span className="text-arabic text-xs text-gold/90">ك</span>
      </div>
    )
  }

  return (
    <figure
      role="img"
      aria-label={`Sampul kitab ${kitab.judulLatin} (${kitab.judulArab}), fan ${kitab.kategori.nama}`}
      className={cn(
        "relative flex overflow-hidden rounded-xl ring-1 ring-white/10",
        sizes === "portrait" ? "aspect-3/4" : "aspect-16/9",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(150deg, hsl(${hueA} 48% 24%) 0%, hsl(${hueA} 44% 13%) 45%, hsl(${hueB} 52% 17%) 100%)`,
      }}
    >
      <svg
        aria-hidden
        className="absolute inset-0 size-full opacity-[0.13]"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id={`ornamen-${kitab.slug}`}
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect
              x="6"
              y="6"
              width="16"
              height="16"
              fill="none"
              stroke="hsl(43 74% 70%)"
              strokeWidth="0.8"
            />
            <circle cx="14" cy="14" r="2.2" fill="hsl(43 74% 70%)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#ornamen-${kitab.slug})`} />
      </svg>

      <div className="absolute inset-3 rounded-lg border border-gold/25" />

      <div className="relative z-10 flex size-full flex-col items-center justify-between gap-2 p-5 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/70">
          {kitab.kategori.nama.split(" ")[0]}
        </span>
        <span className="text-arabic text-lg leading-[1.9] font-bold text-balance text-foreground drop-shadow sm:text-xl">
          {kitab.judulArab}
        </span>
        <div className="space-y-1">
          <p className="font-heading text-[13px] leading-tight font-semibold text-balance">
            {kitab.judulLatin}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {kitab.pengarang.namaLatin}
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/45 to-transparent" />
    </figure>
  )
}
