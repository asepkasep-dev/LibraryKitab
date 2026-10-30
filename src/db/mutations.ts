import { and, eq, ne, or, sql } from "drizzle-orm"
import { db } from "./index"
import {
  bookmark,
  catatan,
  kategori,
  kitab,
  logAdmin,
  pengarang,
  riwayatBaca,
  users,
} from "./schema"
import type {
  JenisPeran,
  KategoriVe,
  LogVe,
  PengarangVe,
  PenggunaVe,
  Role,
  StatusKitab,
  StatusPengguna,
} from "./queries"
import type { KitabInput, KategoriInput, PengarangInput, ProfilInput } from "@/lib/validasi"

/* ------------------------------ Penjaga keunikan ----------------------------- */

export async function slugKitabTerpakai(slug: string, kecualiId?: string) {
  const kondisi = kecualiId
    ? and(eq(kitab.slug, slug), ne(kitab.id, kecualiId))
    : eq(kitab.slug, slug)
  const rows = await db.select({ id: kitab.id }).from(kitab).where(kondisi).limit(1)
  return rows.length > 0
}

/** Mengembalikan baris kategori yang namanya atau slug-nya sudah dipakai. */
export async function kategoriTerpakai({
  nama,
  slug,
  kecualiId,
}: {
  nama: string
  slug: string
  kecualiId?: string
}) {
  const dasar = or(eq(kategori.nama, nama), eq(kategori.slug, slug))
  const kondisi = kecualiId ? and(dasar, ne(kategori.id, kecualiId)) : dasar
  const rows = await db.select().from(kategori).where(kondisi).limit(1)
  return rows[0] ?? null
}

export async function pengarangTerpakai({ namaLatin, kecualiId }: { namaLatin: string; kecualiId?: string }) {
  const kondisi = kecualiId
    ? and(eq(pengarang.namaLatin, namaLatin), ne(pengarang.id, kecualiId))
    : eq(pengarang.namaLatin, namaLatin)
  const rows = await db.select().from(pengarang).where(kondisi).limit(1)
  return rows[0] ?? null
}

/* ------------------------------ Pengguna ----------------------------- */

/** Upsert dari sesi/webhook Clerk. Peran dan status tidak pernah ditimpa. */
export async function pastikanPengguna({
  clerkId,
  email,
  namaLengkap,
  role,
  status,
}: {
  clerkId: string
  email: string
  namaLengkap: string | null
  role?: Role
  status?: StatusPengguna
}): Promise<PenggunaVe> {
  const [row] = await db
    .insert(users)
    .values({ clerkId, email, namaLengkap, role, status })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: { email, namaLengkap, updatedAt: new Date() },
    })
    .returning()

  return {
    id: row.id,
    clerkId: row.clerkId,
    email: row.email,
    namaLengkap: row.namaLengkap ?? "",
    jenisPeran: row.jenisPeran,
    kelas: row.kelas ?? "",
    role: row.role,
    status: row.status,
    fontSizePreferensi: row.fontSizePreferensi,
    createdAt: row.createdAt,
  }
}

