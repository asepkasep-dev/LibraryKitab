export const APP_NAME = "KitabKu Pesantren"

export const APP_DESCRIPTION =
  "Perpustakaan digital kitab kuning untuk santri dan ustadz. Jelajahi katalog, baca e-kitab langsung di ponsel, simpan bookmark dan catatan, lalu lanjutkan bacaan dari halaman terakhir. Gratis untuk seluruh warga pesantren."

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export const PENYELENGGARA = "Perpustakaan Digital Pesantren Al-Hikmah"
export const KONTAK_EMAIL = "perpustakaan@alkitabku.sch.id"
export const KONTAK_TELEPON = "0812-3456-7890"
export const KONTAK_ALAMAT =
  "Kompleks Pesantren Al-Hikmah, Jl. Kyai Haji Abdul Hamid No. 45, Indonesia"
export const KONTAK_JAM = "Senin s.d. Sabtu, 08.00 s.d. 15.30 WIB"

export type NavLink = {
  href: string
  label: string
  hint?: string
  /** Nama ikon Lucide dalam bentuk kebab-case, sesuai isi PRD Bab 7. */
  icon?: string
}

export const NAV_PUBLIK: NavLink[] = [
  { href: "/katalog", label: "Katalog" },
  { href: "/tentang", label: "Tentang" },
  { href: "/faq", label: "FAQ" },
  { href: "/kontak", label: "Kontak" },
]

export const NAV_MEMBER: NavLink[] = [
  { href: "/dashboard", label: "Dasbor", icon: "layout-dashboard" },
  { href: "/dashboard/bookmark", label: "Bookmark Saya", icon: "bookmark" },
  { href: "/dashboard/catatan", label: "Catatan Saya", icon: "notebook-pen" },
  { href: "/dashboard/riwayat", label: "Riwayat Baca", icon: "history" },
  { href: "/dashboard/profil", label: "Profil Saya", icon: "user-round" },
]

export const NAV_ADMIN: NavLink[] = [
  { href: "/admin/dashboard", label: "Dasbor", icon: "layout-dashboard" },
  { href: "/admin/kitab", label: "Manajemen Kitab", icon: "book-open" },
  { href: "/admin/kategori", label: "Kategori (Fan)", icon: "shapes" },
  { href: "/admin/pengarang", label: "Pengarang", icon: "feather" },
  { href: "/admin/syarah", label: "Syarah / Syarih", icon: "scroll-text" },
  { href: "/admin/pengguna", label: "Pengguna", icon: "users" },
]

export const FOOTER_NAV: { judul: string; tautan: NavLink[] }[] = [
  {
    judul: "Jelajahi",
    tautan: [
      { href: "/katalog", label: "Katalog Kitab" },
      { href: "/tentang", label: "Tentang Kami" },
      { href: "/faq", label: "Pertanyaan Umum" },
    ],
  },
  {
    judul: "Bantuan",
    tautan: [
      { href: "/kontak", label: "Hubungi Pengelola" },
      { href: "/sign-in", label: "Masuk Akun" },
      { href: "/sign-up", label: "Daftar Akun Baru" },
    ],
  },
  {
    judul: "Legal",
    tautan: [
      { href: "/syarat-ketentuan", label: "Syarat & Ketentuan" },
      { href: "/kebijakan-privasi", label: "Kebijakan Privasi" },
    ],
  },
]

export type UrutanKatalog = "terbaru" | "judul" | "terpopuler"

export const OPSI_URUT: { nilai: UrutanKatalog; label: string }[] = [
  { nilai: "terbaru", label: "Terbaru" },
  { nilai: "judul", label: "Judul A-Z" },
  { nilai: "terpopuler", label: "Terpopuler" },
]

export const KITAB_PER_HALAMAN = 12

/** Batas unggahan berkas PDF (NEXT_PUBLIC_MAX_PDF_SIZE_MB pada .env). */
export const MAKS_PDF_MB = 150
