import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PageIntro } from "@/components/shell/sidebar-shell"
import { FormProfil } from "@/components/member/form-profil"
import { statistikMember } from "@/db/queries"
import { butuhMember } from "@/lib/auth"

export const metadata = { title: "Profil Saya" }

export default async function ProfilPage() {
  const pengguna = await butuhMember()
  const statistik = await statistikMember(pengguna.id)

  return (
    <div>
      <PageIntro
        judul="Profil Saya"
        deskripsi="Perbarui identitas dan preferensi membaca Anda. Ukuran huruf dan mode reader langsung dipakai ketika membuka kitab di reader."
        aksi={
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/riwayat">Lihat riwayat baca</Link>
          </Button>
        }
      />
      <FormProfil
        pengguna={pengguna}
        jumlahBookmark={statistik.totalBookmark}
        jumlahCatatan={statistik.totalCatatan}
        jumlahRiwayat={statistik.kitabDibaca}
      />
    </div>
  )
}
