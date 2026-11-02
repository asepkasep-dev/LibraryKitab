import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import { test } from "node:test"
import { bacaTandaBerkas, buatTandaBerkas, type MetaBerkasPdf } from "../src/lib/tanda-berkas"

/**
 * Test src/lib/tanda-berkas.ts: bukti hasil unggah PDF ber-HMAC.
 * Fokus pada sifat keamanan yang dijanjikan: hanya nilai dari unggahan
 * sungguhan yang terbaca, hanya untuk kitab yang jadi sasarannya, sisanya
 * menghasilkan null (gagal tertutup).
 */

const KUNCI_A = "kunci-hmac-uji-A-0123456789"
const KUNCI_B = "kunci-hmac-uji-B-9876543210"

// Nilai waktu kelipatan 1000 supaya floor(ms/1000) pada masa berlaku tidak berubah.
const SEKARANG = 1_700_000_000_000
const MASA_UJI_DETIK = 3600

const ID_KITAB = "0f1c2b3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d"
const ID_KITAB_LAIN = "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d"

const META: MetaBerkasPdf = {
  kitabId: null,
  path: "pdf/tafsir-al-jalalain-ab12cd34.pdf",
  byte: 5_242_880,
  halaman: 120,
}

/** Bentuk muatan di dalam payload. Meniru tipe Muatan internal modul. */
type MuatanTanda = MetaBerkasPdf & { kedaluwarsa: number }

type KunciEnv = "BUNNY_STORAGE_ACCESS_KEY" | "TANDA_BERKAS_MASA_DETIK"

const KEKUNCI_ENV: KunciEnv[] = ["BUNNY_STORAGE_ACCESS_KEY", "TANDA_BERKAS_MASA_DETIK"]

/**
 * process.env dibagi antar test dalam satu proses, jadi setiap test wajib
 * mengembalikan nilai asli. Pola mengikuti tests/bunny-url.test.ts.
 */
function denganEnv<T>(isi: Partial<Record<KunciEnv, string>>, jalankan: () => T): T {
  const semula = new Map<KunciEnv, string | undefined>(
    KEKUNCI_ENV.map((kunci) => [kunci, process.env[kunci]])
  )
  for (const kunci of KEKUNCI_ENV) delete process.env[kunci]
  Object.assign(process.env, isi)

  try {
    return jalankan()
  } finally {
    for (const [kunci, nilai] of semula) {
      if (nilai === undefined) delete process.env[kunci]
      else process.env[kunci] = nilai
    }
  }
}

/**
 * Menandatangani muatan sendiri dengan kunci yang sama seperti modul,
 * dipakai untuk kasus yang tidak bisa lahir dari buatTandaBerkas
 * (misalnya jalur di luar pdf/ atau bilangan di luar rentang).
 */
function tandaUntukMuatan(muatan: MuatanTanda, kunci: string): string {
  const payload = Buffer.from(JSON.stringify(muatan), "utf8").toString("base64url")
  const tanda = createHmac("sha256", kunci).update(payload).digest("base64url")
  return `${payload}.${tanda}`
}

function kedaluwarsaUji(): number {
  return Math.floor(SEKARANG / 1000) + MASA_UJI_DETIK
}

/** Semua kasus di bawah memakai masa berlaku uji yang sama. */
const ENV_UJI = { BUNNY_STORAGE_ACCESS_KEY: KUNCI_A, TANDA_BERKAS_MASA_DETIK: String(MASA_UJI_DETIK) }

test("bolak-balik: tanda baru terbaca kembali dengan nilai yang sama", () => {
  denganEnv(ENV_UJI, () => {
    const token = buatTandaBerkas(META, SEKARANG)
    assert.deepEqual(bacaTandaBerkas(token, null, SEKARANG), META)
  })
})

test("muatan diubah tanpa menandatangani ulang ditolak", () => {
  denganEnv(ENV_UJI, () => {
    const token = buatTandaBerkas(META, SEKARANG)
    const [payload, tanda] = token.split(".")

    const muatan = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as MuatanTanda
    muatan.halaman += 1

    const payloadBaru = Buffer.from(JSON.stringify(muatan), "utf8").toString("base64url")
    const tokenPalsu = `${payloadBaru}.${tanda}`

    // Kasus inti: jumlah halaman dari formulir admin tidak dipercaya lagi,
    // hanya bukti bertanda tangan yang boleh memasok angka ini.
    assert.equal(bacaTandaBerkas(tokenPalsu, null, SEKARANG), null)

    // Bukti penolakan berasal dari perubahan muatan, bukan hal lain:
    // token asli masih terbaca pada saat yang sama.
    assert.deepEqual(bacaTandaBerkas(token, null, SEKARANG), META)
  })
})

test("tanda dibuat dengan kunci A lalu dibaca dengan kunci B ditolak", () => {
  const token = denganEnv({ BUNNY_STORAGE_ACCESS_KEY: KUNCI_A }, () =>
    buatTandaBerkas(META, SEKARANG)
  )
  denganEnv({ BUNNY_STORAGE_ACCESS_KEY: KUNCI_B }, () => {
    assert.equal(bacaTandaBerkas(token, null, SEKARANG), null)
  })
})

