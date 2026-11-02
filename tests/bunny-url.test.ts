import assert from "node:assert/strict"
import { test } from "node:test"
import { cdnSiapPublikasi, unggahBerkas, urlBaca, urlPublik, urlTtd } from "../src/lib/bunny"

const HOST = "cdn.pustakakitab.id"
const PATH = "/pdf/tafsir-al-jalalain-ab12cd34.pdf"
const TERSIMPAN = `https://${HOST}${PATH}`
const SEKARANG = 1_700_000_000_000
const KEDALUWARSA_DETIK = 900

type KunciEnv =
  | "BUNNY_STORAGE_ZONE_NAME"
  | "BUNNY_STORAGE_ACCESS_KEY"
  | "BUNNY_STORAGE_REGION"
  | "BUNNY_CDN_HOSTNAME"
  | "BUNNY_CDN_TOKEN_KEY"
  | "BUNNY_SIGNED_URL_EXPIRY_SECONDS"

const KEKUNCI_ENV: KunciEnv[] = [
  "BUNNY_STORAGE_ZONE_NAME",
  "BUNNY_STORAGE_ACCESS_KEY",
  "BUNNY_STORAGE_REGION",
  "BUNNY_CDN_HOSTNAME",
  "BUNNY_CDN_TOKEN_KEY",
  "BUNNY_SIGNED_URL_EXPIRY_SECONDS",
]

/** Kunci Bunny dibersihkan per test supaya nilai dari .env tidak ikut terpakai. */
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

const KONFIG_CDN = {
  BUNNY_STORAGE_ZONE_NAME: "zona-katalog",
  BUNNY_STORAGE_ACCESS_KEY: "kunci-access-dummy",
  BUNNY_CDN_HOSTNAME: HOST,
  BUNNY_SIGNED_URL_EXPIRY_SECONDS: String(KEDALUWARSA_DETIK),
}

test("urlBaca null untuk url_pdf kosong tanpa membutuhkan konfigurasi Bunny", () => {
  denganEnv({}, () => {
    assert.equal(urlBaca(""), null)
    assert.equal(urlBaca("   "), null)
  })
})

test("urlBaca menandatangani url_pdf dengan token dan masa berlaku deterministik", () => {
  denganEnv({ ...KONFIG_CDN, BUNNY_CDN_TOKEN_KEY: "token-cdn-dummy" }, () => {
    const hasil = urlBaca(TERSIMPAN, SEKARANG)
    assert.ok(hasil)

    const hex = (Math.floor(SEKARANG / 1000) + KEDALUWARSA_DETIK).toString(16)
    assert.ok(hasil.startsWith(`https://${HOST}/${hex}${PATH}?token=`), hasil)
    assert.match(hasil, /token=[0-9a-f]{64}$/)
  })
})

test("urlBaca tanpa BUNNY_CDN_TOKEN_KEY mengembalikan url publik (perilaku khusus pengembangan)", () => {
  denganEnv({ ...KONFIG_CDN, BUNNY_CDN_TOKEN_KEY: "" }, () => {
    assert.equal(urlBaca(TERSIMPAN, SEKARANG), TERSIMPAN)
  })
})

test("urlBaca mengembalikan url dari host lain apa adanya", () => {
  denganEnv({ ...KONFIG_CDN, BUNNY_CDN_TOKEN_KEY: "token-cdn-dummy" }, () => {
    const milikHostLain = `https://cdn.pesantrenlain.id${PATH}`
    assert.equal(urlBaca(milikHostLain, SEKARANG), milikHostLain)
  })
})

test("urlBaca mengembalikan url tersimpan saat BUNNY_CDN_HOSTNAME belum diisi", () => {
  denganEnv(
    {
      BUNNY_STORAGE_ZONE_NAME: "zona-katalog",
      BUNNY_STORAGE_ACCESS_KEY: "kunci-access-dummy",
      BUNNY_CDN_TOKEN_KEY: "token-cdn-dummy",
    },
    () => {
      assert.equal(urlBaca(TERSIMPAN, SEKARANG), TERSIMPAN)
    }
  )
})

test("urlPublik dan urlTtd jalan tanpa kredensial storage zone", () => {
  denganEnv({ BUNNY_CDN_HOSTNAME: HOST }, () => {
    assert.equal(urlPublik("pdf/tafsir.pdf"), `https://${HOST}/pdf/tafsir.pdf`)
    // Tanpa token, URL dikembalikan apa adanya; yang diuji di sini adalah ia tidak melempar.
    assert.equal(urlTtd("pdf/tafsir.pdf", SEKARANG), `https://${HOST}/pdf/tafsir.pdf`)
  })

  denganEnv(
    {
      BUNNY_CDN_HOSTNAME: HOST,
      BUNNY_CDN_TOKEN_KEY: "token-cdn-dummy",
      BUNNY_SIGNED_URL_EXPIRY_SECONDS: String(KEDALUWARSA_DETIK),
    },
    () => {
      const hex = (Math.floor(SEKARANG / 1000) + KEDALUWARSA_DETIK).toString(16)
      const hasil = urlTtd(`/pdf/tafsir-al-jalalain-ab12cd34.pdf`, SEKARANG)
      assert.ok(hasil?.startsWith(`https://${HOST}/${hex}/pdf/tafsir-al-jalalain-ab12cd34.pdf?token=`), hasil)
      assert.match(hasil, /token=[0-9a-f]{64}$/)
    }
  )
})

test("unggahBerkas menolak lebih dulu dengan pesan storage, tanpa mencoba jaringan", async () => {
  const penolakan = denganEnv({ BUNNY_CDN_HOSTNAME: HOST }, () =>
    unggahBerkas("pdf/tafsir.pdf", new Uint8Array([1, 2]), "application/pdf"),
  )
  await assert.rejects(penolakan, /BUNNY_STORAGE_ZONE_NAME/)
})

test("cdnSiapPublikasi hanya memandang BUNNY_CDN_HOSTNAME", () => {
  denganEnv({ BUNNY_STORAGE_ZONE_NAME: "zona-katalog", BUNNY_STORAGE_ACCESS_KEY: "kunci" }, () => {
    assert.equal(cdnSiapPublikasi(), false)
  })
  denganEnv({ BUNNY_CDN_HOSTNAME: " " }, () => {
    assert.equal(cdnSiapPublikasi(), false)
  })
  denganEnv({ BUNNY_CDN_HOSTNAME: HOST }, () => {
    assert.equal(cdnSiapPublikasi(), true)
  })
})
