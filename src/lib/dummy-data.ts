/**
 * Data dummy Tahap 1. Seluruh isi meniru bentuk data Bab 10 supaya pemindahan
 * ke query Drizzle pada Tahap 2 cukup mengganti fungsi baca di file ini.
 */

export type Role = "member" | "admin"
export type JenisPeran = "santri" | "ustadz"
export type StatusKitab = "draft" | "published" | "archived"
export type StatusPengguna = "aktif" | "nonaktif"

export type Kategori = {
  id: string
  nama: string
  slug: string
  deskripsi: string
}

export type Pengarang = {
  id: string
  namaArab: string
  namaLatin: string
  tahunWafat: string
  biografiSingkat: string
}

export type Kitab = {
  id: string
  judulLatin: string
  judulArab: string
  slug: string
  deskripsi: string
  kategoriId: string
  pengarangId: string
  syarahId: string | null
  tahunTerbit: string
  jumlahHalaman: number
  urlSampul: string | null
  urlPdf: string
  ukuranPdfByte: number
  status: StatusKitab
  jumlahDibuka: number
  createdAt: string
  updatedAt: string
}

export type Pengguna = {
  id: string
  clerkId: string
  email: string
  namaLengkap: string
  jenisPeran: JenisPeran | null
  role: Role
  status: StatusPengguna
  kelas: string
  fontSizePreferensi: number
  createdAt: string
}

export type RiwayatBaca = {
  id: string
  userId: string
  kitabId: string
  halamanTerakhir: number
  persentaseSelesai: number
  terakhirDibukaAt: string
}

export type Bookmark = {
  id: string
  userId: string
  kitabId: string
  halaman: number
  label: string | null
  createdAt: string
}

export type Catatan = {
  id: string
  userId: string
  kitabId: string
  halaman: number
  isi: string
  createdAt: string
  updatedAt: string
}

export type LogAdmin = {
  id: string
  adminId: string
  aksi: string
  targetTabel: string
  targetId: string
  detail: string
  createdAt: string
}

export const kategoriList: Kategori[] = [
  {
    id: "k1",
    nama: "Nahwu (Tata Bahasa Arab)",
    slug: "nahwu",
    deskripsi:
      "Kaidah i'rab dan susunan kata dalam kalimat Arab, dasar wajib untuk memahami matan kitab.",
  },
  {
    id: "k2",
    nama: "Sharaf (Morfologi Arab)",
    slug: "sharaf",
    deskripsi:
      "Perubahan bentuk kata dari akar huruf menjadi isim, fi'il, dan turunannya.",
  },
  {
    id: "k3",
    nama: "Fiqih",
    slug: "fiqih",
    deskripsi:
      "Hukum amaliah dari thaharah hingga muamalah berdasarkan matan dan syarah mazhab.",
  },
  {
    id: "k4",
    nama: "Tauhid (Akidah)",
    slug: "tauhid",
    deskripsi:
      "Penetapan keesaan Allah, sifat dua puluh, dan hal-hal yang meniadakan akidah yang lurus.",
  },
  {
    id: "k5",
    nama: "Tafsir",
    slug: "tafsir",
    deskripsi:
      "Penjelasan ayat-alayat Al-Qur'an, mulai dari makna kalimat sampai sebab turunnya ayat.",
  },
  {
    id: "k6",
    nama: "Hadis",
    slug: "hadis",
    deskripsi:
      "Kumpulan hadis pilihan beserta ilmu musthalah sebagai alat uji kesahihannya.",
  },
  {
    id: "k7",
    nama: "Akhlak dan Tasawuf",
    slug: "akhlak-tasawuf",
    deskripsi:
      "Penyucian jiwa, adab sehari-hari, dan perjalanan hati menuju Allah.",
  },
  {
    id: "k8",
    nama: "Ushul Fiqih",
    slug: "ushul-fiqih",
    deskripsi:
      "Metodologi istimbath hukum: sumber, kaidah, dan cara para imam mengambil dalil.",
  },
]

