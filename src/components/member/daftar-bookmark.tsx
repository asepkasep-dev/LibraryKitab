"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { BookmarkCheck, ExternalLink, LoaderCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { KitabCover } from "@/components/site/kitab-cover"
import { EmptyState } from "@/components/site/primitives"
import { toast } from "sonner"
import { hapusBookmarkId } from "@/actions/baca"
import type { BookmarkVe, KitabVe } from "@/db/queries"
import { formatAngka, waktuRelatif } from "@/lib/format"

export type GrupBookmark = { kitab: KitabVe; items: BookmarkVe[] }

/**
 * Daftar dibaca ulang lewat `revalidatePath` di sisi server, jadi tidak ada
 * salinan lokal yang bisa berbeda dari isi database.
 */
export function DaftarBookmark({ awal }: { awal: GrupBookmark[] }) {
  const [konfirmasi, setKonfirmasi] = useState<
    { id: string; kitab: KitabVe; halaman: number } | null
  >(null)
  const [isPending, jalankan] = useTransition()

  const jumlahBookmark = awal.reduce((acc, row) => acc + row.items.length, 0)

  function hapus() {
    const target = konfirmasi
    if (!target) return
    setKonfirmasi(null)
    jalankan(async () => {
      const hasil = await hapusBookmarkId(target.id)
      if (!hasil.ok) {
        toast.error(hasil.pesan)
        return
      }
      toast.success(`Bookmark halaman ${target.halaman} dihapus`)
    })
  }

  if (jumlahBookmark === 0) {
    return (
      <EmptyState
        ikon={<BookmarkCheck className="size-6" strokeWidth={1.75} />}
        judul="Belum ada bookmark tersimpan"
        pesan="Tandai halaman penting langsung dari reader. Bookmark membantu Anda kembali ke pembahasan tertentu saat muraja'ah."
        aksi={
          <Button asChild>
            <Link href="/katalog">Cari kitab untuk dibaca</Link>
          </Button>
        }
      />
    )
  }

  return (
    <>
      <p className="mb-5 text-sm text-muted-foreground">
        {formatAngka(jumlahBookmark)} bookmark tersimpan pada{" "}
        {formatAngka(awal.length)} kitab. Klik nomor halaman untuk langsung
        membuka reader pada halaman tersebut.
      </p>

      <div className="space-y-5">
        {awal.map((row) => (
          <Card key={row.kitab.id} className="gap-0">
            <CardContent className="space-y-4 px-5 py-5">
              <div className="flex flex-wrap items-center gap-4">
                <KitabCover kitab={row.kitab} sizes="micro" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-heading text-base font-semibold">
                    {row.kitab.judulLatin}
                  </h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.kitab.kategori.nama} · {row.kitab.pengarang.namaLatin}
                  </p>
                </div>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-white/10 tabular-nums">
                  {row.items.length} halaman
                </span>
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link href={`/baca/${row.kitab.slug}`}>
                    <ExternalLink className="size-4" strokeWidth={1.75} />
                    Buka reader
                  </Link>
                </Button>
              </div>

              <ul className="grid gap-2 md:grid-cols-2">
                {row.items.map((item) => (
                  <li
                    key={item.id}
                    className="surface-inset flex items-center gap-3 p-3"
                  >
                    <Link
                      href={`/baca/${row.kitab.slug}?halaman=${item.halaman}`}
                      className="grid h-9 min-w-11 shrink-0 place-items-center rounded-lg bg-gold/15 px-2 font-heading text-sm font-bold text-gold tabular-nums transition-colors hover:bg-gold/25"
                      aria-label={`Buka halaman ${item.halaman} kitab ${row.kitab.judulLatin}`}
                    >
                      {item.halaman}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.label ?? "Tanpa label"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Ditandai {waktuRelatif(item.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label={`Hapus bookmark halaman ${item.halaman}`}
                      onClick={() =>
                        setKonfirmasi({
                          id: item.id,
                          kitab: row.kitab,
                          halaman: item.halaman,
                        })
                      }
                    >
                      <Trash2 className="size-4" strokeWidth={1.75} />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={konfirmasi !== null}
        onOpenChange={(buka) => !buka && setKonfirmasi(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus bookmark ini?</DialogTitle>
            <DialogDescription>
              {konfirmasi
                ? `Tanda pada halaman ${konfirmasi.halaman} kitab ${konfirmasi.kitab.judulLatin} akan dihapus dari daftar Anda.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setKonfirmasi(null)}>
              Batal
            </Button>
            <Button
              variant="solidDestructive"
              disabled={isPending}
              onClick={hapus}
            >
              {isPending && <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />}
              Hapus bookmark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
