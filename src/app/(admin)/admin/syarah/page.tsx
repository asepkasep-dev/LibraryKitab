import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PageIntro } from "@/components/shell/sidebar-shell"
import { KelolaPengarang } from "@/components/admin/kelola-pengarang"
import { pengarangUntukKelola } from "@/db/queries"

export const metadata = { title: "Kelola Syarah" }

/**
 * Tabel `pengarang` dipakai dua peran, jadi halaman ini menampilkan seluruh nama
 * dengan hitungan pada peran syarah. Nama baru yang belum dipakai tetap muncul
 * supaya dapat langsung dipilih saat mengunggah kitab.
 */
export default async function SyarahPage() {
  const barisAwal = (await pengarangUntukKelola("syarah")).map((row) => ({
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
        judul="Syarah / Syarih"
        deskripsi="Penyusun penjelasan (syarah) atau hasyiyah atas matn kitab. Satu syarah dapat dipakai oleh beberapa kitab."
        aksi={
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/pengarang">Kelola pengarang</Link>
          </Button>
        }
      />
      <KelolaPengarang
        namaEntitas="Syarah"
        deskripsi="Isi identitas syarih agar pembaca tahu siapa yang menjelaskan matn kitab."
        keteranganKolom="Kitab disyarahi"
        barisAwal={barisAwal}
      />
    </div>
  )
}
