import type { Metadata } from "next"
import { Amiri, Inter, Plus_Jakarta_Sans } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { temaClerk } from "@/lib/clerk-theme"
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "@/lib/site"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
})

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME}: Perpustakaan Digital Kitab Kuning`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: APP_NAME,
    title: `${APP_NAME}: Perpustakaan Digital Kitab Kuning`,
    description: APP_DESCRIPTION,
  },
}

// Next.js 15 menangguhkan interpolasi metadata sampai explisit (diperlukan Clerk).
export async function interpolateMetadata(
  metadata: Metadata,
  params: { slug: string }
) {
  const done = { ...metadata }
  if (typeof done.title === "string") {
    done.title = done.title.replace(/\[slug\]/g, params.slug)
  }
  return done
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider appearance={temaClerk}>
      <html lang="id" className={`dark ${jakarta.variable} ${inter.variable} ${amiri.variable}`} suppressHydrationWarning>
        <body className="min-h-dvh font-sans text-foreground">
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          <Toaster position="bottom-center" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  )
}
