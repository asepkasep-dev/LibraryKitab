"use server"

import { revalidatePath } from "next/cache"
import { ubahRolePengguna, ubahStatusPengguna, tulisLog } from "@/db/mutations"
import { penggunaById } from "@/db/queries"
import { butuhAdminAksi } from "@/lib/auth"
import { skemaId, skemaPeranAnggota, skemaStatusAnggota } from "@/lib/validasi"
import { gagal, sukses, type HasilAksi } from "./tipe"

import type { Role, StatusPengguna } from "@/db/queries"

const LABEL_STATUS: Record<StatusPengguna, string> = {
  aktif: "aktif kembali",
  nonaktif: "dinonaktifkan",
}

const LABEL_PERAN: Record<Role, string> = {
  member: "santri/ustadz",
  admin: "pengelola",
}

/** Menjaga agar pengelola tidak mengunci dirinya sendiri dari panel. */
function janganUbahDiriSendiri(pengelolaId: string, targetId: string) {
  if (pengelolaId === targetId) {
    throw new Error("Anda tidak dapat mengubah peran atau status akun sendiri.")
  }
}

export async function ubahStatusAnggota(id: string, status: StatusPengguna): Promise<HasilAksi> {
  try {
    const pengelola = await butuhAdminAksi()
    const idAnggota = skemaId.parse(id)
    const statusAnggota = skemaStatusAnggota.parse(status)
    janganUbahDiriSendiri(pengelola.id, idAnggota)

    const target = await penggunaById(idAnggota)
    if (!target) return { ok: false, pesan: "Pengguna tidak ditemukan di database." }

    await ubahStatusPengguna(idAnggota, statusAnggota)
    await tulisLog({
      adminId: pengelola.id,
      aksi: statusAnggota === "aktif" ? "pengguna_diaktifkan" : "pengguna_dinonaktifkan",
      targetTabel: "users",
      targetId: idAnggota,
      detail: `${target.email}: ${target.status} → ${statusAnggota}`,
    })
    revalidatePath("/admin/pengguna")

    return sukses(idAnggota, `Akun ${target.email} ${LABEL_STATUS[statusAnggota]}.`)
  } catch (error) {
    return gagal(error)
  }
}

export async function ubahPeranAnggota(id: string, role: Role): Promise<HasilAksi> {
  try {
    const pengelola = await butuhAdminAksi()
    const idAnggota = skemaId.parse(id)
    const peranAnggota = skemaPeranAnggota.parse(role)
    janganUbahDiriSendiri(pengelola.id, idAnggota)

    const target = await penggunaById(idAnggota)
    if (!target) return { ok: false, pesan: "Pengguna tidak ditemukan di database." }

    await ubahRolePengguna(idAnggota, peranAnggota)
    await tulisLog({
      adminId: pengelola.id,
      aksi: "pengguna_peran_diubah",
      targetTabel: "users",
      targetId: idAnggota,
      detail: `${target.email}: ${target.role} → ${peranAnggota}`,
    })
    revalidatePath("/admin/pengguna")

    return sukses(idAnggota, `${target.email} kini berperan sebagai ${LABEL_PERAN[peranAnggota]}.`)
  } catch (error) {
    return gagal(error)
  }
}
