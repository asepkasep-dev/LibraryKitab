import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageIntro } from "@/components/shell/sidebar-shell"
import { KerjaCatatan } from "@/components/member/kerja-catatan"
import { listCatatanDenganKitab } from "@/db/queries"
import { butuhMember } from "@/lib/auth"

export const metadata = { title: "Catatan Saya" }

export default async function CatatanPage() {
  const pengguna = await butuhMember()
  const baris = await listCatatanDenganKitab(pengguna.id)

  return (
    <div>
      <PageIntro
        judul="Catatan Saya"
        deskripsi="Catatan pemahaman Anda menempel pada halaman kitab. Saring per kitab atau cari kata kunci tertentu ketika menyiapkan bahan pengajian."
        aksi={
          <Button asChild size="sm" variant="outline">
            <Link href="/katalog">Lanjut membaca</Link>
          </Button>
        }
      />
      <KerjaCatatan awal={baris} />
    </div>
  )
}
