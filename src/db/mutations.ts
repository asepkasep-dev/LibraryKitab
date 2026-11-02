import { randomUUID } from "node:crypto"
import { and, eq, ne, or, sql } from "drizzle-orm"
import type { BatchItem } from "drizzle-orm/batch"
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

/**
 * Upsert identitas dari sesi atau webhook Clerk. Peran dan status tidak ikut
 * dibaca: akun baru memakai default kolom (`member`, `aktif`) dan akun yang
 * sudah ada tidak pernah ditimpa, supaya kenaikan wewenang hanya terjadi di
 * dasbor admin dan skrip seed.
 */
export async function pastikanPengguna({
  clerkId,
  email,
  namaLengkap,
}: {
  clerkId: string
  email: string
  namaLengkap: string | null
}): Promise<PenggunaVe> {
  const [row] = await db
    .insert(users)
    .values({ clerkId, email, namaLengkap })
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

export async function ubahRolePengguna(
  id: string,
  role: Role,
  log: Omit<LogIsian, "targetId">
) {
  await jalankanDenganLog(
    db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id)),
    { ...log, targetId: id }
  )
}

export async function ubahStatusPengguna(
  id: string,
  status: StatusPengguna,
  log: Omit<LogIsian, "targetId">
) {
  await jalankanDenganLog(
    db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, id)),
    { ...log, targetId: id }
  )
}

/** Dipakai webhook user.deleted dan tombol hapus di panel pengguna. */
export async function hapusPenggunaByClerkId(clerkId: string) {
  const rows = await db.delete(users).where(eq(users.clerkId, clerkId)).returning({ id: users.id })
  return rows[0]?.id ?? null
}

/* ------------------------------ Kategori (fan) ----------------------------- */

/**
 * Semua tulis entitas menerima jejak audit dan mengirimnya lewat
 * `jalankanDenganLog`: satu request Neon yang dieksekusi dalam satu transaksi,
 * supaya tidak ada perubahan tanpa jejak, atau jejak tanpa perubahan.
 */
export async function buatKategori(
  input: KategoriInput,
  log: Omit<LogIsian, "targetId">
): Promise<string> {
  const id = randomUUID()
  await jalankanDenganLog(
    db
      .insert(kategori)
      .values({ id, nama: input.nama, slug: input.slug, deskripsi: input.deskripsi }),
    { ...log, targetId: id }
  )
  return id
}

export async function ubahKategori(
  id: string,
  input: KategoriInput,
  log: Omit<LogIsian, "targetId">
): Promise<string> {
  await jalankanDenganLog(
    db
      .update(kategori)
      .set({ nama: input.nama, slug: input.slug, deskripsi: input.deskripsi })
      .where(eq(kategori.id, id)),
    { ...log, targetId: id }
  )
  return id
}

export async function hapusKategori(id: string, log: Omit<LogIsian, "targetId">) {
  await jalankanDenganLog(db.delete(kategori).where(eq(kategori.id, id)), { ...log, targetId: id })
}

/* ------------------------------ Pengarang & syarah ----------------------------- */

export async function buatPengarang(
  input: PengarangInput,
  log: Omit<LogIsian, "targetId">
): Promise<string> {
  const id = randomUUID()
  await jalankanDenganLog(
    db.insert(pengarang).values({
      id,
      namaArab: input.namaArab,
      namaLatin: input.namaLatin,
      tahunWafat: input.tahunWafat,
      biografiSingkat: input.biografiSingkat,
    }),
    { ...log, targetId: id }
  )
  return id
}

export async function ubahPengarang(
  id: string,
  input: PengarangInput,
  log: Omit<LogIsian, "targetId">
): Promise<string> {
  await jalankanDenganLog(
    db
      .update(pengarang)
      .set({
        namaArab: input.namaArab,
        namaLatin: input.namaLatin,
        tahunWafat: input.tahunWafat,
        biografiSingkat: input.biografiSingkat,
      })
      .where(eq(pengarang.id, id)),
    { ...log, targetId: id }
  )
  return id
}

