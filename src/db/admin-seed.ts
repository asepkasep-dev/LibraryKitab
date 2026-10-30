import { eq } from "drizzle-orm"
import { z } from "zod"
import { db } from "./index"
import { users } from "./schema"

/** Bentuk id Clerk: awalan user_ diikuti huruf dan angka kecil. */
const POLA_CLERK_ID = /^user_[a-z0-9]{6,}$/i

export type KonfigurasiAdmin = { clerkId: string; email: string }

/**
 * ADMIN_CLERK_ID adalah satu-satunya jalan menaikkan peran lewat skrip, sesuai
 * aturan bahwa peran tidak pernah diberikan dari kode client. Email tidak ikut
 * ditampilkan di pesan error agar data pribadi tidak masuk log.
 */
export function bacaKonfigurasiAdmin(
  env: Record<string, string | undefined> = process.env,
): KonfigurasiAdmin | null {
  const clerkId = env.ADMIN_CLERK_ID?.trim() ?? ""
  if (!clerkId) return null

  if (!POLA_CLERK_ID.test(clerkId)) {
    throw new Error(
      "ADMIN_CLERK_ID belum benar. Bentuk id Clerk adalah user_ diikuti huruf dan angka, contoh user_2abc1def2gh3.",
    )
  }

  const email = env.ADMIN_EMAIL?.trim() || `${clerkId}@pengguna.kitabku`
  if (!z.email().safeParse(email).success) {
    throw new Error("ADMIN_EMAIL belum berupa alamat email yang sah.")
  }

  return { clerkId, email }
}

/** Naikkan (atau buat) akun pengelola; mengembalikan ringkasan untuk dicetak seed. */
export async function angkatAdminDariEnv(): Promise<string> {
  const config = bacaKonfigurasiAdmin()
  if (!config) return "ADMIN_CLERK_ID kosong, peran akun tidak diubah."

  const [punyaEmail] = await db
    .select({ clerkId: users.clerkId })
    .from(users)
    .where(eq(users.email, config.email))
    .limit(1)
  if (punyaEmail && punyaEmail.clerkId !== config.clerkId) {
    throw new Error(
      "ADMIN_EMAIL sudah menempel pada akun lain. Ganti emailnya atau kosongkan ADMIN_EMAIL.",
    )
  }

  const [sebelumnya] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.clerkId, config.clerkId))
    .limit(1)

  await db
    .insert(users)
    .values({ clerkId: config.clerkId, email: config.email, role: "admin", status: "aktif" })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: { role: "admin", updatedAt: new Date() },
    })

  if (!sebelumnya) return "Akun admin baru dibuat dari ADMIN_CLERK_ID."
  return sebelumnya.role === "admin"
    ? "Akun ADMIN_CLERK_ID sudah berstatus admin, tidak ada perubahan."
    : "Peran akun ADMIN_CLERK_ID dinaikkan menjadi admin."
}
