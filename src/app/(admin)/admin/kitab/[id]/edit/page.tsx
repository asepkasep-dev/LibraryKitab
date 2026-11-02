import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageIntro } from "@/components/shell/sidebar-shell"
import { FormKitab } from "@/components/admin/form-kitab"
import { StatusKitabBadge } from "@/components/site/status-badge"
import { kitabById, opsiKategori, opsiPengarang, opsiSyarah } from "@/db/queries"
import { butuhAdmin } from "@/lib/auth"
import { formatUkuranBerkas } from "@/lib/format"

type HalamanProps = { params: Promise<{ id: string }> }

export async function generateMetadata({
  params,
}: HalamanProps): Promise<Metadata> {
  await butuhAdmin()
  const { id } = await params
  const kitab = await kitabById(id)
  if (!kitab) return { title: "Kitab tidak ditemukan" }
  return { title: `Ubah ${kitab.judulLatin}` }
}

export default async function UbahKitabPage({ params }: HalamanProps) {
  const { id } = await params
  const kitab = await kitabById(id)
  if (!kitab) notFound()

  const [daftarKategori, daftarPengarang, daftarSyarah] = await Promise.all([
    opsiKategori(),
    opsiPengarang(),
    opsiSyarah(),
  ])

  return (
    <div className="space-y-6">
      <PageIntro
        judul={`Ubah metadata: ${kitab.judulLatin}`}
        deskripsi="Perubahan judul dan deskripsi langsung tampil pada halaman detail publik. Mengganti berkas PDF tidak mengubah riwayat baca yang sudah tersimpan."
        aksi={
          <div className="flex flex-wrap items-center gap-2">
            <StatusKitabBadge status={kitab.status} />
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/kitab">
                <ArrowLeft className="size-4" strokeWidth={1.75} />
                Daftar kitab
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/baca/${kitab.slug}`}>
                <ExternalLink className="size-4" strokeWidth={1.75} />
                Pratinjau reader
              </Link>
            </Button>
          </div>
        }
      />

      <div className="surface-inset flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-xs text-muted-foreground">
        <span>
          ID kitab: <span className="font-mono text-foreground">{kitab.id}</span>
        </span>
        <span>
          Slug: <span className="font-mono text-teal-300">{kitab.slug}</span>
        </span>
        <span>
          Berkas saat ini:{" "}
          <span className="font-mono text-foreground">{kitab.urlPdf || "belum ada"}</span>
        </span>
        <span>{formatUkuranBerkas(kitab.ukuranPdfByte)}</span>
        <span>{kitab.jumlahDibuka} sesi baca</span>
      </div>

      <FormKitab
        mode="ubah"
        awal={kitab}
        kategori={daftarKategori}
        pengarang={daftarPengarang}
        syarah={daftarSyarah}
      />
    </div>
  )
}
