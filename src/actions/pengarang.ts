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
import { skemaId, skemaPengarang } from "@/lib/validasi"
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
    const idPengarang = id ? skemaId.parse(id) : null
    const data = skemaPengarang.parse({
      namaArab: nilai.namaArab ?? "",
      namaLatin: nilai.namaLatin ?? "",
      tahunWafat: nilai.tahunWafat ?? "",
      biografiSingkat: nilai.biografiSingkat ?? "",
    })

    const bentrok = await pengarangTerpakai({
      namaLatin: data.namaLatin,
      kecualiId: idPengarang ?? undefined,
    })
    if (bentrok) {
      return {
        ok: false,
        pesan: `Nama Latin “${data.namaLatin}” sudah terdaftar sebagai pengarang lain.`,
        bidang: { namaLatin: "Nama Latin ini sudah dipakai." },
      }
    }

    const tersimpan = idPengarang ? await ubahPengarang(idPengarang, data) : await buatPengarang(data)

    await tulisLog({
      adminId: pengelola.id,
      aksi: idPengarang ? "pengarang_diperbarui" : "pengarang_dibuat",
      targetTabel: "pengarang",
      targetId: tersimpan.id,
      detail: tersimpan.namaLatin,
    })
    segarkan()

    return sukses(
      tersimpan.id,
      idPengarang ? "Data pengarang diperbarui." : `Pengarang “${tersimpan.namaLatin}” ditambahkan.`
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
    const idPengarang = skemaId.parse(id)
    const sebagaiPenulis = await hitungKitabTerhubung({ pengarangId: idPengarang })
    const sebagaiSyarah = await hitungKitabTerhubung({ syarahId: idPengarang })
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

    await hapusBarisPengarang(idPengarang)
    await tulisLog({
      adminId: pengelola.id,
      aksi: "pengarang_dihapus",
      targetTabel: "pengarang",
      targetId: idPengarang,
    })
    segarkan()

    return sukses(idPengarang, "Pengarang dihapus dari daftar kelola.")
  } catch (error) {
    return gagal(error)
  }
}
