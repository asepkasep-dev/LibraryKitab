import { z } from "zod"

/**
 * Semua id yang datang dari client dibandingkan pada kolom uuid. Bentuknya
 * diperiksa lebih dulu agar query tidak berangkat dengan nilai yang pasti salah.
 */
export const skemaId = z.uuid("Identitas data tidak dikenali.")

export const skemaStatusKitab = z.enum(
  ["draft", "published", "archived"],
  "Status kitab tidak dikenali.",
)

export const skemaPeranAnggota = z.enum(
  ["member", "admin"],
  "Peran anggota tidak dikenali.",
)

export const skemaStatusAnggota = z.enum(
  ["aktif", "nonaktif"],
  "Status anggota tidak dikenali.",
)

export const KEPERLUAN = [
  "Usulan kitab untuk dipindai",
  "Laporan kesalahan tampilan",
  "Kendala akun anggota",
  "Kerja sama perpustakaan",
  "Pertanyaan lainnya",
] as const

export const skemaPesanKontak = z.object({
  nama: z
    .string()
    .trim()
    .min(3, "Tulis nama Anda minimal 3 karakter.")
    .max(80, "Nama terlalu panjang (maksimal 80 karakter)."),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi agar kami bisa membalas.")
    .pipe(z.email("Format email belum benar, contoh: nama@pesantren.id")),
  keperluan: z
    .string()
    .min(1, "Pilih keperluan pesan agar sampai ke orang yang tepat."),
  subjek: z
    .string()
    .trim()
    .min(5, "Subjek minimal 5 karakter.")
    .max(120, "Subjek maksimal 120 karakter."),
  pesan: z
    .string()
    .trim()
    .min(20, "Ceritakan kebutuhan Anda minimal 20 karakter.")
    .max(1200, "Pesan maksimal 1.200 karakter."),
  setujui: z
    .boolean()
    .refine((v) => v, "Centang persetujuan penggunaan data Anda."),
})

export type PesanKontak = z.infer<typeof skemaPesanKontak>

/* ---------------- Skema Tahap 1 (state dummy) ---------------- */

export const skemaProfil = z.object({
  namaLengkap: z
    .string()
    .trim()
    .min(3, "Tulis nama lengkap minimal 3 karakter.")
    .max(80, "Nama maksimal 80 karakter."),
  jenisPeran: z.enum(["santri", "ustadz"], "Pilih peran Anda di pesantren."),
  kelas: z
    .string()
    .trim()
    .min(2, "Isi kelas atau liwan tempat Anda mengaji.")
    .max(40, "Kelas maksimal 40 karakter."),
  fontSizePreferensi: z
    .number({ error: "Ukuran huruf harus berupa angka." })
    .int("Ukuran huruf memakai bilangan bulat.")
    .min(14, "Ukuran huruf minimal 14 px.")
    .max(24, "Ukuran huruf maksimal 24 px."),
  modeReader: z.enum(["gelap", "sepia"], "Pilih mode tampilan reader."),
})

export type ProfilInput = z.infer<typeof skemaProfil>

export const skemaKategori = z.object({
  nama: z
    .string()
    .trim()
    .min(3, "Nama kategori minimal 3 karakter.")
    .max(60, "Nama kategori maksimal 60 karakter."),
  slug: z
    .string()
    .trim()
    .min(3, "Slug minimal 3 karakter.")
    .max(60, "Slug maksimal 60 karakter.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda hubung."),
  deskripsi: z
    .string()
    .trim()
    .min(20, "Tulis deskripsi minimal 20 karakter agar santri paham cakupan fan ini.")
    .max(400, "Deskripsi maksimal 400 karakter."),
})

export type KategoriInput = z.infer<typeof skemaKategori>

export const skemaPengarang = z.object({
  namaArab: z
    .string()
    .trim()
    .min(3, "Nama Arab minimal 3 karakter.")
    .max(120, "Nama Arab maksimal 120 karakter."),
  namaLatin: z
    .string()
    .trim()
    .min(3, "Nama Latin minimal 3 karakter.")
    .max(120, "Nama Latin maksimal 120 karakter."),
  tahunWafat: z
    .string()
    .trim()
    .min(2, "Isi tahun wafat, contoh: 723 H / 1323 M.")
    .max(24, "Tahun wafat maksimal 24 karakter."),
  biografiSingkat: z
    .string()
    .trim()
    .min(30, "Biografi singkat minimal 30 karakter.")
    .max(600, "Biografi maksimal 600 karakter."),
})

export type PengarangInput = z.infer<typeof skemaPengarang>

export const skemaKitab = z.object({
  judulLatin: z
    .string()
    .trim()
    .min(3, "Judul Latin minimal 3 karakter.")
    .max(160, "Judul Latin maksimal 160 karakter."),
  judulArab: z
    .string()
    .trim()
    .min(3, "Judul Arab minimal 3 karakter.")
    .max(160, "Judul Arab maksimal 160 karakter."),
  kategoriId: z
    .string()
    .min(1, "Pilih kategori fan.")
    .refine((v) => skemaId.safeParse(v).success, "Kategori tidak dikenali."),
  pengarangId: z
    .string()
    .min(1, "Pilih pengarang kitab.")
    .refine((v) => skemaId.safeParse(v).success, "Pengarang tidak dikenali."),
  syarahId: z.union([z.literal(""), skemaId], {
    error: "Penyusun syarah tidak dikenali.",
  }),
  tahunTerbit: z
    .string()
    .trim()
    .min(2, "Isi tahun terbit, contoh 1405 M atau ± 720 H.")
    .max(40, "Tahun terbit maksimal 40 karakter."),
  jumlahHalaman: z
    .number({ error: "Jumlah halaman harus berupa angka." })
    .int("Jumlah halaman memakai bilangan bulat.")
    .min(1, "Jumlah halaman minimal 1.")
    .max(5000, "Jumlah halaman maksimal 5.000."),
  deskripsi: z
    .string()
    .trim()
    .min(40, "Deskripsi minimal 40 karakter agar katalog informatif.")
    .max(2000, "Deskripsi maksimal 2.000 karakter."),
  status: z.enum(["draft", "published", "archived"]),
})

export type KitabInput = z.infer<typeof skemaKitab>
