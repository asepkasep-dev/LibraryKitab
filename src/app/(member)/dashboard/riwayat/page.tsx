import Link from "next/link"
import { CheckCircle2, History, PlayCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { KitabCover } from "@/components/site/kitab-cover"
import { PageIntro } from "@/components/shell/sidebar-shell"
import { EmptyState, ProgresBar } from "@/components/site/primitives"
import { listRiwayatDenganKitab } from "@/db/queries"
import { butuhMember } from "@/lib/auth"
import { formatAngka, formatTanggalWaktu, waktuRelatif } from "@/lib/format"

export const metadata = { title: "Riwayat Baca" }

export default async function RiwayatPage() {
  const pengguna = await butuhMember()
  const baris = await listRiwayatDenganKitab(pengguna.id)
  const selesai = baris.filter((row) => row.riwayat.persentaseSelesai >= 100)
  const halamanDibaca = baris.reduce((a, row) => a + row.riwayat.halamanTerakhir, 0)

  if (baris.length === 0) {
    return (
      <div>
        <PageIntro
          judul="Riwayat Baca"
          deskripsi="Setiap kitab yang Anda buka akan tercatat di sini beserta halaman terakhir dan tanggal akses."
        />
        <EmptyState
          ikon={<History className="size-6" strokeWidth={1.75} />}
          judul="Belum ada riwayat baca"
          pesan="Mulai dari katalog, lalu progres baca Anda akan tersimpan otomatis setiap berpindah halaman."
          aksi={
            <Button asChild>
              <Link href="/katalog">Buka katalog kitab</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <PageIntro
        judul="Riwayat Baca"
        deskripsi="Urutan terbaru berada paling atas. Progres dihitung dari halaman terakhir dibagi total halaman kitab."
        aksi={
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="surface-inset px-3 py-1.5">
              {formatAngka(baris.length)} kitab dibuka
            </span>
            <span className="surface-inset px-3 py-1.5">
              {formatAngka(selesai.length)} selesai dibaca
            </span>
            <span className="surface-inset px-3 py-1.5">
              {formatAngka(halamanDibaca)} halaman total
            </span>
          </div>
        }
      />

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="min-w-[18rem] px-5">Kitab</TableHead>
                <TableHead className="min-w-[10rem]">Progres</TableHead>
                <TableHead className="min-w-[9rem]">Halaman terakhir</TableHead>
                <TableHead className="min-w-[12rem]">Terakhir dibuka</TableHead>
                <TableHead className="min-w-[8rem]">Status</TableHead>
                <TableHead className="px-5 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {baris.map((row) => {
                const sudahSelesai = row.riwayat.persentaseSelesai >= 100
                return (
                  <TableRow key={row.riwayat.id} className="border-white/5">
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <KitabCover kitab={row.kitab} sizes="micro" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{row.kitab.judulLatin}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {row.kitab.kategori.nama} · {row.kitab.pengarang.namaLatin}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-40 py-4">
                      <ProgresBar nilai={row.riwayat.persentaseSelesai} size="thin" />
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatAngka(row.riwayat.halamanTerakhir)} /{" "}
                      {formatAngka(row.kitab.jumlahHalaman)} hlm
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {waktuRelatif(row.riwayat.terakhirDibukaAt)}
                      <span className="block text-[11px] text-muted-foreground/80">
                        {formatTanggalWaktu(row.riwayat.terakhirDibukaAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {sudahSelesai ? (
                        <Badge className="gap-1.5 border-emerald-500/25 bg-emerald-500/15 text-emerald-300">
                          <CheckCircle2 className="size-3.5" strokeWidth={1.75} />
                          Selesai
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1.5">
                          <History className="size-3.5" strokeWidth={1.75} />
                          Berjalan
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant={sudahSelesai ? "outline" : "default"}>
                          <Link href={`/baca/${row.kitab.slug}`}>
                            <PlayCircle className="size-4" strokeWidth={1.75} />
                            {sudahSelesai ? "Baca ulang" : "Lanjutkan"}
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/kitab/${row.kitab.slug}`}>Detail</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
