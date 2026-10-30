import Link from "next/link"
import {
  BookMarked,
  Eye,
  Layers,
  Pencil,
  Plus,
  Shapes,
  TrendingUp,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageIntro } from "@/components/shell/sidebar-shell"
import { ProgresBar, StatCard } from "@/components/site/primitives"
import { StatusKitabBadge } from "@/components/site/status-badge"
import { Reveal } from "@/components/site/reveal"
import { listLogAdmin, petaNamaPengguna, statistikAdmin } from "@/db/queries"
import { formatAngka, potongTeks, waktuRelatif } from "@/lib/format"

export const metadata = {
  title: "Dasbor Pengelola",
  robots: { index: false, follow: false },
}

/** Kunci `aksi` pada log_admin ditampilkan sebagai kalimat kerja. */
const LABEL_AKSI: Record<string, string> = {
  kitab_dibuat: "Menambahkan kitab",
  kitab_diperbarui: "Memperbarui metadata kitab",
  kitab_status_diubah: "Mengubah status publikasi",
  kitab_dihapus: "Menghapus kitab",
  kategori_dibuat: "Menambahkan fan",
  kategori_diperbarui: "Memperbarui fan",
  kategori_dihapus: "Menghapus fan",
  pengarang_dibuat: "Menambahkan data pengarang",
  pengarang_diperbarui: "Memperbarui data pengarang",
  pengarang_dihapus: "Menghapus data pengarang",
  pengguna_diaktifkan: "Mengaktifkan akun anggota",
  pengguna_dinonaktifkan: "Menonaktifkan akun anggota",
  pengguna_peran_diubah: "Mengubah peran akun",
}

