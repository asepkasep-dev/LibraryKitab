import { Webhook } from "svix"
import { hapusPenggunaByClerkId, pastikanPengguna } from "@/db/mutations"
import { rencanaDariEvento } from "@/lib/webhook-clerk"

export async function POST(req: Request) {
  const rahasia = process.env.CLERK_WEBHOOK_SECRET
  if (!rahasia) {
    return Response.json(
      { error: "CLERK_WEBHOOK_SECRET belum diisi di environment." },
      { status: 500 }
    )
  }

  const id = req.headers.get("svix-id")
  const timestamp = req.headers.get("svix-timestamp")
  const signature = req.headers.get("svix-signature")
  if (!id || !timestamp || !signature) {
    return Response.json({ error: "Header Svix tidak lengkap." }, { status: 400 })
  }

  // Signature diverifikasi di atas body mentah sebelum satu bait data dipercaya.
  let muatan: unknown
  try {
    // verify() dari svix sudah mengembalikan objek hasil parse, bukan string,
    // sehingga tidak ada JSON.parse lanjutan di sini.
    muatan = new Webhook(rahasia).verify(await req.text(), {
      "svix-id": id,
      "svix-timestamp": timestamp,
      "svix-signature": signature,
    })
  } catch {
    return Response.json({ error: "Signature webhook tidak valid." }, { status: 400 })
  }

  const rencana = rencanaDariEvento(muatan)
  if (!rencana) {
    // Bentuk muatan tidak valid untuk tipe yang kita pakai; pesan singkat,
    // tanpa mengulang isi muatan agar data pribadi tidak masuk log.
    return Response.json({ error: "Muatan webhook tidak valid." }, { status: 400 })
  }

  if (rencana.jenis === "abaikan") {
    // Tipe tak terkait diakui dengan 200 agar Clerk berhenti mengirim ulang.
    return Response.json({ received: true, diabaikan: rencana.tipe })
  }

  if (rencana.jenis === "hapus") {
    const idLokal = await hapusPenggunaByClerkId(rencana.clerkId)
    return Response.json({ received: true, dihapus: idLokal })
  }

  // Kegagalan database dibiarkan melewat: Next membalas 5xx dan Clerk mengirim
  // ulang, lebih baik daripada mengakui evento yang belum tersimpan.
  // Hanya identitas akun yang dipakai. Akun baru jatuh ke default kolom (member,
  // aktif); peran dan status diubah lewat dasbor admin atau seed, bukan webhook.
  const tersimpan = await pastikanPengguna({
    clerkId: rencana.clerkId,
    email: rencana.email,
    namaLengkap: rencana.namaLengkap,
  })

  return Response.json({ received: true, id: tersimpan.id })
}
