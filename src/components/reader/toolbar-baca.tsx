"use client"

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
import { LompatHalamanBaca } from "@/components/reader/lompat-halaman-baca"
import { TombolToolbar } from "@/components/reader/tombol-toolbar-baca"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ZOOM_BAKU, ZOOM_LANGKAH } from "@/lib/baca"
import { cn } from "@/lib/utils"

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
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 sm:pb-5">
      <div className="surface-card pointer-events-auto flex max-w-[min(56rem,100%)] flex-wrap items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 shadow-[0_20px_50px_-12px_rgb(0_0_0/0.8)]">
        <TombolToolbar
          label="Halaman sebelumnya"
          onClick={() => onLompat(halaman - 1)}
        >
          <ChevronLeft strokeWidth={1.75} />
        </TombolToolbar>

        <LompatHalamanBaca halaman={halaman} totalHalaman={totalHalaman} onLompat={onLompat} />

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
              className="h-9 w-16 rounded-xl font-heading text-sm font-semibold tabular-nums text-foreground hover:bg-white/10 hover:text-white"
            >
              {zoom}%
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="border-white/10 bg-popover">
            Rentang {ZOOM_LANGKAH[0]}% s.d. {ZOOM_LANGKAH[ZOOM_LANGKAH.length - 1]}%,
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
