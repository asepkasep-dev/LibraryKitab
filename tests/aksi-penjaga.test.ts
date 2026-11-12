import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"
import { test } from "node:test"
import ts from "typescript"

/**
 * Setiap server action tulis wajib membuka dirinya dengan penjaga sesi yang
 * tepat: `await` pertama di seluruh tubuh harus memanggil penjaga yang
 * dipetakan untuk aksi itu, dan berada di dalam blok `try`. Aksi adalah
 * satu-satunya jalur tulis ke database, dan aksi yang lupa satu baris tetap
 * menulis tanpa error, tanpa test yang merah, dan halaman admin tetap terlihat
 * normal.
 *
 * Sumber dibaca lewat AST, bukan regex, supaya penjaga di dalam komentar, di
 * dalam closure yang tidak pernah dipanggil, atau sesudah await lain tidak
 * terhitung. Pemeriksaan ini gagal saat penulisan, bukan saat penyalahgunaan.
 */

const ADMIN = "butuhAdminAksi"
const MEMBER = "butuhMemberAksi"

/**
 * Penjaga wajib per aksi, bukan satu daftar rata: aksi tulis pengelola yang
 * diturunkan ke penjaga anggota berarti setiap santri aktif boleh mengubah data
 * perpustakaan. Aksi baru wajib didaftarkan di sini sehingga test merah sampai
 * ada yang menyatakan siapa yang boleh memanggilnya.
 */
const WAJIB: Record<string, string> = {
  simpanKitab: ADMIN,
  gantiStatusKitab: ADMIN,
  hapusKitab: ADMIN,
  simpanKategori: ADMIN,
  hapusKategori: ADMIN,
  simpanPengarang: ADMIN,
  hapusPengarang: ADMIN,
  ubahStatusAnggota: ADMIN,
  ubahPeranAnggota: ADMIN,
  perbaruiProfilAksi: MEMBER,
  bukaSesiBaca: MEMBER,
  simpanProgresBacaAksi: MEMBER,
  tambahBookmark: MEMBER,
  hapusBookmarkHalaman: MEMBER,
  hapusBookmarkId: MEMBER,
  tambahCatatan: MEMBER,
  ubahCatatanIsi: MEMBER,
  hapusCatatanId: MEMBER,
}

/**
 * Aksi tanpa penjaga sesi. `penyaring` adalah panggilan yang wajib menjadi
 * await pertama sebagai ganti penjaga, jadi pengecualian tidak menjadi cek
 * kosong: alasan tertulisnya ikut diperiksa terhadap kode.
 */
const DIKECUALIKAN: Record<string, { alasan: string; penyaring: string }> = {
  perpanjangUrlBaca: {
    alasan:
      "Reader boleh dibuka pengunjung anonim. Kitab yang tidak tayang menghasilkan null sehingga aksi ini tidak menjadi jalan belakang ke naskah yang belum diterbitkan.",
    penyaring: "kitabTayangBySlug",
  },
}

const DIR_AKSI = join(process.cwd(), "src", "actions")

function berkasAksi(dir: string = DIR_AKSI): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entri) => {
      const penuh = join(dir, entri.name)
      if (entri.isDirectory()) return berkasAksi(penuh)
      return entri.name.endsWith(".ts") ? [penuh] : []
    })
    .sort()
}

type Aksi = { nama: string; label: string; tubuh: ts.Block }

function adaModifier(node: ts.HasModifiers, kind: ts.SyntaxKind) {
  return (ts.getModifiers(node) ?? []).some((m) => m.kind === kind)
}

/**
 * Bentuk export yang tidak bisa diperiksa dilaporkan, bukan dilewati. Tanpa
 * ini, aksi yang ditulis dengan bentuk baru hilang dari pemindaian dan test
 * tetap hijau sementara aksinya tidak pernah diperiksa.
 */
function bacaBerkas(path: string) {
  const label = relative(process.cwd(), path).replace(/\\/g, "/")
  const sf = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true)
  const aksi: Aksi[] = []
  const asing: string[] = []

  for (const node of sf.statements) {
    if (ts.isExportAssignment(node) || ts.isExportDeclaration(node)) {
      asing.push(`${label}: export default / export { } tidak dapat diperiksa`)
      continue
    }

    if (ts.isFunctionDeclaration(node)) {
      if (!adaModifier(node, ts.SyntaxKind.ExportKeyword)) continue
      if (!adaModifier(node, ts.SyntaxKind.AsyncKeyword)) continue
      if (!node.name || !node.body) {
        asing.push(`${label}: fungsi async tanpa nama atau tanpa tubuh`)
        continue
      }
      aksi.push({ nama: node.name.text, label, tubuh: node.body })
      continue
    }

    if (ts.isVariableStatement(node) && adaModifier(node, ts.SyntaxKind.ExportKeyword)) {
      for (const deklarasi of node.declarationList.declarations) {
        const nilai = deklarasi.initializer
        if (!nilai || (!ts.isArrowFunction(nilai) && !ts.isFunctionExpression(nilai))) continue
        if (!adaModifier(nilai, ts.SyntaxKind.AsyncKeyword)) continue
        const nama = deklarasi.name.getText(sf)
        if (!ts.isBlock(nilai.body)) {
          asing.push(`${label} → ${nama}: tubuh arrow bukan blok, tidak dapat diperiksa`)
          continue
        }
        aksi.push({ nama, label, tubuh: nilai.body })
      }
    }
  }

  return { aksi, asing }
}

