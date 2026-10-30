import { PageIntro } from "@/components/shell/sidebar-shell"
import { KerjaPengguna } from "@/components/admin/kerja-pengguna"
import { listPenggunaDenganAktivitas } from "@/db/queries"
import { butuhAdmin } from "@/lib/auth"

export const metadata = { title: "Daftar Pengguna" }

export default async function AdminPenggunaPage() {
  const [pengelola, baris] = await Promise.all([butuhAdmin(), listPenggunaDenganAktivitas()])

  return (
    <div className="space-y-6">
      <PageIntro
        judul="Daftar Pengguna"
        deskripsi="Seluruh akun santri, ustadz, dan pengelola. Nonaktifkan akun untuk mencabut akses baca tanpa menghapus bookmark, catatan, dan riwayatnya."
      />
      <KerjaPengguna awal={baris} pengelolaId={pengelola.id} />
    </div>
  )
}