export const pengarangList: Pengarang[] = [
  {
    id: "pg1",
    namaArab: "الآجروم",
    namaLatin: "Ibnu Ajurrum",
    tahunWafat: "723 H",
    biografiSingkat:
      "Fuqaha dan Nahwi asal Fez, Maroko. Matan ringkasnya menjadi pintu masuk hampir seluruh pesantren.",
  },
  {
    id: "pg2",
    namaArab: "ابن مالك",
    namaLatin: "Ibnu Malik",
    tahunWafat: "672 H",
    biografiSingkat:
      "Imam bahasa Arab dari Damaskus, penulis Alfiyah yang memuat kaidah nahwu dalam bentuk nazham.",
  },
  {
    id: "pg3",
    namaArab: "ابن عقيل",
    namaLatin: "Ibnu Aqil",
    tahunWafat: "769 H",
    biografiSingkat:
      "Penyusun syarah paling masyhur atas Alfiyah Ibnu Malik, banyak dipakai sebagai rujukan utama kajian nahwu.",
  },
  {
    id: "pg4",
    namaArab: "الأمريطي",
    namaLatin: "Abu Al-Qasim Al-Imrithi",
    tahunWafat: "775 H",
    biografiSingkat:
      "Nahwi Mesir yang nazham dan syarahnya menjadi lanjutan klasik setelah Alfiyah.",
  },
  {
    id: "pg5",
    namaArab: "أبو شجاع",
    namaLatin: "Abu Syuja'",
    tahunWafat: "593 H",
    biografiSingkat:
      "Qadhi Baghdad, penulis matan fiqih Syafii yang hafalannya jadi bahan pengajian dasar.",
  },
  {
    id: "pg6",
    namaArab: "الغزي",
    namaLatin: "Al-Qasim Al-Ghuzzi",
    tahunWafat: "± abad ke-10 H",
    biografiSingkat:
      "Penyusun Fath Al-Qarib, syarah ringkas yang menjabarkan matan Abu Syuja'.",
  },
  {
    id: "pg7",
    namaArab: "الإمام النووي",
    namaLatin: "Imam An-Nawawi",
    tahunWafat: "676 H",
    biografiSingkat:
      "Mufti mazhab Syafii dari Nawa, Suriah. Karyanya mencakup hadis, fiqih, dan penyucian jiwa.",
  },
  {
    id: "pg8",
    namaArab: "الإمام الغزالي",
    namaLatin: "Imam Al-Ghazali",
    tahunWafat: "505 H",
    biografiSingkat:
      "Hujjatul Islam, penulis Ihya' Ulumiddin yang memadukan fiqih, tasawuf, dan bimbingan praktis.",
  },
  {
    id: "pg9",
    namaArab: "الزرنوجي",
    namaLatin: "Al-Zarnuji",
    tahunWafat: "± abad ke-6 H",
    biografiSingkat:
      "Penulis panduan adab menuntut ilmu yang hingga kini diajarkan di kelas awal pesantren.",
  },
  {
    id: "pg10",
    namaArab: "سليم البشري",
    namaLatin: "Salim Al-Bushri",
    tahunWafat: "± awal abad ke-20 M",
    biografiSingkat:
      "Fuqaha asal Hadramaut, penulis Safinah An-Naja yang mudah dibawa santri pemula.",
  },
  {
    id: "pg11",
    namaArab: "النسفي",
    namaLatin: "Ahmad Al-Nasafi",
    tahunWafat: "710 H",
    biografiSingkat:
      "Ulama Transoksania yang matan akidahnya menjadi pegangan dasar tauhid.",
  },
  {
    id: "pg12",
    namaArab: "اللقاني",
    namaLatin: "Ibrahim Al-Laqqani",
    tahunWafat: "781 H",
    biografiSingkat:
      "Ulama Al-Azhar, penulis nazham akidah dan sharaf yang populer di majelis Maghribi.",
  },
  {
    id: "pg13",
    namaArab: "جلال الدين السيوطي",
    namaLatin: "Jalaluddin As-Suyuthi",
    tahunWafat: "911 H",
    biografiSingkat:
      "Imam multidisiplin asal Kairo, menyempurnakan Tafsir Al-Jalalain dan menulis banyak ushul.",
  },
  {
    id: "pg14",
    namaArab: "جلال الدين المحلي",
    namaLatin: "Jalaluddin Al-Mahalli",
    tahunWafat: "864 H",
    biografiSingkat:
      "Mufasir Syafii yang memulai Tafsir Al-Jalalain sebelum diteruskan muridnya.",
  },
  {
    id: "pg15",
    namaArab: "ابن حجر العسقلاني",
    namaLatin: "Ibnu Hajar Al-Asqalani",
    tahunWafat: "852 H",
    biografiSingkat:
      "Hafiz hadis, penulis Bulugh Al-Maram yang menghimpun hadis hukum beserta takhrijnya.",
  },
  {
    id: "pg16",
    namaArab: "ابن عطاء الله السكندري",
    namaLatin: "Ibnu Atha'illah Al-Iskandari",
    tahunWafat: "742 H",
    biografiSingkat:
      "Guru tarekat Syadziliyah di Alexand ria, pengarang kumpulan hikmah Al-Hikam.",
  },
  {
    id: "pg17",
    namaArab: "إمام الحرمين الجويني",
    namaLatin: "Imam Al-Haramain Al-Juwaini",
    tahunWafat: "450 H",
    biografiSingkat:
      "Imam dua tanah haram, guru Al-Ghazali, penulis risalah ringkas ushul fiqih Al-Waraqat.",
  },
  {
    id: "pg18",
    namaArab: "الشاطبي",
    namaLatin: "Asy-Syathibi",
    tahunWafat: "790 H",
    biografiSingkat:
      "Ulama Andalusia yang menata filosofi syariat dalam Al-Muwafaqat.",
  },
  {
    id: "pg19",
    namaArab: "القطب الرازي",
    namaLatin: "Syarafuddin Al-Qathi",
    tahunWafat: "± abad ke-7 H",
    biografiSingkat:
      "Penulis kitab tashrif yang menjadi rujukan perubahan bentuk kata di kelas sharaf.",
  },
  {
    id: "pg20",
    namaArab: "ابن كثير",
    namaLatin: "Ibnu Katsir",
    tahunWafat: "774 H",
    biografiSingkat:
      "Mufasir dan sejarawan Syafii, penulis tafsir bil-ma'tsur yang banyak dikaji pesantren.",
  },
  {
    id: "pg21",
    namaArab: "أحمد بن Ruslan",
    namaLatin: "Ahmad bin Ruslan",
    tahunWafat: "844 H",
    biografiSingkat:
      "Fuqaha Syafii di Mesir, pengarang nazham fiqih Az-Zubad.",
  },
]

const HARI = 86_400_000
const sekarang = Date.parse("2026-10-26T04:20:00Z")
const lalu = (hari: number) => new Date(sekarang - hari * HARI).toISOString()

