"use server"

import { revalidatePath } from "next/cache"
import {
  buatKategori,
  hapusKategori as hapusBarisKategori,
  kategoriTerpakai,
  ubahKategori,
} from "@/db/mutations"
import { hitungKitabTerhubung } from "@/db/queries"
import { butuhAdminAksi } from "@/lib/auth"
import { slugify } from "@/lib/format"
import { skemaId, skemaKategori } from "@/lib/validasi"
import { gagal, sukses, type HasilAksi } from "./tipe"

type NilaiEntitas = Record<string, string>

const PATH_TERDAMPAK = ["/admin/kategori", "/admin/kitab", "/katalog", "/"]

function segarkan() {
  for (const path of PATH_TERDAMPAK) revalidatePath(path)
}

export async function simpanKategori(
  id: string | null,
  nilai: NilaiEntitas
): Promise<HasilAksi> {
  try {
    const pengelola = await butuhAdminAksi()
    const idKategori = id ? skemaId.parse(id) : null
    const data = skemaKategori.parse({
      nama: nilai.nama ?? "",
      slug: nilai.slug?.trim() ? slugify(nilai.slug) : slugify(nilai.nama ?? ""),
      deskripsi: nilai.deskripsi ?? "",
    })

    const bentrok = await kategoriTerpakai({
      nama: data.nama,
      slug: data.slug,
      kecualiId: idKategori ?? undefined,
    })
    if (bentrok) {
      return {
        ok: false,
        pesan:
          bentrok.slug === data.slug
            ? `Slug “${data.slug}” sudah dipakai fan lain.`
            : `Fan “${data.nama}” sudah terdaftar.`,
        bidang: bentrok.slug === data.slug ? { slug: "Slug ini sudah dipakai." } : {},
      }
    }

    const jejak = {
      adminId: pengelola.id,
      aksi: idKategori ? "kategori_diperbarui" : "kategori_dibuat",
      targetTabel: "kategori",
      detail: `${data.nama} (${data.slug})`,
    }
    const idTersimpan = idKategori
      ? await ubahKategori(idKategori, data, jejak)
      : await buatKategori(data, jejak)
    segarkan()

    return sukses(idTersimpan, idKategori ? "Fan diperbarui." : `Fan “${data.nama}” ditambahkan.`)
  } catch (error) {
    return gagal(error)
  }
}

export async function hapusKategori(id: string): Promise<HasilAksi> {
  try {
    const pengelola = await butuhAdminAksi()
    const idKategori = skemaId.parse(id)
    const terkait = await hitungKitabTerhubung({ kategoriId: idKategori })
    if (terkait > 0) {
      return {
        ok: false,
        pesan: `Fan ini masih dipakai ${terkait} kitab. Pindahkan kitabnya terlebih dahulu.`,
      }
    }

    await hapusBarisKategori(idKategori, {
      adminId: pengelola.id,
      aksi: "kategori_dihapus",
      targetTabel: "kategori",
    })
    segarkan()

    return sukses(idKategori, "Fan dihapus dari daftar kelola.")
  } catch (error) {
    return gagal(error)
  }
}