export default async function AdminDashboardPage() {
  const [s, log, namaPengelola] = await Promise.all([
    statistikAdmin(),
    listLogAdmin(6),
    petaNamaPengguna(),
  ])
  const maksimumTerbaca = Math.max(...s.kitabTerpopuler.map((k) => k.jumlahDibuka), 1)
  const maksimumFan = Math.max(...s.sebaranFan.map((f) => f.jumlah), 1)

  return (
    <div className="space-y-10">
      <PageIntro
        judul="Ringkasan perpustakaan"
        deskripsi="Pantau koleksi, aktivitas baca santri, dan pekerjaan pengelolaan terakhir. Seluruh angka dibaca langsung dari database."
        aksi={
          <>
            <Button asChild size="sm">
              <Link href="/admin/kitab/baru">
                <Plus className="size-4" strokeWidth={1.75} />
                Unggah kitab baru
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/kitab">
                <Pencil className="size-4" strokeWidth={1.75} />
                Kelola koleksi
              </Link>
            </Button>
          </>
        }
      />

      <section aria-label="Statistik koleksi" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Reveal className="contents">
          <StatCard
            label="Kitab tayang"
            nilai={formatAngka(s.totalTayang)}
            keterangan={`${formatAngka(s.totalKitab)} koleksi tersimpan · ${formatAngka(s.totalHalaman)} halaman`}
            ikon={<BookMarked className="size-4" strokeWidth={1.75} />}
          />
          <StatCard
            label="Menunggu tayang"
            nilai={formatAngka(s.totalDraf)}
            keterangan={`${formatAngka(s.totalArsip)} kitab diarsipkan`}
            tone="teal"
            ikon={<Layers className="size-4" strokeWidth={1.75} />}
          />
          <StatCard
            label="Member terdaftar"
            nilai={formatAngka(s.totalMember)}
            keterangan={`${formatAngka(s.totalNonaktif)} akun dinonaktifkan`}
            tone="sukses"
            ikon={<Users className="size-4" strokeWidth={1.75} />}
          />
          <StatCard
            label="Sesi baca"
            nilai={formatAngka(s.totalSesi)}
            keterangan="Total kitab dibuka sejak peluncuran"
            tone="netral"
            ikon={<Eye className="size-4" strokeWidth={1.75} />}
          />
        </Reveal>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="surface-card p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 font-heading text-base font-semibold">
              <TrendingUp className="size-4 text-gold" strokeWidth={1.75} />
              Kitab paling sering dibaca
            </h2>
            <Link
              href="/admin/kitab"
              className="text-xs font-medium text-gold hover:text-gold-hover"
            >
              Lihat tabel lengkap
            </Link>
          </div>
          {s.kitabTerpopuler.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Koleksi masih kosong. Unggah kitab pertama untuk mulai memantau pembacaan santri.
            </p>
          ) : (
            <ol className="space-y-4">
              {s.kitabTerpopuler.map((kitab, index) => (
                <li key={kitab.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/5 font-heading text-xs font-semibold text-gold ring-1 ring-white/10 tabular-nums">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/kitab/${kitab.id}/edit`}
                        className="block truncate text-sm font-medium transition-colors hover:text-gold"
                      >
                        {kitab.judulLatin}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {kitab.pengarang.namaLatin} · {kitab.kategori.nama}
                      </p>
                    </div>
                    <span className="shrink-0 font-heading text-sm font-semibold text-gold tabular-nums">
                      {formatAngka(kitab.jumlahDibuka)}
                      <span className="ms-1 text-xs font-normal text-muted-foreground">kali</span>
                    </span>
                  </div>
                  <ProgresBar
                    nilai={Math.round((kitab.jumlahDibuka / maksimumTerbaca) * 100)}
                    size="thin"
                    className="ps-10"
                  />
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="surface-card p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 font-heading text-base font-semibold">
              <Shapes className="size-4 text-gold" strokeWidth={1.75} />
              Sebaran fan ilmu
            </h2>
            <Link
              href="/admin/kategori"
              className="text-xs font-medium text-gold hover:text-gold-hover"
            >
              Kelola kategori
            </Link>
          </div>
          {s.sebaranFan.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada fan terdaftar. Tambahkan lewat halaman Kelola Kategori.
            </p>
          ) : (
            <ul className="space-y-3.5">
              {s.sebaranFan.map((row) => (
                <li key={row.kategori.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate font-medium">{row.kategori.nama}</span>
                    <span className="shrink-0 text-muted-foreground tabular-nums">
                      {row.jumlah} kitab
                    </span>
                  </div>
                  <ProgresBar nilai={Math.round((row.jumlah / maksimumFan) * 100)} tone="teal" size="thin" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-base font-semibold">Aktivitas pengelolaan</h2>
            <span className="text-xs text-muted-foreground">
              Catat di tabel <code className="text-gold/80">log_admin</code>
            </span>
          </div>
          {log.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada aksi pengelolaan tercatat. Setiap perubahan data perpustakaan
              meninggalkan jejak di sini.
            </p>
          ) : (
            <ol className="space-y-3">
              {log.map((item) => (
                <li key={item.id} className="surface-inset space-y-1 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">{LABEL_AKSI[item.aksi] ?? item.aksi}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {waktuRelatif(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                  <p className="text-[11px] text-muted-foreground/80">
                    oleh {namaPengelola.get(item.adminId ?? "") ?? "Pengelola"} · target {item.targetTabel}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="surface-card p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-base font-semibold">Unggahan terbaru</h2>
            <Link
              href="/admin/kitab/baru"
              className="text-xs font-medium text-gold hover:text-gold-hover"
            >
              Tambah kitab
            </Link>
          </div>
          {s.unggahanTerbaru.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada kitab tersimpan. Mulai dari metadata, lalu unggah berkas PDF-nya.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {s.unggahanTerbaru.map((kitab) => (
                <li key={kitab.id} className="surface-inset p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{kitab.judulLatin}</p>
                      <p className="text-arabic text-sm text-muted-foreground">
                        {kitab.judulArab}
                      </p>
                    </div>
                    <StatusKitabBadge status={kitab.status} className="shrink-0" />
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {potongTeks(kitab.deskripsi, 96)}
                  </p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground/80 tabular-nums">
                    <span>{formatAngka(kitab.jumlahHalaman)} halaman</span>
                    <span>·</span>
                    <span>Diperbarui {waktuRelatif(kitab.updatedAt)}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        Kitab berstatus draf dan arsip tidak muncul di katalog publik. Ubah status
        melalui halaman <Link href="/admin/kitab" className="text-gold underline-offset-4 hover:underline">Manajemen Kitab</Link>.
      </p>
    </div>
  )
}
