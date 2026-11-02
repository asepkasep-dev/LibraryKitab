import assert from "node:assert/strict"
import { test } from "node:test"
import {
  KEPERLUAN,
  PESAN_TIPE,
  skemaId,
  skemaKategori,
  skemaKitab,
  skemaPengarang,
  skemaPesanKontak,
  skemaProfil,
} from "../src/lib/validasi"
import { skemaIsiCatatan, skemaKitabHalaman, skemaLabelBookmark } from "../src/lib/baca"

const UUID = "6f0f6f9c-3f5e-4c1a-9b7a-2d5c8e1a4b77"

function dasarKitab(ubah: Record<string, unknown> = {}) {
  return {
    judulLatin: "Al-Adab Al-Mufrad",
    judulArab: "الأدب المفرد",
    kategoriId: UUID,
    pengarangId: UUID,
    syarahId: "",
    tahunTerbit: "1311 H",
    jumlahHalaman: 240,
    deskripsi:
      "Kumpulan hadis tentang adab sehari-hari beserta penjelasan para penyusun syarah kitab.",
    status: "draft",
    ...ubah,
  }
}

function pesanDasar(ubah: Record<string, unknown> = {}) {
  return {
    nama: "Abdullah",
    email: "abdullah@pesantren.id",
    keperluan: KEPERLUAN[3],
    subjek: "Usulan pemindaian kitab",
    pesan: "Kami punya koleksi kitab syafiiah yang layak dipindai bersama.",
    setujui: true,
    ...ubah,
  }
}

/** Mengambil pesan issue pertama agar test bisa mengunci teks Indonesia. */
function pesanError(hasil: { success: boolean; error?: { issues: { message: string }[] } }) {
  assert.equal(hasil.success, false)
  return hasil.error?.issues[0]?.message ?? ""
}

/* ------------------------------- skemaId ------------------------------ */

test("skemaId menolak uuid dengan panjang berbeda", () => {
  assert.equal(skemaId.safeParse(UUID + "a").success, false)
  assert.equal(skemaId.safeParse(UUID.slice(0, 30)).success, false)
  assert.equal(skemaId.safeParse(UUID.toUpperCase()).success, true, "Uuid huruf besar tetap uuid sah.")
})

/* ------------------------------ skemaKitab ---------------------------- */

test("judul latin dan arab wajib 3 karakter setelah spasi tepi dibuang", () => {
  assert.equal(pesanError(skemaKitab.safeParse(dasarKitab({ judulLatin: "ab" }))), "Judul Latin minimal 3 karakter.")
  assert.equal(skemaKitab.safeParse(dasarKitab({ judulLatin: "  abc  " })).success, true)
  assert.equal(skemaKitab.safeParse(dasarKitab({ judulArab: "ab" })).success, false)
  assert.equal(skemaKitab.safeParse(dasarKitab({ judulLatin: "x".repeat(161) })).success, false)
})

test("deskripsi wajib 40 karakter agar katalog informatif", () => {
  assert.equal(
    pesanError(skemaKitab.safeParse(dasarKitab({ deskripsi: "K".repeat(39) }))),
    "Deskripsi minimal 40 karakter agar katalog informatif.",
  )
  assert.equal(skemaKitab.safeParse(dasarKitab({ deskripsi: "K".repeat(40) })).success, true)
  assert.equal(skemaKitab.safeParse(dasarKitab({ deskripsi: "K".repeat(2001) })).success, false)
})

test("tahun terbit wajib diisi minimal 2 karakter dan dibatasi 40", () => {
  assert.equal(skemaKitab.safeParse(dasarKitab({ tahunTerbit: "7" })).success, false)
  assert.equal(skemaKitab.safeParse(dasarKitab({ tahunTerbit: "± 720 H" })).success, true)
  assert.equal(skemaKitab.safeParse(dasarKitab({ tahunTerbit: "x".repeat(41) })).success, false)
})

