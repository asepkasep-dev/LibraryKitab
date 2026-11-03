"use client"

import type { ReactNode } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

/** Panel samping menempel di layar lebar, menjadi Sheet dari kanan di layar kecil. */
export function WadahPanelBaca({
  terbuka,
  layarLebar,
  onTutup,
  children,
}: {
  terbuka: boolean
  layarLebar: boolean
  onTutup: () => void
  children: ReactNode
}) {
  if (!terbuka) return null

  return layarLebar ? (
    <aside className="hidden w-[22rem] shrink-0 overflow-hidden border-s border-white/10 bg-navy/60 lg:flex lg:flex-col">
      {children}
    </aside>
  ) : (
    <Sheet open onOpenChange={(buka) => !buka && onTutup()}>
      <SheetContent
        side="right"
        className="w-[min(24rem,94vw)] gap-0 overflow-y-auto bg-navy/95 pt-14"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Bookmark dan catatan</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}
