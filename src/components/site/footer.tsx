import Link from "next/link"
import { Clock, Mail, MapPin, Phone } from "lucide-react"
import { Logo } from "@/components/site/logo"
import {
  APP_NAME,
  FOOTER_NAV,
  KONTAK_ALAMAT,
  KONTAK_EMAIL,
  KONTAK_JAM,
  KONTAK_TELEPON,
} from "@/lib/site"

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-navy-card/40 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_2fr] lg:px-8">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Perpustakaan digital kitab kuning untuk santri dan ustadz. Baca,
            tandai, dan catat pemahaman Anda — gratis, dari perangkat apa pun.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold/70" strokeWidth={1.75} />
              {KONTAK_ALAMAT}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-gold/70" strokeWidth={1.75} />
              <a
                href={`mailto:${KONTAK_EMAIL}`}
                className="hover:text-foreground"
              >
                {KONTAK_EMAIL}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-gold/70" strokeWidth={1.75} />
              {KONTAK_TELEPON}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-gold/70" strokeWidth={1.75} />
              {KONTAK_JAM}
            </li>
          </ul>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FOOTER_NAV.map((grup) => (
            <nav key={grup.judul} aria-label={grup.judul}>
              <h2 className="font-heading text-sm font-semibold text-foreground">
                {grup.judul}
              </h2>
              <ul className="mt-3 space-y-2">
                {grup.tautan.map((tautan) => (
                  <li key={tautan.href}>
                    <Link
                      href={tautan.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-gold"
                    >
                      {tautan.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Mode Demo
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Tahap 1 memakai data dummy, jadi area member dan pengelola dapat
              dibuka tanpa akun.
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground transition-colors hover:text-gold"
                >
                  Dasbor Santri
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard"
                  className="text-sm text-muted-foreground transition-colors hover:text-gold"
                >
                  Panel Pengelola
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. Diselenggarakan oleh
            perpustakaan pesantren untuk kepentingan kajian.
          </p>
          <p className="text-arabic text-sm text-gold/80">
            وَقُل رَّبِّ زِدْنِي عِلْمًا
          </p>
        </div>
      </div>
    </footer>
  )
}