test("jumlah halaman wajib bulat antara 1 dan 5000", () => {
  assert.equal(pesanError(skemaKitab.safeParse(dasarKitab({ jumlahHalaman: 0 }))), "Jumlah halaman minimal 1.")
  assert.equal(skemaKitab.safeParse(dasarKitab({ jumlahHalaman: 1 })).success, true)
  assert.equal(skemaKitab.safeParse(dasarKitab({ jumlahHalaman: 5000 })).success, true)
  assert.equal(skemaKitab.safeParse(dasarKitab({ jumlahHalaman: 5001 })).success, false)
  assert.equal(skemaKitab.safeParse(dasarKitab({ jumlahHalaman: 240.5 })).success, false)
  assert.equal(skemaKitab.safeParse(dasarKitab({ jumlahHalaman: "240" })).success, false)
})

test("status pada skemaKitab menolak nilai di luar tiga pilihan", () => {
  for (const status of ["draft", "published", "archived"]) {
    assert.equal(skemaKitab.safeParse(dasarKitab({ status })).success, true)
  }
  assert.equal(skemaKitab.safeParse(dasarKitab({ status: "terbit" })).success, false)
  assert.equal(skemaKitab.safeParse(dasarKitab({ status: "" })).success, false)
})

test("syarahId menerima string kosong dan uuid penuh tapi menolak bentuk lain", () => {
  assert.equal(skemaKitab.safeParse(dasarKitab({ syarahId: "" })).success, true)
  assert.equal(skemaKitab.safeParse(dasarKitab({ syarahId: UUID })).success, true)
  assert.equal(skemaKitab.safeParse(dasarKitab({ syarahId: " " })).success, false)
  assert.equal(skemaKitab.safeParse(dasarKitab({ syarahId: null })).success, false)
})

/* --------------------------- skemaPesanKontak -------------------------- */

test("pesan kontak yang lengkap dan sah lolos", () => {
  assert.equal(skemaPesanKontak.safeParse(pesanDasar()).success, true)
})

test("setiap keperluan bawaan diterima pesan kontak", () => {
  for (const keperluan of KEPERLUAN) {
    assert.equal(skemaPesanKontak.safeParse(pesanDasar({ keperluan })).success, true)
  }
  assert.equal(skemaPesanKontak.safeParse(pesanDasar({ keperluan: "" })).success, false)
})

test("nama, subjek, dan pesan dihormati batas karakternya", () => {
  assert.equal(pesanError(skemaPesanKontak.safeParse(pesanDasar({ nama: "ab" }))), "Tulis nama Anda minimal 3 karakter.")
  assert.equal(skemaPesanKontak.safeParse(pesanDasar({ nama: "x".repeat(81) })).success, false)
  assert.equal(pesanError(skemaPesanKontak.safeParse(pesanDasar({ subjek: "abcd" }))), "Subjek minimal 5 karakter.")
  assert.equal(skemaPesanKontak.safeParse(pesanDasar({ subjek: "x".repeat(121) })).success, false)
  assert.equal(
    pesanError(skemaPesanKontak.safeParse(pesanDasar({ pesan: "C".repeat(19) }))),
    "Ceritakan kebutuhan Anda minimal 20 karakter.",
  )
  assert.equal(skemaPesanKontak.safeParse(pesanDasar({ pesan: "C".repeat(1201) })).success, false)
})

test("email divalidasi dan pesan salahnya memakai contoh lokal", () => {
  assert.equal(
    pesanError(skemaPesanKontak.safeParse(pesanDasar({ email: "bukan-email" }))),
    "Format email belum benar, contoh: nama@pesantren.id",
  )
  assert.equal(
    pesanError(skemaPesanKontak.safeParse(pesanDasar({ email: "   " }))),
    "Email wajib diisi agar kami bisa membalas.",
  )
  assert.equal(skemaPesanKontak.safeParse(pesanDasar({ email: "pengelola@alkitabku.sch.id" })).success, true)
})

test("persetujuan penggunaan data wajib dicentang", () => {
  assert.equal(
    pesanError(skemaPesanKontak.safeParse(pesanDasar({ setujui: false }))),
    "Centang persetujuan penggunaan data Anda.",
  )
})

/* --------------------- pesan saat tipe nilai salah -------------------- */

function dasarKategori(ubah: Record<string, unknown> = {}) {
  return {
    nama: "Nahwu",
    slug: "nahwu",
    deskripsi: "Kaidah perubahan bentuk kata dan kedudukan i'rab dalam bahasa Arab.",
    ...ubah,
  }
}

