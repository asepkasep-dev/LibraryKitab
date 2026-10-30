"use client"

import Link from "next/link"
import { UserButton, useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { SheetClose } from "@/components/ui/sheet"

/** Tautan masuk/daftar untuk pengunjung, lalu dasbor + avatar untuk anggota. */
export function AutentikasiNavbar({ varian = "desktop" }: { varian?: "desktop" | "sheet" }) {
  const { isSignedIn } = useAuth()

  if (varian === "sheet") {
    return (
      <div className="grid gap-2">
        {!isSignedIn && (
          <>
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
          </>
        )}
        {isSignedIn && (
          <SheetClose asChild>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">Dasbor saya</Link>
            </Button>
          </SheetClose>
        )}
      </div>
    )
  }

  return (
    <div className="hidden items-center gap-2 md:flex">
      {!isSignedIn && (
        <>
          <Button asChild variant="ghost" size="sm">
            <Link href="/sign-in">Masuk</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/sign-up">Daftar</Link>
          </Button>
        </>
      )}
      {isSignedIn && (
        <>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">Dasbor</Link>
          </Button>
          <UserButton />
        </>
      )}
    </div>
  )
}