export const kitabList: Kitab[] = [
  {
    id: "kb1",
    judulLatin: "Al-Ajurrumiyyah",
    judulArab: "المقدمة الآجرومية",
    slug: "al-ajurrumiyyah",
    deskripsi:
      "Matan nahwu ringkas karya Ibnu Ajurrum yang menjadi pintu masuk kajian i'rab di pesantren. Pembahasannya mencakup pembagian kalimat, tanda robath, dan bab-bab i'rab dengan gaya yang mudah dihafal.",
    kategoriId: "k1",
    pengarangId: "pg1",
    syarahId: null,
    tahunTerbit: "± 720 H",
    jumlahHalaman: 24,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/al-ajurrumiyyah.pdf",
    ukuranPdfByte: 3_612_000,
    status: "published",
    jumlahDibuka: 1_284,
    createdAt: lalu(180),
    updatedAt: lalu(46),
  },
  {
    id: "kb2",
    judulLatin: "Alfiyah Ibnu Malik",
    judulArab: "ألفية ابن مالك",
    slug: "alfiyah-ibnu-malik",
    deskripsi:
      "Nazham nahwu berjumlah ribuan bait yang memuat hampir seluruh kaidah bahasa Arab. Edisi ini menggabungkan matan dengan syarah Ibnu Aqil sehingga penjelasan setiap bait lengkap.",
    kategoriId: "k1",
    pengarangId: "pg2",
    syarahId: "pg3",
    tahunTerbit: "± 650 H",
    jumlahHalaman: 186,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/alfiyah-ibnu-malik.pdf",
    ukuranPdfByte: 21_440_000,
    status: "published",
    jumlahDibuka: 902,
    createdAt: lalu(172),
    updatedAt: lalu(30),
  },
  {
    id: "kb3",
    judulLatin: "Al-Imrithi",
    judulArab: "الأمريطي",
    slug: "al-imrithi",
    deskripsi:
      "Nazham sekaligus syarah yang biasa dikaji setelah Alfiyah. Uraian Ibnu Aqil di sini diringkas kembali sehingga cocok untuk halaqah nahwu tingkat menengah.",
    kategoriId: "k1",
    pengarangId: "pg4",
    syarahId: null,
    tahunTerbit: "± 760 H",
    jumlahHalaman: 620,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/al-imrithi.pdf",
    ukuranPdfByte: 48_900_000,
    status: "published",
    jumlahDibuka: 214,
    createdAt: lalu(120),
    updatedAt: lalu(64),
  },
  {
    id: "kb4",
    judulLatin: "Tashriful Ism",
    judulArab: "تصريف الأسم",
    slug: "tashriful-ism",
    deskripsi:
      "Pengantar ilmu sharaf yang menjabarkan perubahan isim dari tiga huruf asal menjadi berbagai wazan dan shighat.",
    kategoriId: "k2",
    pengarangId: "pg19",
    syarahId: null,
    tahunTerbit: "± abad ke-7 H",
    jumlahHalaman: 96,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/tashriful-ism.pdf",
    ukuranPdfByte: 7_180_000,
    status: "published",
    jumlahDibuka: 461,
    createdAt: lalu(150),
    updatedAt: lalu(52),
  },
  {
    id: "kb5",
    judulLatin: "Al-Jauhar Al-Maknun",
    judulArab: "الجواهر المخنونة",
    slug: "al-jauhar-al-maknun",
    deskripsi:
      "Nazham sharaf karya Ibrahim Al-Laqqani yang sering dilagamkan di kelas sharaf untuk memudahkan hafalan wazan.",
    kategoriId: "k2",
    pengarangId: "pg12",
    syarahId: null,
    tahunTerbit: "± 760 H",
    jumlahHalaman: 132,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/al-jauhar-al-maknun.pdf",
    ukuranPdfByte: 9_845_000,
    status: "published",
    jumlahDibuka: 176,
    createdAt: lalu(96),
    updatedAt: lalu(20),
  },
  {
    id: "kb6",
    judulLatin: "Matan Ghayah wa Taqrib",
    judulArab: "غاية التقريب",
    slug: "matan-ghayah-wa-taqrib",
    deskripsi:
      "Matan fiqih Syafii karya Abu Syuja' yang menghimpun pokok-pokok thaharah, shalat, puasa, zakat, dan muamalah dalam bahasa yang sangat ringkas.",
    kategoriId: "k3",
    pengarangId: "pg5",
    syarahId: "pg6",
    tahunTerbit: "± 580 H",
    jumlahHalaman: 52,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/matan-ghayah-wa-taqrib.pdf",
    ukuranPdfByte: 4_320_000,
    status: "published",
    jumlahDibuka: 1_042,
    createdAt: lalu(168),
    updatedAt: lalu(38),
  },
  {
    id: "kb7",
    judulLatin: "Fath Al-Qarib",
    judulArab: "فتح القريب المجيب",
    slug: "fath-al-qarib",
    deskripsi:
      "Syarah ringkas atas matan Abu Syuja' karya Al-Qasim Al-Ghuzzi. Inilah kitab fiqih yang paling sering dihafal santri setelah Safinah.",
    kategoriId: "k3",
    pengarangId: "pg6",
    syarahId: null,
    tahunTerbit: "± abad ke-10 H",
    jumlahHalaman: 168,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/fath-al-qarib.pdf",
    ukuranPdfByte: 12_600_000,
    status: "published",
    jumlahDibuka: 1_318,
    createdAt: lalu(160),
    updatedAt: lalu(12),
  },
  {
    id: "kb8",
    judulLatin: "Safinah An-Naja",
    judulArab: "سفينة النجا",
    slug: "safinah-an-naja",
    deskripsi:
      "Matan fiqih padat karya Salim Al-Bushri, disusun sebagai bekal praktis ibadah sehari-hari bagi santri pemula.",
    kategoriId: "k3",
    pengarangId: "pg10",
    syarahId: null,
    tahunTerbit: "± 1320 H",
    jumlahHalaman: 210,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/safinah-an-naja.pdf",
    ukuranPdfByte: 15_120_000,
    status: "published",
    jumlahDibuka: 764,
    createdAt: lalu(140),
    updatedAt: lalu(28),
  },
  {
    id: "kb9",
    judulLatin: "Aqidah Al-Awwam",
    judulArab: "عقيدة العوام",
    slug: "aqidah-al-awwam",
    deskripsi:
      "Matan tauhid yang merinci sifat wajib, mustahil, dan jaiz bagi Allah serta para Rasul, ditujukan untuk kaum muslimin awam.",
    kategoriId: "k4",
    pengarangId: "pg11",
    syarahId: null,
    tahunTerbit: "± 700 H",
    jumlahHalaman: 36,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/aqidah-al-awwam.pdf",
    ukuranPdfByte: 2_980_000,
    status: "published",
    jumlahDibuka: 588,
    createdAt: lalu(150),
    updatedAt: lalu(70),
  },
  {
    id: "kb10",
    judulLatin: "Jauhar At-Tauhid",
    judulArab: "جوهرة التوحيد",
    slug: "jauhar-at-tauhid",
    deskripsi:
      "Nazham akidah Ahlussunnah wal Jamaah yang menghimpun kaidah tauhid, sifat dua puluh, dan perkara ghaib dalam bait-bait rapi.",
    kategoriId: "k4",
    pengarangId: "pg12",
    syarahId: null,
    tahunTerbit: "± 770 H",
    jumlahHalaman: 120,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/jauhar-at-tauhid.pdf",
    ukuranPdfByte: 8_450_000,
    status: "published",
    jumlahDibuka: 402,
    createdAt: lalu(132),
    updatedAt: lalu(44),
  },
  {
    id: "kb11",
    judulLatin: "Tafsir Al-Jalalain",
    judulArab: "تفسير الجلالين",
    slug: "tafsir-al-jalalain",
    deskripsi:
      "Tafsir dua imam: dimulai Al-Mahalli dan diselesaikan As-Suyuthi. Penjelasan per ayatnya ringkas sehingga cocok untuk kajian awal di majelis pagi.",
    kategoriId: "k5",
    pengarangId: "pg14",
    syarahId: "pg13",
    tahunTerbit: "± 870 H",
    jumlahHalaman: 680,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/tafsir-al-jalalain.pdf",
    ukuranPdfByte: 52_300_000,
    status: "published",
    jumlahDibuka: 1_476,
    createdAt: lalu(190),
    updatedAt: lalu(8),
  },
  {
    id: "kb12",
    judulLatin: "Tafsir Ibnu Katsir (Ikhtishar)",
    judulArab: "تفسير القرآن العظيم",
    slug: "tafsir-ibnu-katsir-ikhtishar",
    deskripsi:
      "Ringkasan tafsir bil-ma'tsur karya Ibnu Katsir, menekankan penjelasan ayat dengan hadis dan atsar sahabat.",
    kategoriId: "k5",
    pengarangId: "pg20",
    syarahId: null,
    tahunTerbit: "± 770 H",
    jumlahHalaman: 520,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/tafsir-ibnu-katsir-ikhtishar.pdf",
    ukuranPdfByte: 44_800_000,
    status: "published",
    jumlahDibuka: 690,
    createdAt: lalu(88),
    updatedAt: lalu(24),
  },
  {
    id: "kb13",
    judulLatin: "Al-Arba'in An-Nawawiyyah",
    judulArab: "الأربعون النووية",
    slug: "al-arbain-an-nawawiyyah",
    deskripsi:
      "Himpunan 42 hadis pokok yang merangkum poros agama. Dilengkapi penjelasan singkat setiap hadis.",
    kategoriId: "k6",
    pengarangId: "pg7",
    syarahId: null,
    tahunTerbit: "± 660 H",
    jumlahHalaman: 64,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/al-arbain-an-nawawiyyah.pdf",
    ukuranPdfByte: 3_420_000,
    status: "published",
    jumlahDibuka: 1_105,
    createdAt: lalu(176),
    updatedAt: lalu(16),
  },
  {
    id: "kb14",
    judulLatin: "Bulugh Al-Maram",
    judulArab: "بلوغ المرام",
    slug: "bulugh-al-maram",
    deskripsi:
      "Kumpulan hadis hukum tersusun per bab fiqih beserta takhrij dan penilaian sanadnya, rujukan wajib kajian istimbath.",
    kategoriId: "k6",
    pengarangId: "pg15",
    syarahId: null,
    tahunTerbit: "± 840 H",
    jumlahHalaman: 360,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/bulugh-al-maram.pdf",
    ukuranPdfByte: 28_650_000,
    status: "published",
    jumlahDibuka: 522,
    createdAt: lalu(110),
    updatedAt: lalu(56),
  },
  {
    id: "kb15",
    judulLatin: "Riyadhus Shalihin",
    judulArab: "روضة الصالحين",
    slug: "riyadhus-shalihin",
    deskripsi:
      "Antologi hadis dan ayat tentang adab, zuhud, dan penyucian jiwa. Bab-babnya selalu dibuka dengan ayat dan diikuti hadis amalan.",
    kategoriId: "k7",
    pengarangId: "pg7",
    syarahId: null,
    tahunTerbit: "± 665 H",
    jumlahHalaman: 410,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/riyadhus-shalihin.pdf",
    ukuranPdfByte: 31_200_000,
    status: "published",
    jumlahDibuka: 1_398,
    createdAt: lalu(184),
    updatedAt: lalu(6),
  },
  {
    id: "kb16",
    judulLatin: "Ta'lim Al-Muta'allim",
    judulArab: "تعلم المتعلم",
    slug: "taolim-al-mutaallim",
    deskripsi:
      "Panduan adab penuntut ilmu: niat, memilih guru dan teman, hingga cara mengulang pelajaran. Biasanya dihafal santri baru.",
    kategoriId: "k7",
    pengarangId: "pg9",
    syarahId: null,
    tahunTerbit: "± 585 H",
    jumlahHalaman: 48,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/taolim-al-mutaallim.pdf",
    ukuranPdfByte: 2_140_000,
    status: "published",
    jumlahDibuka: 1_640,
    createdAt: lalu(200),
    updatedAt: lalu(4),
  },
  {
    id: "kb17",
    judulLatin: "Al-Hikam Al-'Athaiyyah",
    judulArab: "الحكم العطائية",
    slug: "al-hikam-al-athaiyyah",
    deskripsi:
      "Kumpulan hikmah Ibnu Atha'illah tentang tauhid, usaha batin, dan sikap ridha terhadap qadar.",
    kategoriId: "k7",
    pengarangId: "pg16",
    syarahId: null,
    tahunTerbit: "± 730 H",
    jumlahHalaman: 180,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/al-hikam-al-athaiyyah.pdf",
    ukuranPdfByte: 11_940_000,
    status: "published",
    jumlahDibuka: 843,
    createdAt: lalu(102),
    updatedAt: lalu(18),
  },
  {
    id: "kb18",
    judulLatin: "Bidayah Al-Hidayah",
    judulArab: "بداية الهداية",
    slug: "bidayah-al-hidayah",
    deskripsi:
      "Ringkasan praktis Ihya' Ulumiddin khusus ibadah dan adab harian, ditujukan bagi pembaca awam yang ingin mengamalkan.",
    kategoriId: "k7",
    pengarangId: "pg8",
    syarahId: null,
    tahunTerbit: "± 500 H",
    jumlahHalaman: 96,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/bidayah-al-hidayah.pdf",
    ukuranPdfByte: 6_280_000,
    status: "published",
    jumlahDibuka: 259,
    createdAt: lalu(74),
    updatedAt: lalu(34),
  },
  {
    id: "kb19",
    judulLatin: "Al-Waraqat",
    judulArab: "الورقات",
    slug: "al-waraqat",
    deskripsi:
      "Risalah ushul fiqih paling ringkas karya Imam Al-Haramain, memuat definisi dalil, qiyas, ijtihad, dan taqlid.",
    kategoriId: "k8",
    pengarangId: "pg17",
    syarahId: null,
    tahunTerbit: "± 440 H",
    jumlahHalaman: 32,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/al-waraqat.pdf",
    ukuranPdfByte: 1_870_000,
    status: "published",
    jumlahDibuka: 372,
    createdAt: lalu(66),
    updatedAt: lalu(40),
  },
  {
    id: "kb20",
    judulLatin: "Al-Muwafaqat",
    judulArab: "الموافقات",
    slug: "al-muwafaqat",
    deskripsi:
      "Karya Asy-Syathibi tentang tujuan syariat dan kaidah istimbath, menjadi rujukan ushul fiqih tingkat tinggi.",
    kategoriId: "k8",
    pengarangId: "pg18",
    syarahId: null,
    tahunTerbit: "± 780 H",
    jumlahHalaman: 480,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/al-muwafaqat.pdf",
    ukuranPdfByte: 39_400_000,
    status: "published",
    jumlahDibuka: 168,
    createdAt: lalu(58),
    updatedAt: lalu(26),
  },
  {
    id: "kb21",
    judulLatin: "Ihya' Ulumiddin",
    judulArab: "إحياء علوم الدين",
    slug: "ihya-ulumiddin",
    deskripsi:
      "Magnum opus Imam Al-Ghazali yang memadukan ibadah, adab, dan penyucian jiwa dalam empat rukun besar.",
    kategoriId: "k7",
    pengarangId: "pg8",
    syarahId: null,
    tahunTerbit: "± 500 H",
    jumlahHalaman: 1_024,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/ihya-ulumiddin.pdf",
    ukuranPdfByte: 118_400_000,
    status: "draft",
    jumlahDibuka: 0,
    createdAt: lalu(18),
    updatedAt: lalu(2),
  },
  {
    id: "kb22",
    judulLatin: "Matan Az-Zubad",
    judulArab: "الزبد في الفقه",
    slug: "matan-az-zubad",
    deskripsi:
      "Nazham fiqih Syafii yang biasa dijadikan hafalan lanjutan setelah matan Abu Syuja'.",
    kategoriId: "k3",
    pengarangId: "pg21",
    syarahId: null,
    tahunTerbit: "± 830 H",
    jumlahHalaman: 120,
    urlSampul: null,
    urlPdf: "https://cdn.example.org/kitab/matan-az-zubad.pdf",
    ukuranPdfByte: 5_640_000,
    status: "archived",
    jumlahDibuka: 97,
    createdAt: lalu(240),
    updatedAt: lalu(48),
  },
]

