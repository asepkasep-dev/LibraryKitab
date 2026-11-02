import Link from "next/link"
import {
  ArrowRight,
  BookOpenCheck,
  Bookmark,
  GraduationCap,
  NotebookPen,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SearchBar } from "@/components/site/search-bar"
import { KitabCard } from "@/components/site/kitab-card"
import { KitabCover } from "@/components/site/kitab-cover"
import { Reveal } from "@/components/site/reveal"
import { SectionHeading } from "@/components/site/section-heading"
import { formatAngka } from "@/lib/format"
import {
  hitungKitabPerKategori,
  kitabSorotan,
  ringkasanBeranda,
} from "@/db/queries"
import {
  SLUG_PILIHAN_PENGELOLA,
  SLUG_SOROTAN_SAMPUL,
  tentangKonten,
} from "@/lib/konten"

export default async function BerandaPage() {
  const [angka, fan, pilihan, sorotan] = await Promise.all([
    ringkasanBeranda(),
    hitungKitabPerKategori(),
    kitabSorotan(SLUG_PILIHAN_PENGELOLA),
    kitabSorotan(SLUG_SOROTAN_SAMPUL),
  ])

  return (
    <div className="-mt-18">
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(46rem 30rem at 18% 8%, hsl(43 74% 56% / 0.16), transparent 62%), radial-gradient(40rem 28rem at 88% 22%, hsl(172 60% 45% / 0.13), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-gold/40 to-transparent"
        />

        <div className="mx-auto grid w-full max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
              <Sparkles className="size-3.5" strokeWidth={1.75} />
              Assalamu&apos;alaikum, selamat datang di perpustakaan kitab
            </span>

            <div className="space-y-5">
              <h1 className="text-4xl leading-[1.15] font-bold text-balance md:text-5xl">
                Kitab kuning dalam genggaman,{" "}
                <span className="gold-text">baca sampai halaman terakhir</span>{" "}
                Anda.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                Jelajahi katalog turats, baca langsung di ponsel tanpa mengunduh
                apa pun, lalu simpan bookmark dan catatan pemahaman Anda. Gratis
                untuk seluruh santri dan ustadz.
              </p>
              <p className="text-arabic text-xl text-gold/85 md:text-2xl">
                وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ
              </p>
            </div>

            <div className="max-w-2xl space-y-4">
              <SearchBar />
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Populer:</span>
                {["nahwu", "fiqih", "tafsir", "akhlak"].map((kata) => (
                  <Link
                    key={kata}
                    href={`/katalog?q=${kata}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-gold/30 hover:text-gold"
                  >
                    {kata}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/katalog">
                  Jelajahi katalog
                  <ArrowRight className="size-4" strokeWidth={1.75} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-up">Daftar gratis</Link>
              </Button>
            </div>

            <dl className="grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {[
                {
                  nilai: `${formatAngka(angka.totalTayang)}`,
                  label: "kitab siap dibaca",
                },
                {
                  nilai: `${fan.length}`,
                  label: "fan ilmu terkelompok",
                },
                {
                  nilai: `${formatAngka(angka.totalSesi)}×`,
                  label: "bacaan tercatat",
                },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="sr-only">{item.label}</dt>
                  <dd>
                    <span className="block font-heading text-xl font-bold text-gold sm:text-2xl">
                      {item.nilai}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-muted-foreground">
                      {item.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Tumpukan sampul */}
          <div className="relative mx-auto hidden h-[26rem] w-full max-w-sm lg:block">
            {sorotan.map((kitab, indeks) => (
              <Link
                key={kitab.id}
                href={`/kitab/${kitab.slug}`}
                className="absolute w-[58%] transition-transform duration-300 hover:-translate-y-2 hover:rotate-0"
                style={{
                  left: `${indeks * 18}%`,
                  top: `${indeks * 9}%`,
                  transform: `rotate(${indeks === 1 ? -6 : indeks === 2 ? 5 : -2}deg)`,
                  zIndex: sorotan.length - indeks,
                }}
              >
                <KitabCover
                  kitab={kitab}
                  className="shadow-2xl shadow-black/50 ring-white/15"
                />
              </Link>
            ))}
            <Card className="absolute -bottom-2 right-0 z-10 w-[74%] gap-2 p-4">
              <CardContent className="space-y-2 px-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">
                  Sedang dibaca
                </p>
                <p className="font-heading text-lg font-bold">
                  {formatAngka(angka.totalSesi)} sesi baca
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Progres Anda tersimpan otomatis, jadi bacaan bisa dilanjutkan
                  dari halaman terakhir di perangkat mana pun.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Fan ilmu */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Fan ilmu"
            judul="Pilih bidang kajian, sesuaikan dengan halaqah Anda"
            deskripsi="Setiap kitab sudah dikelompokkan menurut fan agar pencarian tidak melebar. Mulai dari nahwu dasar sampai ushul fiqih tingkat lanjut."
            tautan={{ href: "/katalog", label: "Lihat seluruh katalog" }}
          />
        </Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {fan.map((item, indeks) => (
            <Reveal key={item.kategori.id} delay={indeks * 0.05}>
              <Link href={`/katalog?kategori=${item.kategori.slug}`} className="block h-full">
                <Card
                  interactive
                  className="h-full gap-1.5 p-5 hover:border-gold/30"
                >
                  <CardContent className="space-y-1.5 px-0">
                    <p className="font-heading text-[15px] font-semibold leading-snug">
                      {item.kategori.nama}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.jumlah} kitab tersedia
                    </p>
                    <p className="pt-2 text-xs leading-relaxed text-muted-foreground/90">
                      {item.kategori.deskripsi}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Kitab pilihan */}
      {pilihan.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Kurasi pekan ini"
              judul="Kitab pilihan pengelola"
              deskripsi="Dipilih berdasarkan kitab yang paling sering dikaji di halaqah minggu ini."
              tautan={{ href: "/katalog?urut=terpopuler", label: "Lihat terpopuler" }}
            />
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pilihan.slice(0, 4).map((kitab, indeks) => (
              <Reveal key={kitab.id} delay={indeks * 0.06}>
                <KitabCard kitab={kitab} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Fitur utama */}
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              ikon: Bookmark,
              judul: "Bookmark halaman penting",
              teks: "Tandai ayat atau pasal yang perlu diulang, beri label singkat, dan buka lagi dari daftar bookmark yang dikelompokkan per kitab.",
            },
            {
              ikon: NotebookPen,
              judul: "Catatan pribadi per halaman",
              teks: "Tulis pemahaman Anda tepat di samping halaman yang sedang dibaca. Catatannya privat dan bisa disaring saat muraja'ah.",
            },
            {
              ikon: BookOpenCheck,
              judul: "Progres membaca otomatis",
              teks: "Halaman terakhir tersimpan saat Anda berpindah. Riwayat menampilkan persentase selesai dan menandai kitab yang tamat.",
            },
          ].map((fitur, indeks) => (
            <Reveal key={fitur.judul} delay={indeks * 0.06}>
              <Card className="h-full gap-3 p-6">
                <CardContent className="space-y-3 px-0">
                  <span className="grid size-11 place-items-center rounded-xl bg-gold/15 ring-1 ring-gold/25">
                    <fitur.ikon className="size-5 text-gold" strokeWidth={1.75} />
                  </span>
                  <h3 className="font-heading text-xl font-semibold">{fitur.judul}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {fitur.teks}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Cara kerja */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Cara kerja"
            judul="Dari rak perpustakaan sampai layar ponsel Anda"
            align="center"
            className="mx-auto max-w-2xl"
          />
        </Reveal>
        <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {tentangKonten.caraKerja.map((langkah, indeks) => (
            <Reveal key={langkah.judul} delay={indeks * 0.07} as="li">
              <Card className="h-full gap-2 p-6">
                <CardContent className="space-y-2 px-0">
                  <span className="font-heading text-3xl font-bold text-gold/35">
                    {String(indeks + 1).padStart(2, "0")}
                  </span>
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
        </ol>
      </section>

      {/* Ajakan mendaftar */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <Reveal>
          <Card className="relative overflow-hidden gap-0 p-0">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 opacity-70"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, hsl(222 45% 12%), hsl(222 40% 9%)), radial-gradient(30rem 20rem at 85% 10%, hsl(43 74% 56% / 0.22), transparent 60%)",
              }}
            />
            <CardContent className="flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-12">
              <div className="max-w-xl space-y-3">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
                  <GraduationCap className="size-4" strokeWidth={1.75} />
                  Untuk santri & ustadz
                </span>
                <h2 className="text-2xl font-bold text-balance md:text-3xl">
                  Buat akun, lalu bacaan Anda tidak pernah mulai dari nol lagi
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Cukup email dan kata sandi. Tidak ada biaya, tidak ada
                  langganan, dan seluruh koleksi dapat diakses sejak hari
                  pertama.
                </p>
                <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-emerald-300" strokeWidth={1.75} />
                  Catatan Anda bersifat privat dan hanya tampil di akun Anda.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/sign-up">Daftar sekarang</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/tentang">Kenali kami</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>
    </div>
  )
}
