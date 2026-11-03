"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { ubahPeranAnggota, ubahStatusAnggota } from "@/actions/pengguna"
import { DaftarPengguna } from "@/components/admin/daftar-pengguna"
import { DialogKonfirmasiPengguna } from "@/components/admin/dialog-konfirmasi-pengguna"
import { SaringanPengguna } from "@/components/admin/saringan-pengguna"
import { SEMUA, hitungPengguna, saringPengguna, type BarisPengguna } from "@/lib/admin-pengguna"
import type { Role } from "@/db/queries"

export function KerjaPengguna({
  awal,
  pengelolaId,
}: {
  awal: BarisPengguna[]
  /** Akun yang sedang masuk tidak boleh diubah peran/statusnya sendiri. */
  pengelolaId: string
}) {
  const [kata, setKata] = useState("")
  const [peran, setPeran] = useState(SEMUA)
  const [akses, setAkses] = useState(SEMUA)
  const [konfirmasi, setKonfirmasi] = useState<BarisPengguna | null>(null)
  const [isPending, jalankan] = useTransition()

  const hasil = useMemo(
    () => saringPengguna(awal, { kata, peran, akses }),
    [awal, kata, peran, akses],
  )
  const jumlah = useMemo(() => hitungPengguna(awal), [awal])

  function ubahStatus(target: BarisPengguna) {
    const berikutnya = target.pengguna.status === "aktif" ? "nonaktif" : "aktif"
    setKonfirmasi(null)
    jalankan(async () => {
      const respons = await ubahStatusAnggota(target.pengguna.id, berikutnya)
      if (!respons.ok) {
        toast.error(respons.pesan)
        return
      }
      toast.success(respons.pesan, {
        description:
          berikutnya === "nonaktif"
            ? "Akun tidak dapat masuk atau membuka bookmark sampai diaktifkan lagi."
            : "Akun kembali memperoleh akses penuh sebagai member.",
      })
    })
  }

  function ubahPeran(target: BarisPengguna, role: string) {
    if (role === target.pengguna.role) return
    jalankan(async () => {
      const respons = await ubahPeranAnggota(target.pengguna.id, role as Role)
      if (!respons.ok) {
        toast.error(respons.pesan)
        return
      }
      toast.success(respons.pesan)
    })
  }

  return (
    <div className="space-y-5">
      <SaringanPengguna
        kata={kata}
        peran={peran}
        akses={akses}
        jumlah={jumlah}
        onKata={setKata}
        onPeran={setPeran}
        onAkses={setAkses}
      />
      <DaftarPengguna
        hasil={hasil}
        adaData={awal.length > 0}
        sedangDikerjakan={isPending}
        pengelolaId={pengelolaId}
        onUbahPeran={ubahPeran}
        onAjukanUbahStatus={setKonfirmasi}
      />
      <DialogKonfirmasiPengguna
        target={konfirmasi}
        sedangDikerjakan={isPending}
        onBatal={() => setKonfirmasi(null)}
        onKonfirmasi={ubahStatus}
      />
    </div>
  )
}
