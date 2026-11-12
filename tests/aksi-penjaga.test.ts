import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { test } from "node:test"

/**
 * Setiap server action tulis wajib membuka dirinya dengan penjaga sesi: `await`
 * pertama di dalam `try` harus memanggil `butuhAdminAksi` atau `butuhMemberAksi`.
 * Aturan ini selama ini hanya dijaga kebiasaan, dan aksi adalah satu-satunya
 * jalur tulis ke database. Aksi baru yang lupa satu baris akan tetap menulis
 * tanpa error, tanpa test yang merah, dan halaman admin tetap terlihat normal.
 *
 * Pemeriksaan ini membaca sumber, bukan memanggil kodenya, jadi ia gagal saat
 * penulisan, bukan saat penyalahgunaan.
 */

const PENJAGA = ["butuhAdminAksi", "butuhMemberAksi", "butuhAdmin", "butuhMember"]

/**
 * Aksi tanpa penjaga sesi, masing-masing dengan alasan. Butir baru wajib disertai
 * alasan yang bisa dibaca orang lain, bukan sekadar membuat test hijau.
 */
const DIKECUALIKAN: Record<string, string> = {
  perpanjangUrlBaca:
    "Reader boleh dibuka pengunjung anonim. Penyaringnya kitabTayangBySlug: kitab yang tidak tayang menghasilkan null sehingga aksi ini tidak menjadi jalan belakang ke naskah yang belum diterbitkan.",
}

function berkasAksi(): string[] {
  const dir = join(process.cwd(), "src", "actions")
  return readdirSync(dir)
    .filter((nama) => nama.endsWith(".ts"))
    .sort()
}

type Aksi = { nama: string; badan: string; berkas: string }

/**
 * Ambillah tubuh fungsi sebatas pasangan kurung kurawal aslinya. Titik mulainya
 * bukan kurung kurawal pertama setelah nama: tanda tangan boleh membawa nilai
 * bawaan (`berkas: BerkasKitab = {}`) atau tipe objek (`InputHalaman & { isi }`).
 * Karena itu daftar parameter ditutup lebih dulu, baru kurung kurawal berikutnya
 * dianggap pembuka tubuh.
 */
function tubuh(isi: string, dari: number) {
  let dalam = 0
  let i = isi.indexOf("(", dari)
  for (; i < isi.length; i++) {
    if (isi[i] === "(") dalam++
    else if (isi[i] === ")" && --dalam === 0) break
  }

  const buka = isi.indexOf("{", i + 1)
  dalam = 0
  for (let k = buka; k < isi.length; k++) {
    if (isi[k] === "{") dalam++
    else if (isi[k] === "}" && --dalam === 0) return isi.slice(buka, k + 1)
  }
  return isi.slice(buka)
}

function daftarAksi(isi: string, berkas: string): Aksi[] {
  const hasil: Aksi[] = []
  for (const cocok of isi.matchAll(/export async function (\w+)\s*\(/g)) {
    hasil.push({ nama: cocok[1], badan: tubuh(isi, cocok.index), berkas })
  }
  return hasil
}

function semuaAksi(): Aksi[] {
  return berkasAksi().flatMap((nama) =>
    daftarAksi(readFileSync(join(process.cwd(), "src", "actions", nama), "utf8"), `src/actions/${nama}`),
  )
}

test("pemindaian masih menemukan seluruh aksi tulis", () => {
  const daftar = semuaAksi()
  assert.ok(
    daftar.length >= 15,
    `Pemeriksaan ini kehilangan artinya bila hanya ${daftar.length} aksi yang terbaca; periksa bentuk export di src/actions.`,
  )
})

test("setiap server action dibuka oleh penjaga sesi sebelum satu tulisan pun", () => {
  const temuan: string[] = []
  for (const aksi of semuaAksi()) {
    if (DIKECUALIKAN[aksi.nama]) continue

    const awaitPertama = aksi.badan.match(/await\s+([\w$]+)\s*\(/)
    const penjaga = awaitPertama?.[1] ?? null
    if (!penjaga || !PENJAGA.includes(penjaga)) {
      temuan.push(`${aksi.berkas} → ${aksi.nama}: await pertama = ${penjaga ?? "(tidak ada await)"}`)
      continue
    }

    // Penjaga di luar `try` membuat penolakannya menjadi lemparan mentah ke
    // klien, bukan HasilAksi bertipe seperti yang diminta AGENTS.md.
    const coba = aksi.badan.indexOf("try {")
    const panggilan = aksi.badan.indexOf(`${penjaga}(`)
    if (coba === -1 || panggilan < coba) {
      temuan.push(`${aksi.berkas} → ${aksi.nama}: penjaga ${penjaga} berada di luar try`)
    }
  }

  assert.deepEqual(temuan, [], "Tambahkan penjaga sesi, atau kecualikan dengan alasan tertulis.")
})

test("daftar pengecualian tidak menua tanpa terasa", () => {
  const namaAksi = new Set(semuaAksi().map((a) => a.nama))
  const basi = Object.keys(DIKECUALIKAN).filter((nama) => !namaAksi.has(nama))
  assert.deepEqual(
    basi,
    [],
    "Aksi yang dikecualikan sudah tidak ada. Hapus butirnya, jangan dibiarkan menanggung pengecualian baru.",
  )
})
