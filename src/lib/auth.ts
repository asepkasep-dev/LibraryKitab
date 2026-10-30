import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { cache } from "react"
import { penggunaByClerkId, type PenggunaVe } from "@/db/queries"
import { pastikanPengguna } from "@/db/mutations"

export type Sesi = {
  /** `null` bila pengunjung belum masuk. */
  pengguna: PenggunaVe | null
  masuk: boolean
  admin: boolean
}

/**
 * Satu pembacaan sesi per request (React `cache`), termasuk sinkronisasi baris
 * `users` bila webhook Clerk belum sempat mengirim evento user.created.
 */
export const ambilSesi = cache(async (): Promise<Sesi> => {
  const { userId, sessionClaims } = await auth()
  if (!userId) return { pengguna: null, masuk: false, admin: false }

  const emailKlaim = typeof sessionClaims?.email === "string" ? sessionClaims.email : ""
  const email = emailKlaim || `${userId}@pengguna.kitabku`
  const nama = [sessionClaims?.given_name, sessionClaims?.family_name]
    .filter(Boolean)
    .join(" ")

  const tersimpan =
    (await penggunaByClerkId(userId)) ??
    (await pastikanPengguna({ clerkId: userId, email, namaLengkap: nama || null }))

  return {
    pengguna: tersimpan,
    masuk: true,
    admin: tersimpan.role === "admin",
  }
})

/** Pengunjung anonim maupun anggota nonaktif dianggap tanpa hak simpan. */
export async function ambilSesiOpsional() {
  const sesi = await ambilSesi()
  return sesi.pengguna?.status === "aktif" ? sesi.pengguna : null
}

/** Untuk /dashboard/* dan server action member. */
export async function butuhMember() {
  const { pengguna } = await ambilSesi()
  if (!pengguna) redirect("/sign-in")
  if (pengguna.status === "nonaktif") redirect("/akun-nonaktif")
  return pengguna
}

/** Untuk /admin/* — peran dibaca dari database, bukan dari token saja. */
export async function butuhAdmin() {
  const pengguna = await butuhMember()
  if (pengguna.role !== "admin") redirect("/dashboard")
  return pengguna
}

/** Versi tanpa redirect, dipakai route handler yang harus membalas JSON. */
export async function sesiPenulis() {
  const pengguna = await ambilSesiOpsional()
  if (!pengguna) throw new Error("sesi-tidak-aktif")
  return pengguna
}

/**
 * Penjaga untuk Server Action: melempar pesan yang bisa ditampilkan sebagai toast,
 * bukan redirect seperti pada komponen server.
 */
export async function butuhAdminAksi() {
  const { pengguna } = await ambilSesi()
  if (!pengguna) throw new Error("Sesi Anda berakhir. Silakan masuk kembali.")
  if (pengguna.status === "nonaktif") throw new Error("Akun Anda dinonaktifkan oleh pengelola.")
  if (pengguna.role !== "admin") {
    throw new Error("Hanya pengelola yang dapat mengubah data perpustakaan.")
  }
  return pengguna
}

/** Anggota aktif (member maupun admin) — dipakai aksi bookmark, catatan, riwayat, profil. */
export async function butuhMemberAksi() {
  const { pengguna } = await ambilSesi()
  if (!pengguna) throw new Error("Masuk dulu agar data Anda tersimpan di akun yang benar.")
  if (pengguna.status === "nonaktif") throw new Error("Akun Anda dinonaktifkan oleh pengelola.")
  return pengguna
}
