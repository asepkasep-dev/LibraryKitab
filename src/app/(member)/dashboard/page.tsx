import Link from "next/link"
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  BookmarkCheck,
  FileClock,
  NotebookPen,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { KitabCard } from "@/components/site/kitab-card"
import { KitabCover } from "@/components/site/kitab-cover"
import { PageIntro } from "@/components/shell/sidebar-shell"
import { ProgresBar, StatCard } from "@/components/site/primitives"
import { Reveal } from "@/components/site/reveal"
import {
  listBookmarkGrupKitab,
  listCatatanDenganKitab,
  listRiwayatDenganKitab,
  rekomendasiBerdasarkanFan,
  statistikMember,
} from "@/db/queries"
import { butuhMember } from "@/lib/auth"
import { formatAngka, potongTeks, waktuRelatif } from "@/lib/format"

export const metadata = {
  title: "Dasbor",
}

export default async function DashboardPage() {
  const pengguna = await butuhMember()
  const userId = pengguna.id

  const [statistik, riwayat, rekomendasi, bookmark, catatanSemua] = await Promise.all([
    statistikMember(userId),
    listRiwayatDenganKitab(userId),
    rekomendasiBerdasarkanFan(userId, 4),
    listBookmarkGrupKitab(userId),
    listCatatanDenganKitab(userId),
  ])

  const [terakhir, ...lainnya] = riwayat
  const catatan = catatanSemua.slice(0, 3)
  const namaDepan = pengguna.namaLengkap.trim().split(" ")[0]

  return (
    <div className="space-y-10">
      <PageIntro
        judul={namaDepan ? `Ahlan wa sahlan, ${namaDepan}` : "Ahlan wa sahlan"}
        deskripsi={
          pengguna.jenisPeran === "ustadz"
            ? "Panel kerja untuk menyiapkan bahan pengajian. Lanjutkan bacaan, perbarui catatan, dan pilih kitab yang cocok untuk bandongan besok."
            : "Lanjutkan bacaan yang tertunda, cek bookmark, dan tambahkan catatan pemahaman Anda sebelum muraja'ah berikutnya."
        }
        aksi={
          <>
            <Button asChild size="sm">
              <Link href={terakhir ? `/baca/${terakhir.kitab.slug}` : "/katalog"}>
                <BookOpen className="size-4" strokeWidth={1.75} />
                Lanjutkan membaca
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/katalog">Jelajahi katalog</Link>
            </Button>
          </>
        }
      />

      {terakhir ? (
        <section aria-labelledby="lanjutkan-membaca" className="space-y-4">
          <h2
            id="lanjutkan-membaca"
            className="font-heading text-lg font-semibold text-muted-foreground"
          >
            Lanjutkan membaca
          </h2>

          <Reveal>
            <Card className="gap-0 overflow-hidden p-0">
              <div className="grid gap-5 p-5 md:grid-cols-[13rem_minmax(0,1fr)] md:p-6">
                <KitabCover kitab={terakhir.kitab} className="w-full md:max-w-52" />

                <div className="flex min-w-0 flex-col gap-4">
                  <div className="space-y-1.5">
                    <span className="badge-fan w-fit">{terakhir.kitab.kategori.nama}</span>
                    <h3 className="font-heading text-2xl leading-tight font-bold">
                      {terakhir.kitab.judulLatin}
                    </h3>
                    <p className="text-arabic text-lg text-muted-foreground">
                      {terakhir.kitab.judulArab}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {terakhir.kitab.pengarang.namaLatin} · dibuka{" "}
                      {waktuRelatif(terakhir.riwayat.terakhirDibukaAt)}
                    </p>
                  </div>

                  <ProgresBar
                    nilai={terakhir.riwayat.persentaseSelesai}
                    label={`Halaman ${terakhir.riwayat.halamanTerakhir} dari ${formatAngka(terakhir.kitab.jumlahHalaman)}`}
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <Button asChild size="sm">
                      <Link href={`/baca/${terakhir.kitab.slug}`}>
                        Baca dari halaman {terakhir.riwayat.halamanTerakhir}
                        <ArrowRight className="size-4" strokeWidth={1.75} />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/kitab/${terakhir.kitab.slug}`}>Detail kitab</Link>
                    </Button>
                  </div>

                  {lainnya.length > 0 && (
                    <ul className="mt-2 space-y-2 border-t border-white/5 pt-4">
                      {lainnya.slice(0, 3).map((row) => (
                        <li key={row.riwayat.id}>
                          <Link
                            href={`/baca/${row.kitab.slug}`}
                            className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/5"
                          >
                            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/5 font-heading text-xs font-semibold text-gold ring-1 ring-white/10 tabular-nums">
                              {row.riwayat.halamanTerakhir}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium group-hover:text-gold">
                                {row.kitab.judulLatin}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {waktuRelatif(row.riwayat.terakhirDibukaAt)}
                              </span>
                            </span>
                            <span className="w-24 shrink-0">
                              <ProgresBar
                                nilai={row.riwayat.persentaseSelesai}
                                size="thin"
                              />
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          </Reveal>
        </section>
      ) : (
        <Card className="p-6">
          <CardContent className="px-0 pb-0 text-sm text-muted-foreground">
            Anda belum membuka kitab apa pun. Mulai dari halaman{" "}
            <Link href="/katalog" className="text-gold underline-offset-4 hover:underline">
              katalog
            </Link>{" "}
            untuk memilih kitab pertama.
          </CardContent>
        </Card>
      )}

      <section aria-label="Statistik baca" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Reveal className="contents">
          <StatCard
            label="Kitab dibuka"
            nilai={formatAngka(statistik.kitabDibaca)}
            keterangan="Rata-rata progres keseluruhan"
            ikon={<FileClock className="size-4" strokeWidth={1.75} />}
          />
          <StatCard
            label="Bookmark"
            nilai={formatAngka(statistik.totalBookmark)}
            keterangan={`${bookmark.length} kitab ditandai`}
            tone="teal"
            ikon={<BookmarkCheck className="size-4" strokeWidth={1.75} />}
          />
          <StatCard
            label="Catatan"
            nilai={formatAngka(statistik.totalCatatan)}
            keterangan="Tersimpan per halaman kitab"
            tone="sukses"
            ikon={<NotebookPen className="size-4" strokeWidth={1.75} />}
          />
          <StatCard
            label="Halaman dibaca"
            nilai={formatAngka(statistik.halamanDibaca)}
            keterangan={`${statistik.rataRataProgres}% rata-rata selesai`}
            tone="netral"
            ikon={<BookOpen className="size-4" strokeWidth={1.75} />}
          />
        </Reveal>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 font-heading text-base font-semibold">
              <Bookmark className="size-4 text-gold" strokeWidth={1.75} />
              Bookmark terbaru
            </h2>
            <Link
              href="/dashboard/bookmark"
              className="text-xs font-medium text-gold hover:text-gold-hover"
            >
              Lihat semua
            </Link>
          </div>
          <ul className="space-y-2">
            {bookmark.slice(0, 4).map((grup) => (
              <li key={grup.kitab.id} className="surface-inset p-3">
                <p className="truncate text-sm font-medium">{grup.kitab.judulLatin}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {grup.items.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href={`/baca/${grup.kitab.slug}`}
                      className="rounded-lg bg-white/5 px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-white/10 transition-colors hover:text-gold"
                    >
                      hlm {item.halaman}
                      {item.label ? ` · ${potongTeks(item.label, 22)}` : ""}
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 font-heading text-base font-semibold">
              <NotebookPen className="size-4 text-gold" strokeWidth={1.75} />
              Catatan terbaru
            </h2>
            <Link
              href="/dashboard/catatan"
              className="text-xs font-medium text-gold hover:text-gold-hover"
            >
              Kelola catatan
            </Link>
          </div>
          <ul className="space-y-2">
            {catatan.map((row) => (
              <li key={row.catatan.id} className="surface-inset space-y-1 p-3">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="truncate font-medium text-foreground">
                    {row.kitab.judulLatin}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    hlm {row.catatan.halaman}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {potongTeks(row.catatan.isi, 130)}
                </p>
                <p className="text-[11px] text-muted-foreground/80">
                  Diubah {waktuRelatif(row.catatan.updatedAt)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {rekomendasi.length > 0 && (
        <section aria-labelledby="rekomendasi" className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold/80">
                <Sparkles className="size-3.5" strokeWidth={1.75} />
                Untuk Anda
              </span>
              <h2 id="rekomendasi" className="font-heading text-xl font-bold">
                Kitab dari fan yang sering Anda baca
              </h2>
            </div>
            <Link
              href="/katalog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gold transition-colors hover:text-gold-hover"
            >
              Katalog lengkap
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {rekomendasi.map((kitab) => (
              <Reveal key={kitab.id} className="contents">
                <KitabCard kitab={kitab} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-muted-foreground">
        Progres baca dihitung dari halaman terakhir dibagi total halaman kitab.
      </p>
    </div>
  )
}
