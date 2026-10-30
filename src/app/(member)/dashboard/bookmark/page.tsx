import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageIntro } from "@/components/shell/sidebar-shell"
import { DaftarBookmark } from "@/components/member/daftar-bookmark"
import { listBookmarkGrupKitab } from "@/db/queries"
import { butuhMember } from "@/lib/auth"

export const metadata = { title: "Bookmark Saya" }

export default async function BookmarkPage() {
  const pengguna = await butuhMember()
  const grup = await listBookmarkGrupKitab(pengguna.id)

  return (
    <div>
      <PageIntro
        judul="Bookmark Saya"
        deskripsi="Tanda halaman tersimpan per kitab. Buka langsung ke halaman yang Anda tandai, atau bersihkan yang sudah tidak diperlukan."
        aksi={
          <Button asChild size="sm" variant="outline">
            <Link href="/katalog">Tambah kitab baru</Link>
          </Button>
        }
      />
      <DaftarBookmark awal={grup} />
    </div>
  )
}
