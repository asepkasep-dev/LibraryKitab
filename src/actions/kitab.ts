"use server"

import { revalidatePath } from "next/cache"
import {
  hapusKitab as hapusBarisKitab,
  slugKitabTerpakai,
  tulisKitab,
  ubahStatusKitab,
  urlPdfDipakaiKitabLain,
} from "@/db/mutations"
import { adaKategori, adaPengarang, kitabById } from "@/db/queries"
import { butuhAdminAksi } from "@/lib/auth"
import { hapusBerkas, pathDariUrl, urlPublik } from "@/lib/bunny"
import { slugify } from "@/lib/format"
import { bacaTandaBerkas, type MetaBerkasPdf } from "@/lib/tanda-berkas"
import { skemaId, skemaKitab, skemaStatusKitab, type KitabInput } from "@/lib/validasi"
import { gagal, sukses, type HasilAksi } from "./tipe"

/**
 * Berkas yang sudah naik ke Bunny. Klien mengirim bukti bertanda tangan dari
 * route unggah, bukan URL maupun bilangan halaman, supaya nilai itu tetap milik server.
 */
export type BerkasKitab = { tanda?: string }

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

/**
 * Pembersihan berkas tidak boleh membatalkan aksi yang sudah tersimpan, jadi
 * kegagalannya hanya dicatat di server. Berkas hasil unggahan yang gagal
 * tersimpan sengaja tidak dihapus: pada driver HTTP kita tidak bisa memastikan
 * penulisannya benar-benar batal, dan pengelola masih butuh berkas itu saat coba lagi.
 */
async function buangBerkasLama(urlLama: string, kecualiId: string, pathBaru: string) {
  const pathLama = pathDariUrl(urlLama)
  if (!pathLama || pathLama === pathBaru) return
  if (await urlPdfDipakaiKitabLain(urlLama, kecualiId)) return
  try {
    if (!(await hapusBerkas(pathLama))) console.error("[kitab] berkas lama gagal dihapus:", pathLama)
  } catch (error) {
    console.error("[kitab] pembersihan berkas lama gagal:", pathLama, error)
  }
}

export async function simpanKitab(
  id: string | null,
  data: KitabInput,
  berkas: BerkasKitab = {}
): Promise<HasilAksi> {
  let metaBaru: MetaBerkasPdf | null = null
  try {
    const pengelola = await butuhAdminAksi()
    const input = skemaKitab.parse(data)
    const idKitab = id ? skemaId.parse(id) : null
    await pastikanRelasi(input.kategoriId, input.pengarangId, input.syarahId)

    const lama = idKitab ? await kitabById(idKitab) : null
    if (berkas.tanda) metaBaru = bacaTandaBerkas(berkas.tanda, idKitab)
    if (berkas.tanda && !metaBaru) {
      return {
        ok: false,
        pesan:
          "Bukti unggahan tidak dikenali, tidak cocok dengan kitab ini, atau lewat masa berlaku. Unggah ulang berkas PDF-nya.",
      }
    }

    const urlPdf = metaBaru ? urlPublik(metaBaru.path) : (lama?.urlPdf ?? "")
    const ukuranPdfByte = metaBaru ? metaBaru.byte : (lama?.ukuranPdfByte ?? 0)
    // Bilangan halaman datang dari parser PDF di server; angka form hanya dipakai untuk draf tanpa berkas.
    const jumlahHalaman = metaBaru
      ? metaBaru.halaman
      : urlPdf
        ? (lama?.jumlahHalaman ?? 0)
        : input.jumlahHalaman

    if (input.status === "published" && !urlPdf) {
      return {
        ok: false,
        pesan: "Kitab belum dapat tayang karena berkas PDF-nya belum diunggah.",
      }
    }
    if (input.status === "published" && jumlahHalaman < 1) {
      return {
        ok: false,
        pesan: "Jumlah halaman belum terbaca dari PDF, jadi kitab ini belum dapat ditayangkan.",
      }
    }

    const slug = await siapkanSlug(input.judulLatin, idKitab ?? undefined)
    const tersimpanId = await tulisKitab({
      id: idKitab,
      input: { ...input, jumlahHalaman, slug, urlPdf, ukuranPdfByte },
      log: {
        adminId: pengelola.id,
        aksi: idKitab ? "kitab_diperbarui" : "kitab_dibuat",
        targetTabel: "kitab",
        detail: `${input.judulLatin} (${slug}) status ${input.status}`,
      },
    })

    if (metaBaru && lama?.urlPdf) {
      await buangBerkasLama(lama.urlPdf, tersimpanId, metaBaru.path)
    }
    segarkan(slug)

    return sukses(
      tersimpanId,
      idKitab
        ? "Perubahan kitab tersimpan."
        : input.status === "published"
          ? `Kitab “${input.judulLatin}” tersimpan dan langsung tayang.`
          : `Kitab “${input.judulLatin}” tersimpan sebagai draf.`,
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
    if (statusKitab === "published" && target.jumlahHalaman < 1) {
      return {
        ok: false,
        pesan: "Jumlah halaman kitab ini belum terbaca dari PDF, jadi belum dapat ditayangkan.",
      }
    }

    await ubahStatusKitab(idKitab, statusKitab, {
      adminId: pengelola.id,
      aksi: "kitab_status_diubah",
      targetTabel: "kitab",
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

    await hapusBarisKitab(idKitab, {
      adminId: pengelola.id,
      aksi: "kitab_dihapus",
      targetTabel: "kitab",
      detail: `${target.judulLatin} (${target.slug})`,
    })
    segarkan(target.slug)

    return sukses(idKitab, `Kitab “${target.judulLatin}” dihapus beserta bookmark dan catatannya.`)
  } catch (error) {
    return gagal(error)
  }
}
