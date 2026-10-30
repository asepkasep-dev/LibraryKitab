import type { Metadata } from "next"
import { Bookmark, NotebookPen, RotateCcw } from "lucide-react"
import { SignUp } from "@clerk/nextjs"

export const metadata: Metadata = {
  title: "Daftar akun baru",
  description:
    "Buat akun KitabKu Pesantren untuk menyimpan bookmark, mencatat pemahaman per halaman, dan melanjutkan bacaan dari halaman terakhir.",
}

const MANFAAT = [
  {
    ikon: Bookmark,
    teks: "Tandai halaman penting, buka kembali sekali klik.",
  },
  {
    ikon: NotebookPen,
    teks: "Catat pemahaman per halaman, hanya Anda yang membacanya.",
  },
  {
    ikon: RotateCcw,
    teks: "Pindah perangkat, bacaan berlanjut di halaman terakhir.",
  },
]

export default function DaftarPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">
          Keanggotaan gratis
        </p>
        <h1 className="font-heading text-2xl font-bold text-balance sm:text-3xl">
          Buat akun santri atau ustadz
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Satu email untuk seluruh koleksi. Setelah masuk, lengkapi peran dan
          kelas Anda di dasbor agar saran kitab lebih tepat.
        </p>
      </header>

      <ul className="grid gap-2">
        {MANFAAT.map((item) => (
          <li
            key={item.teks}
            className="surface-inset flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gold/15 ring-1 ring-gold/25">
              <item.ikon className="size-4 text-gold" strokeWidth={1.75} />
            </span>
            {item.teks}
          </li>
        ))}
      </ul>

      <div className="surface-card flex justify-center p-4 sm:p-6">
        <SignUp signInUrl="/sign-in" fallbackRedirectUrl="/dashboard/profil" />
      </div>
    </div>
  )
}