export async function hapusPengarang(id: string, log: Omit<LogIsian, "targetId">) {
  await jalankanDenganLog(db.delete(pengarang).where(eq(pengarang.id, id)), {
    ...log,
    targetId: id,
  })
}

/* ------------------------------ Kitab ----------------------------- */

/** Formulir admin tidak mengetik slug maupun URL; keduanya diisi aksi dari data server. */
export type KitabIsian = KitabInput & {
  slug: string
  urlPdf: string
  ukuranPdfByte: number
}

/** Jejak audit yang wajib lahir bersama perubahan data di sebelahnya. */
export type LogIsian = {
  adminId: string
  aksi: string
  targetTabel: string
  targetId: string
  detail?: string
}

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
  urlPdf: input.urlPdf,
  ukuranPdfByte: input.ukuranPdfByte,
  status: input.status as StatusKitab,
})

/**
 * Driver Neon HTTP menolak `db.transaction`, tetapi `db.batch` dikirim sebagai
 * satu request yang dieksekusi Neon di dalam satu transaksi. Pasangan tulis +
 * log lewat jalur ini agar tidak ada perubahan tanpa jejak, atau sebaliknya.
 */
async function jalankanDenganLog<V extends BatchItem<"pg">>(
  pernyataan: V,
  log: LogIsian
): Promise<V["_"]["result"]> {
  const jejak = db.insert(logAdmin).values({
    adminId: log.adminId,
    aksi: log.aksi,
    targetTabel: log.targetTabel,
    targetId: log.targetId,
    detail: log.detail ?? null,
  })
  const [hasil] = await db.batch([pernyataan, jejak] as [V, BatchItem<"pg">])
  return hasil
}

/** id dibuat di sini agar pernyataan insert kitab dan insert log dapat dibangun lebih dulu. */
export async function tulisKitab({
  id,
  input,
  log,
}: {
  id: string | null
  input: KitabIsian
  log: Omit<LogIsian, "targetId">
}): Promise<string> {
  const idKitab = id ?? randomUUID()
  const kolom = kolomKitab(input)

  if (id === null) {
    await jalankanDenganLog(db.insert(kitab).values({ id: idKitab, ...kolom }), {
      ...log,
      targetId: idKitab,
    })
    return idKitab
  }

  const [tersimpan] = await jalankanDenganLog(
    db
      .update(kitab)
      .set({ ...kolom, updatedAt: new Date() })
      .where(eq(kitab.id, idKitab))
      .returning({ id: kitab.id }),
    { ...log, targetId: idKitab }
  )

  // Baris bisa hilang di antara pembacaan awal aksi dan transaksi ini. Tanpa
  // pemeriksaan, klien diberi pesan "tersimpan" untuk UPDATE yang tidak
  // mengenai apa pun. Jejak audit tetap tercatat satu request: bila ada yang
  // membaca log ini, perubahannya memang nol baris.
  if (!tersimpan) throw new Error("Kitab tidak ditemukan di database, perubahan tidak tersimpan.")
  return idKitab
}

export async function ubahStatusKitab(
  id: string,
  status: StatusKitab,
  log: Omit<LogIsian, "targetId">
) {
  await jalankanDenganLog(
    db.update(kitab).set({ status, updatedAt: new Date() }).where(eq(kitab.id, id)),
    { ...log, targetId: id }
  )
}

export async function hapusKitab(id: string, log: Omit<LogIsian, "targetId">) {
  await jalankanDenganLog(db.delete(kitab).where(eq(kitab.id, id)), { ...log, targetId: id })
}

/**
 * Berkas PDF dapat dirujuk lebih dari satu baris kitab bila tautannya disalin.
 * Pemeriksaan ini menjaga penghapusan berkas tidak memutus kitab lain.
 */
export async function urlPdfDipakaiKitabLain(url: string, kecualiId: string) {
  const rows = await db
    .select({ id: kitab.id })
    .from(kitab)
    .where(and(eq(kitab.urlPdf, url), ne(kitab.id, kecualiId)))
    .limit(1)
  return rows.length > 0
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
