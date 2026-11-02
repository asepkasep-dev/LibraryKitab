import type { NextConfig } from "next"

const produksi = process.env.NODE_ENV === "production"

/** Kepala keamanan dasar; berlaku untuk halaman maupun aset statis. */
const kepalaDasar = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Halaman ini tidak untuk dibingkai situs lain; Clerk memakai iframe miliknya sendiri.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
]

/**
 * Content-Security-Policy belum ditegakkan. Kebijakan ini hanya aman sesudah
 * diuji di lingkungan yang punya kunci Clerk dan CDN Bunny nyata: elemen Clerk,
 * worker pdf.js, dan penanda tangan URL butuh sumber yang terdaftar agar tidak
 * ada fitur yang mati diam-diam.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: produksi
          ? [...kepalaDasar, { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
          : kepalaDasar,
      },
    ]
  },
}

export default nextConfig
