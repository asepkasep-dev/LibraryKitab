"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CircleCheck, LoaderCircle, LogIn, LogOut, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { HalamanKertas } from "@/components/reader/halaman-kertas"
import { PanelSamping } from "@/components/reader/panel-samping"
import { ToolbarBaca, type PanelBaca } from "@/components/reader/toolbar-baca"
import { toast } from "sonner"
import {
  JEDA_SIMPAN_PROGRES_MS,
  KUNCI_PREFERENSI_BACA,
  ZOOM_BAKU,
  batasiZoom,
  buatHalamanDummy,
  langkahZoom,
} from "@/lib/baca"
import { hitungPersentase, inisialNama } from "@/lib/format"
import type { Bookmark, Catatan, KitabTayang } from "@/lib/dummy-data"
import { cn } from "@/lib/utils"

type StatusProgres = "diam" | "menyimpan" | "tersimpan"

function idBaru(awalan: string) {
  return `${awalan}-${Date.now().toString(36)}`
}

function batasiHalaman(nilai: number, batas: number) {
  return Math.min(batas, Math.max(1, Math.round(nilai)))
}

export function ReaderShell({
  kitab,
  halamanAwal,
  sumberAwal = "riwayat",
  bookmarkAwal,
  catatanAwal,
  namaPengguna,
}: {
  kitab: KitabTayang
  halamanAwal: number
  sumberAwal?: "riwayat" | "tautan"
  bookmarkAwal: Bookmark[]
  catatanAwal: Catatan[]
  namaPengguna: string
}) {
  const total = kitab.jumlahHalaman
  const router = useRouter()
  const [halaman, setHalaman] = useState(() => batasiHalaman(halamanAwal, total))
  const [zoom, setZoom] = useState(ZOOM_BAKU)
  const [sepia, setSepia] = useState(false)
  const [panel, setPanel] = useState<PanelBaca | null>(null)
  const [tabPanel, setTabPanel] = useState<PanelBaca>("bookmark")
  const [sudahMasuk, setSudahMasuk] = useState(true)
  const [statusProgres, setStatusProgres] = useState<StatusProgres>("diam")
  const [halamanTersimpan, setHalamanTersimpan] = useState(halamanAwal)
  const [saranLanjutDitutup, setSaranLanjutDitutup] = useState(false)
  const [layarLebar, setLayarLebar] = useState(false)
  const [bookmark, setBookmark] = useState(() =>
    [...bookmarkAwal].sort((a, b) => a.halaman - b.halaman),
  )
  const [catatan, setCatatan] = useState(() =>
    [...catatanAwal].sort((a, b) => b.halaman - a.halaman),
  )
  const sentuhan = useRef<{ x: number; y: number } | null>(null)

  /* Preferensi zoom dan Sepia Malam dipulihkan dari localStorage (Bab 6.C). */
  useEffect(() => {
    const mentah = localStorage.getItem(KUNCI_PREFERENSI_BACA)
    if (mentah) {
      try {
        const data = JSON.parse(mentah) as { zoom?: number; sepia?: boolean }
        if (typeof data.zoom === "number") setZoom(batasiZoom(data.zoom))
        if (typeof data.sepia === "boolean") setSepia(data.sepia)
      } catch {
        localStorage.removeItem(KUNCI_PREFERENSI_BACA)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      KUNCI_PREFERENSI_BACA,
      JSON.stringify({ zoom, sepia }),
    )
  }, [zoom, sepia])

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    const salin = () => setLayarLebar(media.matches)
    salin()
    media.addEventListener("change", salin)
    return () => media.removeEventListener("change", salin)
  }, [])

  /* Progres dikirim dengan jeda 2 detik setiap kali halaman berpindah. */
  useEffect(() => {
    if (!sudahMasuk || halaman === halamanTersimpan) return
    setStatusProgres("menyimpan")
    const jeda = setTimeout(() => {
      setHalamanTersimpan(halaman)
      setStatusProgres("tersimpan")
    }, JEDA_SIMPAN_PROGRES_MS)
    return () => clearTimeout(jeda)
  }, [halaman, sudahMasuk, halamanTersimpan])

  const pindah = useCallback(
    (tujuan: number) => {
      setHalaman((sekarang) => {
        const aman = Math.min(total, Math.max(1, Math.round(tujuan)))
        return aman === sekarang ? sekarang : aman
      })
    },
    [total],
  )

  useEffect(() => {
    function padaTombol(e: KeyboardEvent) {
      const sasaran = e.target as HTMLElement | null
      if (sasaran?.closest("input, textarea, select, [contenteditable='true']")) return
      if (e.key === "ArrowRight") {
        e.preventDefault()
        pindah(halaman + 1)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        pindah(halaman - 1)
      } else if (e.key === "Home") {
        e.preventDefault()
        pindah(1)
      } else if (e.key === "End") {
        e.preventDefault()
        pindah(total)
      } else if (e.key === "Escape" && panel) {
        setPanel(null)
      }
    }
    window.addEventListener("keydown", padaTombol)
    return () => window.removeEventListener("keydown", padaTombol)
  }, [halaman, total, panel, pindah])

  const isiHalaman = useMemo(() => buatHalamanDummy(kitab, halaman), [kitab, halaman])
  const bookmarkHalamanIni = bookmark.find((b) => b.halaman === halaman)

  function ubahZoom(arah: 1 | -1) {
    setZoom((sekarang) => langkahZoom(sekarang, arah))
  }

  function tandaiHalaman() {
    if (!sudahMasuk) {
      toast.info("Masuk untuk menyimpan bookmark", {
        description:
          "Reader tetap bisa dipakai tanpa akun, tetapi tandanya tidak tersimpan.",
        action: { label: "Masuk", onClick: () => router.push("/sign-in") },
      })
      return
    }
    if (bookmarkHalamanIni) {
      const yangHapus = bookmarkHalamanIni
      setBookmark((daftar) => daftar.filter((b) => b.id !== yangHapus.id))
      toast.success(`Bookmark halaman ${halaman} dihapus`, {
        action: {
          label: "Urungkan",
          onClick: () => setBookmark((daftar) => [yangHapus, ...daftar].sort((a, b) => a.halaman - b.halaman)),
        },
      })
      return
    }
    const baru: Bookmark = {
      id: idBaru("bm"),
      userId: "u1",
      kitabId: kitab.id,
      halaman,
      label: null,
      createdAt: new Date().toISOString(),
    }
    setBookmark((daftar) => [baru, ...daftar].sort((a, b) => a.halaman - b.halaman))
    setTabPanel("bookmark")
    setPanel("bookmark")
    toast.success(`Halaman ${halaman} ditandai`, {
      description: "Beri label lewat panel bookmark agar mudah ditemukan saat muraja'ah.",
    })
  }

  function bukaPanel(tab: PanelBaca) {
    if (panel && tabPanel === tab) {
      setPanel(null)
      return
    }
    setTabPanel(tab)
    setPanel(tab)
  }

  function tambahCatatan(isi: string) {
    const baru: Catatan = {
      id: idBaru("ct"),
      userId: "u1",
      kitabId: kitab.id,
      halaman,
      isi,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCatatan((daftar) => [baru, ...daftar].sort((a, b) => b.halaman - a.halaman))
    toast.success(`Catatan tersimpan di halaman ${halaman}`)
  }

  function ubahCatatan(id: string, isi: string) {
    setCatatan((daftar) =>
      daftar.map((c) =>
        c.id === id ? { ...c, isi, updatedAt: new Date().toISOString() } : c,
      ),
    )
    toast.success("Catatan diperbarui")
  }

  function hapusCatatan(id: string) {
    const tersimpan = catatan.find((c) => c.id === id)
    setCatatan((daftar) => daftar.filter((c) => c.id !== id))
    if (!tersimpan) return
    toast.success("Catatan dihapus", {
      action: {
        label: "Urungkan",
        onClick: () => setCatatan((daftar) => [tersimpan, ...daftar]),
      },
    })
  }

  function gantiLabel(id: string, label: string) {
    setBookmark((daftar) =>
      daftar.map((b) => (b.id === id ? { ...b, label: label === "" ? null : label } : b)),
    )
    toast.success("Label bookmark diperbarui")
  }

  function hapusBookmark(id: string) {
    const tersimpan = bookmark.find((b) => b.id === id)
    setBookmark((daftar) => daftar.filter((b) => b.id !== id))
    if (!tersimpan) return
    toast.success(`Bookmark halaman ${tersimpan.halaman} dihapus`, {
      action: {
        label: "Urungkan",
        onClick: () => setBookmark((daftar) => [tersimpan, ...daftar]),
      },
    })
  }

  function padaSentuhanAkhir(e: TouchEvent) {
    const awal = sentuhan.current
    sentuhan.current = null
    if (!awal) return
    const akhir = e.changedTouches[0]
    if (!akhir) return
    const geserX = akhir.clientX - awal.x
    const geserY = akhir.clientY - awal.y
    if (Math.abs(geserX) < 64 || Math.abs(geserY) > 90) return
    pindah(geserX < 0 ? halaman + 1 : halaman - 1)
  }

  const panelBaca = (
    <PanelSamping
      kitab={kitab}
      halaman={halaman}
      totalHalaman={total}
      tab={tabPanel}
      onTab={(tab) => {
        setTabPanel(tab)
        setPanel(tab)
      }}
      bookmark={bookmark}
      catatan={catatan}
      bolehSimpan={sudahMasuk}
      onLompat={pindah}
      onTandaiHalamanIni={tandaiHalaman}
      onGantiLabel={gantiLabel}
      onHapusBookmark={hapusBookmark}
      onTambahCatatan={tambahCatatan}
      onUbahCatatan={ubahCatatan}
      onHapusCatatan={hapusCatatan}
    />
  )

  return (
    <div className="flex h-full min-h-0">
      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-slate-950/70 px-3 backdrop-blur-xl sm:px-5">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-slate-200 hover:bg-white/10 hover:text-white">
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
            <span
              className={cn(
                "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset md:inline-flex",
                statusProgres === "menyimpan"
                  ? "bg-white/5 text-muted-foreground ring-white/10"
                  : statusProgres === "tersimpan"
                    ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20"
                    : "bg-white/5 text-muted-foreground ring-white/10",
              )}
            >
              {statusProgres === "menyimpan" ? (
                <LoaderCircle className="size-3.5 animate-spin" strokeWidth={1.75} />
              ) : (
                <CircleCheck className="size-3.5" strokeWidth={1.75} />
              )}
              {statusProgres === "menyimpan"
                ? "Menyimpan progres…"
                : `Progres di halaman ${halamanTersimpan} · ${hitungPersentase(halamanTersimpan, total)}%`}
            </span>

            {sudahMasuk ? (
              <>
                <Avatar className="size-8 ring-1 ring-white/15">
                  <AvatarFallback className="bg-gold/15 font-heading text-xs text-gold">
                    {inisialNama(namaPengguna)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                  onClick={() => setSudahMasuk(false)}
                >
                  <LogOut className="size-4" strokeWidth={1.75} />
                  <span className="hidden lg:inline">Keluar (demo)</span>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setSudahMasuk(true)}
              >
                <LogIn className="size-4" strokeWidth={1.75} />
                Masuk (demo)
              </Button>
            )}
          </div>
        </header>

        {sumberAwal === "riwayat" && halamanAwal > 2 && !saranLanjutDitutup && (
          <div className="pointer-events-none absolute inset-x-0 top-20 z-30 flex justify-center px-4">
            <div className="surface-card pointer-events-auto flex max-w-full flex-wrap items-center gap-2 rounded-2xl px-3 py-2 text-xs">
              <Sparkles className="size-4 shrink-0 text-gold" strokeWidth={1.75} />
              <span className="text-slate-200">
                Melanjutkan dari halaman {halamanAwal} sesuai riwayat baca Anda.
              </span>
              <Button
                variant="ghost"
                size="xs"
                className="text-gold hover:bg-gold/10 hover:text-gold"
                onClick={() => {
                  pindah(1)
                  setSaranLanjutDitutup(true)
                }}
              >
                Mulai dari awal
              </Button>
              <Button
                variant="ghost"
                size="xs"
                className="text-muted-foreground"
                onClick={() => setSaranLanjutDitutup(true)}
              >
                Tutup
              </Button>
            </div>
          </div>
        )}

        <div
          className="min-h-0 flex-1 overflow-auto px-4 pt-8 pb-32 sm:px-6"
          onTouchStart={(e) => {
            const titik = e.touches[0]
            sentuhan.current = titik ? { x: titik.clientX, y: titik.clientY } : null
          }}
          onTouchEnd={padaSentuhanAkhir}
        >
          <div className="flex min-h-full justify-center">
            <HalamanKertas kitab={kitab} isi={isiHalaman} zoom={zoom} sepia={sepia} />
          </div>
        </div>

        <ToolbarBaca
          halaman={halaman}
          totalHalaman={total}
          zoom={zoom}
          sepia={sepia}
          sudahBookmark={Boolean(bookmarkHalamanIni)}
          panelTerbuka={panel}
          bolehSimpan={sudahMasuk}
          onLompat={pindah}
          onZoom={ubahZoom}
          onResetZoom={() => setZoom(ZOOM_BAKU)}
          onSepia={() => setSepia((s) => !s)}
          onBookmark={tandaiHalaman}
          onPanel={bukaPanel}
        />
      </main>

      {panel && layarLebar && (
        <aside className="hidden w-[22rem] shrink-0 overflow-hidden border-s border-white/10 bg-slate-950/60 lg:flex lg:flex-col">
          {panelBaca}
        </aside>
      )}

      {panel && !layarLebar && (
        <Sheet open onOpenChange={(buka) => !buka && setPanel(null)}>
          <SheetContent
            side="right"
            className="w-[min(24rem,94vw)] gap-0 overflow-y-auto bg-slate-950/95 pt-14"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Bookmark dan catatan</SheetTitle>
            </SheetHeader>
            {panelBaca}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