function dasarPengarang(ubah: Record<string, unknown> = {}) {
  return {
    namaArab: "النحوي",
    namaLatin: "Imam an-Nahwi",
    tahunWafat: "723 H",
    biografiSingkat: "Ulama bashrah yang meletakkan dasar ilmu nahwu untuk santri pemula.",
    ...ubah,
  }
}

function dasarProfil(ubah: Record<string, unknown> = {}) {
  return {
    namaLengkap: "Ahmad Fatih",
    jenisPeran: "santri",
    kelas: "Liwan 3",
    fontSizePreferensi: 18,
    modeReader: "gelap",
    ...ubah,
  }
}

test("nilai bertipe salah berhenti dengan pesan Indonesia", () => {
  // Tanpa pesan di level tipe, Zod membalas "Invalid input: expected string,
  // received number". pesanAman mengambil issue pertama apa adanya, sehingga
  // teks Inggris itu muncul di toast dan melanggar aturan bahasa AGENTS.md.
  assert.equal(pesanError(skemaKitab.safeParse(dasarKitab({ judulLatin: 7 }))), PESAN_TIPE)
  assert.equal(pesanError(skemaKategori.safeParse(dasarKategori({ nama: 123 }))), PESAN_TIPE)
  assert.equal(pesanError(skemaPengarang.safeParse(dasarPengarang({ namaArab: 5 }))), PESAN_TIPE)
  assert.equal(pesanError(skemaProfil.safeParse(dasarProfil({ namaLengkap: 1 }))), PESAN_TIPE)
  assert.equal(pesanError(skemaLabelBookmark.safeParse(42)), PESAN_TIPE)
  assert.equal(pesanError(skemaIsiCatatan.safeParse(42)), PESAN_TIPE)
  assert.equal(
    pesanError(skemaKitabHalaman.safeParse({ kitabId: UUID, halaman: "12" })),
    PESAN_TIPE,
  )
})

test("enum dan check tanpa pesan lokal sudah dilengkapi teks Indonesia", () => {
  // skemaKitab.status dulu memakai z.enum tanpa pesan sehingga "Invalid option"
  // berbahasa Inggris bisa sampai ke klien.
  assert.equal(
    pesanError(skemaKitab.safeParse(dasarKitab({ status: 5 }))),
    "Status kitab tidak dikenali.",
  )
  assert.equal(
    pesanError(skemaKitab.safeParse(dasarKitab({ jumlahHalaman: "40" }))),
    "Jumlah halaman harus berupa angka.",
  )
  assert.equal(
    pesanError(skemaKitabHalaman.safeParse({ kitabId: UUID, halaman: 0 })),
    "Nomor halaman dimulai dari 1.",
  )
  assert.equal(
    pesanError(skemaPesanKontak.safeParse({ ...pesanDasar(), setujui: undefined })),
    "Centang persetujuan penggunaan data Anda.",
  )
})

test("tidak ada satu pun skema yang mengembalikan pesan bawaan Zod", () => {
  const skema: [unknown, Record<string, unknown>][] = [
    [skemaKitab, dasarKitab({ judulLatin: 7, status: 9, jumlahHalaman: "x", deskripsi: 1 })],
    [skemaKategori, dasarKategori({ nama: 1, slug: 2, deskripsi: 3 })],
    [skemaPengarang, dasarPengarang({ namaArab: 1, namaLatin: 2, tahunWafat: 3, biografiSingkat: 4 })],
    [skemaProfil, dasarProfil({ namaLengkap: 1, kelas: 2, fontSizePreferensi: "18" })],
    [skemaPesanKontak, pesanDasar({ nama: 1, email: 2, subjek: 3, pesan: 4, keperluan: 5 })],
  ]
  const polaInggris = /invalid|expected|too (small|large)|must be|received/i
  for (const [schema, muatan] of skema) {
    const hasil = (schema as { safeParse(nilai: unknown): { success: boolean; error?: unknown } })
      .safeParse(muatan) as { success: boolean; error?: { issues: { message: string }[] } }
    assert.equal(hasil.success, false)
    for (const issue of hasil.error?.issues ?? []) {
      assert.doesNotMatch(issue.message, polaInggris, `Pesan masih bahasa Inggris: ${issue.message}`)
    }
  }
})
