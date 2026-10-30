"use server"

import { revalidatePath } from "next/cache"
import {
  buatKitab,
  hapusKitab as hapusBarisKitab,
  slugKitabTerpakai,
  tempelkanBerkasPdf,
  ubahKitab,
  ubahStatusKitab,
  tulisLog,
} from "@/db/mutations"
import { adaKategori, adaPengarang, kitabById } from "@/db/queries"
import { butuhAdminAksi } from "@/lib/auth"
import { slugify } from "@/lib/format"
import { skemaId, skemaKitab, skemaStatusKitab, type KitabInput } from "@/lib/validasi"
import { gagal, sukses, type HasilAksi } from "./tipe"

export type BerkasKitab = { urlPdf?: string; ukuranPdfByte?: number }

const PATH_PUBLIK = ["/", "/katalog"]

function segarkan(slug?: string) {
  for (const path of PATH_PUBLIK) revalidatePath(path)
  revalidatePath("/admin/kitab")
  if (slug) {
    revalidatePath(`/kitab/${slug}`)
    revalidatePath(`/baca/${slug}`)
  }
}

/** Slug unik: judul dilucukan lalu diberi penomoran bila sudah dipakai. */
async function siapkanSlug(judul: string, kecualiId?: string) {
  const dasar = slugify(judul) || "kitab"
  let kandidat = dasar
  for (let nomor = 2; nomor <= 50; nomor++) {
    const terpakai = await slugKitabTerpakai(kandidat, kecualiId)
    if (!terpakai) return kandidat
    kandidat = `${dasar}-${nomor}`
  }
  throw new Error("Slug tidak dapat dibuat otomatis. Ubah judul Latin kitab.")
}

/** Kategori dan pengarang wajib ada; FK menolak nilai asing dengan pesan kasar. */
async function pastikanRelasi(kategoriId: string, pengarangId: string, syarahId: string) {
  if (!(await adaKategori(kategoriId))) throw new Error("Pilih fan yang masih terdaftar.")
  if (!(await adaPengarang(pengarangId))) throw new Error("Pilih pengarang yang masih terdaftar.")
  if (syarahId && !(await adaPengarang(syarahId))) {
    throw new Error("Penyusun syarah tidak ditemukan. Pilih dari daftar pengarang.")
  }
}

export async function simpanKitab(
  id: string | null,
  data: KitabInput,
  berkas: BerkasKitab = {}
): Promise<HasilAksi> {
  try {
    const pengelola = await butuhAdminAksi()
    const input = skemaKitab.parse(data)
    const idKitab = id ? skemaId.parse(id) : null
    await pastikanRelasi(input.kategoriId, input.pengarangId, input.syarahId)

    const lama = idKitab ? await kitabById(idKitab) : null
    const urlPdf = berkas.urlPdf ?? lama?.urlPdf ?? ""

    if (input.status === "published" && !urlPdf) {
      return {
        ok: false,
        pesan: "Kitab belum dapat tayang karena berkas PDF-nya belum diunggah.",
      }
    }

    const slug = await siapkanSlug(input.judulLatin, idKitab ?? undefined)
    const tersimpanId = idKitab
      ? await ubahKitab(idKitab, { ...input, slug })
      : await buatKitab({ ...input, slug, urlPdf })

    if (berkas.urlPdf) {
      await tempelkanBerkasPdf(tersimpanId, {
        urlPdf: berkas.urlPdf,
        ukuranPdfByte: berkas.ukuranPdfByte ?? 0,
        jumlahHalaman: input.jumlahHalaman,
      })
    }

    await tulisLog({
      adminId: pengelola.id,
      aksi: idKitab ? "kitab_diperbarui" : "kitab_dibuat",
      targetTabel: "kitab",
      targetId: tersimpanId,
      detail: `${input.judulLatin} (${slug}) — ${input.status}`,
    })
    segarkan(slug)

    return sukses(
      tersimpanId,
      idKitab ? "Perubahan kitab tersimpan." : `Kitab “${input.judulLatin}” tersimpan sebagai draf.`
    )
  } catch (error) {
    return gagal(error)
  }
}

/** Alih status cepat dari daftar kitab kelola. */
export async function gantiStatusKitab(id: string, status: KitabInput["status"]): Promise<HasilAksi> {
  try {
    const pengelola = await butuhAdminAksi()
    const idKitab = skemaId.parse(id)
    const statusKitab = skemaStatusKitab.parse(status)
    const target = await kitabById(idKitab)
    if (!target) return { ok: false, pesan: "Kitab tidak ditemukan di database." }

    if (statusKitab === "published" && !target.urlPdf) {
      return { ok: false, pesan: "Kitab tanpa berkas PDF tidak dapat ditayangkan." }
    }

    await ubahStatusKitab(idKitab, statusKitab)
    await tulisLog({
      adminId: pengelola.id,
      aksi: "kitab_status_diubah",
      targetTabel: "kitab",
      targetId: idKitab,
      detail: `${target.status} → ${statusKitab}`,
    })
    segarkan(target.slug)

    const label =
      statusKitab === "published"
        ? "tayang di katalog"
        : statusKitab === "draft"
          ? "kembali menjadi draf"
          : "diarsipkan"
    return sukses(idKitab, `Kitab ${target.judulLatin} ${label}.`)
  } catch (error) {
    return gagal(error)
  }
}

export async function hapusKitab(id: string): Promise<HasilAksi> {
  try {
    const pengelola = await butuhAdminAksi()
    const idKitab = skemaId.parse(id)
    const target = await kitabById(idKitab)
    if (!target) return { ok: false, pesan: "Kitab tidak ditemukan di database." }

    await hapusBarisKitab(idKitab)
    await tulisLog({
      adminId: pengelola.id,
      aksi: "kitab_dihapus",
      targetTabel: "kitab",
      targetId: idKitab,
      detail: `${target.judulLatin} (${target.slug})`,
    })
    segarkan(target.slug)

    return sukses(idKitab, `Kitab “${target.judulLatin}” dihapus beserta bookmark dan catatannya.`)
  } catch (error) {
    return gagal(error)
  }
}
