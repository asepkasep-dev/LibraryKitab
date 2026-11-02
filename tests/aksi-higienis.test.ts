import assert from "node:assert/strict"
import { test } from "node:test"
import { slugify } from "../src/lib/format"
import { skemaKategori, skemaPengarang, skemaProfil } from "../src/lib/validasi"
import { MAKS_ISI_CATATAN, MAKS_LABEL_BOOKMARK, skemaIsiCatatan, skemaLabelBookmark } from "../src/lib/baca"
import { pesanAman } from "../src/actions/tipe"

// Kunci gerbang validasi yang dipakai src/actions/baca.ts, kategori.ts,
// pengarang.ts, dan profil.ts sebelum nilai klien masuk query atau mutation,
// plus kontrak pesan yang dijamin src/actions/tipe.ts untuk keempat file itu.

function kategoriLengkap(ubah: Record<string, unknown> = {}) {
  return {
    nama: "Nahwu dan Sharaf",
    slug: slugify("Nahwu dan Sharaf"),
    deskripsi: "Kaidah i'rab dan perubahan bentuk kata dalam bahasa Arab.",
    ...ubah,
  }
}

function pengarangLengkap(ubah: Record<string, unknown> = {}) {
  return {
    namaArab: "النحوي",
    namaLatin: "Imam an-Nahwi",
    tahunWafat: "723 H / 1323 M",
    biografiSingkat: "Ulama bashrah yang menyusun dasar ilmu nahwu untuk santri.",
    ...ubah,
  }
}

function profilLengkap(ubah: Record<string, unknown> = {}) {
  return {
    namaLengkap: "Ahmad Fatih",
    jenisPeran: "santri",
    kelas: "Liwan 3",
    fontSizePreferensi: 18,
    modeReader: "gelap",
    ...ubah,
  }
}

test("kategori: bentuk kiriman aksi simpanKategori lolos sebelum query", () => {
  const hasil = skemaKategori.safeParse(kategoriLengkap())
  assert.equal(hasil.success, true)
  if (hasil.success) assert.equal(hasil.data.slug, "nahwu-dan-sharaf")

  // Slug custom dipaksa lewat slugify yang sama dengan aksi, bukan dari klien mentah.
  assert.equal(skemaKategori.safeParse(kategoriLengkap({ slug: "Tasrif #1" })).success, false)
  assert.equal(skemaKategori.safeParse(kategoriLengkap({ slug: slugify("Tasrif #1") })).success, true)
})

test("kategori: nilai non-teks dan terlalu pendek berhenti sebelum mutation", () => {
  assert.equal(skemaKategori.safeParse(kategoriLengkap({ nama: 123 })).success, false)
  assert.equal(skemaKategori.safeParse(kategoriLengkap({ nama: "ab" })).success, false)
  assert.equal(skemaKategori.safeParse(kategoriLengkap({ deskripsi: "x".repeat(19) })).success, false)
  assert.equal(skemaKategori.safeParse(kategoriLengkap({ deskripsi: "x".repeat(401) })).success, false)
})

test("pengarang: batas biografi dan nama dijaga sebelum ubahPengarang", () => {
  assert.equal(skemaPengarang.safeParse(pengarangLengkap()).success, true)
  assert.equal(skemaPengarang.safeParse(pengarangLengkap({ biografiSingkat: "x".repeat(29) })).success, false)
  assert.equal(skemaPengarang.safeParse(pengarangLengkap({ namaLatin: 7 })).success, false)
  assert.equal(
    skemaPengarang.safeParse(pengarangLengkap({ namaArab: "ا".repeat(121) })).success,
    false,
  )
})

test("profil: peran klien hanya santri atau ustadz, kenaikan hak mustahil lewat form", () => {
  const hasil = skemaProfil.safeParse(profilLengkap())
  assert.equal(hasil.success, true)

  assert.equal(skemaProfil.safeParse(profilLengkap({ jenisPeran: "admin" })).success, false)
  assert.equal(skemaProfil.safeParse(profilLengkap({ jenisPeran: "member" })).success, false)
  assert.equal(skemaProfil.safeParse(profilLengkap({ modeReader: "terang" })).success, false)

  // Kunci tambahan dari klien dibuang skema, jadi tidak ikut ke UPDATE.
  const denganSisipan = skemaProfil.parse({ ...profilLengkap(), role: "admin", id: "x" })
  assert.equal("role" in denganSisipan, false)
  assert.equal("id" in denganSisipan, false)
})

test("profil: ukuran huruf dan panjang nama punya batas tegas", () => {
  assert.equal(skemaProfil.safeParse(profilLengkap({ fontSizePreferensi: 13 })).success, false)
  assert.equal(skemaProfil.safeParse(profilLengkap({ fontSizePreferensi: 25 })).success, false)
  assert.equal(skemaProfil.safeParse(profilLengkap({ fontSizePreferensi: 18.5 })).success, false)
  assert.equal(skemaProfil.safeParse(profilLengkap({ fontSizePreferensi: "18" })).success, false)
  assert.equal(skemaProfil.safeParse(profilLengkap({ namaLengkap: "ab" })).success, false)
  assert.equal(skemaProfil.safeParse(profilLengkap({ namaLengkap: "a".repeat(81) })).success, false)
})

test("baca: label bookmark boleh kosong, isi catatan dibatas MAKS_ISI_CATATAN", () => {
  // Aksi tambahBookmark mengirim label ?? "" ke skema yang sama.
  assert.equal(skemaLabelBookmark.safeParse("").success, true)
  assert.equal(skemaLabelBookmark.safeParse("a".repeat(MAKS_LABEL_BOOKMARK)).success, true)
  assert.equal(skemaLabelBookmark.safeParse("a".repeat(MAKS_LABEL_BOOKMARK + 1)).success, false)
  assert.equal(skemaLabelBookmark.safeParse(42).success, false)

  assert.equal(skemaIsiCatatan.safeParse("ab").success, false)
  assert.equal(skemaIsiCatatan.safeParse("abc").success, true)
  assert.equal(skemaIsiCatatan.safeParse("x".repeat(MAKS_ISI_CATATAN + 1)).success, false)
  assert.equal(skemaIsiCatatan.parse("  catatan ruang  "), "catatan ruang")
})

test("pesanAman: pesan penjaga sesi lolos utuh, kegagalan teknis diringkas", () => {
  assert.equal(
    pesanAman(new Error("Sesi Anda berakhir. Silakan masuk kembali.")),
    "Sesi Anda berakhir. Silakan masuk kembali."
  )
  assert.equal(
    pesanAman(new Error("Kitab ini belum tayang atau sudah dipindahkan ke rak arsip.")),
    "Kitab ini belum tayang atau sudah dipindahkan ke rak arsip."
  )

  const asli = console.error
  const ditulis: string[] = []
  console.error = (...args: unknown[]) => {
    ditulis.push(args.map(String).join(" "))
  }
  try {
    // Nilai non-Error (mis. string lemparan tak terduga) tidak boleh mentah ke layar.
    assert.equal(pesanAman("gagal diam-diam"), "Belum berhasil menyimpan. Silakan coba lagi.")
    const teknis = new Error("Cannot read properties of undefined (reading 'trim')")
    teknis.name = "TypeError"
    assert.equal(pesanAman(teknis, "Fan belum tersimpan. Ulangi sebentar."), "Fan belum tersimpan. Ulangi sebentar.")
    assert.ok(ditulis.length > 0, "kegagalan teknis wajib dicatat di server")
    assert.doesNotMatch(ditulis.join(" "), /@/)
  } finally {
    console.error = asli
  }
})
