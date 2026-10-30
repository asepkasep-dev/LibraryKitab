import type { Metadata } from "next"
import Link from "next/link"
import { LegalShell } from "@/components/site/legal-shell"
import { APP_NAME, KONTAK_EMAIL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Penjelasan data pribadi yang dikumpulkan saat Anda memakai perpustakaan digital kitab, tujuan pemrosesan, dan hak Anda.",
}

export default function KebijakanPrivasiPage() {
  return (
    <LegalShell
      judul="Kebijakan Privasi"
      pembuka={`Kami hanya mengumpulkan data yang dibutuhkan agar ${APP_NAME} bisa bekerja: mengenali akun Anda, menyimpan progres baca, dan melindungi koleksinya. Kami tidak menjual data Anda kepada pihak mana pun.`}
      diperbarui="26 Oktober 2026"
      bagian={[
        {
          judul: "Data yang kami simpan",
          isi: (
            <>
              <p>
                <span className="text-foreground">Data akun:</span> nama lengkap,
                email, jenis peran (santri atau ustadz), kelas, dan status akun.
                Data autentikasi seperti kata sandi dikelola penyedia layanan
                masuk, bukan disimpan sebagai teks biasa oleh kami.
              </p>
              <p>
                <span className="text-foreground">Data baca:</span> kitab yang
                Anda buka, halaman terakhir, persentase selesai, bookmark
                beserta labelnya, serta isi catatan yang Anda tulis per halaman.
              </p>
              <p>
                <span className="text-foreground">Data teknis:</span> preferensi
                tampilan pembaca seperti tingkat zoom dan mode Sepia Malam
                disimpan di perangkat Anda sendiri, sehingga tidak masuk ke
                server kami.
              </p>
            </>
          ),
        },
        {
          judul: "Mengapa data itu dibutuhkan",
          isi: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Mengembalikan Anda ke halaman terakhir saat melanjutkan baca.</li>
              <li>Menyimpan bookmark dan catatan agar mudah dibuka kembali.</li>
              <li>
                Menampilkan statistik bagi pengelola, misalnya fan mana yang
                paling banyak dibaca, agar pengadaan kitab tepat sasaran.
              </li>
              <li>Mendeteksi penyalahgunaan layanan dan menjaga keamanan akun.</li>
            </ul>
          ),
        },
        {
          judul: "Pihak yang membantu kami",
          isi: (
            <p>
              Layanan masuk (autentikasi), penyimpanan basis data, dan pengiriman
              berkas kitab melalui penyedia infrastruktur. Masing-masing hanya
              memproses data seperlunya untuk menjalankan fungsi tersebut. Berkas
              PDF kitab dilindungi tautan berlaku terbatas agar tidak bisa
              diambil dari luar aplikasi.
            </p>
          ),
        },
        {
          judul: "Catatan Anda bersifat privat",
          isi: (
            <p>
              Isi catatan dan label bookmark hanya dapat dibaca oleh Anda.
              Santri lain, termasuk sesama anggota halaqah, tidak melihatnya.
              Pengelola juga tidak membaca isi catatan Anda; yang mereka lihat
              hanyalah jumlah kitab dibaca dan progres per akun.
            </p>
          ),
        },
        {
          judul: "Cookie dan penyimpanan lokal",
          isi: (
            <p>
              Kami memakai cookie yang diperlukan untuk menjaga sesi Anda tetap
              masuk, serta penyimpanan lokal untuk preferensi reader. Tidak ada
              cookie pelacakan pihak ketiga untuk keperluan iklan.
            </p>
          ),
        },
        {
          judul: "Hak atas data Anda",
          isi: (
            <>
              <p>
                Anda dapat melihat, memperbaiki, dan menghapus data baca sendiri
                melalui{" "}
                <Link href="/dashboard/profil" className="text-gold hover:underline">
                  halaman profil
                </Link>
                , daftar bookmark, dan daftar catatan.
              </p>
              <p>
                Bila Anda ingin berhenti sepenuhnya, kirim permintaan penghapusan
                akun. Setelah diproses, akun, riwayat, bookmark, dan catatan Anda
                dihapus dari sistem kami.
              </p>
            </>
          ),
        },
        {
          judul: "Santri yang masih berusia anak",
          isi: (
            <p>
              Untuk anggota di bawah 18 tahun, pendaftaran dan permintaan
              penghapusan data dilakukan bersama wali atau musyrif. Kami tidak
              meminta data di luar yang diperlukan untuk layanan belajar.
            </p>
          ),
        },
        {
          judul: "Keamanan",
          isi: (
            <p>
              Lalu lintas dilindungi HTTPS, masukan pengguna dibersihkan sebelum
              disimpan, dan akses pengelolaan dibatasi hanya untuk peran
              pengelola. Tidak ada sistem yang benar-benar bebas risiko; bila
              terjadi insiden, kami akan memberitahu akun yang terdampak.
            </p>
          ),
        },
        {
          judul: "Berapa lama data disimpan",
          isi: (
            <p>
              Data baca disimpan selama akun aktif. Saat akun dihapus, catatan
              dan riwayat ikut dihapus. Laporan agregat tanpa identitas
              (misalnya jumlah kitab per fan) dapat kami simpan lebih lama untuk
              keperluan pengembangan koleksi.
            </p>
          ),
        },
        {
          judul: "Hubungi kami",
          isi: (
            <p>
              Permintaan terkait privasi dapat dikirim ke{" "}
              <a href={`mailto:${KONTAK_EMAIL}`} className="text-gold hover:underline">
                {KONTAK_EMAIL}
              </a>{" "}
              atau melalui{" "}
              <Link href="/kontak" className="text-gold hover:underline">
                formulir kontak
              </Link>
              .
            </p>
          ),
        },
      ]}
    />
  )
}