test("token kedaluwarsa ditolak, sebelum itu masih diterima", () => {
  denganEnv(ENV_UJI, () => {
    const token = buatTandaBerkas(META, SEKARANG)
    const batas = SEKARANG + MASA_UJI_DETIK * 1000

    assert.deepEqual(bacaTandaBerkas(token, null, batas - 1), META)
    // Perbandingan memakai <=, jadi tepat di detik kedaluwarsa sudah ditolak.
    assert.equal(bacaTandaBerkas(token, null, batas), null)
    assert.equal(bacaTandaBerkas(token, null, batas + 1), null)
  })
})

test("masa berlaku baku tiga jam saat TANDA_BERKAS_MASA_DETIK tidak diisi", () => {
  const TIGA_JAM_DETIK = 3 * 60 * 60
  denganEnv({ BUNNY_STORAGE_ACCESS_KEY: KUNCI_A }, () => {
    const token = buatTandaBerkas(META, SEKARANG)
    const batas = SEKARANG + TIGA_JAM_DETIK * 1000
    assert.deepEqual(bacaTandaBerkas(token, null, batas - 1), META)
    assert.equal(bacaTandaBerkas(token, null, batas + 1), null)
  })
})

test("jalur di luar direktori pdf ditolak walau tanda tangannya sah", () => {
  denganEnv(ENV_UJI, () => {
    const kedaluwarsa = kedaluwarsaUji()
    const jalurBahaya = [
      "sampul/x.jpg",
      "../pdf/x.pdf",
      "pdf/a%2Fb.pdf",
      "pdf/../../etc/passwd.pdf",
      "pdf/sarat/spasi.pdf",
      "PDF/naik-direktori-induk.pdf",
      "pdf/rahasia.pdf.pdf.txt",
    ]
    for (const path of jalurBahaya) {
      const token = tandaUntukMuatan(
        { kitabId: null, path, byte: META.byte, halaman: 10, kedaluwarsa },
        KUNCI_A
      )
      assert.equal(bacaTandaBerkas(token, null, SEKARANG), null, `jalur harus ditolak: ${path}`)
    }

    // Kontrol: muatan identik dengan jalur aman dan kunci sama diterima,
    // bukti penolakan di atas memang karena jalur, bukan tanda tangan.
    const tokenAman = tandaUntukMuatan({ ...META, kedaluwarsa }, KUNCI_A)
    assert.deepEqual(bacaTandaBerkas(tokenAman, null, SEKARANG), META)
  })
})

test("halaman 0, 5001, dan bukan bilangan bulat ditolak", () => {
  denganEnv(ENV_UJI, () => {
    const kedaluwarsa = kedaluwarsaUji()
    for (const halaman of [0, 5001, 2.5, -7]) {
      const token = tandaUntukMuatan(
        { kitabId: null, path: META.path, byte: 4096, halaman, kedaluwarsa },
        KUNCI_A
      )
      assert.equal(bacaTandaBerkas(token, null, SEKARANG), null, `halaman ${halaman} harus ditolak`)
    }

    // Batas luar rentang sah: 1 dan 5000 harus tetap diterima.
    for (const halaman of [1, 5000]) {
      const token = tandaUntukMuatan(
        { kitabId: null, path: META.path, byte: 4096, halaman, kedaluwarsa },
        KUNCI_A
      )
      assert.deepEqual(bacaTandaBerkas(token, null, SEKARANG), { ...META, byte: 4096, halaman })
    }
  })
})

test("byte 0 dan negatif ditolak", () => {
  denganEnv(ENV_UJI, () => {
    const kedaluwarsa = kedaluwarsaUji()
    for (const byte of [0, -1, -5_242_880]) {
      const token = tandaUntukMuatan(
        { kitabId: null, path: META.path, byte, halaman: 10, kedaluwarsa },
        KUNCI_A
      )
      assert.equal(bacaTandaBerkas(token, null, SEKARANG), null, `byte ${byte} harus ditolak`)
    }

    const token = tandaUntukMuatan(
      { kitabId: null, path: META.path, byte: 1, halaman: 10, kedaluwarsa },
      KUNCI_A
    )
    assert.deepEqual(bacaTandaBerkas(token, null, SEKARANG), { ...META, byte: 1, halaman: 10 })
  })
})

test("kunci kosong: buatTandaBerkas melempar, bacaTandaBerkas gagal tertutup", () => {
  const token = denganEnv({ BUNNY_STORAGE_ACCESS_KEY: KUNCI_A }, () =>
    buatTandaBerkas(META, SEKARANG)
  )
  denganEnv({}, () => {
    assert.throws(
      () => buatTandaBerkas(META, SEKARANG),
      (error: unknown) =>
        error instanceof Error &&
        error.message.includes("BUNNY_STORAGE_ACCESS_KEY") &&
        /belum diisi/i.test(error.message),
      "Pesan error harus berbahasa Indonesia dan menyebut nama variabelnya."
    )
    // Membaca tanpa kunci tidak boleh melempar, cukup menolak.
    assert.equal(bacaTandaBerkas(token, null, SEKARANG), null)
  })
})