export const penggunaList: Pengguna[] = [
  {
    id: "u1",
    clerkId: "user_demo_ahmadfauzi",
    email: "ahmad.fauzi@pesantren.id",
    namaLengkap: "Ahmad Fauzi",
    jenisPeran: "santri",
    role: "member",
    status: "aktif",
    kelas: "Kelas Lanjutan",
    fontSizePreferensi: 18,
    createdAt: lalu(310),
  },
  {
    id: "u2",
    clerkId: "user_demo_ustadzabdul",
    email: "abdul.rahman@pesantren.id",
    namaLengkap: "Ustadz Abdul Rahman",
    jenisPeran: "ustadz",
    role: "member",
    status: "aktif",
    kelas: "Musyrif Halaqah Ula",
    fontSizePreferensi: 20,
    createdAt: lalu(420),
  },
  {
    id: "u3",
    clerkId: "user_demo_sitimaryam",
    email: "siti.maryam@pesantren.id",
    namaLengkap: "Siti Maryam",
    jenisPeran: "santri",
    role: "member",
    status: "aktif",
    kelas: "Kelas Dasar",
    fontSizePreferensi: 16,
    createdAt: lalu(120),
  },
  {
    id: "u4",
    clerkId: "user_demo_harun",
    email: "harun.rasyid@pesantren.id",
    namaLengkap: "Ustadz Muhammad Harun",
    jenisPeran: "ustadz",
    role: "admin",
    status: "aktif",
    kelas: "Pengelola Perpustakaan",
    fontSizePreferensi: 17,
    createdAt: lalu(540),
  },
  {
    id: "u5",
    clerkId: "user_demo_ridwan",
    email: "muhammad.ridwan@pesantren.id",
    namaLengkap: "Muhammad Ridwan",
    jenisPeran: "santri",
    role: "member",
    status: "aktif",
    kelas: "Kelas Menengah",
    fontSizePreferensi: 16,
    createdAt: lalu(88),
  },
  {
    id: "u6",
    clerkId: "user_demo_nuraisyah",
    email: "nur.aisyah@pesantren.id",
    namaLengkap: "Nur Aisyah",
    jenisPeran: "santri",
    role: "member",
    status: "aktif",
    kelas: "Kelas Dasar",
    fontSizePreferensi: 16,
    createdAt: lalu(46),
  },
  {
    id: "u7",
    clerkId: "user_demo_fatimah",
    email: "fatimah.azzahra@pesantren.id",
    namaLengkap: "Fatimah Az-Zahra",
    jenisPeran: "santri",
    role: "member",
    status: "nonaktif",
    kelas: "Kelas Lanjutan",
    fontSizePreferensi: 18,
    createdAt: lalu(150),
  },
  {
    id: "u8",
    clerkId: "user_demo_abdulaziz",
    email: "abdul.aziz@pesantren.id",
    namaLengkap: "Abdul Aziz",
    jenisPeran: "ustadz",
    role: "member",
    status: "aktif",
    kelas: "Musyrif Halaqah Wustha",
    fontSizePreferensi: 19,
    createdAt: lalu(210),
  },
]

