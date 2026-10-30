import Link from "next/link"
import { Compass, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/site/logo"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-white/10 bg-navy/60 backdrop-blur-xl">
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Logo />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <div className="space-y-5 text-center">
          <p className="font-heading text-7xl font-bold text-gold/25">404</p>
          <h1 className="text-3xl font-bold md:text-4xl">
            Halaman ini tidak ditemukan di rak kami
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
            Kemungkinan tautannya salah ketik atau kitabnya sedang dipindahkan
            ke rak arsip. Coba kembali ke beranda, atau lanjut ke katalog untuk
            mencari judul lain.
          </p>
          <p className="text-arabic text-xl text-gold/80">
            وَلا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/katalog">
                <Compass className="size-4" strokeWidth={1.75} />
                Buka katalog
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/">
                <Home className="size-4" strokeWidth={1.75} />
                Kembali ke beranda
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
