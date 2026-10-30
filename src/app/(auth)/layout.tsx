import type { Metadata } from "next"
import Link from "next/link"
import { Quote } from "lucide-react"
import { Logo } from "@/components/site/logo"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-navy-card/60 p-12 backdrop-blur-xl lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(38rem 26rem at 20% 15%, hsl(43 74% 56% / 0.14), transparent 65%), radial-gradient(34rem 24rem at 85% 80%, hsl(172 60% 45% / 0.12), transparent 60%)",
          }}
        />
        <Logo className="relative" href="/" />

        <div className="relative max-w-md space-y-6">
          <p className="text-arabic text-2xl leading-[1.9] text-gold/90">
            وَمَن يَسْلُكْ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ
            طَرِيقًا إِلَى الْجَنَّةِ
          </p>
          <blockquote className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <span className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
              <Quote className="size-3.5" strokeWidth={1.75} />
              Catatan pengelola
            </span>
            <p>
              Kami merapikan ribuan halaman kitab kuning agar Anda tidak perlu
              antre di rak perpustakaan. Baca sampai halaman berapa pun,
              simpan catatan, dan lanjutkan kapan saja.
            </p>
          </blockquote>
        </div>

        <div className="relative flex flex-wrap gap-x-8 gap-y-2 text-xs text-muted-foreground">
          <Link href="/tentang" className="hover:text-gold">
            Tentang kami
          </Link>
          <Link href="/faq" className="hover:text-gold">
            Pertanyaan umum
          </Link>
          <Link href="/" className="hover:text-gold">
            Kembali ke beranda
          </Link>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-5 lg:justify-end">
          <Logo className="lg:hidden" href="/" />
          <ButtonLink />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  )
}

function ButtonLink() {
  return (
    <Link
      href="/"
      className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
    >
      Beranda
    </Link>
  )
}
