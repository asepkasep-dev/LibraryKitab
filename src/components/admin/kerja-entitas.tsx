"use client"

import { useMemo, useState, useTransition } from "react"
import { Plus, Search, X } from "lucide-react"
import type { ZodType } from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DialogHapusEntitas } from "@/components/admin/dialog-hapus-entitas"
import { FormulirEntitas } from "@/components/admin/formulir-entitas"
import { TabelEntitas } from "@/components/admin/tabel-entitas"
import { saringEntitas, type EntitasBaris, type EntitasNilai, type BidangEntitas, type KolomEntitas } from "@/lib/admin-entitas"
import { toast } from "sonner"
import type { HasilAksi } from "@/actions/tipe"

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

  const hasil = useMemo(() => saringEntitas(barisAwal, kata), [barisAwal, kata])

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

      <TabelEntitas
        namaEntitas={namaEntitas}
        kolom={kolom}
        hasil={hasil}
        adaData={barisAwal.length > 0}
        sedangDikerjakan={isPending}
        onUbah={bukaForm}
        onAjukanHapus={setKonfirmasiHapus}
      />

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

      <DialogHapusEntitas
        namaEntitas={namaEntitas}
        target={konfirmasiHapus}
        sedangDikerjakan={isPending}
        onBatal={() => setKonfirmasiHapus(null)}
        onKonfirmasi={hapus}
      />
    </div>
  )
}
