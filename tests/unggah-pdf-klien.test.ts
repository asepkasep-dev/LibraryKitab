import assert from "node:assert/strict"
import { test } from "node:test"
import {
  bacaResponsUnggah,
  buatMuatanPdf,
  persenProgres,
  validasiBerkasPdf,
} from "../src/lib/unggah-pdf-klien"

const pdf = (nama = "alfiyah.pdf", byte = 1024) =>
  new File([new Uint8Array(byte)], nama, { type: "application/pdf" })

test("validasiBerkasPdf menerima PDF berdasarkan mime", () => {
  assert.equal(validasiBerkasPdf(pdf(), 150), null)
})

test("validasiBerkasPdf menerima berkas tanpa mime PDF tetapi berekstensi .pdf", () => {
  const aneh = new File([new Uint8Array(10)], "KITAB.PDF", { type: "" })
  assert.equal(validasiBerkasPdf(aneh, 150), null)
})

test("validasiBerkasPdf menolak format lain dengan pesan Indonesia", () => {
  const salah = new File([new Uint8Array(10)], "kitab.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
  assert.deepEqual(validasiBerkasPdf(salah, 150), {
    judul: "Format berkas tidak didukung",
    deskripsi: "Unggah berkas berformat PDF.",
  })
})

test("validasiBerkasPdf menolak berkas di atas batas ukuran", () => {
  const besar = pdf("gede.pdf", 3 * 1024 * 1024)
  assert.deepEqual(validasiBerkasPdf(besar, 2), {
    judul: "Berkas terlalu besar",
    deskripsi: "Maksimal 2 MB, ukuran berkas ini 3 MB.",
  })
})

test("validasiBerkasPdf menerima berkas tepat di batas", () => {
  assert.equal(validasiBerkasPdf(pdf("pas.pdf", 2 * 1024 * 1024), 2), null)
})

test("buatMuatanPdf mengirim berkas, slug, dan id kitab target", () => {
  const berkas = pdf()
  const muatan = buatMuatanPdf(berkas, "Alfiyah", "k-1")
  assert.equal(muatan.get("slug"), "Alfiyah")
  assert.equal(muatan.get("idKitab"), "k-1")
  assert.equal(muatan.get("berkas"), berkas)
})

test("buatMuatanPdf mengirim string kosong untuk kitab baru", () => {
  assert.equal(buatMuatanPdf(pdf(), "Alfiyah", "").get("idKitab"), "")
})

test("persenProgres membulatkan dan menahan diri saat total tidak diketahui", () => {
  assert.equal(persenProgres(512, 1024, true), 50)
  assert.equal(persenProgres(1, 3, true), 33)
  assert.equal(persenProgres(512, 0, false), null)
})

test("bacaResponsUnggah menerima balasan sehat dan memakai byte cadangan", () => {
  const hasil = bacaResponsUnggah(
    JSON.stringify({ ok: true, path: "kitab/alfiyah.pdf", halaman: 120, tanda: "sig" }),
    200,
    2048,
  )
  assert.deepEqual(hasil, {
    ok: true,
    berkas: { path: "kitab/alfiyah.pdf", byte: 2048, halaman: 120, tanda: "sig" },
  })
})

test("bacaResponsUnggah memakai byte dari server bila dikirim", () => {
  const hasil = bacaResponsUnggah(
    JSON.stringify({ ok: true, path: "p", byte: 4096, halaman: 9, tanda: "t" }),
    200,
    2048,
  )
  assert.deepEqual(hasil, { ok: true, berkas: { path: "p", byte: 4096, halaman: 9, tanda: "t" } })
})

for (const [label, teks, status, pesanHarapan] of [
  ["bukan JSON", "<html>502</html>", 502, "Unggahan gagal (502)."],
  ["ok false", JSON.stringify({ ok: false, pesan: "Maks 150 MB." }), 400, "Maks 150 MB."],
  ["tanpa tanda tangan", JSON.stringify({ ok: true, path: "p", halaman: 3 }), 200, "Unggahan gagal (200)."],
  ["tanpa path", JSON.stringify({ ok: true, tanda: "t", halaman: 3 }), 200, "Unggahan gagal (200)."],
  ["tanpa halaman", JSON.stringify({ ok: true, tanda: "t", path: "p" }), 200, "Unggahan gagal (200)."],
  [
    "status 500 tetapi body ok",
    JSON.stringify({ ok: true, path: "p", tanda: "t", halaman: 3 }),
    500,
    "Unggahan gagal (500).",
  ],
] as const) {
  test(`bacaResponsUnggah menolak balasan ${label} tanpa membocorkan detail teknis`, () => {
    const hasil = bacaResponsUnggah(teks, status, 10)
    assert.equal(hasil.ok, false)
    if (!hasil.ok) {
      assert.equal(
        hasil.pesan,
        pesanHarapan,
        "Pesan harus persis salah satu dari pesan server atau pesan status, supaya isi mentah balasan tidak pernah ikut terkirim ke layar.",
      )
    }
  })
}

test("bacaResponsUnggah memakai pesan server saat tersedia", () => {
  const hasil = bacaResponsUnggah(JSON.stringify({ ok: false, pesan: "Kunci Bunny belum diisi." }), 500, 1)
  assert.deepEqual(hasil, { ok: false, pesan: "Kunci Bunny belum diisi." })
})

test("bacaResponsUnggah memberi pesan status untuk balasan yang tidak bisa dibaca", () => {
  const hasil = bacaResponsUnggah("<html>502</html>", 502, 1)
  assert.deepEqual(hasil, { ok: false, pesan: "Unggahan gagal (502)." })
})
