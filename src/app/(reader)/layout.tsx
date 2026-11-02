import type { Metadata } from "next"

/** Layout reader: layar penuh tanpa header/footer (Bab 7). */
export const metadata: Metadata = {
  title: "Baca kitab",
  robots: { index: false, follow: false },
}

export default function ReaderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="h-dvh overflow-hidden bg-navy">{children}</div>
}
