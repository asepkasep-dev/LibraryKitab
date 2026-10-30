/**
 * Teks editorial statis. Isinya tidak diambil dari database karena tidak
 * berubah lewat panel pengelola (Bab 3.C dan Bab 9).
 */

export const FAQ_ITEMS: { pertanyaan: string; jawaban: string }[] = [
  {
    pertanyaan: "Apakah membaca kitab di sini dipungut biaya?",
    jawaban:
      "Tidak. Seluruh e-kitab di KitabKu Pesantren gratis untuk santri, ustadz, maupun umum. Kami tidak menjual paket langganan atau membayar per kitab.",
  },
  {
    pertanyaan: "Perlukah mendaftar untuk membaca kitab?",
    jawaban:
      "Tidak wajib. Katalog, halaman detail, dan pembaca kitab dapat dibuka tanpa akun. Daftar hanya diperlukan bila Anda ingin menyimpan bookmark, catatan, dan melanjutkan bacaan dari halaman terakhir.",
  },
  {
    pertanyaan: "Saya lupa kata sandi, bagaimana memulihkannya?",
    jawaban:
      "Buka halaman Masuk, lalu pilih tautan lupa kata sandi. Kami mengirim tautan pemulihan ke email yang terdaftar. Tautan berlaku beberapa menit demi keamanan akun Anda.",
  },
  {
    pertanyaan: "Apakah bisa membaca lewat ponsel?",
    jawaban:
      "Bisa. Tampilan disesuaikan untuk ponsel: satu halaman penuh, gestur geser ke kiri dan kanan untuk berpindah halaman, serta mode Sepia Malam untuk baca malam di asrama.",
  },
  {
    pertanyaan: "Bookmark dan catatan saya milik siapa?",
    jawaban:
      "Milik Anda sepenuhnya. Catatan bersifat privat dan hanya dapat dibaca oleh Anda sendiri. Kami tidak menampilkannya kepada santri lain.",
  },
  {
    pertanyaan: "Kenapa sebagian kitab belum tersedia?",
    jawaban:
      "Proses pindaian dan penelusuran metadata dilakukan bertahap oleh tim perpustakaan. Kitab berstatus draf belum tampil di katalog sampai pengecekan halaman selesai.",
  },
  {
    pertanyaan: "Bagaimana mengusulkan kitab untuk dipindai?",
    jawaban:
      "Tulis judul, pengarang, dan edisi yang Anda maksud pada halaman Kontak. Pengelola memprioritaskan kitab yang rutin dikaji di halaqah.",
  },
  {
    pertanyaan: "Apakah kitab boleh diunduh atau dicetak?",
    jawaban:
      "Untuk versi awal, baca dilakukan di dalam pembaca agar progres dan catatan tetap tersimpan. Fitur simpan berkas direncanakan pada rilis berikutnya.",
  },
]

export const tentangKonten = {
  visi:
    "Menjadikan setiap kitab kuning yang dikaji di pesantren dapat diakses santri mana pun, dari perangkat apa pun, tanpa biaya dan tanpa antre di rak.",
  misi: [
    "Memindai dan menata metadata kitab agar pencarian selesai di bawah sepuluh detik.",
    "Menyediakan pengalaman baca yang tenang, nyaman di mata, dan ramah koneksi terbatas.",
    "Membiasakan santri mencatat dan mengulang bacaan lewat bookmark serta catatan pribadi.",
    "Memberi pengelola perpustakaan satu tempat untuk merawat koleksi digital.",
  ],
  caraKerja: [
    {
      judul: "Pengelola memindai kitab",
      teks:
        "Tim perpustakaan memindai kitab cetak, memeriksa jumlah halaman, lalu mengunggah berkas PDF beserta metadata pengarang, syarah, dan fan ilmu.",
    },
    {
      judul: "Santri menemukan kitab",
      teks:
        "Kolom pencarian menelusuri judul Latin, judul Arab, nama pengarang, dan penyusun syarah. Filter fan mempercepat memperkecil hasil.",
    },
    {
      judul: "Bacaan berlanjut di mana saja",
      teks:
        "Setiap kali Anda berpindah halaman, progres tersimpan. Buka kembali di ponsel atau laptop, pembaca langsung menuju halaman terakhir Anda.",
    },
    {
      judul: "Catatan tersusun rapi",
      teks:
        "Tandai halaman penting dan tulis pemahaman Anda. Semua tersimpan per halaman kitab sehingga mudah dibuka ulang saat muraja'ah.",
    },
  ],
  angka: [
    { nilai: "100+", label: "kitab target pada tiga bulan pertama" },
    { nilai: "8", label: "fan ilmu yang sudah terkelompok" },
    { nilai: "Gratis", label: "untuk seluruh warga pesantren" },
    { nilai: "< 3 dtk", label: "target waktu muat halaman baca" },
  ],
}

/** Kurasi redaksi: urutan slug, bukan hasil query. */
export const SLUG_PILIHAN_PENGELOLA = [
  "taolim-al-mutaallim",
  "fath-al-qarib",
  "tafsir-al-jalalain",
  "riyadhus-shalihin",
  "al-ajurrumiyyah",
] as const

export const SLUG_SOROTAN_SAMPUL = [
  "al-ajurrumiyyah",
  "riyadhus-shalihin",
  "fath-al-qarib",
] as const
