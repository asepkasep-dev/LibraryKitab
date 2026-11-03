"use client"

import { type RefObject } from "react"
import { Check, FilePenLine, Inbox, Pencil, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChipHalaman } from "@/components/reader/chip-halaman"
import { Textarea } from "@/components/ui/textarea"
import type { Konfirmasi } from "@/components/reader/dialog-konfirmasi-baca"
import type { CatatanVe } from "@/db/queries"
import { MAKS_ISI_CATATAN } from "@/lib/baca"
import { formatTanggalSingkat, waktuRelatif } from "@/lib/format"

/** Tab catatan: komposer untuk halaman aktif dan daftar catatan yang bisa disunting. */
export function PapanCatatan({
  catatan,
  halaman,
  bolehSimpan,
  draft,
  onDraft,
  textareaRef,
  onKirimCatatan,
  sedangSunting,
  onSedangSunting,
  teksSunting,
  onTeksSunting,
  onSimpanSuntingan,
  onHapusCatatan,
  onLompat,
  onAjukanHapus,
}: {
  catatan: CatatanVe[]
  halaman: number
  bolehSimpan: boolean
  draft: string
  onDraft: (nilai: string) => void
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onKirimCatatan: () => void
  sedangSunting: string | null
  onSedangSunting: (id: string | null) => void
  teksSunting: string
  onTeksSunting: (nilai: string) => void
  onSimpanSuntingan: (id: string) => void
  onHapusCatatan: (id: string) => void
  onLompat: (nomor: number) => void
  onAjukanHapus: (k: NonNullable<Konfirmasi>) => void
}) {
  return (
    <>
      {bolehSimpan && (
        <div className="space-y-2">
          <label
            htmlFor="catatan-baru"
            className="text-xs font-medium text-muted-foreground"
          >
            Catatan untuk halaman {halaman}
          </label>
          <Textarea
            id="catatan-baru"
            ref={textareaRef}
            value={draft}
            onChange={(e) => onDraft(e.target.value)}
            rows={3}
            maxLength={MAKS_ISI_CATATAN}
            placeholder="Tulis pemahaman, pertanyaan, atau bahan muraja'ah…"
            className="min-h-20 resize-none"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {draft.length}/{MAKS_ISI_CATATAN}
            </span>
            <Button size="sm" onClick={onKirimCatatan} disabled={draft.trim() === ""}>
              <FilePenLine className="size-4" strokeWidth={1.75} aria-hidden />
              Simpan catatan
            </Button>
          </div>
        </div>
      )}

      <div className="-mx-1 max-h-[42vh] space-y-2 overflow-y-auto px-1 lg:max-h-none lg:flex-1">
        {catatan.length === 0 ? (
          <p className="surface-inset flex items-start gap-2 p-3 text-xs leading-relaxed text-muted-foreground">
            <Inbox className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
            Belum ada catatan pada kitab ini. Catatan tersimpan per halaman
            sehingga mudah dibuka ulang ketika muraja&apos;ah.
          </p>
        ) : (
          catatan.map((item) => {
            const suntingAktif = sedangSunting === item.id
            return (
              <article key={item.id} className="surface-inset space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <ChipHalaman
                    nomor={item.halaman}
                    aktif={item.halaman === halaman}
                    onClick={() => onLompat(item.halaman)}
                  />
                  <div className="flex items-center gap-0.5">
                    {suntingAktif ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-gold"
                          aria-label="Simpan perubahan catatan"
                          onClick={() => onSimpanSuntingan(item.id)}
                        >
                          <Check className="size-4" strokeWidth={1.75} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground"
                          aria-label="Batalkan perubahan catatan"
                          onClick={() => onSedangSunting(null)}
                        >
                          <X className="size-4" strokeWidth={1.75} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-white"
                          aria-label={`Sunting catatan halaman ${item.halaman}`}
                          onClick={() => {
                            onSedangSunting(item.id)
                            onTeksSunting(item.isi)
                          }}
                        >
                          <Pencil className="size-3.5" strokeWidth={1.75} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          aria-label={`Hapus catatan halaman ${item.halaman}`}
                          onClick={() =>
                            onAjukanHapus({
                              judul: "Hapus catatan?",
                              penjelasan: `Catatan pada halaman ${item.halaman} akan hilang dari daftar Anda.`,
                              lakukan: () => onHapusCatatan(item.id),
                            })
                          }
                        >
                          <Trash2 className="size-3.5" strokeWidth={1.75} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {suntingAktif ? (
                  <Textarea
                    value={teksSunting}
                    onChange={(e) => onTeksSunting(e.target.value)}
                    maxLength={MAKS_ISI_CATATAN}
                    rows={4}
                    className="min-h-24"
                  />
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                    {item.isi}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Dibuat {formatTanggalSingkat(item.createdAt)}
                  {item.updatedAt.getTime() !== item.createdAt.getTime() &&
                    ` · diubah ${waktuRelatif(item.updatedAt)}`}
                </p>
              </article>
            )
          })
        )}
      </div>
    </>
  )
}
