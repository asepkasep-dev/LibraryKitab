import type { Metadata } from "next"
import { SidebarShell } from "@/components/shell/sidebar-shell"
import { gabungLabelPeran } from "@/db/queries"
import { butuhMember } from "@/lib/auth"
import { NAV_MEMBER } from "@/lib/site"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function MemberLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pengguna = await butuhMember()

  return (
    <SidebarShell
      nav={NAV_MEMBER}
      area="member"
      brand="Dasbor Santri"
      bolehAdmin={pengguna.role === "admin"}
      user={{
        nama: pengguna.namaLengkap || "Santri",
        email: pengguna.email,
        peran: gabungLabelPeran(pengguna),
      }}
    >
      {children}
    </SidebarShell>
  )
}
