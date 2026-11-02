import { PDFDocument } from "pdf-lib"
import { pesanAman } from "@/actions/tipe"
import { butuhAdminAksi } from "@/lib/auth"
import { cdnSiapPublikasi, jalurPdf, unggahBerkas } from "@/lib/bunny"
import { buatTandaBerkas } from "@/lib/tanda-berkas"
import { skemaId } from "@/lib/validasi"
import { slugify } from "@/lib/format"

export const runtime = "nodejs"

function batasMb() {
  const nilai = Number(process.env.MAX_PDF_SIZE_MB)
  return Number.isFinite(nilai) && nilai > 0 ? nilai : 150
}

function mimeDiizinkan() {
  return (process.env.ALLOWED_PDF_MIME ?? "application/pdf")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

/** `application/pdf` sering hilang di sisi klien, jadi magic byte yang memutuskan. */
function adalahPdf(isi: Uint8Array) {
  const kepala = new TextDecoder().decode(isi.subarray(0, 5))
  return kepala === "%PDF-"
}

export async function POST(req: Request) {
  try {
    await butuhAdminAksi()
  } catch (error) {
    return Response.json({
      ok: false,
      pesan: pesanAman(error, "Unggahan hanya tersedia untuk pengelola yang masuk."),
    }, { status: 403 })
  }

  // Ditolak sebelum body 150 MB dibaca: tanpa alamat CDN, berkas yang naik tidak
  // akan pernah bisa ditayangkan dan hanya jadi yatim di storage zone.
  if (!cdnSiapPublikasi()) {
    return Response.json(
      {
        ok: false,
        pesan: "Alamat tayang berkas belum dikonfigurasi di server. Lengkapi BUNNY_CDN_HOSTNAME lebih dulu.",
      },
      { status: 501 },
    )
  }

  const form = await req.formData().catch(() => null)
  if (!form) {
    return Response.json({ ok: false, pesan: "Muatan formulir tidak terbaca." }, { status: 400 })
  }

  const berkas = form.get("berkas")
  if (!(berkas instanceof File)) {
    return Response.json({ ok: false, pesan: "Berkas PDF tidak dikirim." }, { status: 400 })
  }

  const maksimumByte = batasMb() * 1024 * 1024
  if (berkas.size === 0) {
    return Response.json({ ok: false, pesan: "Berkas PDF kosong." }, { status: 400 })
  }
  if (berkas.size > maksimumByte) {
    return Response.json(
      { ok: false, pesan: `Berkas terlalu besar. Maksimal ${batasMb()} MB.` },
      { status: 413 }
    )
  }

  // Bukti unggah diikat ke kitab sasaran. Untuk kitab yang belum dibuat,
  // id-nya null dan hanya bisa dipakai pada save yang juga belum ber-id.
  const idMinta = String(form.get("idKitab") ?? "").trim()
  if (idMinta && !skemaId.safeParse(idMinta).success) {
    return Response.json(
      { ok: false, pesan: "Identitas kitab pada formulir unggah tidak dikenali." },
      { status: 400 },
    )
  }
  const kitabId = idMinta || null

  const isi = new Uint8Array(await berkas.arrayBuffer())
  const mimeBoleh = mimeDiizinkan().includes(berkas.type.toLowerCase())
  if (!adalahPdf(isi) || (!mimeBoleh && !berkas.name.toLowerCase().endsWith(".pdf"))) {
    return Response.json(
      { ok: false, pesan: "Hanya berkas PDF sungguhan yang dapat diunggah." },
      { status: 415 }
    )
  }

  let halaman = 0
  try {
    const dokumen = await PDFDocument.load(isi, { ignoreEncryption: true })
    halaman = dokumen.getPageCount()
  } catch {
    return Response.json(
      { ok: false, pesan: "Berkas PDF rusak atau tidak dapat dibaca parser." },
      { status: 422 }
    )
  }

  const slugMentah = String(form.get("slug") ?? "").trim() || berkas.name.replace(/\.pdf$/i, "")
  const slug = slugify(slugMentah)
  if (!slug) {
    return Response.json({ ok: false, pesan: "Nama kitab tidak dapat dijadikan slug." }, { status: 400 })
  }

  // Penanda acak mencegah berkas kitab berjudul sama saling menimpa.
  const path = jalurPdf(`${slug}-${crypto.randomUUID().slice(0, 8)}`)
  try {
    await unggahBerkas(path, isi, "application/pdf")
    // Bukti bertanda tangan: aksi tulis memakai angka ini, bukan ketikan formulir.
    const tanda = buatTandaBerkas({ kitabId, path, byte: berkas.size, halaman })
    return Response.json({ ok: true, path, byte: berkas.size, halaman, tanda, slug })
  } catch (error) {
    return Response.json(
      { ok: false, pesan: pesanAman(error, "Berkas belum naik ke penyimpanan. Coba unggah ulang.") },
      { status: 502 }
    )
  }
}
