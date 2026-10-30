import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ENUM
export const roleEnum = pgEnum("role", ["member", "admin"]);
export const jenisPerananEnum = pgEnum("jenis_peran", ["santri", "ustadz"]);
export const statusKitabEnum = pgEnum("status_kitab", [
  "draft",
  "published",
  "archived",
]);
export const statusPengguna = pgEnum("status_pengguna", ["aktif", "nonaktif"]);

// USERS (disinkronkan dari Clerk via webhook)
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    namaLengkap: varchar("nama_lengkap", { length: 150 }),
    jenisPeran: jenisPerananEnum("jenis_peran"),
    kelas: varchar("kelas", { length: 100 }),
    role: roleEnum("role").notNull().default("member"),
    status: statusPengguna("status").notNull().default("aktif"),
    fontSizePreferensi: integer("font_size_preferensi").notNull().default(16),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_users_role").on(t.role)]
);

// KATEGORI (FAN ILMU)
export const kategori = pgTable(
  "kategori",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nama: varchar("nama", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    deskripsi: text("deskripsi"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("uq_kategori_nama").on(t.nama)]
);

// PENGARANG & SYARAH (satu tabel, dibedakan oleh peran di tabel kitab)
export const pengarang = pgTable(
  "pengarang",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    namaArab: varchar("nama_arab", { length: 200 }),
    namaLatin: varchar("nama_latin", { length: 200 }).notNull(),
    tahunWafat: varchar("tahun_wafat", { length: 40 }),
    biografiSingkat: text("biografi_singkat"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("uq_pengarang_latin").on(t.namaLatin)]
);

// KITAB (E-BOOK)
export const kitab = pgTable(
  "kitab",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    judulLatin: varchar("judul_latin", { length: 200 }).notNull(),
    judulArab: varchar("judul_arab", { length: 300 }),
    slug: varchar("slug", { length: 220 }).notNull().unique(),
    deskripsi: text("deskripsi"),
    kategoriId: uuid("kategori_id")
      .notNull()
      .references(() => kategori.id, { onDelete: "restrict" }),
    pengarangId: uuid("pengarang_id")
      .notNull()
      .references(() => pengarang.id, { onDelete: "restrict" }),
    syarahId: uuid("syarah_id").references(() => pengarang.id, {
      onDelete: "set null",
    }),
    tahunTerbit: varchar("tahun_terbit", { length: 40 }),
    jumlahHalaman: integer("jumlah_halaman").notNull().default(0),
    urlSampul: text("url_sampul"),
    urlPdf: text("url_pdf").notNull(),
    ukuranPdfByte: integer("ukuran_pdf_byte").notNull().default(0),
    status: statusKitabEnum("status").notNull().default("draft"),
    jumlahDibuka: integer("jumlah_dibuka").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_kitab_status").on(t.status),
    index("idx_kitab_kategori").on(t.kategoriId),
    index("idx_kitab_pengarang").on(t.pengarangId),
  ]
);

// RIWAYAT BACA & PROGRES (satu baris per user per kitab)
export const riwayatBaca = pgTable(
  "riwayat_baca",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kitabId: uuid("kitab_id")
      .notNull()
      .references(() => kitab.id, { onDelete: "cascade" }),
    halamanTerakhir: integer("halaman_terakhir").notNull().default(1),
    persentaseSelesai: integer("persentase_selesai").notNull().default(0),
    terakhirDibukaAt: timestamp("terakhir_dibuka_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_riwayat_user_kitab").on(t.userId, t.kitabId),
    index("idx_riwayat_user_terakhir").on(t.userId, t.terakhirDibukaAt),
  ]
);

// BOOKMARK
export const bookmark = pgTable(
  "bookmark",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kitabId: uuid("kitab_id")
      .notNull()
      .references(() => kitab.id, { onDelete: "cascade" }),
    halaman: integer("halaman").notNull(),
    label: varchar("label", { length: 80 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_bookmark_user_kitab_halaman").on(
      t.userId,
      t.kitabId,
      t.halaman
    ),
  ]
);

// CATATAN PRIBADI
export const catatan = pgTable(
  "catatan",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kitabId: uuid("kitab_id")
      .notNull()
      .references(() => kitab.id, { onDelete: "cascade" }),
    halaman: integer("halaman").notNull(),
    isi: varchar("isi", { length: 2000 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_catatan_user_kitab").on(t.userId, t.kitabId)]
);

// LOG AKTIVITAS ADMIN
export const logAdmin = pgTable("log_admin", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Nullable: admin yang dihapus dari Clerk tidak boleh menggagalkan penghapusan,
  // sedangkan riwayat aksinya tetap tersimpan.
  adminId: uuid("admin_id").references(() => users.id, { onDelete: "set null" }),
  aksi: varchar("aksi", { length: 100 }).notNull(),
  targetTabel: varchar("target_tabel", { length: 60 }).notNull(),
  targetId: varchar("target_id", { length: 60 }),
  detail: text("detail"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// RELASI
export const kitabRelations = relations(kitab, ({ one, many }) => ({
  kategori: one(kategori, {
    fields: [kitab.kategoriId],
    references: [kategori.id],
  }),
  pengarang: one(pengarang, {
    fields: [kitab.pengarangId],
    references: [pengarang.id],
    relationName: "pengarangKitab",
  }),
  syarah: one(pengarang, {
    fields: [kitab.syarahId],
    references: [pengarang.id],
    relationName: "syarahKitab",
  }),
  riwayat: many(riwayatBaca),
  bookmark: many(bookmark),
  catatan: many(catatan),
}));

export const usersRelations = relations(users, ({ many }) => ({
  riwayat: many(riwayatBaca),
  bookmark: many(bookmark),
  catatan: many(catatan),
}));

export type User = typeof users.$inferSelect;
export type KategoriRow = typeof kategori.$inferSelect;
export type PengarangRow = typeof pengarang.$inferSelect;
export type KitabRow = typeof kitab.$inferSelect;
export type RiwayatBacaRow = typeof riwayatBaca.$inferSelect;
export type BookmarkRow = typeof bookmark.$inferSelect;
export type CatatanRow = typeof catatan.$inferSelect;
export type LogAdminRow = typeof logAdmin.$inferSelect;
