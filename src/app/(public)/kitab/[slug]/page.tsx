import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Eye,
  FileText,
  History,
  Layers,
  ScrollText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { KitabCard } from "@/components/site/kitab-card"
import { KitabCover } from "@/components/site/kitab-cover"
import { ProgresBar } from "@/components/site/primitives"
import { Reveal } from "@/components/site/reveal"
import { SectionHeading } from "@/components/site/section-heading"
import { formatAngka, formatUkuranBerkas, formatTanggal } from "@/lib/format"
import { kitabTerkait, kitabTayangBySlug, riwayatOlehUser } from "@/db/queries"
import { ambilSesiOpsional } from "@/lib/auth"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const kitab = await kitabTayangBySlug(slug)
  if (!kitab) return { title: "Kitab tidak ditemukan" }
  return {
    // Format judul sesuai Bab 8.
    title: `${kitab.judulLatin} - ${kitab.pengarang.namaLatin}`,
    description: `${kitab.judulLatin} (${kitab.judulArab}) karya ${kitab.pengarang.namaLatin}. ${kitab.deskripsi.slice(0, 120)}…`,
  }
}

export default async function DetailKitabPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const kitab = await kitabTayangBySlug(slug)
  if (!kitab) notFound()

  // Progres hanya tampil bagi santri yang sudah masuk; pengunjung tetap bisa membaca.
  const [pengguna, terkait] = await Promise.all([
    ambilSesiOpsional(),
    kitabTerkait(kitab),
  ])
  const progres = pengguna ? await riwayatOlehUser(pengguna.id, kitab.id) : null

  const baris = [
    {
      ikon: Layers,
      label: "Fan ilmu",
      nilai: kitab.kategori.nama,
      href: `/katalog?kategori=${kitab.kategori.slug}`,
    },
    {
      ikon: BookOpen,
      label: "Pengarang",
      nilai: `${kitab.pengarang.namaLatin}${
        kitab.pengarang.tahunWafat ? ` · wafat ${kitab.pengarang.tahunWafat}` : ""
      }`,
      href: `/katalog?pengarang=${kitab.pengarang.id}`,
    },
    kitab.syarah && {
      ikon: ScrollText,
      label: "Syarah",
      nilai: `${kitab.syarah.namaLatin} · wafat ${kitab.syarah.tahunWafat}`,
      href: `/katalog?syarah=${kitab.syarah.id}`,
    },
    { ikon: CalendarDays, label: "Tahun terbit", nilai: kitab.tahunTerbit },
    {
      ikon: FileText,
      label: "Jumlah halaman",
      nilai: `${formatAngka(kitab.jumlahHalaman)} halaman`,
    },
    {
      ikon: FileText,
      label: "Berkas",
      nilai: `PDF ${formatUkuranBerkas(kitab.ukuranPdfByte)}`,
    },
    {
      ikon: Eye,
      label: "Sesi baca",
      nilai: `${formatAngka(kitab.jumlahDibuka)}× dibuka`,
    },
    {
      ikon: History,
      label: "Ditambahkan",
      nilai: formatTanggal(kitab.createdAt),
    },
  ].filter(Boolean) as {
    ikon: typeof BookOpen
    label: string
    nilai: string
    href?: string
  }[]

  return (
    <div className="pb-6">
      <nav
        aria-label="Jejak navigasi"
        className="mx-auto flex w-full max-w-7xl items-center gap-1.5 px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:px-8"
      >
        <Link href="/" className="hover:text-gold">
          Beranda
        </Link>
        <ChevronRight className="size-3.5" strokeWidth={1.75} />
        <Link href="/katalog" className="hover:text-gold">
          Katalog
        </Link>
        <ChevronRight className="size-3.5" strokeWidth={1.75} />
        <span className="truncate text-foreground">{kitab.judulLatin}</span>
      </nav>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-4 sm:px-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:px-8">
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <KitabCover kitab={kitab} className="shadow-2xl shadow-black/40" />
          <Button asChild size="lg" className="w-full">
            <Link href={`/baca/${kitab.slug}`}>
              <BookOpen className="size-4" strokeWidth={1.75} />
              {progres ? `Lanjutkan halaman ${progres.halamanTerakhir}` : "Baca sekarang"}
            </Link>
          </Button>
          {progres && (
            <Card className="gap-2 p-4">
              <CardContent className="space-y-2 px-0">
                <ProgresBar
                  nilai={progres.persentaseSelesai}
                  label={`Progres Anda · ${formatAngka(progres.halamanTerakhir)} dari ${formatAngka(kitab.jumlahHalaman)} hlm`}
                  tone={progres.persentaseSelesai >= 100 ? "sukses" : "gold"}
                />
              </CardContent>
            </Card>
          )}
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Dibaca dari browser, tanpa perlu mengunduh berkas.
          </p>
        </div>

        <div className="space-y-8">
          <header className="space-y-4">
            <span className="badge-fan">{kitab.kategori.nama}</span>
            <h1 className="text-3xl font-bold text-balance md:text-4xl">
              {kitab.judulLatin}
            </h1>
            <p className="text-arabic text-3xl leading-[1.9] text-gold/90 md:text-4xl">
              {kitab.judulArab}
            </p>
            <p className="text-sm text-muted-foreground">
              oleh{" "}
              <Link
                href={`/katalog?pengarang=${kitab.pengarang.id}`}
                className="text-foreground underline decoration-gold/40 underline-offset-4 hover:text-gold"
              >
                {kitab.pengarang.namaLatin}
              </Link>
              {kitab.syarah && (
                <>
                  {" "}
                  dengan syarah{" "}
                  <Link
                    href={`/katalog?syarah=${kitab.syarah.id}`}
                    className="text-foreground underline decoration-gold/40 underline-offset-4 hover:text-gold"
                  >
                    {kitab.syarah.namaLatin}
                  </Link>
                </>
              )}
            </p>
          </header>

          <Card className="gap-0 p-0">
            <CardContent className="p-6">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Ringkasan isi
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">
                {kitab.deskripsi}
              </p>
            </CardContent>
          </Card>

          <Card className="gap-0 p-0">
            <CardContent className="p-6">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Metadata kitab
              </h2>
              <dl className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
                {baris.map((barisItem) => (
                  <div
                    key={barisItem.label}
                    className="flex items-start gap-3 border-b border-white/5 py-3 last:border-0"
                  >
                    <barisItem.ikon
                      className="mt-0.5 size-4 shrink-0 text-gold/70"
                      strokeWidth={1.75}
                    />
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">
                        {barisItem.label}
                      </dt>
                      <dd className="truncate text-sm font-medium">
                        {barisItem.href ? (
                          <Link
                            href={barisItem.href}
                            className="hover:text-gold"
                          >
                            {barisItem.nilai}
                          </Link>
                        ) : (
                          barisItem.nilai
                        )}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card className="gap-0 p-0">
            <CardContent className="p-6">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Tentang pengarang
              </h2>
              <p className="text-arabic mt-3 text-xl text-gold/85">
                {kitab.pengarang.namaArab}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {kitab.pengarang.biografiSingkat}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href={`/katalog?pengarang=${kitab.pengarang.id}`}>
                  Lihat semua karya {kitab.pengarang.namaLatin}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {terkait.length > 0 && (
            <section>
              <Reveal>
                <SectionHeading
                  judul="Kitab terkait"
                  deskripsi="Masih satu fan ilmu atau dari pengarang yang sama, untuk melanjutkan kajian."
                  tautan={{
                    href: `/katalog?kategori=${kitab.kategori.slug}`,
                    label: `Semua ${kitab.kategori.nama.split(" ")[0]}`,
                  }}
                />
              </Reveal>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {terkait.map((k) => (
                  <Reveal key={k.id}>
                    <KitabCard kitab={k} />
                  </Reveal>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
