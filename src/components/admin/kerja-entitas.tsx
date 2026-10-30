"use client"

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ZodType } from "zod"
import { Layers, LoaderCircle, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/site/primitives"
import { toast } from "sonner"
import { slugify } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { HasilAksi } from "@/actions/tipe"

export type EntitasNilai = Record<string, string>

export type EntitasBaris = {
  id: string
  nilai: EntitasNilai
  /** Jumlah kitab yang masih memakai entitas ini; dipakai untuk proteksi hapus. */
  terkait?: number
}

export type BidangEntitas = {
  kunci: string
  label: string
  jenis: "teks" | "arab" | "textarea" | "slug"
  petunjuk?: string
  /** Kunci bidang sumber otomatis untuk bidang slug. */
  slugDari?: string
  baris?: number
}

export type KolomEntitas = {
  label: string
  sel: (baris: EntitasBaris) => ReactNode
  className?: string
}

export function KerjaEntitas({
  namaEntitas,
  deskripsi,
  kolom,
  bidang,
  skema,
  barisAwal,
  contohNilai,
  onSimpan,
  onHapus,
}: {
  namaEntitas: string
  deskripsi: string
  kolom: KolomEntitas[]
  bidang: BidangEntitas[]
  skema: ZodType<EntitasNilai, EntitasNilai>
  barisAwal: EntitasBaris[]
  contohNilai?: EntitasNilai
  onSimpan: (id: string | null, nilai: EntitasNilai) => Promise<HasilAksi>
  onHapus: (id: string) => Promise<HasilAksi>
}) {
  const [kata, setKata] = useState("")
  const [formTerbuka, setFormTerbuka] = useState(false)
  const [sedangUbah, setSedangUbah] = useState<EntitasBaris | null>(null)
  const [konfirmasiHapus, setKonfirmasiHapus] = useState<EntitasBaris | null>(null)
  const [errorBidang, setErrorBidang] = useState<EntitasNilai>({})
  const [isPending, jalankan] = useTransition()

  const hasil = useMemo(() => {
    const q = kata.trim().toLowerCase()
    if (!q) return barisAwal
    return barisAwal.filter((row) =>
      Object.values(row.nilai).some((nilai) => nilai.toLowerCase().includes(q)),
    )
  }, [barisAwal, kata])

  function bukaForm(barisTarget: EntitasBaris | null) {
    setSedangUbah(barisTarget)
    setErrorBidang({})
    setFormTerbuka(true)
  }

  function tutupForm() {
    setFormTerbuka(false)
    setSedangUbah(null)
    setErrorBidang({})
  }

  /**
   * Tidak ada salinan lokal: aksi memanggil `revalidatePath` di server sehingga
   * `barisAwal` datang kembali sudah berisi perubahan.
   */
  function simpan(nilai: EntitasNilai) {
    const id = sedangUbah?.id ?? null
    setErrorBidang({})
    jalankan(async () => {
      const respons = await onSimpan(id, nilai)
      if (!respons.ok) {
        setErrorBidang(respons.bidang ?? {})
        toast.error(respons.pesan)
        return
      }
      tutupForm()
      toast.success(respons.pesan)
    })
  }

  function hapus(barisTarget: EntitasBaris) {
    setKonfirmasiHapus(null)
    jalankan(async () => {
      const respons = await onHapus(barisTarget.id)
      if (!respons.ok) {
        toast.error(respons.pesan)
        return
      }
      toast.success(respons.pesan)
    })
  }

  return (
    <div className="space-y-5">
      <div className="surface-card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={kata}
              onChange={(e) => setKata(e.target.value)}
              aria-label={`Cari ${namaEntitas}`}
              placeholder={`Cari ${namaEntitas.toLowerCase()}…`}
              className="h-10 ps-9"
            />
          </div>
          {kata && (
            <Button variant="ghost" size="sm" onClick={() => setKata("")}>
              <X className="size-4" strokeWidth={1.75} />
              Bersihkan
            </Button>
          )}
        </div>
        <Button onClick={() => bukaForm(null)} disabled={isPending} className="gap-2">
          <Plus className="size-4" strokeWidth={1.75} />
          Tambah {namaEntitas.toLowerCase()}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Total {barisAwal.length} {namaEntitas.toLowerCase()}
        {kata && ` · menampilkan ${hasil.length} hasil sesuai pencarian`}.
      </p>

      <div className="surface-card overflow-hidden">
        {hasil.length === 0 ? (
          <EmptyState
            ikon={<Layers className="size-6" strokeWidth={1.75} />}
            judul={barisAwal.length === 0 ? "Belum ada data" : "Belum ada data yang cocok"}
            pesan={
              barisAwal.length === 0
                ? `Tambahkan ${namaEntitas.toLowerCase()} pertama lewat tombol di atas agar kitab dapat memakai data ini.`
                : `Ubah kata kunci pencarian, atau tambahkan ${namaEntitas.toLowerCase()} baru lewat tombol di atas.`
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  {kolom.map((item) => (
                    <TableHead key={item.label} className={item.className}>
                      {item.label}
                    </TableHead>
                  ))}
                  <TableHead className="px-5 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasil.map((row) => {
                  const terpakai = (row.terkait ?? 0) > 0
                  return (
                    <TableRow key={row.id} className="border-white/5">
                      {kolom.map((item) => (
                        <TableCell key={item.label} className={item.className}>
                          {item.sel(row)}
                        </TableCell>
                      ))}
                      <TableCell className="px-5 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Ubah ${namaEntitas}`}
                            disabled={isPending}
                            onClick={() => bukaForm(row)}
                          >
                            <Pencil className="size-4" strokeWidth={1.75} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className={cn(
                              "text-muted-foreground",
                              !terpakai && "hover:text-destructive",
                            )}
                            disabled={isPending}
                            aria-label={
                              terpakai
                                ? `${namaEntitas} masih dipakai kitab`
                                : `Hapus ${namaEntitas}`
                            }
                            onClick={() => setKonfirmasiHapus(row)}
                          >
                            <Trash2 className="size-4" strokeWidth={1.75} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={formTerbuka} onOpenChange={setFormTerbuka}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {sedangUbah ? `Ubah ${namaEntitas.toLowerCase()}` : `Tambah ${namaEntitas.toLowerCase()}`}
            </DialogTitle>
            <DialogDescription>{deskripsi}</DialogDescription>
          </DialogHeader>
          <FormulirEntitas
            bidang={bidang}
            skema={skema}
            nilai={sedangUbah?.nilai ?? contohNilai}
            errorBidang={errorBidang}
            sedangDikerjakan={isPending}
            onSimpan={simpan}
            onBatal={tutupForm}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={konfirmasiHapus !== null}
        onOpenChange={(buka) => !buka && setKonfirmasiHapus(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus {namaEntitas.toLowerCase()} ini?</DialogTitle>
            <DialogDescription>
              Barisnya dihapus dari database dan tindakannya dicatat pada
              log_admin. Kitab yang memakai entitas ini tidak ikut terhapus.
            </DialogDescription>
          </DialogHeader>

          {(konfirmasiHapus?.terkait ?? 0) > 0 && (
            <Alert>
              <Layers className="size-4" strokeWidth={1.75} />
              <AlertTitle>Masih dipakai {konfirmasiHapus?.terkait} kitab</AlertTitle>
              <AlertDescription>
                Pindahkan atau hapus dulu kitab yang memakai data ini, baru
                entitas dapat dihapus.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setKonfirmasiHapus(null)}>
              Batal
            </Button>
            <Button
              variant="solidDestructive"
              className="gap-2"
              disabled={(konfirmasiHapus?.terkait ?? 0) > 0 || isPending}
              onClick={() => konfirmasiHapus && hapus(konfirmasiHapus)}
            >
              {isPending ? (
                <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />
              ) : (
                <Trash2 className="size-4" strokeWidth={1.75} />
              )}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FormulirEntitas({
  bidang,
  skema,
  nilai,
  errorBidang,
  sedangDikerjakan,
  onSimpan,
  onBatal,
}: {
  bidang: BidangEntitas[]
  skema: ZodType<EntitasNilai, EntitasNilai>
  nilai?: EntitasNilai
  errorBidang: EntitasNilai
  sedangDikerjakan: boolean
  onSimpan: (nilai: EntitasNilai) => void
  onBatal: () => void
}) {
  const awal = useMemo(() => {
    const kosong: EntitasNilai = {}
    for (const item of bidang) kosong[item.kunci] = nilai?.[item.kunci] ?? ""
    return kosong
  }, [bidang, nilai])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<EntitasNilai>({
    resolver: zodResolver(skema),
    defaultValues: awal,
  })

  /** Tabrakan nama atau slug baru diketahui setelah server action berjalan. */
  useEffect(() => {
    for (const [kunci, pesan] of Object.entries(errorBidang)) {
      setError(kunci, { type: "server", message: pesan })
    }
  }, [errorBidang, setError])

  const kunciSlug = bidang.find((item) => item.jenis === "slug")
  const [slugDimanual, setSlugDimanual] = useState(
    Boolean(nilai && kunciSlug && nilai[kunciSlug.kunci]),
  )
  const nilaiSumber = watch(kunciSlug?.slugDari ?? "__tanpa_sumber")

  useEffect(() => {
    if (!kunciSlug?.slugDari || slugDimanual) return
    setValue(kunciSlug.kunci, slugify(String(nilaiSumber ?? "")), {
      shouldDirty: true,
    })
  }, [kunciSlug, nilaiSumber, slugDimanual, setValue])

  return (
    <form onSubmit={handleSubmit(onSimpan)} className="space-y-4">
      {bidang.map((item) => {
        const error = errors[item.kunci]?.message
        const id = `bidang-${item.kunci}`

        if (item.jenis === "textarea") {
          return (
            <div key={item.kunci} className="space-y-1.5">
              <Label htmlFor={id}>{item.label}</Label>
              <Textarea
                id={id}
                rows={item.baris ?? 4}
                className="min-h-24"
                {...register(item.kunci)}
              />
              {item.petunjuk && (
                <p className="text-xs text-muted-foreground">{item.petunjuk}</p>
              )}
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          )
        }

        if (item.jenis === "slug") {
          return (
            <div key={item.kunci} className="space-y-1.5">
              <Label htmlFor={id}>{item.label}</Label>
              <Controller
                control={control}
                name={item.kunci}
                render={({ field }) => (
                  <Input
                    id={id}
                    className="h-10 font-mono"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      setSlugDimanual(true)
                      field.onChange(e.target.value)
                    }}
                    placeholder="contoh: ushul-fiqih"
                  />
                )}
              />
              {item.petunjuk && (
                <p className="text-xs text-muted-foreground">{item.petunjuk}</p>
              )}
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          )
        }

        return (
          <div key={item.kunci} className="space-y-1.5">
            <Label htmlFor={id}>{item.label}</Label>
            <Input
              id={id}
              className={cn("h-10", item.jenis === "arab" && "text-arabic text-base")}
              placeholder={item.petunjuk}
              {...register(item.kunci)}
            />
            {item.petunjuk && item.jenis !== "teks" && (
              <p className="text-xs text-muted-foreground">{item.petunjuk}</p>
            )}
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        )
      })}

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onBatal}>
          Batal
        </Button>
        <Button type="submit" disabled={sedangDikerjakan} className="gap-2">
          {sedangDikerjakan && (
            <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />
          )}
          Simpan
        </Button>
      </DialogFooter>
    </form>
  )
}