export const penggunaDemo = penggunaList[0]
export const adminDemo = penggunaList[3]
export const penggunaNonaktifDemo =
  penggunaList.find((u) => u.status === "nonaktif")!

export const riwayatList: RiwayatBaca[] = [
  {
    id: "r1",
    userId: "u1",
    kitabId: "kb1",
    halamanTerakhir: 19,
    persentaseSelesai: 78,
    terakhirDibukaAt: lalu(0),
  },
  {
    id: "r2",
    userId: "u1",
    kitabId: "kb2",
    halamanTerakhir: 84,
    persentaseSelesai: 45,
    terakhirDibukaAt: lalu(1),
  },
  {
    id: "r3",
    userId: "u1",
    kitabId: "kb15",
    halamanTerakhir: 49,
    persentaseSelesai: 12,
    terakhirDibukaAt: lalu(3),
  },
  {
    id: "r4",
    userId: "u1",
    kitabId: "kb8",
    halamanTerakhir: 210,
    persentaseSelesai: 100,
    terakhirDibukaAt: lalu(9),
  },
  {
    id: "r5",
    userId: "u1",
    kitabId: "kb10",
    halamanTerakhir: 10,
    persentaseSelesai: 8,
    terakhirDibukaAt: lalu(14),
  },
  {
    id: "r6",
    userId: "u1",
    kitabId: "kb16",
    halamanTerakhir: 48,
    persentaseSelesai: 100,
    terakhirDibukaAt: lalu(23),
  },
]

