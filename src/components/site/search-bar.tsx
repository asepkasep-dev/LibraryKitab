"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Kolom pencarian kitab. Pada Tahap 1 hanya mengarahkan ke /katalog;
 * pembaruan hasil langsung (debounce) dilakukan halaman katalog.
 */
export function SearchBar({
  variant = "hero",
  defaultNilai = "",
  className,
}: {
  variant?: "hero" | "compact"
  defaultNilai?: string
  className?: string
}) {
  const router = useRouter()
  const [nilai, setNilai] = useState(defaultNilai)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = nilai.trim()
    router.push(q ? `/katalog?q=${encodeURIComponent(q)}` : "/katalog")
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className={cn(
        "relative flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl transition-shadow focus-within:border-gold/40 focus-within:ring-4 focus-within:ring-gold/15",
        className,
      )}
    >
      <Search
        className={cn(
          "ml-2 shrink-0 text-muted-foreground",
          variant === "hero" ? "size-5" : "size-4",
        )}
        strokeWidth={1.75}
      />
      <input
        type="search"
        value={nilai}
        onChange={(e) => setNilai(e.target.value)}
        placeholder={
          variant === "hero"
            ? "Cari kitab, pengarang, atau syarah… misalnya: nahwu"
            : "Cari kitab…"
        }
        aria-label="Cari kitab"
        className={cn(
          "min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
          variant === "hero"
            ? "text-base md:text-[15px]"
            : "h-8 text-sm",
        )}
      />
      <Button
        type="submit"
        size={variant === "hero" ? "lg" : "sm"}
        className={variant === "compact" ? "h-8 px-3" : ""}
      >
        {variant === "hero" ? "Cari" : "Cari kitab"}
      </Button>
    </form>
  )
}
