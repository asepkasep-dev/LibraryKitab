"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DialogKonfirmasiBaca,
  type Konfirmasi,
} from "@/components/reader/dialog-konfirmasi-baca"
import { PapanBookmark } from "@/components/reader/papan-bookmark"
import { PapanCatatan } from "@/components/reader/papan-catatan"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProgresBar } from "@/components/site/primitives"
import { toast } from "sonner"
import { skemaIsiCatatan, skemaLabelBookmark } from "@/lib/baca"
import type { BookmarkVe, CatatanVe, KitabVe } from "@/db/queries"
import { hitungPersentase } from "@/lib/format"
import { cn } from "@/lib/utils"

type TabPanel = "bookmark" | "catatan"

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
          <PapanBookmark
            bookmark={bookmark}
            halaman={halaman}
            bolehSimpan={bolehSimpan}
            judulKitab={kitab.judulLatin}
            labelDiusulkan={labelDiusulkan}
            onLabelDiusulkan={setLabelDiusulkan}
            onSimpanLabel={simpanLabel}
            onHapusBookmark={onHapusBookmark}
            onLompat={onLompat}
            onTandaiHalamanIni={onTandaiHalamanIni}
            onAjukanHapus={setKonfirmasi}
          />
        </TabsContent>

        <TabsContent value="catatan" className="mt-3 min-h-0 space-y-3">
          <PapanCatatan
            catatan={catatan}
            halaman={halaman}
            bolehSimpan={bolehSimpan}
            draft={draft}
            onDraft={setDraft}
            textareaRef={textareaRef}
            onKirimCatatan={kirimCatatan}
            sedangSunting={sedangSunting}
            onSedangSunting={setSedangSunting}
            teksSunting={teksSunting}
            onTeksSunting={setTeksSunting}
            onSimpanSuntingan={simpanSuntingan}
            onHapusCatatan={onHapusCatatan}
            onLompat={onLompat}
            onAjukanHapus={setKonfirmasi}
          />
        </TabsContent>
      </Tabs>

      <DialogKonfirmasiBaca konfirmasi={konfirmasi} onTutup={() => setKonfirmasi(null)} />
    </div>
  )
}
