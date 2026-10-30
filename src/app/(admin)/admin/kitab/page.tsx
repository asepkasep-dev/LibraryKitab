import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageIntro } from "@/components/shell/sidebar-shell"
import { TabelKitab } from "@/components/admin/tabel-kitab"
import { listSemuaKitab } from "@/db/queries"

export const metadata = { title: "Manajemen Kitab" }

export default async function ManajemenKitabPage() {
  const daftar = await listSemuaKitab()

  return (
    <div className="space-y-6">
      <PageIntro
        judul="Manajemen Kitab"
        deskripsi="Seluruh koleksi perpustakaan, termasuk draf dan arsip. Perubahan status langsung berdampak pada katalog publik."
        aksi={
          <Button asChild size="sm">
            <Link href="/admin/kitab/baru">
              <Plus className="size-4" strokeWidth={1.75} />
              Unggah kitab baru
            </Link>
          </Button>
        }
      />
      <TabelKitab awal={daftar} />
    </div>
  )
}
