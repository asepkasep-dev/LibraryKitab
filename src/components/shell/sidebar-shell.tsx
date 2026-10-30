"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, type FormEvent, type ReactNode } from "react"
import { SignOutButton } from "@clerk/nextjs"
import { ArrowRightLeft, ChevronRight, LogOut, Menu, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { NavIcon } from "@/components/shell/nav-icon"
import { Logo } from "@/components/site/logo"
import { inisialNama } from "@/lib/format"
import type { NavLink } from "@/lib/site"
import { cn } from "@/lib/utils"

export type ShellArea = "member" | "admin"

export function SidebarShell({
  nav,
  area,
  brand,
  user,
  bolehAdmin = false,
  children,
}: {
  nav: NavLink[]
  area: ShellArea
  brand: string
  user: { nama: string; email: string; peran: string }
  /** Penentu tunggal tampilan tautan panel pengelola (dari tabel users). */
  bolehAdmin?: boolean
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [cari, setCari] = useState("")

  const aktifByPath = (href: string) =>
    href === "/" || area === "admin"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`)

  // Tautan paling spesifik menang agar sub-halaman tidak ikut menyorot induknya.
  const hrefAktif = nav
    .filter((item) => aktifByPath(item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  const judulHalaman =
    nav.find((item) => item.href === hrefAktif)?.label ?? brand

  const targetCari = area === "admin" ? "/admin/kitab" : "/katalog"
  const placeholderCari =
    area === "admin" ? "Cari kitab kelola…" : "Cari cepat kitab…"

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = cari.trim()
    router.push(q ? `${targetCari}?q=${encodeURIComponent(q)}` : targetCari)
  }

  const menu = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3" aria-label={brand}>
      {nav.map((item) => {
        const aktif = item.href === hrefAktif
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              aktif
                ? area === "admin"
                  ? "bg-gold/15 text-gold ring-1 ring-gold/25"
                  : "bg-white/10 text-foreground ring-1 ring-white/10"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
            aria-current={aktif ? "page" : undefined}
          >
            <NavIcon
              nama={item.icon}
              className={cn(
                "size-4.5 shrink-0 transition-colors",
                aktif
                  ? area === "admin"
                    ? "text-gold"
                    : "text-teal-300"
                  : "text-muted-foreground group-hover:text-foreground",
              )}
            />
            <span className="truncate">{item.label}</span>
            {aktif && area === "admin" && (
              <span className="ml-auto size-1.5 rounded-full bg-gold" />
            )}
          </Link>
        )
      })}
    </nav>
  )

  const kartuPengguna = (
    <div className="border-t border-white/10 p-3">
      <div className="surface-inset flex items-center gap-3 p-3">
        <Avatar className="size-9">
          <AvatarFallback className="bg-gold/15 font-heading text-sm text-gold">
            {inisialNama(user.nama)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-semibold">{user.nama}</p>
          <p className="truncate text-xs text-muted-foreground">{user.peran}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-white/10 bg-sidebar/85 backdrop-blur-xl lg:flex">
        <div className="flex h-18 items-center gap-2 border-b border-white/5 px-5">
          <Logo href={area === "admin" ? "/admin/dashboard" : "/dashboard"} compact />
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
              area === "admin"
                ? "bg-gold/15 text-gold ring-1 ring-gold/25"
                : "bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/20",
            )}
          >
            {area === "admin" ? "Pengelola" : "Member"}
          </span>
        </div>
        <p className="px-5 pt-5 pb-2 font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {brand}
        </p>
        {menu}
        {area === "admin" ? (
          <div className="p-3">
            <Link
              href="/dashboard"
              className="surface-inset flex items-center justify-between gap-2 p-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="inline-flex items-center gap-2">
                <ArrowRightLeft className="size-4" strokeWidth={1.75} />
                Kembali ke area santri
              </span>
              <ChevronRight className="size-4" strokeWidth={1.75} />
            </Link>
          </div>
        ) : (
          bolehAdmin && (
            <div className="p-3">
              <Link
                href="/admin/dashboard"
                className="surface-inset flex items-center justify-between gap-2 p-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowRightLeft className="size-4" strokeWidth={1.75} />
                  Area pengelola
                </span>
                <ChevronRight className="size-4" strokeWidth={1.75} />
              </Link>
            </div>
          )
        )}
        {kartuPengguna}
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-navy/75 backdrop-blur-xl">
          <div className="mx-auto flex h-18 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Buka menu navigasi"
                >
                  <Menu className="size-5" strokeWidth={1.75} />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="max-h-[78vh] rounded-t-3xl border-t border-white/10 bg-navy-card/95 backdrop-blur-2xl"
              >
                <SheetHeader className="text-left">
                  <SheetTitle>{brand}</SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    {user.nama} · {user.peran}
                  </SheetDescription>
                </SheetHeader>
                <div className="-mx-4 mt-2 flex max-h-[52vh] flex-col gap-1 overflow-y-auto px-4">
                  {nav.map((item) => {
                    const aktif = item.href === hrefAktif
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                            aktif
                              ? "bg-white/10 text-foreground"
                              : "text-muted-foreground hover:bg-white/5",
                          )}
                        >
                          <NavIcon nama={item.icon} className="size-4.5" />
                          {item.label}
                        </Link>
                      </SheetClose>
                    )
                  })}
                </div>
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <h1 className="truncate font-heading text-lg font-semibold sm:text-xl">
                {judulHalaman}
              </h1>
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {area === "admin"
                  ? "Panel pengelola perpustakaan"
                  : "Assalamu'alaikum, selamat melanjutkan bacaan"}
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              role="search"
              className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-colors focus-within:border-gold/40 md:flex"
            >
              <Search className="size-4 text-muted-foreground" strokeWidth={1.75} />
              <input
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                aria-label={placeholderCari}
                placeholder={placeholderCari}
                className="w-36 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground xl:w-52"
              />
            </form>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Menu akun"
                  className="rounded-full ring-1 ring-white/10 transition-shadow hover:ring-gold/40 focus-visible:ring-3 focus-visible:ring-gold/40 focus-visible:outline-none"
                >
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-gold/15 font-heading text-sm text-gold">
                      {inisialNama(user.nama)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <p className="font-heading text-sm font-semibold">{user.nama}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profil">Profil & preferensi baca</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/catatan">Catatan saya</Link>
                </DropdownMenuItem>
                {bolehAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard">Beralih ke panel pengelola</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <SignOutButton redirectUrl="/sign-in">
                  <DropdownMenuItem className="text-red-300 focus:text-red-200">
                    <LogOut className="size-4" strokeWidth={1.75} />
                    Keluar
                  </DropdownMenuItem>
                </SignOutButton>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  )
}

export function PageIntro({
  judul,
  deskripsi,
  aksi,
}: {
  judul: string
  deskripsi?: string
  aksi?: ReactNode
}) {
  return (
    <section className="mb-7 flex flex-col gap-4 border-b border-white/5 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1.5">
        <h2 className="font-heading text-2xl font-bold text-balance">{judul}</h2>
        {deskripsi && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {deskripsi}
          </p>
        )}
      </div>
      {aksi && <div className="flex flex-wrap items-center gap-2">{aksi}</div>}
    </section>
  )
}
