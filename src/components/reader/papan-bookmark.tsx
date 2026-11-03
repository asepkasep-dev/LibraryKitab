"use client"

import { Bookmark, Check, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChipHalaman } from "@/components/reader/chip-halaman"
import type { Konfirmasi } from "@/components/reader/dialog-konfirmasi-baca"
import type { BookmarkVe } from "@/db/queries"
import { waktuRelatif } from "@/lib/format"

/** Tab bookmark: tandai halaman ini, daftar penanda, dan label yang bisa diubah di tempat. */
export function PapanBookmark({
  bookmark,
  halaman,
  bolehSimpan,
  judulKitab,
  labelDiusulkan,
  onLabelDiusulkan,
  onSimpanLabel,
  onHapusBookmark,
  onLompat,
  onTandaiHalamanIni,
  onAjukanHapus,
}: {
  bookmark: BookmarkVe[]
  halaman: number
  bolehSimpan: boolean
  judulKitab: string
  labelDiusulkan: { id: string; teks: string } | null
  onLabelDiusulkan: (nilai: { id: string; teks: string } | null) => void
  onSimpanLabel: (id: string) => void
  onHapusBookmark: (id: string) => void
  onLompat: (nomor: number) => void
  onTandaiHalamanIni: () => void
  onAjukanHapus: (k: NonNullable<Konfirmasi>) => void
}) {
  const bookmarkHalamanIni = bookmark.find((b) => b.halaman === halaman)
  return (
    <>
      {bolehSimpan && (
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center"
          onClick={onTandaiHalamanIni}
          disabled={Boolean(bookmarkHalamanIni)}
        >
          <Bookmark
            className="size-4"
            strokeWidth={1.75}
            aria-hidden
          />
          {bookmarkHalamanIni
            ? `Halaman ${halaman} sudah ditandai`
            : `Tandai halaman ${halaman}`}
        </Button>
      )}

      <div className="-mx-1 max-h-[46vh] space-y-2 overflow-y-auto px-1 lg:max-h-none lg:flex-1">
        {bookmark.length === 0 ? (
          <p className="surface-inset p-3 text-xs leading-relaxed text-muted-foreground">
            Belum ada bookmark pada kitab ini. Tekan tombol bookmark pada
            toolbar saat menemukan halaman yang perlu diulang.
          </p>
        ) : (
          bookmark.map((item) => {
            const sedangDiusulkan = labelDiusulkan?.id === item.id
            return (
              <div
                key={item.id}
                className="surface-inset flex items-start gap-2 p-2.5"
              >
                <ChipHalaman
                  nomor={item.halaman}
                  aktif={item.halaman === halaman}
                  onClick={() => onLompat(item.halaman)}
                />
                <div className="min-w-0 flex-1">
                  {sedangDiusulkan ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        value={labelDiusulkan?.teks ?? ""}
                        maxLength={80}
                        onChange={(e) =>
                          onLabelDiusulkan({ id: item.id, teks: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onSimpanLabel(item.id)
                          if (e.key === "Escape") onLabelDiusulkan(null)
                        }}
                        className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-sm outline-none focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/40"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-gold"
                        aria-label="Simpan label"
                        onClick={() => onSimpanLabel(item.id)}
                      >
                        <Check className="size-4" strokeWidth={1.75} />
                      </Button>
                    </div>
                  ) : (
                    <p className="truncate text-sm font-medium">
                      {item.label ?? <span className="text-muted-foreground">Tanpa label</span>}
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Disimpan {waktuRelatif(item.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground hover:text-white"
                    aria-label={`Ubah label bookmark halaman ${item.halaman}`}
                    onClick={() =>
                      onLabelDiusulkan({ id: item.id, teks: item.label ?? "" })
                    }
                  >
                    <Pencil className="size-3.5" strokeWidth={1.75} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    aria-label={`Hapus bookmark halaman ${item.halaman}`}
                    onClick={() =>
                      onAjukanHapus({
                        judul: "Hapus bookmark?",
                        penjelasan: `Bookmark halaman ${item.halaman} pada ${judulKitab} akan hilang dari daftar Anda.`,
                        lakukan: () => onHapusBookmark(item.id),
                      })
                    }
                  >
                    <Trash2 className="size-3.5" strokeWidth={1.75} />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
