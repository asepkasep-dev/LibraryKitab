"use server"

import { revalidatePath } from "next/cache"
import {
  buatPengarang,
  hapusPengarang as hapusBarisPengarang,
  pengarangTerpakai,
  ubahPengarang,
  tulisLog,
} from "@/db/mutations"
import { hitungKitabTerhubung } from "@/db/queries"
import { butuhAdminAksi } from "@/lib/auth"
import { skemaPengarang } from "@/lib/validasi"
import { gagal, sukses, type HasilAksi } from "./tipe"

type NilaiEntitas = Record<string, string>

const PATH_TERDAMPAK = ["/admin/pengarang", "/admin/syarah", "/admin/kitab", "/katalog", "/"]

function segarkan() {
  for (const path of PATH_TERDAMPAK) revalidatePath(path)
}

export async function simpanPengarang(
  id: string | null,
  nilai: NilaiEntitas
): Promise<HasilAksi> {
  try {
    const pengelola = await butuhAdminAksi()
    const data = skemaPengarang.parse({
      namaArab: nilai.namaArab ?? "",
      namaLatin: nilai.namaLatin ?? "",
      tahunWafat: nilai.tahunWafat ?? "",
      biografiSingkat: nilai.biografiSingkat ?? "",
    })

    const bentrok = await pengarangTerpakai({
      namaLatin: data.namaLatin,
      kecualiId: id ?? undefined,
    })
    if (bentrok) {
      return {
        ok: false,
        pesan: `Nama Latin “${data.namaLatin}” sudah terdaftar sebagai pengarang lain.`,
        bidang: { namaLatin: "Nama Latin ini sudah dipakai." },
      }
    }

    const tersimpan = id ? await ubahPengarang(id, data) : await buatPengarang(data)

    await tulisLog({
      adminId: pengelola.id,
      aksi: id ? "pengarang_diperbarui" : "pengarang_dibuat",
      targetTabel: "pengarang",
      targetId: tersimpan.id,
      detail: tersimpan.namaLatin,
    })
    segarkan()

    return sukses(
      tersimpan.id,
      id ? "Data pengarang diperbarui." : `Pengarang “${tersimpan.namaLatin}” ditambahkan.`
    )
  } catch (error) {
    return gagal(error)
  }
}

/**
 * Pengarang dipakai dua peran (penulis dan penyusun syarah). Keduanya harus
 * bersih sebelum baris boleh dihapus karena foreign key memakai ON DELETE RESTRICT.
 */
export async function hapusPengarang(id: string): Promise<HasilAksi> {
  try {
    const pengelola = await butuhAdminAksi()
    const sebagaiPenulis = await hitungKitabTerhubung({ pengarangId: id })
    const sebagaiSyarah = await hitungKitabTerhubung({ syarahId: id })
    if (sebagaiPenulis > 0 || sebagaiSyarah > 0) {
      const perian =
        sebagaiPenulis > 0 && sebagaiSyarah > 0
          ? "penulis maupun syarah"
          : sebagaiPenulis > 0
            ? "penulis"
            : "syarah"
      return {
        ok: false,
        pesan: `Pengarang ini masih berperan sebagai ${perian} pada ${
          sebagaiPenulis + sebagaiSyarah
        } kitab. Pindahkan kitabnya dulu.`,
      }
    }

    await hapusBarisPengarang(id)
    await tulisLog({
      adminId: pengelola.id,
      aksi: "pengarang_dihapus",
      targetTabel: "pengarang",
      targetId: id,
    })
    segarkan()

    return sukses(id, "Pengarang dihapus dari daftar kelola.")
  } catch (error) {
    return gagal(error)
  }
}
