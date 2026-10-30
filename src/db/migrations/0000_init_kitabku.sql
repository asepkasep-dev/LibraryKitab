CREATE TYPE "public"."jenis_peran" AS ENUM('santri', 'ustadz');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('member', 'admin');--> statement-breakpoint
CREATE TYPE "public"."status_kitab" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."status_pengguna" AS ENUM('aktif', 'nonaktif');--> statement-breakpoint
CREATE TABLE "bookmark" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kitab_id" uuid NOT NULL,
	"halaman" integer NOT NULL,
	"label" varchar(80),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catatan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kitab_id" uuid NOT NULL,
	"halaman" integer NOT NULL,
	"isi" varchar(2000) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kategori" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"deskripsi" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kategori_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "kitab" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"judul_latin" varchar(200) NOT NULL,
	"judul_arab" varchar(300),
	"slug" varchar(220) NOT NULL,
	"deskripsi" text,
	"kategori_id" uuid NOT NULL,
	"pengarang_id" uuid NOT NULL,
	"syarah_id" uuid,
	"tahun_terbit" varchar(40),
	"jumlah_halaman" integer DEFAULT 0 NOT NULL,
	"url_sampul" text,
	"url_pdf" text NOT NULL,
	"ukuran_pdf_byte" integer DEFAULT 0 NOT NULL,
	"status" "status_kitab" DEFAULT 'draft' NOT NULL,
	"jumlah_dibuka" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kitab_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "log_admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"aksi" varchar(100) NOT NULL,
	"target_tabel" varchar(60) NOT NULL,
	"target_id" varchar(60),
	"detail" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengarang" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama_arab" varchar(200),
	"nama_latin" varchar(200) NOT NULL,
	"tahun_wafat" varchar(40),
	"biografi_singkat" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "riwayat_baca" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kitab_id" uuid NOT NULL,
	"halaman_terakhir" integer DEFAULT 1 NOT NULL,
	"persentase_selesai" integer DEFAULT 0 NOT NULL,
	"terakhir_dibuka_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"nama_lengkap" varchar(150),
	"jenis_peran" "jenis_peran",
	"kelas" varchar(100),
	"role" "role" DEFAULT 'member' NOT NULL,
	"status" "status_pengguna" DEFAULT 'aktif' NOT NULL,
	"font_size_preferensi" integer DEFAULT 16 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_kitab_id_kitab_id_fk" FOREIGN KEY ("kitab_id") REFERENCES "public"."kitab"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catatan" ADD CONSTRAINT "catatan_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catatan" ADD CONSTRAINT "catatan_kitab_id_kitab_id_fk" FOREIGN KEY ("kitab_id") REFERENCES "public"."kitab"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitab" ADD CONSTRAINT "kitab_kategori_id_kategori_id_fk" FOREIGN KEY ("kategori_id") REFERENCES "public"."kategori"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitab" ADD CONSTRAINT "kitab_pengarang_id_pengarang_id_fk" FOREIGN KEY ("pengarang_id") REFERENCES "public"."pengarang"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitab" ADD CONSTRAINT "kitab_syarah_id_pengarang_id_fk" FOREIGN KEY ("syarah_id") REFERENCES "public"."pengarang"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_admin" ADD CONSTRAINT "log_admin_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_baca" ADD CONSTRAINT "riwayat_baca_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_baca" ADD CONSTRAINT "riwayat_baca_kitab_id_kitab_id_fk" FOREIGN KEY ("kitab_id") REFERENCES "public"."kitab"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_bookmark_user_kitab_halaman" ON "bookmark" USING btree ("user_id","kitab_id","halaman");--> statement-breakpoint
CREATE INDEX "idx_catatan_user_kitab" ON "catatan" USING btree ("user_id","kitab_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_kategori_nama" ON "kategori" USING btree ("nama");--> statement-breakpoint
CREATE INDEX "idx_kitab_status" ON "kitab" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_kitab_kategori" ON "kitab" USING btree ("kategori_id");--> statement-breakpoint
CREATE INDEX "idx_kitab_pengarang" ON "kitab" USING btree ("pengarang_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_pengarang_latin" ON "pengarang" USING btree ("nama_latin");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_riwayat_user_kitab" ON "riwayat_baca" USING btree ("user_id","kitab_id");--> statement-breakpoint
CREATE INDEX "idx_riwayat_user_terakhir" ON "riwayat_baca" USING btree ("user_id","terakhir_dibuka_at");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");