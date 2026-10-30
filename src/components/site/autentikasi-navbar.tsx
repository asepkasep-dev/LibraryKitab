"use client"

import Link from "next/link"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { SheetClose } from "@/components/ui/sheet"

/** Tautan masuk/daftar untuk pengunjung, lalu dasbor + avatar untuk anggota. */
export function AutentikasiNavbar({ varian = "desktop" }: { varian?: "desktop" | "sheet" }) {
  if (varian === "sheet") {
    return (
      <div className="grid gap-2">
        <SignedOut>
          <SheetClose asChild>
            <Button asChild variant="outline" className="w-full">
              <Link href="/sign-in">Masuk</Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button asChild className="w-full">
              <Link href="/sign-up">Daftar gratis</Link>
            </Button>
          </SheetClose>
        </SignedOut>
        <SignedIn>
          <SheetClose asChild>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">Dasbor saya</Link>
            </Button>
          </SheetClose>
        </SignedIn>
      </div>
    )
  }

  return (
    <div className="hidden items-center gap-2 md:flex">
      <SignedOut>
        <Button asChild variant="ghost" size="sm">
          <Link href="/sign-in">Masuk</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/sign-up">Daftar</Link>
        </Button>
      </SignedOut>
      <SignedIn>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">Dasbor</Link>
        </Button>
        <UserButton />
      </SignedIn>
    </div>
  )
}
