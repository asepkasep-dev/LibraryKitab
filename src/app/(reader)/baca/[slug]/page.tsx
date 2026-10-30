import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ReaderShell } from "@/components/reader/reader-shell"
import {
  bookmarkList,
  catatanList,
  getKitabTayangBySlug,
  penggunaDemo,
  riwayatList,
} from "@/lib/dummy-data"

type HalamanProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ halaman?: string }>
}

export async function generateMetadata({
  params,
}: HalamanProps): Promise<Metadata> {
  const { slug } = await params
  const kitab = getKitabTayangBySlug(slug)
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
  const kitab = getKitabTayangBySlug(slug)
  if (!kitab) notFound()

  const riwayat = riwayatList.find(
    (row) => row.userId === penggunaDemo.id && row.kitabId === kitab.id,
  )
  const dariTautan = Number.parseInt(halaman ?? "", 10)
  const halamanAwal = Number.isNaN(dariTautan)
    ? (riwayat?.halamanTerakhir ?? 1)
    : Math.min(kitab.jumlahHalaman, Math.max(1, dariTautan))

  return (
    <ReaderShell
      kitab={kitab}
      halamanAwal={halamanAwal}
      sumberAwal={Number.isNaN(dariTautan) ? "riwayat" : "tautan"}
      bookmarkAwal={bookmarkList.filter(
        (row) => row.userId === penggunaDemo.id && row.kitabId === kitab.id,
      )}
      catatanAwal={catatanList.filter(
        (row) => row.userId === penggunaDemo.id && row.kitabId === kitab.id,
      )}
      namaPengguna={penggunaDemo.namaLengkap}
    />
  )
}
