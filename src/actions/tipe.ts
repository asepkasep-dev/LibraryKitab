import { ZodError } from "zod"

export type HasilAksi =
  | { ok: true; id?: string; pesan: string }
  | { ok: false; pesan: string; bidang?: Record<string, string> }

/** Pesan keberhasilan baku agar toast seragam di semua aksi. */
export function sukses(id: string, pesan: string): HasilAksi {
  return { ok: true, id, pesan }
}

export function gagal(error: unknown): HasilAksi {
  if (error instanceof ZodError) {
    const bidang: Record<string, string> = {}
    for (const isu of error.issues) {
      const kunci = isu.path.join(".")
      if (kunci && !bidang[kunci]) bidang[kunci] = isu.message
    }
    const pertama = error.issues[0]?.message ?? "Data belum lengkap."
    return { ok: false, pesan: pertama, bidang }
  }

  if (error instanceof Error) {
    if (adalahTabrakanUnik(error)) {
      return {
        ok: false,
        pesan: "Nama atau slug ini sudah dipakai data lain. Gunakan kombinasi lain.",
      }
    }
    if (error.message.includes("DATABASE_URL")) {
      return {
        ok: false,
        pesan: "Koneksi database belum dikonfigurasi. Isi DATABASE_URL di .env.local.",
      }
    }
    return { ok: false, pesan: error.message }
  }

  return { ok: false, pesan: "Belum berhasil menyimpan. Silakan coba lagi." }
}

/** Postgres sqlstate 23505 (unique_violation) pada error Neon/driver. */
function adalahTabrakanUnik(error: Error) {
  const kode = (error as Error & { code?: string; pgcode?: string }).code
  const pgcode = (error as Error & { pgcode?: string }).pgcode
  return (
    kode === "23505" ||
    pgcode === "23505" ||
    /duplicate key value violates unique constraint/i.test(error.message)
  )
}
