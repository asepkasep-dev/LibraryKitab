import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ReaderShell } from "@/components/reader/reader-shell"
import {
  daftarBookmarkOlehUser,
  daftarCatatanOlehUser,
  kitabTayangBySlug,
  riwayatOlehUser,
} from "@/db/queries"
import { ambilSesiOpsional } from "@/lib/auth"
import { urlBaca } from "@/lib/bunny"

type HalamanProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ halaman?: string }>
}

export async function generateMetadata({
  params,
}: HalamanProps): Promise<Metadata> {
  const { slug } = await params
  const kitab = await kitabTayangBySlug(slug)
  if (!kitab) return { title: "Kitab tidak ditemukan" }

  return {
    title: `Baca ${kitab.judulLatin}`,
    description:
      `Baca ${kitab.judulLatin} (${kitab.judulArab}) karya ${kitab.pengarang.namaLatin} ` +
      `dengan navigasi halaman, zoom, dan mode Sepia Malam.`,
    robots: { index: false, follow: false },
  }
}

export default async function BacaKitabPage({
  params,
  searchParams,
}: HalamanProps) {
  const { slug } = await params
  const { halaman } = await searchParams
  const kitab = await kitabTayangBySlug(slug)
  if (!kitab) notFound()

  // Pengunjung anonim tetap bisa membaca; hak simpan hanya untuk akun aktif.
  const anggota = await ambilSesiOpsional()
  const riwayat = anggota ? await riwayatOlehUser(anggota.id, kitab.id) : null
  const bookmark = anggota ? await daftarBookmarkOlehUser(anggota.id, kitab.id) : []
  const catatan = anggota ? await daftarCatatanOlehUser(anggota.id, kitab.id) : []

  const dariTautan = Number.parseInt(halaman ?? "", 10)
  const halamanAwal = Number.isNaN(dariTautan)
    ? (riwayat?.halamanTerakhir ?? 1)
    : Math.min(kitab.jumlahHalaman, Math.max(1, dariTautan))

  return (
    <ReaderShell
      kitab={kitab}
      pdfBaca={urlBaca(kitab.urlPdf)}
      halamanAwal={halamanAwal}
      sumberAwal={Number.isNaN(dariTautan) ? "riwayat" : "tautan"}
      bookmarkAwal={bookmark}
      catatanAwal={catatan}
      masuk={anggota !== null}
      penggunaId={anggota?.id ?? ""}
      namaPengguna={anggota?.namaLengkap ?? null}
    />
  )
}
