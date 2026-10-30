import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PageIntro } from "@/components/shell/sidebar-shell"
import { KelolaPengarang } from "@/components/admin/kelola-pengarang"
import { pengarangUntukKelola } from "@/db/queries"

export const metadata = { title: "Kelola Pengarang" }

export default async function PengarangPage() {
  const barisAwal = (await pengarangUntukKelola("penulis")).map((row) => ({
    id: row.id,
    nilai: {
      namaArab: row.namaArab,
      namaLatin: row.namaLatin,
      tahunWafat: row.tahunWafat,
      biografiSingkat: row.biografiSingkat,
    },
    terkait: row.terkait,
  }))

  return (
    <div className="space-y-6">
      <PageIntro
        judul="Pengarang Kitab"
        deskripsi="Data pengarang tampil pada kartu katalog dan halaman detail kitab. Nama Arab ditulis lengkap tanpa harakat tambahan di luar naskah."
        aksi={
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/syarah">Kelola syarih</Link>
          </Button>
        }
      />
      <KelolaPengarang
        namaEntitas="Pengarang"
        deskripsi="Lengkapi nama Arab, transliterasi Latin, tahun wafat, dan biografi singkat."
        keteranganKolom="Kitab ditulis"
        barisAwal={barisAwal}
      />
    </div>
  )
}
