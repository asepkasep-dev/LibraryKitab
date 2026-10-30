"use client"

import { useEffect, useState, type ReactNode } from "react"
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Moon,
  NotebookPen,
  PanelRightClose,
  PanelRightOpen,
  Sun,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ZOOM_BAKU, ZOOM_LANGKAH } from "@/lib/baca"
import { cn } from "@/lib/utils"

function TombolToolbar({
  label,
  aktif,
  tertekan,
  onClick,
  children,
}: {
  label: string
  aktif?: boolean
  tertekan?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-pressed={aktif}
          onClick={onClick}
          className={cn(
            "size-9 rounded-xl text-slate-200 hover:bg-white/10 hover:text-white",
            aktif && "bg-gold/15 text-gold hover:bg-gold/20 hover:text-gold",
            tertekan && "text-gold",
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="border-white/10 bg-slate-900">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

export type PanelBaca = "bookmark" | "catatan"

export function ToolbarBaca({
  halaman,
  totalHalaman,
  zoom,
  sepia,
  sudahBookmark,
  panelTerbuka,
  bolehSimpan,
  onLompat,
  onZoom,
  onResetZoom,
  onSepia,
  onBookmark,
  onPanel,
}: {
  halaman: number
  totalHalaman: number
  zoom: number
  sepia: boolean
  sudahBookmark: boolean
  panelTerbuka: PanelBaca | null
  bolehSimpan: boolean
  onLompat: (halaman: number) => void
  onZoom: (arah: 1 | -1) => void
  onResetZoom: () => void
  onSepia: () => void
  onBookmark: () => void
  onPanel: (tab: PanelBaca) => void
}) {
  const [teksLompat, setTeksLompat] = useState(String(halaman))

  useEffect(() => {
    setTeksLompat(String(halaman))
  }, [halaman])

  function kirimLompat(berkas: React.FormEvent) {
    berkas.preventDefault()
    const tujuan = Number.parseInt(teksLompat, 10)
    if (Number.isNaN(tujuan)) {
      setTeksLompat(String(halaman))
      return
    }
    onLompat(Math.min(totalHalaman, Math.max(1, tujuan)))
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 sm:pb-5">
      <div className="surface-card pointer-events-auto flex max-w-[min(56rem,100%)] flex-wrap items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 shadow-[0_20px_50px_-12px_rgb(0_0_0/0.8)]">
        <TombolToolbar
          label="Halaman sebelumnya"
          onClick={() => onLompat(halaman - 1)}
        >
          <ChevronLeft strokeWidth={1.75} />
        </TombolToolbar>

        <form onSubmit={kirimLompat} className="flex items-center gap-1 px-1">
          <label htmlFor="lompat-halaman" className="sr-only">
            Nomor halaman
          </label>
          <input
            id="lompat-halaman"
            value={teksLompat}
            onChange={(e) => setTeksLompat(e.target.value.replace(/\D/g, ""))}
            onBlur={() => setTeksLompat(String(halaman))}
            inputMode="numeric"
            className="h-9 w-12 rounded-lg border border-white/10 bg-white/5 text-center font-heading text-sm font-semibold tabular-nums outline-none focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/40"
          />
          <span className="text-sm text-muted-foreground tabular-nums">
            / {totalHalaman}
          </span>
        </form>

        <TombolToolbar
          label="Halaman berikutnya"
          onClick={() => onLompat(halaman + 1)}
        >
          <ChevronRight strokeWidth={1.75} />
        </TombolToolbar>

        <Separator
          orientation="vertical"
          className="mx-1 hidden h-7 self-center sm:block"
        />

        <TombolToolbar
          label="Perkecil (Zoom out)"
          onClick={() => onZoom(-1)}
        >
          <ZoomOut strokeWidth={1.75} />
        </TombolToolbar>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetZoom}
              aria-label={`Zoom ${zoom} persen, kembali ke ${ZOOM_BAKU} persen`}
              className="h-9 w-16 rounded-xl font-heading text-sm font-semibold tabular-nums text-slate-200 hover:bg-white/10 hover:text-white"
            >
              {zoom}%
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="border-white/10 bg-slate-900">
            Rentang {ZOOM_LANGKAH[0]}%–{ZOOM_LANGKAH[ZOOM_LANGKAH.length - 1]}%,
            klik untuk mengatur ulang
          </TooltipContent>
        </Tooltip>
        <TombolToolbar label="Perbesar (Zoom in)" onClick={() => onZoom(1)}>
          <ZoomIn strokeWidth={1.75} />
        </TombolToolbar>

        <Separator
          orientation="vertical"
          className="mx-1 hidden h-7 self-center sm:block"
        />

        <TombolToolbar
          label={sepia ? "Matikan Sepia Malam" : "Aktifkan Sepia Malam"}
          aktif={sepia}
          onClick={onSepia}
        >
          {sepia ? (
            <Sun strokeWidth={1.75} />
          ) : (
            <Moon strokeWidth={1.75} />
          )}
        </TombolToolbar>
        <TombolToolbar
          label={
            !bolehSimpan
              ? "Masuk untuk menyimpan bookmark"
              : sudahBookmark
                ? "Hapus bookmark halaman ini"
                : "Tandai halaman ini"
          }
          aktif={sudahBookmark}
          onClick={onBookmark}
        >
          <Bookmark
            strokeWidth={1.75}
            className={cn(sudahBookmark && "fill-current")}
          />
        </TombolToolbar>
        <TombolToolbar
          label={
            bolehSimpan ? "Catatan halaman ini" : "Masuk untuk menyimpan catatan"
          }
          aktif={panelTerbuka === "catatan"}
          onClick={() => onPanel("catatan")}
        >
          <NotebookPen strokeWidth={1.75} />
        </TombolToolbar>
        <TombolToolbar
          label={panelTerbuka ? "Tutup panel samping" : "Buka panel samping"}
          aktif={panelTerbuka !== null}
          onClick={() => onPanel(panelTerbuka ?? "bookmark")}
        >
          {panelTerbuka ? (
            <PanelRightClose strokeWidth={1.75} />
          ) : (
            <PanelRightOpen strokeWidth={1.75} />
          )}
        </TombolToolbar>
      </div>
    </div>
  )
}
