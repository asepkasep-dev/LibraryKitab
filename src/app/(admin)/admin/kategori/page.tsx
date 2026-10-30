import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PageIntro } from "@/components/shell/sidebar-shell"
import { KelolaKategori } from "@/components/admin/kelola-kategori"
import { kategoriUntukKelola } from "@/db/queries"

export const metadata = { title: "Kelola Kategori" }

export default async function KategoriPage() {
  const barisAwal = (await kategoriUntukKelola()).map((row) => ({
    id: row.id,
    nilai: { nama: row.nama, slug: row.slug, deskripsi: row.deskripsi },
    terkait: row.terkait,
  }))

  return (
    <div className="space-y-6">
      <PageIntro
        judul="Kategori / Fan Ilmu"
        deskripsi="Fan ilmu dipakai menyaring katalog dan menentukan warna sampul kitab. Perubahan pada halaman ini berdampak ke seluruh katalog."
        aksi={
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/kitab">Lihat daftar kitab</Link>
          </Button>
        }
      />
      <KelolaKategori barisAwal={barisAwal} />
    </div>
  )
}
