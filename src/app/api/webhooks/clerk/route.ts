import { Webhook } from "svix"
import { hapusPenggunaByClerkId, pastikanPengguna } from "@/db/mutations"
import type { Role, StatusPengguna } from "@/db/queries"

/** Bentuk evento Clerk yang dipakai route ini (minimal, sesuai kebutuhan). */
type EventClerk = {
  type: string
  data: {
    id?: string
    email?: string
    primary_email_address_id?: string
    email_addresses?: { id: string; email_address: string }[]
    first_name?: string | null
    last_name?: string | null
    public_metadata?: { role?: string; status?: string }
  }
}

const AKSI = new Set(["user.created", "user.updated", "user.deleted"])

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

  const isi = await req.text()

  let evento: EventClerk
  try {
    const terverifikasi = new Webhook(rahasia).verify(isi, {
      "svix-id": id,
      "svix-timestamp": timestamp,
      "svix-signature": signature,
    })
    evento = JSON.parse(String(terverifikasi)) as EventClerk
  } catch {
    return Response.json({ error: "Signature webhook tidak valid." }, { status: 400 })
  }

  if (!AKSI.has(evento.type)) {
    return Response.json({ received: true, diabaikan: evento.type })
  }

  const clerkId = evento.data.id
  if (!clerkId) {
    return Response.json({ error: "Evento tanpa user id." }, { status: 400 })
  }

  if (evento.type === "user.deleted") {
    const idLokal = await hapusPenggunaByClerkId(clerkId)
    return Response.json({ received: true, dihapus: idLokal })
  }

  const email =
    evento.data.email_addresses?.find(
      (row) => row.id === evento.data.primary_email_address_id
    )?.email_address ??
    evento.data.email_addresses?.[0]?.email_address ??
    `${clerkId}@pengguna.kitabku`

  const nama = [evento.data.first_name, evento.data.last_name]
    .filter(Boolean)
    .join(" ")

  /**
   * Nilai apa pun selain yang dikenal jatuh ke default aman. Peran hanya naik
   * bila admin menulis public_metadata.role = "admin" lewat Clerk API/dashboard.
   */
  const peran: Role =
    evento.data.public_metadata?.role === "admin" ? "admin" : "member"
  const status: StatusPengguna =
    evento.data.public_metadata?.status === "nonaktif" ? "nonaktif" : "aktif"

  await pastikanPengguna({
    clerkId,
    email,
    namaLengkap: nama || null,
    role: peran,
    status,
  })

  return Response.json({ received: true, tipe: evento.type })
}
