"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Logo } from "@/components/site/logo"
import { AutentikasiNavbar } from "@/components/site/autentikasi-navbar"
import { NAV_PUBLIK } from "@/lib/site"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [terbuka, setTerbuka] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => setTerbuka(false), [pathname])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-navy/75 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {NAV_PUBLIK.map((tautan) => {
            const aktif =
              tautan.href === "/katalog"
                ? pathname.startsWith("/katalog") || pathname.startsWith("/kitab")
                : pathname === tautan.href
            return (
              <Link
                key={tautan.href}
                href={tautan.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  aktif
                    ? "text-gold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tautan.label}
                {aktif && (
                  <span className="absolute inset-x-3 -bottom-px h-px bg-linear-to-r from-transparent via-gold to-transparent" />
                )}
              </Link>
            )
          })}
        </nav>

        <AutentikasiNavbar />

        <Sheet open={terbuka} onOpenChange={setTerbuka}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="Buka menu navigasi"
            >
              <Menu className="size-5" strokeWidth={1.75} />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="top"
            className="h-fit gap-0 border-b border-white/10 bg-navy/95 pt-[calc(var(--spacing,0.25rem)*6)] pb-6 backdrop-blur-2xl"
          >
            <SheetHeader className="px-0 text-left">
              <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
              <Logo />
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1" aria-label="Navigasi mobile">
              {NAV_PUBLIK.map((tautan) => (
                <SheetClose asChild key={tautan.href}>
                  <Link
                    href={tautan.href}
                    className="rounded-xl px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-white/10"
                  >
                    {tautan.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <div className="mt-5">
              <AutentikasiNavbar varian="sheet" />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
