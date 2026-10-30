import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

function buatKlien() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL belum diisi. Salin .env.example menjadi .env.local lalu tempel connection string Neon PostgreSQL."
    )
  }
  return drizzle(neon(connectionString), { schema })
}

type Klien = ReturnType<typeof buatKlien>

let klien: Klien | null = null

function ambilKlien(): Klien {
  klien ??= buatKlien()
  return klien
}

/**
 * Klien dibuat saat pertama dipakai, bukan saat modul dimuat, supaya `next build`
 * tetap berjalan di mesin yang belum punya kredensial Neon.
 */
export const db = new Proxy({} as Klien, {
  get(_target, properti) {
    const aktif = ambilKlien() as unknown as Record<string | symbol, unknown>
    return Reflect.get(aktif, properti, aktif)
  },
})

export { schema }
