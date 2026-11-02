"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertTriangle,
  CircleCheck,
  FileText,
  LoaderCircle,
  Save,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ProgresBar } from "@/components/site/primitives"
import { simpanKitab } from "@/actions/kitab"
import { MAKS_PDF_MB } from "@/lib/site"
import { formatUkuranBerkas, slugify, waktuRelatif } from "@/lib/format"
import { skemaKitab, type KitabInput } from "@/lib/validasi"
import type { KitabVe, StatusKitab } from "@/db/queries"
import { cn } from "@/lib/utils"

export type OpsiPilhan = { id: string; nama: string }

const TIDAK_ADA = "tidak-ada"

/** Balasan /api/admin/upload-pdf — hanya varian `ok: true` yang punya bukti unggahan. */
type ResponsUnggah = {
  ok: boolean
  path?: string
  byte?: number
  halaman?: number
  tanda?: string
  pesan?: string
}

type BerkasTersimpan = { path: string; byte: number; halaman: number; tanda: string }

const STATUS_OPSI: { nilai: StatusKitab; judul: string; keterangan: string }[] = [
  {
    nilai: "draft",
    judul: "Draf",
    keterangan: "Hanya terlihat di panel pengelola, belum muncul di katalog.",
  },
  {
    nilai: "published",
    judul: "Tayang",
    keterangan: "Muncul di katalog publik, pencarian, dan dapat dibuka santri.",
  },
  {
    nilai: "archived",
    judul: "Arsip",
    keterangan: "Ditarik dari peredaran, riwayat baca tetap tersimpan.",
  },
]