function semuaAksi() {
  return berkasAksi().flatMap((path) => bacaBerkas(path).aksi)
}

/** Await pertama milik pernyataan ini; closure di dalamnya bukan milik aksi. */
function awaitPertama(node: ts.Node): ts.AwaitExpression | null {
  let hasil: ts.AwaitExpression | null = null
  const telusuri = (n: ts.Node) => {
    if (hasil) return
    if (ts.isAwaitExpression(n)) {
      hasil = n
      return
    }
    if (ts.isFunctionLike(n)) return
    ts.forEachChild(n, telusuri)
  }
  ts.forEachChild(node, telusuri)
  return hasil
}

function pemanggil(awaitnya: ts.AwaitExpression): string | null {
  const ungkapan = awaitnya.expression
  return ts.isCallExpression(ungkapan) && ts.isIdentifier(ungkapan.expression)
    ? ungkapan.expression.text
    : null
}

/**
 * Penjaga di luar `try` membuat penolakannya menjadi lemparan mentah ke klien,
 * bukan HasilAksi bertipe seperti yang diminta AGENTS.md. Yang dihitung hanya
 * blok `try` itu sendiri: `catch` dan `finally` bukan tempat membuka aksi.
 */
function tryPemilik(node: ts.Node, batas: ts.Node): ts.TryStatement | null {
  let anak = node
  for (let induk = node.parent; induk && induk !== batas; induk = induk.parent) {
    if (ts.isTryStatement(induk) && induk.tryBlock === anak) return induk
    anak = induk
  }
  return null
}

/** Catch yang tidak mengembalikan apa pun membiarkan penolakan penjaga lolos. */
function mengakhiri(node: ts.Node): boolean {
  let hasil = false
  const telusuri = (n: ts.Node) => {
    if (hasil) return
    if (ts.isReturnStatement(n) || ts.isThrowStatement(n)) {
      hasil = true
      return
    }
    if (ts.isFunctionLike(n)) return
    ts.forEachChild(n, telusuri)
  }
  ts.forEachChild(node, telusuri)
  return hasil
}

test("peta penjaga mencakup tepat aksi yang ada di src/actions", () => {
  const terbaca = semuaAksi()
    .map((a) => a.nama)
    .sort()
  const dipetakan = [...Object.keys(WAJIB), ...Object.keys(DIKECUALIKAN)].sort()

  assert.deepEqual(
    terbaca,
    dipetakan,
    "Ada aksi yang belum dipetakan, atau peta memuat aksi yang sudah tidak ada. Perbarui WAJIB/DIKECUALIKAN, jangan biarkan pemindaian kehilangan sasarannya.",
  )
})

test("bentuk export yang tidak dapat diperiksa tidak dibiarkan lolos", () => {
  const asing = berkasAksi().flatMap((path) => bacaBerkas(path).asing)
  assert.deepEqual(asing, [], "Ubah bentuk exportnya, atau perluas pemindai ini supaya aksi itu ikut diperiksa.")
})

test("setiap aksi dibuka penjaga yang tepat, di dalam try, sebelum satu tulisan pun", () => {
  const temuan: string[] = []

  for (const aksi of semuaAksi()) {
    const wajib = WAJIB[aksi.nama]
    const kecuali = DIKECUALIKAN[aksi.nama]
    const harapan = wajib ?? kecuali?.penyaring
    if (!harapan) {
      temuan.push(`${aksi.label} → ${aksi.nama}: belum dipetakan di WAJIB maupun DIKECUALIKAN`)
      continue
    }

    const awaitnya = awaitPertama(aksi.tubuh)
    const terpanggil = awaitnya ? pemanggil(awaitnya) : null
    if (terpanggil !== harapan) {
      temuan.push(
        `${aksi.label} → ${aksi.nama}: await pertama = ${terpanggil ?? "(tidak ada await)"}, seharusnya ${harapan}`,
      )
      continue
    }

    const coba = awaitnya ? tryPemilik(awaitnya, aksi.tubuh) : null
    if (!coba) {
      temuan.push(`${aksi.label} → ${aksi.nama}: penjaga ${harapan} berada di luar try`)
      continue
    }

    const tangkap = coba.catchClause
    if (!tangkap || !mengakhiri(tangkap.block)) {
      temuan.push(
        `${aksi.label} → ${aksi.nama}: catch tidak mengembalikan hasil, penolakan penjaga bisa lolos`,
      )
    }
  }

  assert.deepEqual(temuan, [], "Tambahkan penjaga sesi yang tepat, atau kecualikan dengan alasan tertulis.")
})