"use server"

import { revalidatePath } from "next/cache"
import { perbaruiProfil } from "@/db/mutations"
import { butuhMemberAksi } from "@/lib/auth"
import { skemaProfil } from "@/lib/validasi"
import { gagal, sukses, type HasilAksi } from "./tipe"

import type { ProfilInput } from "@/lib/validasi"

/**
 * `modeReader` (gelap/sepia) sengaja tidak ikut disimpan: preferensi tampilan
 * itu per perangkat dan sudah tersimpan di localStorage reader.
 */
export async function perbaruiProfilAksi(data: ProfilInput): Promise<HasilAksi> {
  try {
    const anggota = await butuhMemberAksi()
    const input = skemaProfil.parse(data)

    const tersimpan = await perbaruiProfil(anggota.id, input)
    if (!tersimpan) return { ok: false, pesan: "Akun Anda tidak ditemukan. Masuk ulang, ya." }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/profil")
    return sukses(tersimpan.id, "Profil tersimpan. Saran kitab di dasbor mengikuti peran dan kelas Anda.")
  } catch (error) {
    return gagal(error)
  }
}
