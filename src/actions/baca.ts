"use server"

import { revalidatePath } from "next/cache"
import {
  catatSesiBaca,
  hapusBookmark,
  hapusBookmarkById,
  hapusCatatan,
  simpanBookmark,
  simpanCatatan,
  simpanProgresBaca,
  ubahCatatan,
} from "@/db/mutations"
import { kitabById } from "@/db/queries"
import { butuhMemberAksi } from "@/lib/auth"
import { hitungPersentase } from "@/lib/format"
import { MAKS_ISI_CATATAN, skemaIsiCatatan, skemaLabelBookmark } from "@/lib/baca"
import { gagal, sukses, type HasilAksi } from "./tipe"

type InputHalaman = { kitabId: string; halaman: number }

/**
 * Semua aksi ini memfilter barisnya lewat `userId` milik sesi, jadi anggota
 * tidak dapat menyentuh bookmark/catatan orang lain meski mengirim id asing.
 */
async function kitabDibuka(kitabId: string) {
  const target = await kitabById(kitabId)
  if (!target) throw new Error("Kitab tidak ditemukan di katalog kami.")
  return target
}

function halamanWajar(halaman: number, total: number) {
  const nilai = Math.trunc(halaman)
  if (!Number.isFinite(nilai) || nilai < 1) return 1
  return total > 0 ? Math.min(nilai, total) : nilai
}

function segarkan(slug: string) {
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/bookmark")
  revalidatePath("/dashboard/catatan")
  revalidatePath("/dashboard/riwayat")
  revalidatePath(`/baca/${slug}`)
}

export async function bukaSesiBaca(kitabId: string): Promise<HasilAksi> {
  try {
    await butuhMemberAksi()
    const target = await kitabDibuka(kitabId)
    await catatSesiBaca(kitabId)
    revalidatePath("/dashboard")
    return sukses(target.id, `Membuka ${target.judulLatin}.`)
  } catch (error) {
    return gagal(error)
  }
}

export async function simpanProgresBacaAksi(input: InputHalaman): Promise<HasilAksi> {
  try {
    const anggota = await butuhMemberAksi()
    const target = await kitabDibuka(input.kitabId)
    const halaman = halamanWajar(input.halaman, target.jumlahHalaman)
    const persentase = hitungPersentase(halaman, target.jumlahHalaman)

    await simpanProgresBaca({
      userId: anggota.id,
      kitabId: target.id,
      halaman,
      persentase,
    })
    segarkan(target.slug)
    return sukses(target.id, `Halaman ${halaman} tersimpan.`)
  } catch (error) {
    return gagal(error)
  }
}

export async function tambahBookmark(input: InputHalaman & { label?: string | null }): Promise<HasilAksi> {
  try {
    const anggota = await butuhMemberAksi()
    const target = await kitabDibuka(input.kitabId)
    const halaman = halamanWajar(input.halaman, target.jumlahHalaman)
    const label = skemaLabelBookmark.parse(input.label ?? "")

    const id = await simpanBookmark({ userId: anggota.id, kitabId: target.id, halaman, label: label || null })
    segarkan(target.slug)
    return sukses(id, `Bookmark halaman ${halaman} disimpan.`)
  } catch (error) {
    return gagal(error)
  }
}

export async function hapusBookmarkHalaman(input: InputHalaman): Promise<HasilAksi> {
  try {
    const anggota = await butuhMemberAksi()
    const target = await kitabDibuka(input.kitabId)
    const id = await hapusBookmark({
      userId: anggota.id,
      kitabId: target.id,
      halaman: Math.trunc(input.halaman),
    })
    if (!id) return { ok: false, pesan: "Bookmark itu sudah tidak ada di daftar Anda." }
    segarkan(target.slug)
    return sukses(id, `Bookmark halaman ${input.halaman} dihapus.`)
  } catch (error) {
    return gagal(error)
  }
}

/** Dihapus dari halaman /dashboard/bookmark, tanpa perlu tahu kitabnya. */
export async function hapusBookmarkId(id: string): Promise<HasilAksi> {
  try {
    const anggota = await butuhMemberAksi()
    const terhapus = await hapusBookmarkById(id, anggota.id)
    if (!terhapus) return { ok: false, pesan: "Bookmark tidak ditemukan pada akun Anda." }
    revalidatePath("/dashboard/bookmark")
    revalidatePath("/dashboard")
    return sukses(id, "Bookmark dihapus.")
  } catch (error) {
    return gagal(error)
  }
}

export async function tambahCatatan(input: InputHalaman & { isi: string }): Promise<HasilAksi> {
  try {
    const anggota = await butuhMemberAksi()
    const target = await kitabDibuka(input.kitabId)
    const halaman = halamanWajar(input.halaman, target.jumlahHalaman)
    const isi = skemaIsiCatatan.parse(input.isi)

    const id = await simpanCatatan({ userId: anggota.id, kitabId: target.id, halaman, isi })
    segarkan(target.slug)
    return sukses(id, `Catatan halaman ${halaman} tersimpan.`)
  } catch (error) {
    return gagal(error)
  }
}

export async function ubahCatatanIsi(id: string, isi: string): Promise<HasilAksi> {
  try {
    const anggota = await butuhMemberAksi()
    const teks = skemaIsiCatatan.parse(isi)
    const terubah = await ubahCatatan(id, anggota.id, teks.slice(0, MAKS_ISI_CATATAN))
    if (!terubah) return { ok: false, pesan: "Catatan tidak ditemukan pada akun Anda." }
    revalidatePath("/dashboard/catatan")
    return sukses(id, "Catatan diperbarui.")
  } catch (error) {
    return gagal(error)
  }
}

export async function hapusCatatanId(id: string): Promise<HasilAksi> {
  try {
    const anggota = await butuhMemberAksi()
    const terhapus = await hapusCatatan(id, anggota.id)
    if (!terhapus) return { ok: false, pesan: "Catatan tidak ditemukan pada akun Anda." }
    revalidatePath("/dashboard/catatan")
    revalidatePath("/dashboard")
    return sukses(id, "Catatan dihapus.")
  } catch (error) {
    return gagal(error)
  }
}
