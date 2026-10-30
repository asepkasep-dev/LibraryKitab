"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function FaqAccordion({
  items,
}: {
  items: { pertanyaan: string; jawaban: string }[]
}) {
  const [kataKunci, setKataKunci] = useState("")
  const [terbuka, setTerbuka] = useState<number | null>(0)

  const hasil = useMemo(() => {
    const q = kataKunci.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) =>
      `${item.pertanyaan} ${item.jawaban}`.toLowerCase().includes(q),
    )
  }, [items, kataKunci])

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.75}
        />
        <Input
          type="search"
          value={kataKunci}
          onChange={(e) => setKataKunci(e.target.value)}
          placeholder="Cari pertanyaan, misalnya: biaya, bookmark…"
          aria-label="Cari pertanyaan umum"
          className="pl-10"
        />
      </div>

      {hasil.length === 0 ? (
        <p className="surface-card p-6 text-sm text-muted-foreground">
          Belum ada pertanyaan yang cocok dengan “{kataKunci}”. Coba kata lain,
          atau kirim pesan lewat halaman kontak — jawabannya akan kami tambahkan
          ke daftar ini.
        </p>
      ) : (
        <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          {hasil.map((item, indeks) => {
            const aktif = terbuka === indeks
            return (
              <details
                key={item.pertanyaan}
                open={aktif}
                onToggle={(e) =>
                  setTerbuka(
                    (e.currentTarget as HTMLDetailsElement).open ? indeks : null,
                  )
                }
                className="group/faq"
              >
                <summary
                  className={cn(
                    "flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium transition-colors sm:text-[15px]",
                    aktif ? "text-gold" : "text-foreground hover:text-gold",
                  )}
                >
                  <span className="text-pretty">{item.pertanyaan}</span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
                      aktif && "rotate-180 text-gold",
                    )}
                    strokeWidth={1.75}
                  />
                </summary>
                <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {item.jawaban}
                </div>
              </details>
            )
          })}
        </div>
      )}
    </div>
  )
}
