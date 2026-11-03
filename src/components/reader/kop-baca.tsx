"use client"

import Link from "next/link"
import { AlertTriangle, ArrowLeft, CircleCheck, LoaderCircle, LogIn } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { KitabVe } from "@/db/queries"
import { inisialNama } from "@/lib/format"
import { teksPillProgres, type StatusProgres } from "@/lib/baca-alur"
import { cn } from "@/lib/utils"

/** Bilah atas reader: kembali ke detail, judul kitab, pil progres, identitas pembaca. */
export function KopBaca({
  kitab,
  masuk,
  namaPengguna,
  statusProgres,
  halamanTersimpan,
  total,
}: {
  kitab: KitabVe
  masuk: boolean
  namaPengguna: string | null
  statusProgres: StatusProgres
  halamanTersimpan: number
  total: number
}) {
  return (
    <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-navy/70 px-3 backdrop-blur-xl sm:px-5">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 text-foreground hover:bg-white/10 hover:text-white">
        <Link href={`/kitab/${kitab.slug}`}>
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          <span className="hidden sm:inline">Detail kitab</span>
          <span className="sr-only sm:hidden">Kembali ke detail kitab</span>
        </Link>
      </Button>

      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-sm font-semibold">{kitab.judulLatin}</p>
        <p className="truncate text-xs text-muted-foreground">
          {kitab.kategori.nama} · {kitab.pengarang.namaLatin}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {masuk && (
          <span
            className={cn(
              "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset md:inline-flex",
              statusProgres === "gagal"
                ? "bg-peringatan/10 text-peringatan ring-peringatan/25"
                : statusProgres === "tersimpan"
                  ? "bg-sukses/10 text-sukses ring-sukses/20"
                  : "bg-white/5 text-muted-foreground ring-white/10",
            )}
          >
            {statusProgres === "menyimpan" ? (
              <LoaderCircle className="size-3.5 animate-spin" strokeWidth={1.75} />
            ) : statusProgres === "gagal" ? (
              <AlertTriangle className="size-3.5" strokeWidth={1.75} />
            ) : (
              <CircleCheck className="size-3.5" strokeWidth={1.75} />
            )}
            {teksPillProgres(statusProgres, halamanTersimpan, total)}
          </span>
        )}

        {masuk ? (
          <Avatar className="size-8 ring-1 ring-white/15">
            <span className="sr-only">{namaPengguna ?? "Anggota"}</span>
            <AvatarFallback className="bg-gold/15 font-heading text-xs text-gold">
              {inisialNama(namaPengguna)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/sign-in">
              <LogIn className="size-4" strokeWidth={1.75} />
              Masuk
            </Link>
          </Button>
        )}
      </div>
    </header>
  )
}
