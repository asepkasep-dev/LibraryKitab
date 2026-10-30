import { existsSync } from "node:fs";
import { config } from "dotenv";

/**
 * Next.js membaca .env.local secara otomatis, tetapi drizzle-kit dan skrip tsx
 * hanya membaca .env. Tanpa ini `npm run db:migrate` dan `npm run db:seed` tetap
 * bilang DATABASE_URL belum diisi padahal kredensialnya sudah ada.
 * Urutan menyesuaikan Next: .env.local lebih dahulu, lalu .env sebagai dasar.
 */
for (const berkas of [".env.local", ".env.development.local", ".env"]) {
  if (existsSync(berkas)) config({ path: berkas, quiet: true });
}
