import { ZodError } from "zod"

export type HasilAksi =
  | { ok: true; id?: string; pesan: string }
  | { ok: false; pesan: string; bidang?: Record<string, string> }

/** Pesan keberhasilan baku agar toast seragam di semua aksi. */
export function sukses(id: string, pesan: string): HasilAksi {
  return { ok: true, id, pesan }
}

const PESAN_UMUM = "Belum berhasil menyimpan. Silakan coba lagi."

/**
 * Penanda pesan dari driver, pustaka, atau jaringan. Pesan seperti ini memuat
 * SQL, nama tabel, atau status HTTP internal yang tidak boleh sampai ke layar.
 */
const POLA_TEKNIS =
  /\bSQL\b|syntax error|violates|constraint|relation "|column .* does not|password authentication|ECONNREFUSED|ENOTFOUND|ESOCKET|socket hang up|fetch failed|is not defined|Cannot read propert|Unexpected (token|end)|TypeError|RangeError|pdf-lib|bunnycdn|stack trace/i

export function pesanAman(error: unknown, baku = PESAN_UMUM): string {
  if (error instanceof ZodError) return error.issues[0]?.message ?? baku
  if (!(error instanceof Error)) return baku

  if (error.message.includes("DATABASE_URL")) {
    return "Koneksi database belum dikonfigurasi. Isi DATABASE_URL di .env.local."
  }
  if (adalahTabrakanUnik(error)) {
    return "Nama atau slug ini sudah dipakai data lain. Gunakan kombinasi lain."
  }
  if (adalahTeknis(error)) {
    catatDiServer(error)
    return baku
  }
  return error.message
}

export function gagal(error: unknown): HasilAksi {
  if (error instanceof ZodError) {
    const bidang: Record<string, string> = {}
    for (const isu of error.issues) {
      const kunci = isu.path.join(".")
      if (kunci && !bidang[kunci]) bidang[kunci] = isu.message
    }
    return { ok: false, pesan: pesanAman(error), bidang }
  }
  return { ok: false, pesan: pesanAman(error) }
}

/** Error berpembungkus (NeonDbError, AggregateError) atau berbunyi seperti pesan teknis pustaka. */
function adalahTeknis(error: Error) {
  return error.name !== "Error" || POLA_TEKNIS.test(error.message)
}

function catatDiServer(error: Error) {
  if (typeof window !== "undefined") return
  console.error("[aksi] kegagalan teknis:", samarkanEmail(error.stack ?? error.message))
}

/**
 * Stack trace bisa memuat pesan driver yang mengulang data pengguna, misalnya
 * alamat email di pesan gagal masuk. Log server tidak boleh menyimpannya.
 */
function samarkanEmail(teks: string) {
  return teks.replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, "[email]")
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