export async function perbaruiProfil(id: string, input: ProfilInput) {
  const [row] = await db
    .update(users)
    .set({
      namaLengkap: input.namaLengkap,
      jenisPeran: input.jenisPeran as JenisPeran,
      kelas: input.kelas,
      fontSizePreferensi: input.fontSizePreferensi,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning()
  return row ?? null
}

export async function ubahRolePengguna(id: string, role: Role) {
  const [row] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()
  return row ?? null
}

export async function ubahStatusPengguna(id: string, status: StatusPengguna) {
  const [row] = await db
    .update(users)
    .set({ status, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()
  return row ?? null
}

/** Dipakai webhook user.deleted dan tombol hapus di panel pengguna. */
export async function hapusPenggunaByClerkId(clerkId: string) {
  const rows = await db.delete(users).where(eq(users.clerkId, clerkId)).returning({ id: users.id })
  return rows[0]?.id ?? null
}

/* ------------------------------ Kategori (fan) ----------------------------- */

export async function buatKategori(input: KategoriInput): Promise<KategoriVe> {
  const [row] = await db
    .insert(kategori)
    .values({ nama: input.nama, slug: input.slug, deskripsi: input.deskripsi })
    .returning()
  return { id: row.id, nama: row.nama, slug: row.slug, deskripsi: row.deskripsi ?? "" }
}

export async function ubahKategori(id: string, input: KategoriInput): Promise<KategoriVe> {
  const [row] = await db
    .update(kategori)
    .set({ nama: input.nama, slug: input.slug, deskripsi: input.deskripsi })
    .where(eq(kategori.id, id))
    .returning()
  return {
    id: row.id,
    nama: row.nama,
    slug: row.slug,
    deskripsi: row.deskripsi ?? "",
  }
}

export async function hapusKategori(id: string) {
  await db.delete(kategori).where(eq(kategori.id, id))
}

/* ------------------------------ Pengarang & syarah ----------------------------- */

export async function buatPengarang(input: PengarangInput): Promise<PengarangVe> {
  const [row] = await db
    .insert(pengarang)
    .values({
      namaArab: input.namaArab,
      namaLatin: input.namaLatin,
      tahunWafat: input.tahunWafat,
      biografiSingkat: input.biografiSingkat,
    })
    .returning()
  return jadiBarisPengarang(row)
}

export async function ubahPengarang(id: string, input: PengarangInput): Promise<PengarangVe> {
  const [row] = await db
    .update(pengarang)
    .set({
      namaArab: input.namaArab,
      namaLatin: input.namaLatin,
      tahunWafat: input.tahunWafat,
      biografiSingkat: input.biografiSingkat,
    })
    .where(eq(pengarang.id, id))
    .returning()
  return jadiBarisPengarang(row)
}

function jadiBarisPengarang(r: typeof pengarang.$inferSelect): PengarangVe {
  return {
    id: r.id,
    namaArab: r.namaArab ?? "",
    namaLatin: r.namaLatin,
    tahunWafat: r.tahunWafat ?? "",
    biografiSingkat: r.biografiSingkat ?? "",
  }
}

export async function hapusPengarang(id: string) {
  await db.delete(pengarang).where(eq(pengarang.id, id))
}

/* ------------------------------ Kitab ----------------------------- */

/** Formulir admin tidak mengetik slug/manual URL; keduanya diisi aksi. */
export type KitabIsian = KitabInput & { slug: string; urlPdf?: string }

const kolomKitab = (input: KitabIsian) => ({
  judulLatin: input.judulLatin,
  judulArab: input.judulArab,
  slug: input.slug,
  deskripsi: input.deskripsi,
  kategoriId: input.kategoriId,
  pengarangId: input.pengarangId,
  syarahId: input.syarahId || null,
  tahunTerbit: input.tahunTerbit,
  jumlahHalaman: input.jumlahHalaman,
  status: input.status as StatusKitab,
})

export async function buatKitab(input: KitabIsian) {
  const [row] = await db
    .insert(kitab)
    .values({ ...kolomKitab(input), urlPdf: input.urlPdf ?? "" })
    .returning({ id: kitab.id })
  return row.id
}

export async function ubahKitab(id: string, input: KitabIsian) {
  await db
    .update(kitab)
    .set({ ...kolomKitab(input), updatedAt: new Date() })
    .where(eq(kitab.id, id))
  return id
}

/** Berkas PDF hasil unggahan melengkapi baris kitab. */
export async function tempelkanBerkasPdf(
  id: string,
  { urlPdf, ukuranPdfByte, jumlahHalaman }: { urlPdf: string; ukuranPdfByte: number; jumlahHalaman: number }
) {
  await db
    .update(kitab)
    .set({ urlPdf, ukuranPdfByte, jumlahHalaman, updatedAt: new Date() })
    .where(eq(kitab.id, id))
}

export async function ubahStatusKitab(id: string, status: StatusKitab) {
  await db.update(kitab).set({ status, updatedAt: new Date() }).where(eq(kitab.id, id))
}

export async function hapusKitab(id: string) {
  await db.delete(kitab).where(eq(kitab.id, id))
}

/* ------------------------------ Aktivitas baca ----------------------------- */

/** Dipanggil saat reader dibuka; menaikkan metrik jumlah_dibuka. */
export async function catatSesiBaca(kitabId: string) {
  await db
    .update(kitab)
    .set({ jumlahDibuka: sql`${kitab.jumlahDibuka} + 1` })
    .where(eq(kitab.id, kitabId))
}

export async function simpanBookmark({
  userId,
  kitabId,
  halaman,
  label,
}: {
  userId: string
  kitabId: string
  halaman: number
  label: string | null
}) {
  const [row] = await db
    .insert(bookmark)
    .values({ userId, kitabId, halaman, label })
    .onConflictDoUpdate({
      target: [bookmark.userId, bookmark.kitabId, bookmark.halaman],
      set: { label },
    })
    .returning()
  return row.id
}

export async function hapusBookmark({
  userId,
  kitabId,
  halaman,
}: {
  userId: string
  kitabId: string
  halaman: number
}) {
  const rows = await db
    .delete(bookmark)
    .where(
      and(eq(bookmark.userId, userId), eq(bookmark.kitabId, kitabId), eq(bookmark.halaman, halaman))
    )
    .returning({ id: bookmark.id })
  return rows[0]?.id ?? null
}

export async function hapusBookmarkById(id: string, userId: string) {
  const rows = await db
    .delete(bookmark)
    .where(and(eq(bookmark.id, id), eq(bookmark.userId, userId)))
    .returning({ id: bookmark.id })
  return rows[0]?.id ?? null
}

export async function simpanCatatan({
  userId,
  kitabId,
  halaman,
  isi,
}: {
  userId: string
  kitabId: string
  halaman: number
  isi: string
}) {
  const [row] = await db
    .insert(catatan)
    .values({ userId, kitabId, halaman, isi })
    .returning()
  return row.id
}

export async function ubahCatatan(id: string, userId: string, isi: string) {
  const rows = await db
    .update(catatan)
    .set({ isi, updatedAt: new Date() })
    .where(and(eq(catatan.id, id), eq(catatan.userId, userId)))
    .returning({ id: catatan.id })
  return rows[0]?.id ?? null
}

export async function hapusCatatan(id: string, userId: string) {
  const rows = await db
    .delete(catatan)
    .where(and(eq(catatan.id, id), eq(catatan.userId, userId)))
    .returning({ id: catatan.id })
  return rows[0]?.id ?? null
}

/** Satu baris per user per kitab; progres hanya maju, tidak pernah mundur. */
export async function simpanProgresBaca({
  userId,
  kitabId,
  halaman,
  persentase,
}: {
  userId: string
  kitabId: string
  halaman: number
  persentase: number
}) {
  const [row] = await db
    .insert(riwayatBaca)
    .values({ userId, kitabId, halamanTerakhir: halaman, persentaseSelesai: persentase })
    .onConflictDoUpdate({
      target: [riwayatBaca.userId, riwayatBaca.kitabId],
      set: {
        halamanTerakhir: sql`greatest(${riwayatBaca.halamanTerakhir}, ${halaman})`,
        persentaseSelesai: sql`greatest(${riwayatBaca.persentaseSelesai}, ${persentase})`,
        terakhirDibukaAt: new Date(),
      },
    })
    .returning({ id: riwayatBaca.id })
  return row?.id ?? null
}

/* ------------------------------ Log admin ----------------------------- */

export async function tulisLog({
  adminId,
  aksi,
  targetTabel,
  targetId,
  detail,
}: {
  adminId: string | null
  aksi: string
  targetTabel: string
  targetId?: string | null
  detail?: string | null
}): Promise<LogVe | null> {
  const [row] = await db
    .insert(logAdmin)
    .values({ adminId, aksi, targetTabel, targetId: targetId ?? null, detail: detail ?? null })
    .returning()
  if (!row) return null
  return {
    id: row.id,
    adminId: row.adminId,
    aksi: row.aksi,
    targetTabel: row.targetTabel,
    targetId: row.targetId ?? "",
    detail: row.detail ?? "",
    createdAt: row.createdAt,
  }
}