export const bookmarkList: Bookmark[] = [
  {
    id: "bm1",
    userId: "u1",
    kitabId: "kb1",
    halaman: 3,
    label: "Pembagian kalimah",
    createdAt: lalu(6),
  },
  {
    id: "bm2",
    userId: "u1",
    kitabId: "kb1",
    halaman: 11,
    label: "Bab na'at dan mafquh",
    createdAt: lalu(5),
  },
  {
    id: "bm3",
    userId: "u1",
    kitabId: "kb2",
    halaman: 12,
    label: "Isimah dan tanda rofa'",
    createdAt: lalu(2),
  },
  {
    id: "bm4",
    userId: "u1",
    kitabId: "kb2",
    halaman: 84,
    label: "Bab idhofah",
    createdAt: lalu(1),
  },
  {
    id: "bm5",
    userId: "u1",
    kitabId: "kb15",
    halaman: 49,
    label: "Kitab adab makan",
    createdAt: lalu(3),
  },
  {
    id: "bm6",
    userId: "u1",
    kitabId: "kb7",
    halaman: 22,
    label: "Syarat sah wudhu",
    createdAt: lalu(7),
  },
  {
    id: "bm7",
    userId: "u1",
    kitabId: "kb7",
    halaman: 71,
    label: "Rukun jual beli",
    createdAt: lalu(7),
  },
  {
    id: "bm8",
    userId: "u1",
    kitabId: "kb13",
    halaman: 8,
    label: "Hadis innamal a'mal",
    createdAt: lalu(11),
  },
  {
    id: "bm9",
    userId: "u1",
    kitabId: "kb16",
    halaman: 6,
    label: "Adab memilih guru",
    createdAt: lalu(22),
  },
  {
    id: "bm10",
    userId: "u1",
    kitabId: "kb10",
    halaman: 10,
    label: "Sifat dua puluh",
    createdAt: lalu(14),
  },
  {
    id: "bm11",
    userId: "u1",
    kitabId: "kb11",
    halaman: 302,
    label: "Tafsir ayat Al-Baqarah 261",
    createdAt: lalu(19),
  },
  {
    id: "bm12",
    userId: "u1",
    kitabId: "kb17",
    halaman: 41,
    label: "Hikmah ke-107",
    createdAt: lalu(27),
  },
]

export const catatanList: Catatan[] = [
  {
    id: "ct1",
    userId: "u1",
    kitabId: "kb2",
    halaman: 34,
    isi: "I'rab fa'il itu rofa'. Kalau fa'il datang sesudah fi'il, ia rofa' karena fi'il — contoh قَامَ زَيْدٌ. Kalau datang sebelum fi'il, periksa dulu apakah ia mubtada atau fa'il — contoh زَيْدٌ قَائِمٌ.",
    createdAt: lalu(1),
    updatedAt: lalu(1),
  },
  {
    id: "ct2",
    userId: "u1",
    kitabId: "kb1",
    halaman: 11,
    isi: "Tanda rofa' pada isim jama' adalah dhommah, sementara pada mu'rob binaa memakai dhommah juga. Jangan tertukar dengan nashabnya jama' ta'nis salim.",
    createdAt: lalu(5),
    updatedAt: lalu(4),
  },
  {
    id: "ct3",
    userId: "u1",
    kitabId: "kb15",
    halaman: 49,
    isi: "Adab makan: sebut nama Allah, makan yang terdekat, dan jangan mencela makanan. Cocok untuk bahan kultum malam Ahad.",
    createdAt: lalu(3),
    updatedAt: lalu(3),
  },
  {
    id: "ct4",
    userId: "u1",
    kitabId: "kb7",
    halaman: 71,
    isi: "Rukun jual beli: 'aqid, ma'qud 'alaih, dan shighat. Yang perlu diulang: syarat ma'qud 'alaih harus suci, bermanfaat, dan milik penjual.",
    createdAt: lalu(7),
    updatedAt: lalu(7),
  },
  {
    id: "ct5",
    userId: "u1",
    kitabId: "kb13",
    halaman: 8,
    isi: "Niat sebelum amal menentukan hukumnya. Hafalkan matn hadis ini untuk pembukaan pengajian.",
    createdAt: lalu(11),
    updatedAt: lalu(10),
  },
  {
    id: "ct6",
    userId: "u1",
    kitabId: "kb17",
    halaman: 41,
    isi: "Di antara tanda keberhasilan: berpaling dari apa yang tidak menjadi urusan Anda. Tandai untuk muhasabah pekanan.",
    createdAt: lalu(27),
    updatedAt: lalu(20),
  },
]

