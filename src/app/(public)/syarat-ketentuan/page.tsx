import type { Metadata } from "next"
import Link from "next/link"
import { LegalShell } from "@/components/site/legal-shell"
import { APP_NAME, KONTAK_EMAIL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan",
  description:
    "Ketentuan penggunaan perpustakaan digital kitab kuning: akun, konten, hak cipta, dan penghentian layanan.",
}

export default function SyaratKetentuanPage() {
  return (
    <LegalShell
      judul="Syarat dan Ketentuan"
      pembuka={`Dengan membuat akun dan membaca kitab di ${APP_NAME}, Anda menyetujui ketentuan berikut. Tujuannya sederhana: menjaga kenyamanan bersama dan merawat koleksi digital pesantren.`}
      diperbarui="26 Oktober 2026"
      bagian={[
        {
          judul: "Siapa yang boleh menggunakan layanan",
          isi: (
            <>
              <p>
                Layanan terbuka untuk santri, ustadz, wali santri, dan masyarakat
                umum yang ingin mempelajari kitab kuning. Katalog dan halaman
                pembaca dapat diakses tanpa mendaftar.
              </p>
              <p>
                Fitur pribadi seperti bookmark, catatan, dan riwayat baca
                membutuhkan akun. Untuk santri di bawah 18 tahun, pendaftaran
                dilakukan dengan sepengetahuan wali atau musyrif halaqah.
              </p>
            </>
          ),
        },
        {
          judul: "Akun dan keamanan",
          isi: (
            <>
              <p>
                Satu akun digunakan satu orang. Jangan membagikan kata sandi
                atau memakai akun orang lain. Segala aktivitas yang terjadi pada
                akun Anda menjadi tanggung jawab Anda.
              </p>
              <p>
                Kami tidak pernah meminta kata sandi Anda melalui pesan apa pun. Jika Anda mencurigai akun digunakan orang lain,
                segera hubungi pengelola melalui halaman{" "}
                <Link href="/kontak" className="text-gold hover:underline">
                  kontak
                </Link>
                .
              </p>
            </>
          ),
        },
        {
          judul: "Konten kitab dan hak cipta",
          isi: (
            <>
              <p>
                Kitab yang kami tayangkan adalah karya ulama terdahulu (turats)
                yang menjadi bagian dari khazanah keilmuan Islam. Metadata,
                tata letak halaman, dan kumpulan teks digital adalah hasil kerja
                tim perpustakaan.
              </p>
              <p>
                Tautan baca disediakan untuk kebutuhan belajar pribadi. Mengunduh
                massal, mengulang tayang berkas pada situs lain tanpa izin, atau
                menghapus atribusi pengarang dan penerbit tidak diperbolehkan.
              </p>
            </>
          ),
        },
        {
          judul: "Penggunaan yang dilarang",
          isi: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Mengubah isi kitab, catatan, atau metadata milik orang lain.</li>
              <li>
                Memuat layanan secara berlebihan (scraping, brute force,
                permintaan otomatis dalam jumlah besar).
              </li>
              <li>Menayangkan berkas melalui situs lain tanpa persetujuan.</li>
              <li>Memakai data pengguna untuk pemasaran tanpa izin.</li>
            </ul>
          ),
        },
        {
          judul: "Ketersediaan layanan",
          isi: (
            <p>
              Kami mengusahakan seluruh kitab dapat dibaca setiap saat, tetapi
              pemeliharaan, gangguan jaringan, atau perbaikan berkas dapat
              menyebabkan layanan terhenti sementara. Tidak ada jaminan
              ketersediaan berkelanjutan pada versi awal ini.
            </p>
          ),
        },
        {
          judul: "Catatan dan bookmark Anda",
          isi: (
            <>
              <p>
                Catatan pribadi adalah milik Anda. Kami menampilkannya hanya
                kepada Anda dan tidak membagikannya kepada santri lain.
              </p>
              <p>
                Anda dapat menghapus catatan, bookmark, dan riwayat kapan saja
                dari dasbor. Penghapusan bersifat permanen setelah konfirmasi.
              </p>
            </>
          ),
        },
        {
          judul: "Penghentian atau penonaktifan akun",
          isi: (
            <p>
              Pengelola dapat menonaktifkan akun yang melanggar ketentuan atau
              mengganggu keamanan layanan. Akun yang dinonaktifkan tidak dapat
              masuk ke area member sampai statusnya dipulihkan. Anda berhak
              meminta peninjauan ulang melalui email pengelola.
            </p>
          ),
        },
        {
          judul: "Perubahan ketentuan",
          isi: (
            <p>
              Ketentuan ini dapat diperbarui mengikuti fitur baru. Perubahan
              signifikan akan diumumkan pada halaman ini beserta tanggal
              penyesuaiannya, dan penggunaan layanan setelah itu berarti Anda
              menerima ketentuan terbaru.
            </p>
          ),
        },
        {
          judul: "Hubungi kami",
          isi: (
            <p>
              Pertanyaan seputar ketentuan ini dapat dikirim ke{" "}
              <a href={`mailto:${KONTAK_EMAIL}`} className="text-gold hover:underline">
                {KONTAK_EMAIL}
              </a>{" "}
              atau melalui formulir pada halaman kontak.
            </p>
          ),
        },
      ]}
    />
  )
}