export function FormKitab({
  mode,
  awal,
  kategori,
  pengarang,
  syarah,
}: {
  mode: "baru" | "ubah"
  awal: KitabVe | null
  kategori: OpsiPilhan[]
  pengarang: OpsiPilhan[]
  syarah: OpsiPilhan[]
}) {
  const router = useRouter()
  const berkasInput = useRef<HTMLInputElement>(null)
  const [berkas, setBerkas] = useState<File | null>(null)
  const [tersimpan, setTersimpan] = useState<BerkasTersimpan | null>(null)
  const [progres, setProgres] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<KitabInput>({
    resolver: zodResolver(skemaKitab),
    defaultValues: {
      judulLatin: awal?.judulLatin ?? "",
      judulArab: awal?.judulArab ?? "",
      kategoriId: awal?.kategoriId ?? "",
      pengarangId: awal?.pengarangId ?? "",
      syarahId: awal?.syarahId ?? "",
      tahunTerbit: awal?.tahunTerbit ?? String(new Date().getFullYear()),
      jumlahHalaman: awal?.jumlahHalaman ?? 0,
      deskripsi: awal?.deskripsi ?? "",
      status: awal?.status ?? "draft",
    },
  })

  const judulLatin = watch("judulLatin")
  const status = watch("status")
  const slugPratinjau = slugify(judulLatin || "tanpa-judul")
  const berkasDitampilkan = tersimpan?.path ?? awal?.urlPdf ?? null
  /** Selama berkas ada, bilangan halaman milik server; formulir hanya menampilkan. */
  const punyaPdf = Boolean(tersimpan ?? awal?.urlPdf)

  function pilihBerkas(file: File | undefined | null) {
    if (!file) return
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Format berkas tidak didukung", {
        description: "Unggah berkas berformat PDF.",
      })
      return
    }
    if (file.size > MAKS_PDF_MB * 1024 * 1024) {
      toast.error("Berkas terlalu besar", {
        description: `Maksimal ${MAKS_PDF_MB} MB, ukuran berkas ini ${formatUkuranBerkas(file.size)}.`,
      })
      return
    }
    setBerkas(file)
    setTersimpan(null)
    setProgres(null)
  }

  /**
   * XHR dipakai karena `fetch` tidak memberi progres unggahan, padahal bilangan
   * halaman dan berkas besar butuh indikator berjalan.
   */
  function unggahSekarang() {
    if (!berkas) {
      toast.error("Pilih berkas PDF terlebih dahulu.")
      return
    }

    const muatan = new FormData()
    muatan.append("berkas", berkas)
    muatan.append("slug", judulLatin.trim() || berkas.name.replace(/\.pdf$/i, ""))
    // Id kitab yang sedang disunting, supaya bukti unggah terikat padanya.
    muatan.append("idKitab", awal?.id ?? "")

    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/admin/upload-pdf")

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) setProgres(Math.round((event.loaded / event.total) * 100))
    })

    xhr.addEventListener("load", () => {
      let data: ResponsUnggah | null = null
      try {
        data = JSON.parse(xhr.responseText) as ResponsUnggah
      } catch {
        data = null
      }

      if (xhr.status < 300 && data?.ok && data.tanda && data.path && data.halaman) {
        setTersimpan({
          path: data.path,
          tanda: data.tanda,
          byte: data.byte ?? berkas.size,
          halaman: data.halaman,
        })
        setProgres(100)
        setValue("jumlahHalaman", data.halaman, { shouldDirty: true, shouldValidate: true })
        toast.success("Berkas tersimpan di Bunny Storage", {
          description: `Parser membaca ${data.halaman} halaman; kolom jumlah halaman terisi otomatis.`,
        })
        return
      }

      setProgres(null)
      toast.error(data?.pesan ?? `Unggahan gagal (${xhr.status}).`)
    })

    xhr.addEventListener("error", () => {
      setProgres(null)
      toast.error("Koneksi unggahan terputus", {
        description: "Periksa jaringan Anda, lalu unggah berkas ulang.",
      })
    })

    setProgres(0)
    xhr.send(muatan)
  }

  function buangBerkas() {
    setBerkas(null)
    setTersimpan(null)
    setProgres(null)
    if (berkasInput.current) berkasInput.current.value = ""
  }

  async function onSubmit(data: KitabInput) {
    const hasil = await simpanKitab(awal?.id ?? null, data, { tanda: tersimpan?.tanda })
    if (!hasil.ok) {
      toast.error(hasil.pesan)
      return
    }

    toast.success(hasil.pesan, {
      description:
        data.status === "published"
          ? "Kitab tayang dan sudah muncul di katalog publik."
          : "Belum tayang, hanya terlihat di panel pengelola.",
    })
    router.push("/admin/kitab")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="surface-card space-y-5 p-5 sm:p-6">
        <div>
          <h2 className="font-heading text-lg font-semibold">Metadata kitab</h2>
          <p className="text-sm text-muted-foreground">
            Kolom bertanda bintang wajib diisi. Slug dibuat otomatis dari judul
            Latin dan hanya boleh diubah lewat migrasi terkendali.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="judulLatin">Judul Latin *</Label>
            <Input id="judulLatin" className="h-10" {...register("judulLatin")} />
            <p className="text-xs text-muted-foreground">
              URL reader: <span className="font-mono text-teal-300">/baca/{slugPratinjau}</span>
            </p>
            {errors.judulLatin && (
              <p className="text-xs text-red-400">{errors.judulLatin.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="judulArab">Judul Arab *</Label>
            <Input
              id="judulArab"
              className="text-arabic h-10 text-base"
              {...register("judulArab")}
            />
            {errors.judulArab && (
              <p className="text-xs text-red-400">{errors.judulArab.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kategoriId">Kategori / fan *</Label>
            <Controller
              control={control}
              name="kategoriId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="kategoriId" className="w-full">
                    <SelectValue placeholder="Pilih fan ilmu" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategori.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.kategoriId && (
              <p className="text-xs text-red-400">{errors.kategoriId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pengarangId">Pengarang *</Label>
            <Controller
              control={control}
              name="pengarangId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="pengarangId" className="w-full">
                    <SelectValue placeholder="Pilih pengarang" />
                  </SelectTrigger>
                  <SelectContent>
                    {pengarang.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.pengarangId && (
              <p className="text-xs text-red-400">{errors.pengarangId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="syarahId">Syarah / hasyiyah</Label>
            <Controller
              control={control}
              name="syarahId"
              render={({ field }) => (
                <Select
                  value={field.value || TIDAK_ADA}
                  onValueChange={(nilai) =>
                    field.onChange(nilai === TIDAK_ADA ? "" : nilai)
                  }
                >
                  <SelectTrigger id="syarahId" className="w-full">
                    <SelectValue placeholder="Tanpa syarah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TIDAK_ADA}>Tanpa syarah</SelectItem>
                    {syarah.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tahunTerbit">Tahun terbit *</Label>
              <Input id="tahunTerbit" className="h-10" {...register("tahunTerbit")} />
              {errors.tahunTerbit && (
                <p className="text-xs text-red-400">{errors.tahunTerbit.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jumlahHalaman">Jumlah halaman *</Label>
              <Input
                id="jumlahHalaman"
                className="h-10 tabular-nums"
                inputMode="numeric"
                readOnly={punyaPdf}
                aria-readonly={punyaPdf}
                {...register("jumlahHalaman", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                {punyaPdf
                  ? "Dihitung server dari berkas PDF, tidak dapat diubah manual."
                  : "Diisi otomatis begitu berkas PDF diunggah."}
              </p>
              {errors.jumlahHalaman && (
                <p className="text-xs text-red-400">{errors.jumlahHalaman.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deskripsi">Deskripsi singkat *</Label>
          <Textarea
            id="deskripsi"
            rows={5}
            className="min-h-32"
            placeholder="Ringkas isi kitab, metode pembahasan, dan cocok untuk santri tingkat berapa."
            {...register("deskripsi")}
          />
          <p className="text-xs text-muted-foreground">
            40 s.d. 2.000 karakter. Teks ini tampil pada kartu katalog dan halaman detail.
          </p>
          {errors.deskripsi && (
            <p className="text-xs text-red-400">{errors.deskripsi.message}</p>
          )}
        </div>
      </section>

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
            pilihBerkas(e.dataTransfer.files?.[0])
          }}
          className={cn(
            "rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center transition-colors",
            "hover:border-gold/40 hover:bg-gold/[0.04]",
          )}
        >
          <input
            ref={berkasInput}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => pilihBerkas(e.target.files?.[0])}
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
            onClick={() => berkasInput.current?.click()}
          >
            Pilih berkas
          </Button>
        </div>

        {berkas && (
          <div className="surface-inset space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="size-4 shrink-0 text-teal-300" strokeWidth={1.75} />
                <p className="truncate text-sm font-medium">{berkas.name}</p>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {formatUkuranBerkas(berkas.size)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {progres === null && (
                  <Button type="button" size="sm" onClick={unggahSekarang}>
                    Unggah sekarang
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive gap-1.5"
                  onClick={buangBerkas}
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
              <Alert className="border-emerald-500/25 bg-emerald-500/10">
                <CircleCheck className="size-4" strokeWidth={1.75} />
                <AlertTitle className="text-emerald-200">Unggahan selesai</AlertTitle>
                <AlertDescription className="text-emerald-100/80">
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

      <section className="surface-card space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="font-heading text-lg font-semibold">Status publikasi</h2>
          <p className="text-sm text-muted-foreground">
            Hanya status “Tayang” yang muncul di katalog, pencarian, dan halaman
            detail publik.
          </p>
        </div>

        <div className="grid gap-2">
          {STATUS_OPSI.map((item) => (
            <label
              key={item.nilai}
              className={cn(
                "surface-inset flex cursor-pointer items-start gap-3 p-3 transition-colors",
                status === item.nilai && "border-gold/40 bg-gold/[0.07]",
              )}
            >
              <input
                type="radio"
                value={item.nilai}
                {...register("status")}
                className="mt-1 size-4 accent-[hsl(43_74%_56%)]"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{item.judul}</span>
                <span className="block text-xs text-muted-foreground">
                  {item.keterangan}
                </span>
              </span>
            </label>
          ))}
        </div>

        {status === "published" && (
          <p className="inline-flex items-center gap-2 text-xs text-teal-300">
            <Sparkles className="size-3.5" strokeWidth={1.75} />
            Kitab akan langsung dapat dibaca publik melalui tautan reader.
          </p>
        )}
        {errors.status && (
          <p className="text-xs text-red-400">{errors.status.message}</p>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />
          ) : (
            <Save className="size-4" strokeWidth={1.75} />
          )}
          {isSubmitting
            ? "Menyimpan…"
            : mode === "baru"
              ? "Simpan kitab"
              : "Simpan perubahan"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/kitab">Batal, kembali ke daftar</Link>
        </Button>
        {awal && (
          <span className="text-xs text-muted-foreground">
            Terakhir diperbarui {waktuRelatif(awal.updatedAt)} · {awal.jumlahDibuka}{" "}
            sesi baca
          </span>
        )}
      </div>
    </form>
  )
}
