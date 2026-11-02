import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, Ban, Check, Clock, Mail, Phone, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ambilSesi } from "@/lib/auth"
import { KONTAK_EMAIL, KONTAK_JAM, KONTAK_TELEPON } from "@/lib/site"

export const metadata: Metadata = {
  title: "Akun dinonaktifkan",
}

const DIBLOKIR = [
  "Masuk ke dasbor, bookmark, catatan, dan riwayat baca",
  "Menyimpan progres bacaan baru dari perangkat mana pun",
  "Menambah atau mengubah catatan pribadi",
]

const TETAP_TERBUKA = [
  "Katalog kitab dan halaman detail koleksi tetap terbuka",
  "Pembaca kitab (/baca) tetap dapat dipakai tanpa login",
  "Bookmark, catatan, dan riwayat Anda tidak dihapus, hanya disembunyikan",
]

export default async function AkunNonaktifPage() {
  const { pengguna } = await ambilSesi()
  if (pengguna?.status === "aktif") redirect("/dashboard")
  const email = pengguna?.email ?? "akun Anda"
  const nama = pengguna?.namaLengkap || "Akun ini"
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-red-500/15 ring-1 ring-red-500/25">
          <ShieldOff className="size-6 text-red-300" strokeWidth={1.75} />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-300/90">
          Akses anggota dibatasi
        </p>
        <h1 className="font-heading text-2xl font-bold text-balance sm:text-3xl">
          Akun ini sedang dinonaktifkan
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Pengelola perpustakaan menonaktifkan akun tersebut, sehingga area
          keanggotaan tidak dapat dibuka. Tidak ada data baca yang hilang.
          Seluruh bookmark, catatan, dan riwayat menunggu akun aktif kembali.
        </p>
      </header>

      <div className="surface-card space-y-3 p-5">
        <h2 className="font-heading text-base font-semibold">Yang tidak berjalan</h2>
        <ul className="space-y-2">
          {DIBLOKIR.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Ban className="mt-0.5 size-4 shrink-0 text-red-300" strokeWidth={1.75} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="surface-card space-y-3 p-5">
        <h2 className="font-heading text-base font-semibold">Yang tetap bisa Anda buka</h2>
        <ul className="space-y-2">
          {TETAP_TERBUKA.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-300" strokeWidth={2} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="surface-inset space-y-3 p-5">
        <h2 className="font-heading text-base font-semibold">Cara mengaktifkan kembali</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Kirim permintaan aktivasi ulang melalui halaman Kontak dengan keperluan
          <span className="text-foreground"> “Kendala akun anggota”</span>, atau
          datang langsung ke perpustakaan pada jam layanan.
        </p>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Mail className="size-4 text-gold" strokeWidth={1.75} />
            {KONTAK_EMAIL}
          </li>
          <li className="flex items-center gap-2">
            <Clock className="size-4 text-gold" strokeWidth={1.75} />
            {KONTAK_JAM}
          </li>
          <li className="flex items-center gap-2">
            <Phone className="size-4 text-gold" strokeWidth={1.75} />
            Telepon pengelola: {KONTAK_TELEPON}
          </li>
        </ul>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild size="sm">
            <Link href="/kontak">
              Hubungi pengelola
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/sign-in">Coba masuk lagi</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>
          Akun{" "}
          <span className="text-foreground">{nama}</span> ({email}) dinonaktifkan
          oleh pengelola dan dapat aktif kembali setelah{" "}
          <Link
            href="/admin/pengguna"
            className="text-gold underline-offset-4 hover:underline"
          >
            Daftar Pengguna
          </Link>{" "}
          di panel pengelola mengubah statusnya menjadi aktif.
        </p>
        <Link href="/" className="text-gold hover:text-gold-hover">
          Kembali ke beranda
        </Link>
      </div>
    </div>
  )
}
