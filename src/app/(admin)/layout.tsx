import type { Metadata } from "next"
import { SidebarShell } from "@/components/shell/sidebar-shell"
import { butuhAdmin } from "@/lib/auth"
import { NAV_ADMIN } from "@/lib/site"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pengelola = await butuhAdmin()

  return (
    <SidebarShell
      nav={NAV_ADMIN}
      area="admin"
      brand="Panel Pengelola"
      user={{
        nama: pengelola.namaLengkap || "Pengelola",
        email: pengelola.email,
        peran: "Admin · Pengelola Perpustakaan",
      }}
    >
      {children}
    </SidebarShell>
  )
}
