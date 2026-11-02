import { z } from "zod"

/**
 * Pembacaan evento Clerk. Sengaja dipisah dari route agar bentuk muatan bisa
 * diuji tanpa database: muatan asing ditolak lebih dulu, dan rencana yang
 * dihasilkan hanya berisi identitas akun.
 *
 * Peran dan status tidak pernah dibaca dari evento. `public_metadata` boleh
 * ditulis oleh siapa pun yang pegang API key atau dasbor Clerk, jadi nilai itu
 * bukan sumber wewenang; kenaikan peran hanya lewat dasbor admin dan seed.
 */

const skemaAlamat = z.object({
  id: z.string().min(1).max(64),
  email_address: z.email(),
})

export const skemaEventoClerk = z.object({
  type: z.enum(["user.created", "user.updated", "user.deleted"]),
  data: z.object({
    id: z.string().min(1).max(64),
    primary_email_address_id: z.string().max(64).optional(),
    email_addresses: z.array(skemaAlamat).max(20).optional(),
    first_name: z.string().max(80).nullish(),
    last_name: z.string().max(80).nullish(),
  }),
})

export type RencanaWebhook =
  /** Evento Clerk yang tidak dipakai proyek ini cukup diakui, tidak ditolak. */
  | { jenis: "abaikan"; tipe: string }
  | { jenis: "hapus"; clerkId: string }
  | {
      jenis: "upsert"
      clerkId: string
      email: string
      namaLengkap: string | null
    }

export function rencanaDariEvento(muatan: unknown): RencanaWebhook | null {
  const tipeHasil = z.object({ type: z.string().min(1).max(60) }).safeParse(muatan)
  if (!tipeHasil.success) return null
  const tipe = tipeHasil.data.type
  if (tipe !== "user.created" && tipe !== "user.updated" && tipe !== "user.deleted") {
    return { jenis: "abaikan", tipe }
  }

  const hasil = skemaEventoClerk.safeParse(muatan)
  if (!hasil.success) return null

  const data = hasil.data.data
  if (tipe === "user.deleted") return { jenis: "hapus", clerkId: data.id }

  const email =
    data.email_addresses?.find((baris) => baris.id === data.primary_email_address_id)
      ?.email_address ??
    data.email_addresses?.[0]?.email_address ??
    `${data.id}@pengguna.kitabku`

  const nama = [data.first_name, data.last_name].filter(Boolean).join(" ")

  return {
    jenis: "upsert",
    clerkId: data.id,
    email,
    namaLengkap: nama || null,
  }
}
