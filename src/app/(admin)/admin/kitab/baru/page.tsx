import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageIntro } from "@/components/shell/sidebar-shell"
import { FormKitab } from "@/components/admin/form-kitab"
import { opsiKategori, opsiPengarang, opsiSyarah } from "@/db/queries"

export const metadata = { title: "Unggah Kitab Baru" }

export default async function KitabBaruPage() {
  const [daftarKategori, daftarPengarang, daftarSyarah] = await Promise.all([
    opsiKategori(),
    opsiPengarang(),
    opsiSyarah(),
  ])

  return (
    <div className="space-y-6">
      <PageIntro
        judul="Unggah Kitab Baru"
        deskripsi="Lengkapi metadata, unggah berkas PDF hasil pemindaian, lalu tentukan status publikasi. Kitab tersimpan sebagai draf sampai Anda menayangkannya."
        aksi={
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/kitab">
              <ArrowLeft className="size-4" strokeWidth={1.75} />
              Kembali ke daftar
            </Link>
          </Button>
        }
      />
      <FormKitab
        mode="baru"
        awal={null}
        kategori={daftarKategori}
        pengarang={daftarPengarang}
        syarah={daftarSyarah}
      />
    </div>
  )
}
