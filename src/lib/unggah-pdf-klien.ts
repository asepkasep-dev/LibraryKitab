import { formatUkuranBerkas } from "@/lib/format"

export type BerkasTersimpan = { path: string; byte: number; halaman: number; tanda: string }

/** Bentuk balasan /api/admin/upload-pdf; hanya varian `ok: true` yang membawa bukti unggahan. */
export type ResponsUnggah = {
  ok: boolean
  path?: string
  byte?: number
  halaman?: number
  tanda?: string
  pesan?: string
}

export type GalatBerkas = { judul: string; deskripsi?: string }

export function validasiBerkasPdf(file: File, maksMb: number): GalatBerkas | null {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { judul: "Format berkas tidak didukung", deskripsi: "Unggah berkas berformat PDF." }
  }
  if (file.size > maksMb * 1024 * 1024) {
    return {
      judul: "Berkas terlalu besar",
      deskripsi: `Maksimal ${maksMb} MB, ukuran berkas ini ${formatUkuranBerkas(file.size)}.`,
    }
  }
  return null
}

/**
 * `idKitab` kosong berarti kitabnya belum dibuat. Route tidak menolaknya: ia
 * menandatangani bukti dengan `kitabId: null`, dan bukti semacam itu hanya
 * diterima `simpanKitab` yang juga berjalan tanpa id. Yang ditolak server adalah
 * bukti yang id-nya tidak cocok dengan kitab sasaran, jadi field ini wajib ikut
 * terkirim apa adanya.
 */
export function buatMuatanPdf(file: File, slug: string, idKitab: string): FormData {
  const muatan = new FormData()
  muatan.append("berkas", file)
  muatan.append("slug", slug)
  muatan.append("idKitab", idKitab)
  return muatan
}

export function persenProgres(loaded: number, total: number, lengthComputable: boolean): number | null {
  return lengthComputable ? Math.round((loaded / total) * 100) : null
}

/**
 * Bukti unggah hanya sah bila statusnya sukses dan server mengembalikan tiga field
 * bukti (`tanda`, `path`, `halaman`); `byte` boleh absen dan diganti `byteCadangan`.
 * Bentuk lain dianggap gagal; pesan dari server diteruskan apa adanya karena route
 * handler sudah menyaringnya lewat pesanAman.
 */
export function bacaResponsUnggah(
  teks: string,
  status: number,
  byteCadangan: number,
): { ok: true; berkas: BerkasTersimpan } | { ok: false; pesan: string } {
  let data: ResponsUnggah | null = null
  try {
    data = JSON.parse(teks) as ResponsUnggah
  } catch {
    data = null
  }

  if (status < 300 && data?.ok && data.tanda && data.path && data.halaman) {
    return {
      ok: true,
      berkas: {
        path: data.path,
        tanda: data.tanda,
        byte: data.byte ?? byteCadangan,
        halaman: data.halaman,
      },
    }
  }

  return { ok: false, pesan: data?.pesan ?? `Unggahan gagal (${status}).` }
}