export const logAdminList: LogAdmin[] = [
  {
    id: "la1",
    adminId: "u4",
    aksi: "Mengganti file PDF",
    targetTabel: "kitab",
    targetId: "kb11",
    detail: "Berkas Tafsir Al-Jalalain diganti karena halaman 300–312 kabur.",
    createdAt: lalu(0),
  },
  {
    id: "la2",
    adminId: "u4",
    aksi: "Menerbitkan kitab",
    targetTabel: "kitab",
    targetId: "kb18",
    detail: "Bidayah Al-Hidayah dipublikasikan setelah rampung dicek.",
    createdAt: lalu(1),
  },
  {
    id: "la3",
    adminId: "u4",
    aksi: "Menambahkan pengarang",
    targetTabel: "pengarang",
    targetId: "pg21",
    detail: "Ahmad bin Ruslan masuk daftar pengarang rujukan.",
    createdAt: lalu(2),
  },
  {
    id: "la4",
    adminId: "u4",
    aksi: "Menonaktifkan akun",
    targetTabel: "users",
    targetId: "u7",
    detail: "Akun Fatimah Az-Zahra dinonaktifkan atas permintaan santri.",
    createdAt: lalu(4),
  },
  {
    id: "la5",
    adminId: "u4",
    aksi: "Menambahkan kategori",
    targetTabel: "kategori",
    targetId: "k8",
    detail: "Fan Ushul Fiqih dibuat untuk memisahkan kajian istimbath.",
    createdAt: lalu(6),
  },
  {
    id: "la6",
    adminId: "u4",
    aksi: "Memuat draf kitab",
    targetTabel: "kitab",
    targetId: "kb21",
    detail: "Ihya' Ulumiddin diunggah sebagai draf, menunggu cek jumlah halaman.",
    createdAt: lalu(9),
  },
]

/* ------------------------------------------------------------------ */
/* Helper baca — padanan query Drizzle pada Tahap 2                   */
/* ------------------------------------------------------------------ */

export type KitabTayang = Kitab & {
  kategori: Kategori
  pengarang: Pengarang
  syarah: Pengarang | null
}

const kategoriById = new Map(kategoriList.map((k) => [k.id, k]))
const pengarangById = new Map(pengarangList.map((p) => [p.id, p]))
const kitabById = new Map(kitabList.map((k) => [k.id, k]))

export function getKitab(id: string): Kitab | undefined {
  return kitabById.get(id)
}

export function joinKitab(row: Kitab): KitabTayang {
  return {
    ...row,
    kategori: kategoriById.get(row.kategoriId) ?? kategoriList[0],
    pengarang: pengarangById.get(row.pengarangId) ?? pengarangList[0],
    syarah: row.syarahId ? (pengarangById.get(row.syarahId) ?? null) : null,
  }
}

/** Hanya kitab berstatus published yang tampil di area publik (Bab 6.B). */
export function listKitabTayang(): KitabTayang[] {
  return kitabList.filter((k) => k.status === "published").map(joinKitab)
}

export function listSemuaKitab(): KitabTayang[] {
  return kitabList.map(joinKitab)
}

export function getKitabBySlug(slug: string): KitabTayang | undefined {
  const row = kitabList.find((k) => k.slug === slug)
  return row ? joinKitab(row) : undefined
}

export function getKitabTayangBySlug(slug: string): KitabTayang | undefined {
  const row = kitabList.find(
    (k) => k.slug === slug && k.status === "published",
  )
  return row ? joinKitab(row) : undefined
}

export type FilterKatalog = {
  q?: string
  kategori?: string
  pengarang?: string
  syarah?: string
  urut?: "terbaru" | "judul" | "terpopuler"
  halaman?: number
}

function cocokCari(k: KitabTayang, q: string) {
  const norm = (t: string) => t.toLocaleLowerCase("id")
  const haystack = [
    k.judulLatin,
    k.judulArab,
    k.pengarang.namaLatin,
    k.pengarang.namaArab,
    k.syarah?.namaLatin ?? "",
    k.kategori.nama,
  ]
    .map(norm)
    .join(" • ")
  return q
    .split(/\s+/)
    .filter(Boolean)
    .every((kata) => haystack.includes(norm(kata)))
}

export function cariKitab(filter: FilterKatalog) {
  const { q = "", kategori, pengarang, syarah, urut = "terbaru", halaman = 1 } =
    filter
  const perHalaman = 12

  let hasil = listKitabTayang()
  if (q.trim()) hasil = hasil.filter((k) => cocokCari(k, q.trim()))
  if (kategori) hasil = hasil.filter((k) => k.kategori.slug === kategori)
  if (pengarang) hasil = hasil.filter((k) => k.pengarang.id === pengarang)
  if (syarah) hasil = hasil.filter((k) => k.syarah?.id === syarah)

  hasil = [...hasil].sort((a, b) => {
    if (urut === "judul") return a.judulLatin.localeCompare(b.judulLatin, "id")
    if (urut === "terpopuler") return b.jumlahDibuka - a.jumlahDibuka
    return Date.parse(b.createdAt) - Date.parse(a.createdAt)
  })

  const totalHalaman = Math.max(1, Math.ceil(hasil.length / perHalaman))
  const aktif = Math.min(Math.max(1, halaman), totalHalaman)

  return {
    items: hasil.slice((aktif - 1) * perHalaman, aktif * perHalaman),
    total: hasil.length,
    totalHalaman,
    halaman: aktif,
    perHalaman,
  }
}

