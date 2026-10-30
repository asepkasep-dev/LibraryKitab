import { and, asc, count, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
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

export const PER_HALAMAN_KATALOG = 12

/* ------------------------------ Bentuk data ----------------------------- */

export type JenisPeran = "santri" | "ustadz"
export type Role = "member" | "admin"
export type StatusPengguna = "aktif" | "nonaktif"
export type StatusKitab = "draft" | "published" | "archived"

export type KategoriVe = { id: string; nama: string; slug: string; deskripsi: string }

export type PengarangVe = {
  id: string
  namaArab: string
  namaLatin: string
  tahunWafat: string
  biografiSingkat: string
}

/** Baris kitab beserta fan, pengarang, dan syarahnya (hasil join). */
export type KitabVe = {
  id: string
  judulLatin: string
  judulArab: string
  slug: string
  deskripsi: string
  kategoriId: string
  pengarangId: string
  syarahId: string | null
  tahunTerbit: string
  jumlahHalaman: number
  urlSampul: string | null
  urlPdf: string
  ukuranPdfByte: number
  status: StatusKitab
  jumlahDibuka: number
  createdAt: Date
  updatedAt: Date
  kategori: KategoriVe
  pengarang: PengarangVe
  syarah: PengarangVe | null
}

export type PenggunaVe = {
  id: string
  clerkId: string
  email: string
  namaLengkap: string
  jenisPeran: JenisPeran | null
  kelas: string
  role: Role
  status: StatusPengguna
  fontSizePreferensi: number
  createdAt: Date
}

export type RiwayatVe = {
  id: string
  userId: string
  kitabId: string
  halamanTerakhir: number
  persentaseSelesai: number
  terakhirDibukaAt: Date
}

export type BookmarkVe = {
  id: string
  userId: string
  kitabId: string
  halaman: number
  label: string | null
  createdAt: Date
}

export type CatatanVe = {
  id: string
  userId: string
  kitabId: string
  halaman: number
  isi: string
  createdAt: Date
  updatedAt: Date
}

export type LogVe = {
  id: string
  adminId: string | null
  aksi: string
  targetTabel: string
  targetId: string
  detail: string
  createdAt: Date
}

type KitabGabung = {
  kitab: typeof kitab.$inferSelect
  kategori: typeof kategori.$inferSelect | null
  pengarang: typeof pengarang.$inferSelect | null
  syarah: typeof pengarang.$inferSelect | null
}

const TEKS = (nilai: string | null) => nilai ?? ""

/** Tabel pengarang dipakai dua kali (penulis & penyusun syarah) sehingga butuh alias. */
const syarahPengarang = alias(pengarang, "syarah_pengarang")

function jadiKategori(r: typeof kategori.$inferSelect): KategoriVe {
  return { id: r.id, nama: r.nama, slug: r.slug, deskripsi: TEKS(r.deskripsi) }
}

function jadiPengarang(r: typeof pengarang.$inferSelect): PengarangVe {
  return {
    id: r.id,
    namaArab: TEKS(r.namaArab),
    namaLatin: r.namaLatin,
    tahunWafat: TEKS(r.tahunWafat),
    biografiSingkat: TEKS(r.biografiSingkat),
  }
}

const KATEGORI_KOSONG: KategoriVe = {
  id: "",
  nama: "Tanpa fan",
  slug: "",
  deskripsi: "",
}

const PENGARANG_KOSONG: PengarangVe = {
  id: "",
  namaArab: "",
  namaLatin: "Pengarang tidak diketahui",
  tahunWafat: "",
  biografiSingkat: "",
}

/** Kolom yang boleh null dinormalkan ke string agar komponen UI tidak perlu guard. */
function dasarKitab(r: typeof kitab.$inferSelect) {
  return {
    id: r.id,
    judulLatin: r.judulLatin,
    judulArab: TEKS(r.judulArab),
    slug: r.slug,
    deskripsi: TEKS(r.deskripsi),
    kategoriId: r.kategoriId,
    pengarangId: r.pengarangId,
    syarahId: r.syarahId,
    tahunTerbit: TEKS(r.tahunTerbit),
    jumlahHalaman: r.jumlahHalaman,
    urlSampul: r.urlSampul,
    urlPdf: r.urlPdf,
    ukuranPdfByte: r.ukuranPdfByte,
    status: r.status as StatusKitab,
    jumlahDibuka: r.jumlahDibuka,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

function jadiKitab(g: KitabGabung): KitabVe {
  return {
    ...dasarKitab(g.kitab),
    kategori: g.kategori ? jadiKategori(g.kategori) : KATEGORI_KOSONG,
    pengarang: g.pengarang ? jadiPengarang(g.pengarang) : PENGARANG_KOSONG,
    syarah: g.syarah ? jadiPengarang(g.syarah) : null,
  }
}

function jadiKitabRel(r: KitabRel): KitabVe {
  const kategoriRel = r.kategori as typeof kategori.$inferSelect
  const pengarangRel = r.pengarang as typeof pengarang.$inferSelect
  const syarahRel = r.syarah as typeof pengarang.$inferSelect | null
  return {
    ...dasarKitab(r),
    kategori: jadiKategori(kategoriRel),
    pengarang: jadiPengarang(pengarangRel),
    syarah: syarahRel ? jadiPengarang(syarahRel) : null,
  }
}

function jadiPengguna(r: typeof users.$inferSelect): PenggunaVe {
  return {
    id: r.id,
    clerkId: r.clerkId,
    email: r.email,
    namaLengkap: TEKS(r.namaLengkap),
    jenisPeran: r.jenisPeran,
    kelas: TEKS(r.kelas),
    role: r.role,
    status: r.status,
    fontSizePreferensi: r.fontSizePreferensi,
    createdAt: r.createdAt,
  }
}

function jadiLog(r: typeof logAdmin.$inferSelect): LogVe {
  return {
    id: r.id,
    adminId: r.adminId,
    aksi: r.aksi,
    targetTabel: r.targetTabel,
    targetId: TEKS(r.targetId),
    detail: TEKS(r.detail),
    createdAt: r.createdAt,
  }
}

function kitabDenganRelasi(opsi: {
  where?: SQL
  orderBy?: (ReturnType<typeof desc> | ReturnType<typeof asc>)[]
  limit?: number
}) {
  return db.query.kitab.findMany({
    with: { kategori: true, pengarang: true, syarah: true },
    where: opsi.where,
    orderBy: opsi.orderBy,
    limit: opsi.limit,
  })
}

/** Hasil query relasional db.query.kitab dengan with: { kategori, pengarang, syarah }. */
type KitabRel = Awaited<ReturnType<typeof kitabDenganRelasi>>[number]

/* ------------------------------ Katalog publik ----------------------------- */

/** Semua kitab berstatus published, terbaru lebih dulu. */
export async function daftarKitabTayang(batas = 200) {
  const rows = await kitabDenganRelasi({
    where: eq(kitab.status, "published"),
    orderBy: [desc(kitab.createdAt), asc(kitab.judulLatin)],
    limit: batas,
  })
  return rows.map(jadiKitabRel)
}

export async function daftarSlugTayang() {
  const rows = await db
    .select({ slug: kitab.slug })
    .from(kitab)
    .where(eq(kitab.status, "published"))
    .orderBy(asc(kitab.judulLatin))
  return rows.map((r) => r.slug)
}

export async function kitabTayangBySlug(slug: string) {
  const rows = await kitabDenganRelasi({
    where: and(eq(kitab.slug, slug), eq(kitab.status, "published")),
    limit: 1,
  })
  const row = rows[0]
  return row ? jadiKitabRel(row) : null
}

/** Default hanya published; `khususTayang: false` dipakai halaman admin. */
export async function kitabBySlug(slug: string, { khususTayang = true } = {}) {
  const rows = await kitabDenganRelasi({ where: eq(kitab.slug, slug), limit: 1 })
  const row = rows[0]
  if (!row) return null
  if (khususTayang && row.status !== "published") return null
  return jadiKitabRel(row)
}

export async function kitabById(id: string) {
  const rows = await kitabDenganRelasi({ where: eq(kitab.id, id), limit: 1 })
  const row = rows[0]
  return row ? jadiKitabRel(row) : null
}

/** Sama seperti kitabById, tapi menolak kitab yang belum atau tidak lagi tayang. */
export async function kitabTayangById(id: string) {
  const rows = await kitabDenganRelasi({
    where: and(eq(kitab.id, id), eq(kitab.status, "published")),
    limit: 1,
  })
  const row = rows[0]
  return row ? jadiKitabRel(row) : null
}

function polaIlike(kata: string) {
  return `%${kata.replace(/[\\%_]/g, (m) => `\\${m}`).toLowerCase()}%`
}

function kondisiCari(kata: string) {
  const pola = polaIlike(kata)
  return or(
    ilike(kitab.judulLatin, pola),
    ilike(sql`coalesce(${kitab.judulArab}, '')`, pola),
    ilike(kategori.nama, pola),
    ilike(pengarang.namaLatin, pola),
    ilike(sql`coalesce(${pengarang.namaArab}, '')`, pola)
  )
}

export type FilterKatalog = {
  q?: string
  kategori?: string
  pengarang?: string
  syarah?: string
  urut?: "terbaru" | "judul" | "terpopuler"
  halaman?: number
}

/**
 * Pencarian server-side: ILIKE multi-kata pada judul dan nama fan/pengarang,
 * filter fan lewat slug, filter pengarang & syarah lewat uuid, urutan dan
 * pagination dikerjakan database.
 */
export async function cariKitab(filter: FilterKatalog) {
  const {
    q = "",
    kategori: fan,
    pengarang: penulis,
    syarah,
    urut = "terbaru",
    halaman = 1,
  } = filter

  const kata = q
    .toLowerCase()
    .split(/\s+/)
    .map((k) => k.replace(/[\\%_]/g, "").trim())
    .filter(Boolean)

  const kondisi: SQL[] = [eq(kitab.status, "published")]
  const perKata = kata.map(kondisiCari)
  if (perKata.length) kondisi.push(and(...perKata)!)
  if (fan && fan !== "semua") kondisi.push(eq(kategori.slug, fan))
  if (penulis && penulis !== "semua") kondisi.push(eq(kitab.pengarangId, penulis))
  if (syarah && syarah !== "semua") kondisi.push(eq(kitab.syarahId, syarah))
  const gabung = and(...kondisi)!

  const urutan =
    urut === "judul"
      ? [asc(kitab.judulLatin)]
      : urut === "terpopuler"
        ? [desc(kitab.jumlahDibuka), asc(kitab.judulLatin)]
        : [desc(kitab.createdAt), asc(kitab.judulLatin)]

  const nomorHalaman = Math.max(1, Math.trunc(halaman))

  const bangunQuery = () =>
    db
      .select({
        kitab: kitab,
        kategori: kategori,
        pengarang: pengarang,
        syarah: syarahPengarang,
      })
      .from(kitab)
      .innerJoin(kategori, eq(kategori.id, kitab.kategoriId))
      .innerJoin(pengarang, eq(pengarang.id, kitab.pengarangId))
      .leftJoin(syarahPengarang, eq(syarahPengarang.id, kitab.syarahId))

  const baris = await bangunQuery()
    .where(gabung)
    .orderBy(...urutan)
    .limit(PER_HALAMAN_KATALOG)
    .offset((nomorHalaman - 1) * PER_HALAMAN_KATALOG)

  const [total] = await db
    .select({ nilai: count() })
    .from(kitab)
    .innerJoin(kategori, eq(kategori.id, kitab.kategoriId))
    .innerJoin(pengarang, eq(pengarang.id, kitab.pengarangId))
    .leftJoin(syarahPengarang, eq(syarahPengarang.id, kitab.syarahId))
    .where(gabung)

  const jumlah = Number(total?.nilai ?? 0)
  const totalHalaman = Math.max(1, Math.ceil(jumlah / PER_HALAMAN_KATALOG))

  return {
    items: baris.map(jadiKitab),
    total: jumlah,
    totalHalaman,
    halaman: Math.min(nomorHalaman, totalHalaman),
    perHalaman: PER_HALAMAN_KATALOG,
  }
}

/** Bentuk keluaran cariKitab, dipakai sebagai prop komponen eksplorer katalog. */
export type HasilKatalog = Awaited<ReturnType<typeof cariKitab>>

/** Kitab sejenis: fan sama lebih dulu, lalu pengarang sama. */
export async function kitabTerkait(target: KitabVe, batas = 4) {
  const kandidat = await daftarKitabTayang(120)
  const skor = (k: KitabVe) =>
    (k.kategoriId === target.kategoriId ? 2 : 0) +
    (k.pengarangId === target.pengarangId ? 1 : 0)

  return kandidat
    .filter((k) => k.id !== target.id && skor(k) > 0)
    .sort((a, b) => skor(b) - skor(a) || b.jumlahDibuka - a.jumlahDibuka)
    .slice(0, batas)
}

/** Sorotan redaksi di beranda: urutan slug dikurasi, bukan dihasilkan query. */
export async function kitabSorotan(slugs: readonly string[]) {
  if (!slugs.length) return []
  const rows = await kitabDenganRelasi({
    where: and(inArray(kitab.slug, [...slugs]), eq(kitab.status, "published")),
    limit: slugs.length,
  })
  const daftar = rows.map(jadiKitabRel)
  return slugs
    .map((slug) => daftar.find((k) => k.slug === slug))
    .filter((k): k is KitabVe => Boolean(k))
}

export async function kitabTerpopuler(batas = 4) {
  const rows = await kitabDenganRelasi({
    where: eq(kitab.status, "published"),
    orderBy: [desc(kitab.jumlahDibuka), asc(kitab.judulLatin)],
    limit: batas,
  })
  return rows.map(jadiKitabRel)
}

/** Angka ringkas beranda tanpa memuat baris kitab. */
export async function ringkasanBeranda() {
  const [agg] = await db
    .select({
      tayang: sql<number>`count(*) filter (where ${kitab.status} = 'published')::int`,
      sesi: sql<number>`coalesce(sum(${kitab.jumlahDibuka}), 0)::int`,
    })
    .from(kitab)
  return {
    totalTayang: Number(agg?.tayang ?? 0),
    totalSesi: Number(agg?.sesi ?? 0),
  }
}

export async function hitungKitabPerKategori() {
  const rows = await db
    .select({ kategori: kategori, jumlah: count(kitab.id) })
    .from(kategori)
    .leftJoin(kitab, and(eq(kitab.kategoriId, kategori.id), eq(kitab.status, "published")))
    .groupBy(kategori.id)
    .orderBy(asc(kategori.nama))
  return rows.map((r) => ({ kategori: jadiKategori(r.kategori), jumlah: Number(r.jumlah) }))
}

export async function daftarKategori() {
  const rows = await db.select().from(kategori).orderBy(asc(kategori.nama))
  return rows.map(jadiKategori)
}

/** Penjaga FK sebelum menulis: id palsu harus ditolak di aplikasi, bukan oleh Postgres. */
export async function adaKategori(id: string) {
  const rows = await db.select({ id: kategori.id }).from(kategori).where(eq(kategori.id, id)).limit(1)
  return rows.length > 0
}

export async function adaPengarang(id: string) {
  const rows = await db.select({ id: pengarang.id }).from(pengarang).where(eq(pengarang.id, id)).limit(1)
  return rows.length > 0
}

/** Opsi filter pengarang di katalog: hanya penulis yang punya kitab tayang. */
export async function opsiPengarangKatalog() {
  const rows = await db
    .selectDistinct({ pengarang: pengarang })
    .from(pengarang)
    .innerJoin(kitab, and(eq(kitab.pengarangId, pengarang.id), eq(kitab.status, "published")))
    .orderBy(asc(pengarang.namaLatin))
  return rows.map((r) => jadiPengarang(r.pengarang))
}

/** Opsi filter syarah di katalog: penyusun syarah yang kitabnya tayang. */
export async function opsiSyarahKatalog() {
  const rows = await db
    .selectDistinct({ pengarang: pengarang })
    .from(pengarang)
    .innerJoin(kitab, and(eq(kitab.syarahId, pengarang.id), eq(kitab.status, "published")))
    .orderBy(asc(pengarang.namaLatin))
  return rows.map((r) => jadiPengarang(r.pengarang))
}

/* ------------------------------ Data reader ----------------------------- */

export async function riwayatOlehUser(userId: string, kitabId: string) {
  const [row] = await db
    .select()
    .from(riwayatBaca)
    .where(and(eq(riwayatBaca.userId, userId), eq(riwayatBaca.kitabId, kitabId)))
    .limit(1)
  return row satisfies RiwayatVe | null
}

export async function daftarBookmarkOlehUser(userId: string, kitabId: string) {
  const rows = await db
    .select()
    .from(bookmark)
    .where(and(eq(bookmark.userId, userId), eq(bookmark.kitabId, kitabId)))
    .orderBy(desc(bookmark.halaman))
  return rows satisfies BookmarkVe[]
}

export async function daftarCatatanOlehUser(userId: string, kitabId: string) {
  const rows = await db
    .select()
    .from(catatan)
    .where(and(eq(catatan.userId, userId), eq(catatan.kitabId, kitabId)))
    .orderBy(desc(catatan.halaman))
  return rows satisfies CatatanVe[]
}

/* ------------------------------ Area member ----------------------------- */

export async function penggunaByClerkId(clerkId: string) {
  const [row] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1)
  return row ? jadiPengguna(row) : null
}

export async function penggunaById(id: string) {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return row ? jadiPengguna(row) : null
}

export async function listRiwayatDenganKitab(userId: string) {
  const rows = await db
    .select({
      riwayat: riwayatBaca,
      kitab: kitab,
      kategori: kategori,
      pengarang: pengarang,
      syarah: syarahPengarang,
    })
    .from(riwayatBaca)
    .innerJoin(kitab, eq(kitab.id, riwayatBaca.kitabId))
    .innerJoin(kategori, eq(kategori.id, kitab.kategoriId))
    .innerJoin(pengarang, eq(pengarang.id, kitab.pengarangId))
    .leftJoin(syarahPengarang, eq(syarahPengarang.id, kitab.syarahId))
    .where(eq(riwayatBaca.userId, userId))
    .orderBy(desc(riwayatBaca.terakhirDibukaAt))

  return rows.map((r) => ({
    riwayat: r.riwayat satisfies RiwayatVe,
    kitab: jadiKitab({
      kitab: r.kitab,
      kategori: r.kategori,
      pengarang: r.pengarang,
      syarah: r.syarah,
    }),
  }))
}

export async function listBookmarkGrupKitab(userId: string) {
  const rows = await db
    .select({
      bookmark: bookmark,
      kitab: kitab,
      kategori: kategori,
      pengarang: pengarang,
      syarah: syarahPengarang,
    })
    .from(bookmark)
    .innerJoin(kitab, eq(kitab.id, bookmark.kitabId))
    .innerJoin(kategori, eq(kategori.id, kitab.kategoriId))
    .innerJoin(pengarang, eq(pengarang.id, kitab.pengarangId))
    .leftJoin(syarahPengarang, eq(syarahPengarang.id, kitab.syarahId))
    .where(eq(bookmark.userId, userId))
    .orderBy(desc(bookmark.createdAt), asc(bookmark.halaman))

  const grup: { kitab: KitabVe; items: BookmarkVe[] }[] = []
  for (const r of rows) {
    const item: BookmarkVe = {
      id: r.bookmark.id,
      userId: r.bookmark.userId,
      kitabId: r.bookmark.kitabId,
      halaman: r.bookmark.halaman,
      label: r.bookmark.label,
      createdAt: r.bookmark.createdAt,
    }
    const ketemu = grup.find((g) => g.kitab.id === item.kitabId)
    if (ketemu) {
      ketemu.items.push(item)
      continue
    }
    grup.push({
      kitab: jadiKitab({
        kitab: r.kitab,
        kategori: r.kategori,
        pengarang: r.pengarang,
        syarah: r.syarah,
      }),
      items: [item],
    })
  }
  return grup
}

export async function listCatatanDenganKitab(userId: string) {
  const rows = await db
    .select({
      catatan: catatan,
      kitab: kitab,
      kategori: kategori,
      pengarang: pengarang,
      syarah: syarahPengarang,
    })
    .from(catatan)
    .innerJoin(kitab, eq(kitab.id, catatan.kitabId))
    .innerJoin(kategori, eq(kategori.id, kitab.kategoriId))
    .innerJoin(pengarang, eq(pengarang.id, kitab.pengarangId))
    .leftJoin(syarahPengarang, eq(syarahPengarang.id, kitab.syarahId))
    .where(eq(catatan.userId, userId))
    .orderBy(desc(catatan.updatedAt))

  return rows.map((r) => ({
    catatan: r.catatan satisfies CatatanVe,
    kitab: jadiKitab({
      kitab: r.kitab,
      kategori: r.kategori,
      pengarang: r.pengarang,
      syarah: r.syarah,
    }),
  }))
}

export async function statistikMember(userId: string) {
  const [riwayat, bookmarkRows, catatanRows] = await Promise.all([
    listRiwayatDenganKitab(userId),
    db.select({ id: bookmark.id }).from(bookmark).where(eq(bookmark.userId, userId)),
    db.select({ id: catatan.id }).from(catatan).where(eq(catatan.userId, userId)),
  ])

  const halamanDibaca = riwayat.reduce((a, r) => a + r.riwayat.halamanTerakhir, 0)
  const rataRataProgres = riwayat.length
    ? Math.round(
        riwayat.reduce((a, r) => a + r.riwayat.persentaseSelesai, 0) / riwayat.length
      )
    : 0

  return {
    kitabDibaca: riwayat.length,
    totalBookmark: bookmarkRows.length,
    totalCatatan: catatanRows.length,
    halamanDibaca,
    rataRataProgres,
    kitabTerakhir: riwayat[0]?.kitab ?? null,
    riwayatTerakhir: riwayat[0]?.riwayat ?? null,
  }
}

/** Rekomendasi: fan yang sering dibaca user, dikurangi kitab yang sudah dibuka. */
export async function rekomendasiBerdasarkanFan(userId: string, batas = 4) {
  const kandidat = await daftarKitabTayang(120)
  const riwayat = await listRiwayatDenganKitab(userId)
  if (!riwayat.length) return kandidat.slice(0, batas)

  const bobotFan = new Map<string, number>()
  for (const r of riwayat) {
    bobotFan.set(r.kitab.kategoriId, (bobotFan.get(r.kitab.kategoriId) ?? 0) + 1)
  }
  const sudah = new Set(riwayat.map((r) => r.kitab.id))

  return kandidat
    .filter((k) => !sudah.has(k.id))
    .sort(
      (a, b) =>
        (bobotFan.get(b.kategoriId) ?? 0) - (bobotFan.get(a.kategoriId) ?? 0) ||
        b.jumlahDibuka - a.jumlahDibuka
    )
    .slice(0, batas)
}

/* ------------------------------ Area admin ----------------------------- */

export async function listSemuaKitab() {
  const rows = await kitabDenganRelasi({
    orderBy: [desc(kitab.updatedAt), asc(kitab.judulLatin)],
  })
  return rows.map(jadiKitabRel)
}

export async function statistikAdmin() {
  const [semuaKitab, agregat, memberAktif, memberNonaktif, idTerpopuler, idTerbaru, sebaranFan] =
    await Promise.all([
      listSemuaKitab(),
      db
        .select({
          total: count(),
          tayang: sql<number>`count(*) filter (where ${kitab.status} = 'published')::int`,
          draf: sql<number>`count(*) filter (where ${kitab.status} = 'draft')::int`,
          arsip: sql<number>`count(*) filter (where ${kitab.status} = 'archived')::int`,
          halaman: sql<number>`coalesce(sum(${kitab.jumlahHalaman}), 0)::int`,
          sesi: sql<number>`coalesce(sum(${kitab.jumlahDibuka}), 0)::int`,
        })
        .from(kitab),
      db.select({ id: users.id }).from(users).where(eq(users.status, "aktif")),
      db.select({ id: users.id }).from(users).where(eq(users.status, "nonaktif")),
      db.select({ id: kitab.id }).from(kitab).orderBy(desc(kitab.jumlahDibuka)).limit(6),
      db.select({ id: kitab.id }).from(kitab).orderBy(desc(kitab.updatedAt)).limit(5),
      hitungKitabPerKategori(),
    ])

  const a = agregat[0]
  const urutkan = (ids: { id: string }[]) =>
    ids
      .map((r) => semuaKitab.find((k) => k.id === r.id))
      .filter((k): k is KitabVe => Boolean(k))

  return {
    totalKitab: Number(a?.total ?? 0),
    totalTayang: Number(a?.tayang ?? 0),
    totalDraf: Number(a?.draf ?? 0),
    totalArsip: Number(a?.arsip ?? 0),
    totalMember: memberAktif.length,
    totalNonaktif: memberNonaktif.length,
    totalHalaman: Number(a?.halaman ?? 0),
    totalSesi: Number(a?.sesi ?? 0),
    kitabTerpopuler: urutkan(idTerpopuler),
    unggahanTerbaru: urutkan(idTerbaru),
    sebaranFan,
  }
}

/** Kategori untuk tabel kelola: kitab dihitung pada semua status, bukan hanya tayang. */
export async function kategoriUntukKelola() {
  const rows = await db
    .select({ entitas: kategori, terkait: count(kitab.id) })
    .from(kategori)
    .leftJoin(kitab, eq(kitab.kategoriId, kategori.id))
    .groupBy(kategori.id)
    .orderBy(asc(kategori.nama))
  return rows.map((r) => ({ ...jadiKategori(r.entitas), terkait: Number(r.terkait) }))
}

/**
 * Pengarang untuk tabel kelola. Tabel `pengarang` dipakai dua peran, jadi halaman
 * pengarang dan halaman syarah menampilkan daftar yang sama dengan hitungan
 * sesuai perannya masing-masing.
 */
export async function pengarangUntukKelola(peran: "penulis" | "syarah") {
  const kolom = peran === "penulis" ? kitab.pengarangId : kitab.syarahId
  const rows = await db
    .select({ entitas: pengarang, terkait: count(kitab.id) })
    .from(pengarang)
    .leftJoin(kitab, eq(kolom, pengarang.id))
    .groupBy(pengarang.id)
    .orderBy(asc(pengarang.namaLatin))
  return rows.map((r) => ({ ...jadiPengarang(r.entitas), terkait: Number(r.terkait) }))
}

export async function listPenggunaDenganAktivitas() {
  const rows = await db
    .select({
      pengguna: users,
      jumlahBookmark:
        sql<number>`(select count(*) from bookmark b where b.user_id = ${users.id})::int`,
      jumlahCatatan:
        sql<number>`(select count(*) from catatan c where c.user_id = ${users.id})::int`,
      jumlahRiwayat:
        sql<number>`(select count(*) from riwayat_baca r where r.user_id = ${users.id})::int`,
    })
    .from(users)
    .orderBy(desc(users.createdAt))

  return rows.map((r) => ({
    pengguna: jadiPengguna(r.pengguna),
    jumlahBookmark: Number(r.jumlahBookmark),
    jumlahCatatan: Number(r.jumlahCatatan),
    jumlahRiwayat: Number(r.jumlahRiwayat),
  }))
}

export async function listLogAdmin(batas = 20) {
  const rows = await db
    .select()
    .from(logAdmin)
    .orderBy(desc(logAdmin.createdAt))
    .limit(batas)
  return rows.map(jadiLog)
}

/** Nama pengelola untuk label log aktivitas. */
export async function petaNamaPengguna() {
  const rows = await db
    .select({ id: users.id, namaLengkap: users.namaLengkap })
    .from(users)
  return new Map(rows.map((r) => [r.id, r.namaLengkap ?? "Pengelola"]))
}

/* ------------------------------ Opsi formulir ----------------------------- */

export type OpsiPilhan = { id: string; nama: string }

export async function opsiKategori(): Promise<OpsiPilhan[]> {
  return db
    .select({ id: kategori.id, nama: kategori.nama })
    .from(kategori)
    .orderBy(asc(kategori.nama))
}

export async function opsiPengarang(): Promise<OpsiPilhan[]> {
  return db
    .select({ id: pengarang.id, nama: pengarang.namaLatin })
    .from(pengarang)
    .orderBy(asc(pengarang.namaLatin))
}

/**
 * Peran penulis dan penyusun syarah memakai tabel yang sama, jadi setiap
 * pengarang boleh dipilih sebagai syarah — termasuk yang belum pernah dipakai.
 */
export async function opsiSyarah(): Promise<OpsiPilhan[]> {
  return opsiPengarang()
}

/** Jumlah kitab yang memakai entitas ini, dalam peran mana pun. */
export async function hitungKitabTerhubung({
  kategoriId,
  pengarangId,
  syarahId,
}: {
  kategoriId?: string
  pengarangId?: string
  syarahId?: string
}) {
  const kondisi: SQL[] = []
  if (kategoriId) kondisi.push(eq(kitab.kategoriId, kategoriId))
  if (pengarangId) kondisi.push(eq(kitab.pengarangId, pengarangId))
  if (syarahId) kondisi.push(eq(kitab.syarahId, syarahId))
  if (!kondisi.length) return 0
  const [hasil] = await db.select({ nilai: count() }).from(kitab).where(or(...kondisi))
  return Number(hasil?.nilai ?? 0)
}

/* ------------------------------ Helper kecil ----------------------------- */

export function gabungLabelPeran(pengguna: PenggunaVe) {
  const peran = pengguna.jenisPeran === "ustadz" ? "Ustadz" : "Santri"
  return pengguna.kelas ? `${peran} · ${pengguna.kelas}` : peran
}
