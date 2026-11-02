"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { AlertTriangle, FileText, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { rasioKanvas, skalaHalaman } from "@/lib/baca"
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist"
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist"
import { cn } from "@/lib/utils"

GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs"

type Status = "memuat" | "siap" | "gagal"

export function HalamanPdf({
  url,
  slug,
  judul,
  halaman,
  zoom,
  sepia,
}: {
  url: string | null
  slug: string
  judul: string
  halaman: number
  zoom: number
  sepia: boolean
}) {
  const kanvas = useRef<HTMLCanvasElement | null>(null)
  const wadah = useRef<HTMLDivElement | null>(null)
  const renderBerjalan = useRef<RenderTask | null>(null)
  const [dokumen, setDokumen] = useState<PDFDocumentProxy | null>(null)
  const [status, setStatus] = useState<Status>("memuat")
  const [percobaan, setPercobaan] = useState(0)

  useEffect(() => {
    if (!url) return
    let dibatalkan = false
    setStatus("memuat")
    const tugas = getDocument({ url })
    tugas.promise
      .then((baru) => {
        if (dibatalkan) {
          void tugas.destroy()
          return
        }
        setDokumen(baru)
        setStatus("siap")
      })
      .catch(() => {
        if (!dibatalkan) setStatus("gagal")
      })
    return () => {
      dibatalkan = true
      void tugas.destroy()
      setDokumen(null)
    }
  }, [url, percobaan])

  useEffect(() => {
    if (!dokumen || status !== "siap") return
    let dibatalkan = false
    void (async () => {
      const nomor = Math.min(Math.max(1, halaman), dokumen.numPages)
      const halamanPdf = await dokumen.getPage(nomor)
      const kanvasEl = kanvas.current
      const wadahEl = wadah.current
      if (dibatalkan || !kanvasEl || !wadahEl) return

      const dasar = halamanPdf.getViewport({ scale: 1 })
      const tampilan = halamanPdf.getViewport({
        scale: skalaHalaman(wadahEl.clientWidth - 16, dasar.width, zoom),
      })
      const rasio = rasioKanvas(window.devicePixelRatio)
      kanvasEl.width = Math.floor(tampilan.width * rasio)
      kanvasEl.height = Math.floor(tampilan.height * rasio)
      kanvasEl.style.width = `${tampilan.width}px`
      kanvasEl.style.height = `${tampilan.height}px`

      renderBerjalan.current?.cancel()
      const tugas = halamanPdf.render({
        canvas: kanvasEl,
        viewport: tampilan,
        transform: rasio > 1 ? [rasio, 0, 0, rasio, 0, 0] : undefined,
      })
      renderBerjalan.current = tugas
      try {
        await tugas.promise
      } catch (error) {
        // Render lama sengaja dibatalkan saat halaman atau zoom berganti; penolakan
        // itu bukan kegagalan. Pemeriksaan `instanceof` dibutuhkan karena pdf.js
        // kadang menolak dengan objek yang bukan Error, dan membaca `.name` pada
        // nilai null akan melempar di dalam catch.
        const nama = error instanceof Error ? error.name : ""
        if (!dibatalkan && nama !== "RenderingCancelledException") {
          setStatus("gagal")
        }
      }
    })()
    return () => {
      dibatalkan = true
    }
  }, [dokumen, halaman, zoom, status])

  if (!url) {
    return (
      <div className="flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
        <FileText className="size-8 text-muted-foreground" strokeWidth={1.75} />
        <h2 className="font-heading text-lg font-semibold">Naskah PDF belum tersedia</h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Berkas {judul} belum dipasang di rak digital, jadi isinya belum bisa dibaca di layar.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={`/kitab/${slug}`}>Lihat detail kitab</Link>
        </Button>
      </div>
    )
  }

  return (
    <div ref={wadah} className="relative flex min-h-[70vh] w-full justify-center">
      <canvas
        role="img"
        aria-label={`Halaman ${halaman} kitab ${judul}`}
        className={cn(
          "rounded-xl bg-white shadow-[0_24px_60px_-24px_rgb(0_0_0/0.8)] transition-opacity duration-200",
          sepia && "page-sepia",
          status === "siap" ? "opacity-100" : "opacity-0",
        )}
      />
      {status === "memuat" && (
        <p className="absolute inset-x-0 top-1/3 flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-6 animate-spin" strokeWidth={1.75} />
          Memuat halaman {halaman}…
        </p>
      )}
      {status === "gagal" && (
        <div className="absolute inset-x-0 top-1/4 mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/5 px-6 py-8 text-center">
          <AlertTriangle className="size-7 text-amber-300" strokeWidth={1.75} />
          <h2 className="font-heading text-base font-semibold text-amber-200">
            Halaman kitab belum dapat dimuat
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Berkas PDF-nya mungkin belum tersedia di penyimpanan atau jaringan sedang terputus.
          </p>
          <Button size="sm" onClick={() => setPercobaan((n) => n + 1)}>
            Muat ulang
          </Button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-gold underline underline-offset-4"
          >
            Buka berkas PDF di tab baru
          </a>
        </div>
      )}
    </div>
  )
}
