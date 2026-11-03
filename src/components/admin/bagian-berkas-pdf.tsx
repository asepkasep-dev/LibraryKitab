"use client"

import type { RefObject } from "react"
import {
  AlertTriangle,
  CircleCheck,
  FileText,
  Trash2,
  Upload,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgresBar } from "@/components/site/primitives"
import { MAKS_PDF_MB } from "@/lib/site"
import { formatUkuranBerkas } from "@/lib/format"
import type { BerkasTersimpan } from "@/lib/unggah-pdf-klien"
import type { KitabVe } from "@/db/queries"
import { cn } from "@/lib/utils"

export function BagianBerkasPdf({
  berkas,
  tersimpan,
  progres,
  berkasDitampilkan,
  awal,
  inputRef,
  onPilihBerkas,
  onUnggah,
  onBuang,
}: {
  berkas: File | null
  tersimpan: BerkasTersimpan | null
  progres: number | null
  berkasDitampilkan: string | null
  awal: KitabVe | null
  inputRef: RefObject<HTMLInputElement | null>
  onPilihBerkas: (file: File | undefined | null) => void
  onUnggah: () => void
  onBuang: () => void
}) {
  return (
    <section className="surface-card space-y-5 p-5 sm:p-6">
      <div>
        <h2 className="font-heading text-lg font-semibold">Berkas PDF</h2>
        <p className="text-sm text-muted-foreground">
          Maksimal {MAKS_PDF_MB} MB. Berkas dikirim ke Bunny Storage melalui
          route handler unggahan, sedangkan kolom jumlah halaman diisi dari hasil
          pembacaan PDF.
        </p>
      </div>

      {berkasDitampilkan && !tersimpan && (
        <div className="surface-inset flex items-center gap-3 p-3">
          <FileText className="size-5 shrink-0 text-gold" strokeWidth={1.75} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-xs text-foreground">{berkasDitampilkan}</p>
            <p className="text-xs text-muted-foreground">
              {awal
                ? `${formatUkuranBerkas(awal.ukuranPdfByte)} · ${awal.jumlahHalaman} halaman`
                : "Berkas tersimpan"}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {awal?.jumlahHalaman ?? 0} hlm
          </Badge>
        </div>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          onPilihBerkas(e.dataTransfer.files?.[0])
        }}
        className={cn(
          "rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center transition-colors",
          "hover:border-gold/40 hover:bg-gold/[0.04]",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => onPilihBerkas(e.target.files?.[0])}
        />
        <Upload className="mx-auto size-7 text-gold" strokeWidth={1.75} />
        <p className="mt-3 font-heading text-sm font-semibold">
          Tarik berkas PDF ke sini
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          atau pilih dari perangkat. Format PDF, maks {MAKS_PDF_MB} MB
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
        >
          Pilih berkas
        </Button>
      </div>

      {berkas && (
        <div className="surface-inset space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="size-4 shrink-0 text-gold/85" strokeWidth={1.75} />
              <p className="truncate text-sm font-medium">{berkas.name}</p>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {formatUkuranBerkas(berkas.size)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {progres === null && (
                <Button type="button" size="sm" onClick={onUnggah}>
                  Unggah sekarang
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive gap-1.5"
                onClick={onBuang}
              >
                <Trash2 className="size-4" strokeWidth={1.75} />
                Buang
              </Button>
            </div>
          </div>

          {progres !== null && progres < 100 && (
            <ProgresBar nilai={progres} label="Mengunggah ke Bunny Storage" size="thin" />
          )}

          {progres === 100 && tersimpan && (
            <Alert className="border-sukses/25 bg-sukses/15">
              <CircleCheck className="size-4" strokeWidth={1.75} />
              <AlertTitle className="text-sukses">Unggahan selesai</AlertTitle>
              <AlertDescription className="text-sukses/80">
                {tersimpan.path} · {tersimpan.halaman} halaman terbaca parser dan
                jumlah halaman sudah terisikan.
              </AlertDescription>
            </Alert>
          )}

          {progres === null && !tersimpan && (
            <p className="text-xs text-muted-foreground">
              Berkas masih tersimpan di perangkat. Klik “Unggah sekarang” untuk
              mengirimnya ke Bunny Storage.
            </p>
          )}
        </div>
      )}

      {!berkasDitampilkan && (
        <Alert>
          <AlertTriangle className="size-4" strokeWidth={1.75} />
          <AlertTitle>Belum ada berkas PDF</AlertTitle>
          <AlertDescription>
            Kitab dapat disimpan sebagai draf tanpa berkas, tetapi belum dapat
            ditayangkan sebelum PDF-nya terunggah.
          </AlertDescription>
        </Alert>
      )}
    </section>
  )
}
