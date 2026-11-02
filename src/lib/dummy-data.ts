/**
 * Data katalog untuk seed. Hanya `kategoriList`, `pengarangList`, dan `kitabList`
 * yang punya pemakai, yaitu `src/db/seed.ts`; seluruh halaman aplikasi membaca
 * dari database lewat `src/db/queries.ts`.
 */

export type StatusKitab = "draft" | "published" | "archived"

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