test("kunci di bawah 16 karakter dianggap tidak ada", () => {
  const token = denganEnv({ BUNNY_STORAGE_ACCESS_KEY: KUNCI_A }, () =>
    buatTandaBerkas(META, SEKARANG)
  )
  denganEnv({ BUNNY_STORAGE_ACCESS_KEY: "pendek12345" }, () => {
    assert.throws(() => buatTandaBerkas(META, SEKARANG), Error)
    assert.equal(bacaTandaBerkas(token, null, SEKARANG), null)
  })
})

test("token acak dan bentuk tidak lengkap ditolak tanpa melempar", () => {
  denganEnv(ENV_UJI, () => {
    assert.equal(bacaTandaBerkas("", null, SEKARANG), null)
    assert.equal(bacaTandaBerkas("bukan-token", null, SEKARANG), null)
    assert.equal(bacaTandaBerkas("abc.", null, SEKARANG), null)
    assert.equal(bacaTandaBerkas(".def", null, SEKARANG), null)

    // Payload bukan JSON yang diacak tapi ditandatangani sah: tetap null,
    // karena JSON.parse gagal lebih dulu.
    const payloadAcak = Buffer.from("bukan-json", "utf8").toString("base64url")
    const tanda = createHmac("sha256", KUNCI_A).update(payloadAcak).digest("base64url")
    assert.equal(bacaTandaBerkas(`${payloadAcak}.${tanda}`, null, SEKARANG), null)

    // Kontrol positif agar setup tidak diam-diam rusak.
    const token = buatTandaBerkas(META, SEKARANG)
    assert.deepEqual(bacaTandaBerkas(token, null, SEKARANG), META)
  })
})

test("token dengan segmen ekstra ditolak", () => {
  denganEnv(ENV_UJI, () => {
    const token = buatTandaBerkas(META, SEKARANG)
    // base64url tidak memuat titik, jadi tiga segmen berarti token dirakit ulang.
    assert.equal(bacaTandaBerkas(`${token}.${token.split(".")[1]}`, null, SEKARANG), null)
    assert.equal(bacaTandaBerkas(`${token}.`, null, SEKARANG), null)
    assert.deepEqual(bacaTandaBerkas(token, null, SEKARANG), META)
  })
})

test("bukti terikat pada kitabnya: id lain atau save kitab baru ditolak", () => {
  withEnvMeta({ ...META, kitabId: ID_KITAB }, (token) => {
    // Pemakaian sah: kitab sasaran yang sama.
    assert.deepEqual(bacaTandaBerkas(token, ID_KITAB, SEKARANG), { ...META, kitabId: ID_KITAB })

    // Pindah kitab: berkas milik A tidak bisa menempel di B.
    assert.equal(bacaTandaBerkas(token, ID_KITAB_LAIN, SEKARANG), null)

    // Dibawa ke formulir kitab baru.
    assert.equal(bacaTandaBerkas(token, null, SEKARANG), null)
  })
})

test("bukti untuk kitab baru tidak berlaku pada kitab yang sudah ada", () => {
  withEnvMeta(META, (token) => {
    assert.deepEqual(bacaTandaBerkas(token, null, SEKARANG), META)
    assert.equal(bacaTandaBerkas(token, ID_KITAB, SEKARANG), null)
  })
})

test("kitabId bukan string di dalam muatan ditolak tanpa melempar", () => {
  denganEnv(ENV_UJI, () => {
    const nilaiAsing = [123, true, [], {}, undefined]
    for (const kitabId of nilaiAsing) {
      const muatan = {
        kitabId,
        path: META.path,
        byte: META.byte,
        halaman: 10,
        kedaluwarsa: kedaluwarsaUji(),
      } as unknown as MuatanTanda
      const token = tandaUntukMuatan(muatan, KUNCI_A)
      assert.equal(bacaTandaBerkas(token, null, SEKARANG), null, `kitabId ${String(kitabId)}`)
      assert.equal(bacaTandaBerkas(token, ID_KITAB, SEKARANG), null)
    }

    // Kontrol: muatan yang sama dengan string id diterima pada sasaran yang benar.
    const sah = tandaUntukMuatan(
      { ...META, kitabId: ID_KITAB, kedaluwarsa: kedaluwarsaUji() },
      KUNCI_A
    )
    assert.deepEqual(bacaTandaBerkas(sah, ID_KITAB, SEKARANG), { ...META, kitabId: ID_KITAB })
  })
})

/** Membuat tanda untuk `meta`, lalu menjalankannya dalam env kunci uji. */
function withEnvMeta(meta: MetaBerkasPdf, jalankan: (token: string) => void) {
  denganEnv(ENV_UJI, () => {
    jalankan(buatTandaBerkas(meta, SEKARANG))
  })
}
