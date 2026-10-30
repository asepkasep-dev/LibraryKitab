import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1 pt-18">{children}</main>
      <Footer />
    </div>
  )
}
