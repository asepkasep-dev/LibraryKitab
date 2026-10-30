import type { Metadata } from "next"
import Link from "next/link"
import { Search } from "lucide-react"
import { SignIn } from "@clerk/nextjs"

export const metadata: Metadata = {
  title: "Masuk ke akun",
  description:
    "Masuk ke akun KitabKu Pesantren untuk melanjutkan bacaan, membuka bookmark, dan mengelola catatan pribadi.",
}

export default function MasukPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold/80">
          Area anggota
        </p>
        <h1 className="font-heading text-2xl font-bold text-balance sm:text-3xl">
          Assalamu&apos;alaikum, silakan masuk
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Bookmark, catatan, dan progres baca tersimpan di akun Anda. Tautan
          pemulihan kata sandi tersedia lewat tombol <em>Lupa kata sandi</em>.
        </p>
      </header>

      <div className="surface-card flex justify-center p-4 sm:p-6">
        <SignIn signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
      </div>

      <p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Search className="size-3.5" strokeWidth={1.75} />
        Belum ingin mendaftar?{" "}
        <Link href="/katalog" className="text-gold underline-offset-4 hover:underline">
          Telusuri katalog kitab
        </Link>{" "}
        dan baca langsung di browser.
      </p>
    </div>
  )
}
