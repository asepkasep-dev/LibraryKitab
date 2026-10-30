import type { Metadata } from "next"
import {
  cariKitab,
  daftarKategori,
  opsiPengarangKatalog,
  opsiSyarahKatalog,
} from "@/db/queries"
import { KatalogExplorer, type QueryKatalog } from "@/components/site/katalog-explorer"
import { OPSI_URUT } from "@/lib/site"

export const metadata: Metadata = {
  title: "Katalog Kitab",
  description:
    "Telusuri katalog kitab kuning menurut fan ilmu, pengarang, dan penyusun syarah. Cari judul Latin maupun judul Arab, lalu urutkan terbaru atau terpopuler.",
}

type HalamanProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const SEMUA = "semua"

function ambil(nilai: string | string[] | undefined) {
  return typeof nilai === "string" ? nilai : ""
}

function bacaQuery(sp: Record<string, string | string[] | undefined>): QueryKatalog {
  const urut = ambil(sp.urut)
  return {
    q: ambil(sp.q).slice(0, 80),
    kategori: ambil(sp.kategori) || SEMUA,
    pengarang: ambil(sp.pengarang) || SEMUA,
    syarah: ambil(sp.syarah) || SEMUA,
    urut: OPSI_URUT.find((o) => o.nilai === urut)?.nilai ?? "terbaru",
    halaman: Math.max(1, Number(ambil(sp.halaman)) || 1),
  }
}

export default async function KatalogPage({ searchParams }: HalamanProps) {
  const sp = await searchParams
  const awal = bacaQuery(sp)

  const [hasil, opsiKategori, opsiPengarang, opsiSyarah] = await Promise.all([
    cariKitab(awal),
    daftarKategori(),
    opsiPengarangKatalog(),
    opsiSyarahKatalog(),
  ])

  return (
    <KatalogExplorer
      awal={awal}
      hasil={hasil}
      opsiKategori={opsiKategori}
      opsiPengarang={opsiPengarang}
      opsiSyarah={opsiSyarah}
    />
  )
}
