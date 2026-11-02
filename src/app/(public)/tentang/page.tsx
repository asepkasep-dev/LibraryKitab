import type { Metadata } from "next"
import Link from "next/link"
import {
  BookOpenCheck,
  Compass,
  GraduationCap,
  Landmark,
  Lightbulb,
  ScanLine,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Reveal } from "@/components/site/reveal"
import { SectionHeading } from "@/components/site/section-heading"
import { tentangKonten } from "@/lib/konten"
import { PENYELENGGARA } from "@/lib/site"

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Visi, tujuan, dan cara kerja perpustakaan digital kitab kuning yang dikelola pesantren untuk santri dan ustadz.",
}

export default function TentangPage() {
  return (
    <div className="pb-10">
      <section className="relative overflow-hidden py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(40rem 26rem at 75% 5%, hsl(43 74% 56% / 0.14), transparent 60%)",
          }}
        />
        <div className="mx-auto w-full max-w-4xl space-y-6 px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Landmark className="size-3.5 text-gold" strokeWidth={1.75} />
            {PENYELENGGARA}
          </span>
          <h1 className="text-4xl font-bold text-balance md:text-5xl">
            Merawat kitab kuning dengan cara yang{" "}
            <span className="gold-text">lebih mudah dijangkau</span>
          </h1>
          <p className="text-arabic mx-auto max-w-2xl text-2xl leading-[1.9] text-gold/85">
            وَقُل رَّبِّ زِدْنِي عِلْمًا
          </p>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
            Kami memulai dari persoalan sehari-hari: kitab yang jumlahnya
            terbatas, antre pinjam di perpustakaan, dan catatan yang hilang di
            pinggir halaman. Platform ini kami bangun agar kitab bisa dibaca
            siapa pun, kapan pun, dengan catatan yang tetap tersimpan rapi.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <Card className="h-full gap-3 p-7">
            <CardContent className="space-y-3 px-0">
              <span className="grid size-11 place-items-center rounded-xl bg-gold/15 ring-1 ring-gold/25">
                <Compass className="size-5 text-gold" strokeWidth={1.75} />
              </span>
              <h2 className="font-heading text-xl font-semibold">Visi kami</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tentangKonten.visi}
              </p>
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.08}>
          <Card className="h-full gap-3 p-7">
            <CardContent className="space-y-3 px-0">
              <span className="grid size-11 place-items-center rounded-xl bg-teal-500/15 ring-1 ring-teal-500/25">
                <Lightbulb className="size-5 text-teal-300" strokeWidth={1.75} />
              </span>
              <h2 className="font-heading text-xl font-semibold">Misi kami</h2>
              <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                {tentangKonten.misi.map((baris) => (
                  <li key={baris} className="flex gap-2.5">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold/70" />
                    {baris}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Cara kerja"
            judul="Empat langkah dari rak sampai layar"
            deskripsi="Setiap kitab melewati proses yang sama sebelum tampil di katalog, supaya metadata dan jumlah halamannya dapat dipercaya."
          />
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tentangKonten.caraKerja.map((langkah, indeks) => (
            <Reveal key={langkah.judul} delay={indeks * 0.06}>
              <Card className="h-full gap-2 p-6">
                <CardContent className="space-y-2 px-0">
                  <p className="font-heading text-3xl font-bold text-gold/30">
                    {String(indeks + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-heading text-base font-semibold">
                    {langkah.judul}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {langkah.teks}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tentangKonten.angka.map((angka, indeks) => (
            <Reveal key={angka.label} delay={indeks * 0.05}>
              <Card className="gap-1.5 p-6 text-center">
                <CardContent className="space-y-1.5 px-0">
                  <dt className="order-2 text-xs leading-relaxed text-muted-foreground">
                    {angka.label}
                  </dt>
                  <dd className="font-heading text-3xl font-bold text-gold">
                    {angka.nilai}
                  </dd>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </dl>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              ikon: Users,
              judul: "Untuk santri",
              teks: "Belajar mencatat dengan rapi dan mengulang bacaan tanpa kehilangan halaman terakhir. Cocok untuk muraja'ah sebelum imtihan.",
            },
            {
              ikon: GraduationCap,
              judul: "Untuk ustadz",
              teks: "Menunjuk rujukan yang sama kepada seluruh halaqah, lengkap dengan nomor halaman yang bisa disebut di kelas.",
            },
            {
              ikon: ScanLine,
              judul: "Untuk pengelola",
              teks: "Satu panel untuk mengunggah PDF, menata fan ilmu, dan memantau kitab mana yang paling banyak dibaca.",
            },
          ].map((kartu) => (
            <Card key={kartu.judul} className="gap-3 p-6">
              <CardContent className="space-y-2.5 px-0">
                <span className="grid size-10 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                  <kartu.ikon className="size-5 text-gold" strokeWidth={1.75} />
                </span>
                <h3 className="font-heading text-base font-semibold">{kartu.judul}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {kartu.teks}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="gap-0 p-0">
          <CardContent className="flex flex-col items-start gap-5 p-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="font-heading text-xl font-semibold">
                Mulai dari kitab yang sedang Anda kaji
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                Katalog kami terbuka untuk semua. Jika kitab yang Anda cari belum
                tersedia, usulkan lewat halaman kontak. Kami memprioritaskan
                kitab yang rutin dikaji.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/katalog">
                  <BookOpenCheck className="size-4" strokeWidth={1.75} />
                  Buka katalog
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/kontak">Usulkan kitab</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
