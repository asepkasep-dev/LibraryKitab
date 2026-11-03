"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { gantiStatusKitab, hapusKitab } from "@/actions/kitab"
import { DaftarKitab } from "@/components/admin/daftar-kitab"
import { DialogHapusKitab } from "@/components/admin/dialog-hapus-kitab"
import { SaringanKitab } from "@/components/admin/saringan-kitab"
import {
  SEMUA,
  hitungStatusKitab,
  opsiFilterKategori,
  saringKitab,
} from "@/lib/admin-kitab"
import type { KitabVe, StatusKitab } from "@/db/queries"

export function TabelKitab({ awal }: { awal: KitabVe[] }) {
  const [kata, setKata] = useState("")
  const [kataDiterapkan, setKataDiterapkan] = useState("")
  const [status, setStatus] = useState<string>(SEMUA)
  const [kategori, setKategori] = useState<string>(SEMUA)
  const [konfirmasi, setKonfirmasi] = useState<KitabVe | null>(null)
  const [isPending, jalankan] = useTransition()

  useEffect(() => {
    const jeda = setTimeout(() => setKataDiterapkan(kata.trim().toLowerCase()), 300)
    return () => clearTimeout(jeda)
  }, [kata])

  const kategoriOpsi = useMemo(() => opsiFilterKategori(awal), [awal])
  const hasil = useMemo(
    () => saringKitab(awal, { kata: kataDiterapkan, status, kategori }),
    [awal, kataDiterapkan, status, kategori],
  )
  const jumlah = useMemo(() => hitungStatusKitab(awal), [awal])

  /** Daftar dibaca ulang lewat `revalidatePath` pada aksi, jadi tidak ada salinan lokal. */
  function hapus(target: KitabVe) {
    setKonfirmasi(null)
    jalankan(async () => {
      const respons = await hapusKitab(target.id)
      if (!respons.ok) {
        toast.error(respons.pesan)
        return
      }
      toast.success(respons.pesan)
    })
  }

  function gantiStatus(target: KitabVe, berikutnya: StatusKitab) {
    if (berikutnya === target.status) return
    jalankan(async () => {
      const respons = await gantiStatusKitab(target.id, berikutnya)
      if (!respons.ok) {
        toast.error(respons.pesan)
        return
      }
      toast.success(respons.pesan)
    })
  }

  return (
    <div className="space-y-5">
      <SaringanKitab
        kata={kata}
        status={status}
        kategori={kategori}
        kategoriOpsi={kategoriOpsi}
        jumlah={jumlah}
        adaSaringan={Boolean(kataDiterapkan) || status !== SEMUA || kategori !== SEMUA}
        onKata={setKata}
        onStatus={setStatus}
        onKategori={setKategori}
        onBersihkan={() => {
          setKata("")
          setStatus(SEMUA)
          setKategori(SEMUA)
        }}
      />
      <DaftarKitab
        hasil={hasil}
        sedangDikerjakan={isPending}
        onGantiStatus={gantiStatus}
        onAjukanHapus={setKonfirmasi}
      />
      <DialogHapusKitab
        target={konfirmasi}
        sedangDikerjakan={isPending}
        onBatal={() => setKonfirmasi(null)}
        onKonfirmasi={hapus}
      />
    </div>
  )
}
