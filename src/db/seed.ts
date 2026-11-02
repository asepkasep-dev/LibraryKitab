/**
 * Seed basis dari data dummy Bab 9: seluruh fan (kategori), pengarang & syarah,
 * serta katalog kitab. Skrip idempoten — baris yang sudah ada dilewati, sehingga
 * aman dijalankan berulang kali. Bila ADMIN_CLERK_ID diisi, akun itu dibuat atau
 * dinaikkan menjadi admin lebih dahulu. Jalankan dengan `npm run db:seed`.
 */
import "./env";
import { kategori, kitab, pengarang } from "./schema";
import { db } from "./index";
import { angkatAdminDariEnv } from "./admin-seed";
import { kategoriList, kitabList, pengarangList } from "../lib/dummy-data";
import { jalurPdf } from "../lib/bunny";

function wajib<T>(nilai: T | undefined, pesan: string): T {
  if (nilai === undefined) throw new Error(pesan);
  return nilai;
}

/**
 * url_pdf memakai host CDN Bunny bila terisi; seed tidak mengunggah file.
 * Jalurnya mengikuti jalurPdf agar sama dengan hasil unggahan admin.
 */
function urlPdf(slug: string) {
  const host = process.env.BUNNY_CDN_HOSTNAME || "cdn.example.org";
  return `https://${host}/${jalurPdf(slug)}`;
}

async function seedKategori() {
  await db
    .insert(kategori)
    .values(
      kategoriList.map((k) => ({
        nama: k.nama,
        slug: k.slug,
        deskripsi: k.deskripsi,
      }))
    )
    .onConflictDoNothing({ target: kategori.slug });

  const tersimpan = await db
    .select({ id: kategori.id, slug: kategori.slug })
    .from(kategori);
  const idBySlug = new Map(tersimpan.map((b) => [b.slug, b.id]));

  return new Map(
    kategoriList.map((k) => [
      k.id,
      wajib(
        idBySlug.get(k.slug),
        `Fan ${k.slug} tidak berhasil tersimpan ke tabel kategori.`
      ),
    ])
  );
}

async function seedPengarang() {
  await db
    .insert(pengarang)
    .values(
      pengarangList.map((p) => ({
        namaArab: p.namaArab,
        namaLatin: p.namaLatin,
        tahunWafat: p.tahunWafat,
        biografiSingkat: p.biografiSingkat,
      }))
    )
    .onConflictDoNothing({ target: pengarang.namaLatin });

  const tersimpan = await db
    .select({ id: pengarang.id, namaLatin: pengarang.namaLatin })
    .from(pengarang);
  const idByNama = new Map(tersimpan.map((b) => [b.namaLatin, b.id]));

  return new Map(
    pengarangList.map((p) => [
      p.id,
      wajib(
        idByNama.get(p.namaLatin),
        `Pengarang ${p.namaLatin} tidak berhasil tersimpan ke tabel pengarang.`
      ),
    ])
  );
}

async function seedKitab(
  idKategori: Map<string, string>,
  idPengarang: Map<string, string>
) {
  const rows = kitabList.map((k) => {
    const kategoriId = wajib(
      idKategori.get(k.kategoriId),
      `Kitab ${k.slug} merujuk fan ${k.kategoriId} yang tidak ada dalam daftar kategori.`
    );
    const pengarangId = wajib(
      idPengarang.get(k.pengarangId),
      `Kitab ${k.slug} merujuk pengarang ${k.pengarangId} yang tidak ada dalam daftar.`
    );
    const syarahId = k.syarahId
      ? wajib(
          idPengarang.get(k.syarahId),
          `Kitab ${k.slug} merujuk syarah ${k.syarahId} yang tidak ada dalam daftar.`
        )
      : null;

    return {
      judulLatin: k.judulLatin,
      judulArab: k.judulArab,
      slug: k.slug,
      deskripsi: k.deskripsi,
      kategoriId,
      pengarangId,
      syarahId,
      tahunTerbit: k.tahunTerbit,
      jumlahHalaman: k.jumlahHalaman,
      urlSampul: k.urlSampul,
      urlPdf: urlPdf(k.slug),
      ukuranPdfByte: k.ukuranPdfByte,
      status: k.status,
      jumlahDibuka: k.jumlahDibuka,
      createdAt: new Date(k.createdAt),
      updatedAt: new Date(k.updatedAt),
    };
  });

  await db.insert(kitab).values(rows).onConflictDoNothing({ target: kitab.slug });

  return rows.length;
}

async function main() {
  console.log(await angkatAdminDariEnv());

  const idKategori = await seedKategori();
  const idPengarang = await seedPengarang();
  const diproses = await seedKitab(idKategori, idPengarang);

  const [fan, peng, kb] = await Promise.all([
    db.select({ id: kategori.id }).from(kategori),
    db.select({ id: pengarang.id }).from(pengarang),
    db.select({ id: kitab.id, status: kitab.status }).from(kitab),
  ]);

  const tayang = kb.filter((b) => b.status === "published").length;
  console.log(
    `Seed selesai: ${fan.length} fan ilmu, ${peng.length} pengarang & syarah, ${kb.length} kitab tersimpan (${diproses} diproses dari Bab 9, ${tayang} berstatus published).`
  );
}

main().catch((error) => {
  console.error("Seed gagal:", error);
  process.exit(1);
});
