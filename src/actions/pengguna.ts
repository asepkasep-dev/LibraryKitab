"use server"

import { revalidatePath } from "next/cache"
import { ubahRolePengguna, ubahStatusPengguna, tulisLog } from "@/db/mutations"
import { penggunaById } from "@/db/queries"
import { butuhAdminAksi } from "@/lib/auth"
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
    janganUbahDiriSendiri(pengelola.id, id)

    const target = await penggunaById(id)
    if (!target) return { ok: false, pesan: "Pengguna tidak ditemukan di database." }

    await ubahStatusPengguna(id, status)
    await tulisLog({
      adminId: pengelola.id,
      aksi: status === "aktif" ? "pengguna_diaktifkan" : "pengguna_dinonaktifkan",
      targetTabel: "users",
      targetId: id,
      detail: `${target.email}: ${target.status} → ${status}`,
    })
    revalidatePath("/admin/pengguna")

    return sukses(id, `Akun ${target.email} ${LABEL_STATUS[status]}.`)
  } catch (error) {
    return gagal(error)
  }
}

export async function ubahPeranAnggota(id: string, role: Role): Promise<HasilAksi> {
  try {
    const pengelola = await butuhAdminAksi()
    janganUbahDiriSendiri(pengelola.id, id)

    const target = await penggunaById(id)
    if (!target) return { ok: false, pesan: "Pengguna tidak ditemukan di database." }

    await ubahRolePengguna(id, role)
    await tulisLog({
      adminId: pengelola.id,
      aksi: "pengguna_peran_diubah",
      targetTabel: "users",
      targetId: id,
      detail: `${target.email}: ${target.role} → ${role}`,
    })
    revalidatePath("/admin/pengguna")

    return sukses(id, `${target.email} kini berperan sebagai ${LABEL_PERAN[role]}.`)
  } catch (error) {
    return gagal(error)
  }
}
