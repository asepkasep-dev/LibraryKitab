import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function LegalShell({
  judul,
  pembuka,
  diperbarui,
  bagian,
}: {
  judul: string
  pembuka: string
  diperbarui: string
  bagian: { judul: string; isi: ReactNode }[]
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-gold"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Kembali ke beranda
      </Link>

      <header className="mt-5 space-y-3">
        <h1 className="text-3xl font-bold text-balance md:text-4xl">{judul}</h1>
        <p className="text-xs text-muted-foreground">
          Terakhir disesuaikan: {diperbarui}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">{pembuka}</p>
      </header>

      <Card className="mt-8 gap-0 p-0">
        <CardContent className="divide-y divide-white/5 px-6">
          {bagian.map((item, indeks) => (
            <section key={item.judul} className="space-y-2.5 py-6">
              <h2 className="font-heading text-lg font-semibold">
                <span className="mr-2 text-gold/70">{indeks + 1}.</span>
                {item.judul}
              </h2>
              <div className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                {item.isi}
              </div>
            </section>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
