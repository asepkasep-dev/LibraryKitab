"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  Bookmark,
  Check,
  FilePenLine,
  Inbox,
  LogIn,
  Pencil,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ProgresBar } from "@/components/site/primitives"
import { toast } from "sonner"
import {
  MAKS_ISI_CATATAN,
  skemaIsiCatatan,
  skemaLabelBookmark,
} from "@/lib/baca"
import type { BookmarkVe, CatatanVe, KitabVe } from "@/db/queries"
import {
  formatTanggalSingkat,
  hitungPersentase,
  waktuRelatif,
} from "@/lib/format"
import { cn } from "@/lib/utils"

type TabPanel = "bookmark" | "catatan"

type Konfirmasi = {
  judul: string
  penjelasan: string
  lakukan: () => void
} | null

function ChipHalaman({
  nomor,
  aktif,
  onClick,
}: {
  nomor: number
  aktif?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Pergi ke halaman ${nomor}`}
      className={cn(
        "grid h-7 min-w-9 shrink-0 place-items-center rounded-lg px-1.5 font-heading text-xs font-semibold tabular-nums ring-1 ring-inset transition-colors",
        aktif
          ? "bg-gold/20 text-gold ring-gold/30"
          : "bg-white/5 text-slate-300 ring-white/10 hover:bg-white/10 hover:text-white",
      )}
    >
      {nomor}
    </button>
  )
}

export function PanelSamping({
  kitab,
  halaman,
  totalHalaman,
  tab,
  onTab,
  bookmark,
  catatan,
  bolehSimpan,
  onLompat,
  onTandaiHalamanIni,
  onGantiLabel,
  onHapusBookmark,
  onTambahCatatan,
  onUbahCatatan,
  onHapusCatatan,
  className,
}: {
  kitab: KitabVe
  halaman: number
  totalHalaman: number
  tab: TabPanel
  onTab: (tab: TabPanel) => void
  bookmark: BookmarkVe[]
  catatan: CatatanVe[]
  bolehSimpan: boolean
  onLompat: (nomor: number) => void
  onTandaiHalamanIni: () => void
  onGantiLabel: (id: string, label: string) => void
  onHapusBookmark: (id: string) => void
  onTambahCatatan: (isi: string) => void
  onUbahCatatan: (id: string, isi: string) => void
  onHapusCatatan: (id: string) => void
  className?: string
}) {
  const [draft, setDraft] = useState("")
  const [sedangSunting, setSedangSunting] = useState<string | null>(null)
  const [teksSunting, setTeksSunting] = useState("")
  const [labelDiusulkan, setLabelDiusulkan] = useState<{ id: string; teks: string } | null>(null)
  const [konfirmasi, setKonfirmasi] = useState<Konfirmasi>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const bookmarkHalamanIni = bookmark.find((b) => b.halaman === halaman)

  useEffect(() => {
    if (tab !== "catatan" || !bolehSimpan) return
    textareaRef.current?.focus()
  }, [tab, bolehSimpan, halaman])

  function kirimCatatan() {
    const hasil = skemaIsiCatatan.safeParse(draft)
    if (!hasil.success) {
      toast.error(hasil.error.issues[0]?.message ?? "Catatan belum valid.")
      return
    }
    onTambahCatatan(hasil.data)
    setDraft("")
  }

  function simpanSuntingan(id: string) {
    const hasil = skemaIsiCatatan.safeParse(teksSunting)
    if (!hasil.success) {
      toast.error(hasil.error.issues[0]?.message ?? "Catatan belum valid.")
      return
    }
    onUbahCatatan(id, hasil.data)
    setSedangSunting(null)
  }

  function simpanLabel(id: string) {
    const hasil = skemaLabelBookmark.safeParse(labelDiusulkan?.teks ?? "")
    if (!hasil.success) {
      toast.error(hasil.error.issues[0]?.message ?? "Label belum valid.")
      return
    }
    onGantiLabel(id, hasil.data)
    setLabelDiusulkan(null)
  }

  return (
    <div className={cn("flex min-h-0 flex-col gap-3 p-4", className)}>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Panel baca
        </p>
        <ProgresBar
          nilai={hitungPersentase(halaman, totalHalaman)}
          label={`Progres ${kitab.judulLatin}`}
          size="thin"
        />
      </div>

      <Tabs value={tab} onValueChange={(nilai) => onTab(nilai as TabPanel)}>
        <TabsList className="w-full rounded-xl bg-white/5">
          <TabsTrigger value="bookmark" className="gap-1.5 rounded-lg">
            Bookmark
            <span className="text-xs text-muted-foreground tabular-nums">
              {bookmark.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="catatan" className="gap-1.5 rounded-lg">
            Catatan
            <span className="text-xs text-muted-foreground tabular-nums">
              {catatan.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {!bolehSimpan && (
          <div className="surface-inset mt-3 flex flex-col gap-2 p-3 text-sm">
            <p className="text-muted-foreground">
              Bookmark dan catatan hanya tersimpan untuk member yang sudah
              masuk. Reader tetap dapat dibaca tanpa login.
            </p>
            <Button asChild size="sm" className="w-fit gap-1.5">
              <Link href="/sign-in">
                <LogIn className="size-4" strokeWidth={1.75} />
                Masuk dulu
              </Link>
            </Button>
          </div>
        )}

        <TabsContent value="bookmark" className="mt-3 min-h-0 space-y-2">
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
                              setLabelDiusulkan({ id: item.id, teks: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") simpanLabel(item.id)
                              if (e.key === "Escape") setLabelDiusulkan(null)
                            }}
                            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-sm outline-none focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/40"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-gold"
                            aria-label="Simpan label"
                            onClick={() => simpanLabel(item.id)}
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
                          setLabelDiusulkan({ id: item.id, teks: item.label ?? "" })
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
                          setKonfirmasi({
                            judul: "Hapus bookmark?",
                            penjelasan: `Bookmark halaman ${item.halaman} pada ${kitab.judulLatin} akan hilang dari daftar Anda.`,
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
        </TabsContent>

        <TabsContent value="catatan" className="mt-3 min-h-0 space-y-3">
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
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                maxLength={MAKS_ISI_CATATAN}
                placeholder="Tulis pemahaman, pertanyaan, atau bahan muraja'ah…"
                className="min-h-20 resize-none"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {draft.length}/{MAKS_ISI_CATATAN}
                </span>
                <Button size="sm" onClick={kirimCatatan} disabled={draft.trim() === ""}>
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
                              onClick={() => simpanSuntingan(item.id)}
                            >
                              <Check className="size-4" strokeWidth={1.75} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-muted-foreground"
                              aria-label="Batalkan perubahan catatan"
                              onClick={() => setSedangSunting(null)}
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
                                setSedangSunting(item.id)
                                setTeksSunting(item.isi)
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
                                setKonfirmasi({
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
                        onChange={(e) => setTeksSunting(e.target.value)}
                        maxLength={MAKS_ISI_CATATAN}
                        rows={4}
                        className="min-h-24"
                      />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-line text-slate-200">
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
        </TabsContent>
      </Tabs>

      <Dialog open={konfirmasi !== null} onOpenChange={(buka) => !buka && setKonfirmasi(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{konfirmasi?.judul}</DialogTitle>
            <DialogDescription>{konfirmasi?.penjelasan}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setKonfirmasi(null)}>
              Batal
            </Button>
            <Button
              variant="solidDestructive"
              onClick={() => {
                konfirmasi?.lakukan()
                setKonfirmasi(null)
              }}
            >
              Ya, hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