export function kitabTerkait(target: KitabTayang, batas = 4): KitabTayang[] {
  const skor = (k: KitabTayang) =>
    (k.kategoriId === target.kategoriId ? 2 : 0) +
    (k.pengarangId === target.pengarangId ? 1 : 0)
  return listKitabTayang()
    .filter((k) => k.id !== target.id)
    .map((k) => ({ k, s: skor(k) }))
    .sort((a, b) => b.s - a.s || b.k.jumlahDibuka - a.k.jumlahDibuka)
    .slice(0, batas)
    .map((x) => x.k)
}

/** Kitab pilihan minggu ini — kurasi tetap agar beranda tidak acak. */
export function kitabPilihan(): KitabTayang[] {
  return ["kb16", "kb7", "kb11", "kb15", "kb1"]
    .map((id) => kitabById.get(id))
    .filter((k): k is Kitab => Boolean(k))
    .map(joinKitab)
}

export function hitungKitabPerKategori() {
  const peta = new Map<string, number>()
  for (const k of listKitabTayang()) {
    peta.set(k.kategoriId, (peta.get(k.kategoriId) ?? 0) + 1)
  }
  return kategoriList.map((k) => ({
    kategori: k,
    jumlah: peta.get(k.id) ?? 0,
  }))
}

export function rekomendasiBerdasarkanFan(userId: string, batas = 4): KitabTayang[] {
  const dibaca = riwayatList.filter((r) => r.userId === userId)
  const fanSering = new Map<string, number>()
  for (const r of dibaca) {
    const kb = kitabById.get(r.kitabId)
    if (kb) fanSering.set(kb.kategoriId, (fanSering.get(kb.kategoriId) ?? 0) + 1)
  }
  const sudahDibaca = new Set(dibaca.map((r) => r.kitabId))
  const urutan = [...fanSering.entries()].sort((a, b) => b[1] - a[1]).map((e) => e[0])

  const kandidat = listKitabTayang().filter((k) => !sudahDibaca.has(k.id))
  return kandidat
    .sort(
      (a, b) =>
        urutan.indexOf(b.kategoriId) - urutan.indexOf(a.kategoriId) ||
        b.jumlahDibuka - a.jumlahDibuka,
    )
    .slice(0, batas)
}

export function statistikMember(userId: string) {
  const riwayat = riwayatList.filter((r) => r.userId === userId)
  const bookmark = bookmarkList.filter((b) => b.userId === userId)
  const catatan = catatanList.filter((c) => c.userId === userId)
  const lanjut = [...riwayat].sort(
    (a, b) => Date.parse(b.terakhirDibukaAt) - Date.parse(a.terakhirDibukaAt),
  )[0]

  return {
    kitabDibaca: riwayat.length,
    totalBookmark: bookmark.length,
    totalCatatan: catatan.length,
    halamanDibaca: riwayat.reduce((acc, r) => acc + r.halamanTerakhir, 0),
    rataRataProgres: riwayat.length
      ? Math.round(
          riwayat.reduce((acc, r) => acc + r.persentaseSelesai, 0) /
            riwayat.length,
        )
      : 0,
    kitabTerakhir: lanjut ? joinKitab(kitabById.get(lanjut.kitabId)!) : null,
    riwayatTerakhir: lanjut ?? null,
  }
}

export function listRiwayatDenganKitab(userId: string) {
  return riwayatList
    .filter((r) => r.userId === userId)
    .map((r) => ({ riwayat: r, kitab: joinKitab(kitabById.get(r.kitabId)!) }))
    .sort(
      (a, b) =>
        Date.parse(b.riwayat.terakhirDibukaAt) -
        Date.parse(a.riwayat.terakhirDibukaAt),
    )
}

export function listBookmarkGrupKitab(userId: string) {
  const milik = bookmarkList.filter((b) => b.userId === userId)
  const grup = new Map<string, Bookmark[]>()
  for (const b of milik) {
    grup.set(b.kitabId, [...(grup.get(b.kitabId) ?? []), b])
  }
  return [...grup.entries()]
    .map(([kitabId, items]) => ({
      kitab: joinKitab(kitabById.get(kitabId)!),
      items: items.sort((a, b) => a.halaman - b.halaman),
    }))
    .sort(
      (a, b) =>
        Date.parse(
          b.items[0].createdAt,
        ) - Date.parse(a.items[0].createdAt),
    )
}

export function listCatatanDenganKitab(userId: string) {
  return catatanList
    .filter((c) => c.userId === userId)
    .map((c) => ({ catatan: c, kitab: joinKitab(kitabById.get(c.kitabId)!) }))
    .sort((a, b) => Date.parse(b.catatan.updatedAt) - Date.parse(a.catatan.updatedAt))
}

export function statistikAdmin() {
  const tayang = kitabList.filter((k) => k.status === "published")
  const draf = kitabList.filter((k) => k.status === "draft")
  const arsip = kitabList.filter((k) => k.status === "archived")
  const totalSesi = kitabList.reduce((a, k) => a + k.jumlahDibuka, 0)

  return {
    totalKitab: tayang.length,
    totalDraf: draf.length,
    totalArsip: arsip.length,
    totalMember: penggunaList.filter((u) => u.role === "member").length,
    totalNonaktif: penggunaList.filter((u) => u.status === "nonaktif").length,
    totalHalaman: tayang.reduce((a, k) => a + k.jumlahHalaman, 0),
    totalSesi,
    kitabTerpopuler: [...tayang]
      .sort((a, b) => b.jumlahDibuka - a.jumlahDibuka)
      .slice(0, 6)
      .map(joinKitab),
    unggahanTerbaru: [...kitabList]
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      .slice(0, 5)
      .map(joinKitab),
    sebaranFan: hitungKitabPerKategori().sort((a, b) => b.jumlah - a.jumlah),
  }
}

export function listPenggunaDenganAktivitas() {
  return penggunaList.map((pengguna) => ({
    pengguna,
    jumlahBookmark: bookmarkList.filter((b) => b.userId === pengguna.id).length,
    jumlahCatatan: catatanList.filter((c) => c.userId === pengguna.id).length,
    jumlahRiwayat: riwayatList.filter((r) => r.userId === pengguna.id).length,
  }))
}

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
