import type { Metadata } from "next"
import {
  cariKitab,
  daftarKategori,
  opsiPengarangKatalog,
  opsiSyarahKatalog,
} from "@/db/queries"
import { KatalogExplorer } from "@/components/site/katalog-explorer"
import { bacaQuery } from "@/lib/katalog-query"

export const metadata: Metadata = {
  title: "Katalog Kitab",
  description:
    "Telusuri katalog kitab kuning menurut fan ilmu, pengarang, dan penyusun syarah. Cari judul Latin maupun judul Arab, lalu urutkan terbaru atau terpopuler.",
}

type HalamanProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
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
