/**
 * Pembuatan halaman dummy untuk reader (Task 1.4).
 * Pada Tahap 2 file ini digantikan renderer `pdfjs-dist`; bentuk keluarannya
 * tetap dipakai komponen halaman supaya UI tidak perlu ditulis ulang.
 */

import { z } from "zod"
import type { KitabVe } from "@/db/queries"

/** Rentang zoom sesuai Bab 6.C: 50% sampai 250%. */
export const ZOOM_MIN = 50
export const ZOOM_MAX = 250
export const ZOOM_BAKU = 100
export const ZOOM_LANGKAH = [50, 60, 75, 90, 100, 110, 125, 150, 175, 200, 250]

export const KUNCI_PREFERENSI_BACA = "kitabku:pembaca"
export const MAKS_LABEL_BOOKMARK = 80
export const MAKS_ISI_CATATAN = 2000
export const JEDA_SIMPAN_PROGRES_MS = 2000

export const skemaLabelBookmark = z
  .string()
  .trim()
  .max(MAKS_LABEL_BOOKMARK, `Label bookmark maksimal ${MAKS_LABEL_BOOKMARK} karakter.`)

export const skemaIsiCatatan = z
  .string()
  .trim()
  .min(3, "Tulis minimal 3 karakter agar catatannya berguna nanti.")
  .max(MAKS_ISI_CATATAN, `Catatan maksimal ${MAKS_ISI_CATATAN} karakter.`)

/** Semua id dari client dibandingkan pada kolom uuid, jadi bentuknya wajib uuid. */
export const skemaId = z.uuid("Identitas data tidak dikenali.")

export const skemaKitabHalaman = z.object({
  kitabId: skemaId,
  halaman: z.number().int("Nomor halaman memakai bilangan bulat.").min(1),
})

export function batasiZoom(nilai: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(nilai)))
}

/** Naik/turun satu langkah pada daftar ZOOM_LANGKAH. */
export function langkahZoom(zoomSaatIni: number, arah: 1 | -1) {
  if (arah === 1) {
    return ZOOM_LANGKAH.find((z) => z > zoomSaatIni) ?? ZOOM_MAX
  }
  const sebelum = ZOOM_LANGKAH.filter((z) => z < zoomSaatIni)
  return sebelum[sebelum.length - 1] ?? ZOOM_MIN
}

type Kutipan = { arab: string; arti: string }

/**
 * Korpus kutipan berbahasa Arab beserta terjemahnya. Isinya kalimat umum
 * keilmuan pesantren, bukan petikan matn tertentu, supaya aman dipakai
 * sebagai simulasi halaman.
 */
const KUTIPAN: Kutipan[] = [
  {
    arab: "اِعْلَمْ أَنَّ الْعِلْمَ لَا يُنَالُ إِلَّا بِالْحِرْصِ وَدَوَامِ الْمُطَالَعَةِ",
    arti: "Ketahuilah bahwa ilmu tidak akan diraih kecuali dengan kesungguhan dan rutin membaca.",
  },
  {
    arab: "الْمَبْحَثُ الْأَوَّلُ فِي تَقْسِيمِ الْكَلَامِ إِلَى اسْمٍ وَفِعْلٍ وَحَرْفٍ",
    arti: "Pembahasan pertama membagi kalimat menjadi isim, fi'il, dan huruf.",
  },
  {
    arab: "الْإِعْرَابُ هُوَ تَغَيُّرُ أَحْوَالِ أَوَاخِرِ الْكَلِمَاتِ لِمُوجِبٍ",
    arti: "I'rab ialah berubahnya kondisi akhir kalimat karena sebab yang mengharapkannya.",
  },
  {
    arab: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    arti: "Setiap amal bergantung niat, dan setiap orang hanya memperoleh apa yang ia niatkan.",
  },
  {
    arab: "الْفِقْهُ هُوَ الْعِلْمُ بِالْأَحْكَامِ الشَّرْعِيَّةِ الْعَمَلِيَّةِ الْمُسْتَنْبَطَةِ مِنَ الْأَدِلَّةِ",
    arti: "Fikih adalah pengetahuan tentang hukum syar'i yang amaliyah yang digali dari dalil yang rinci.",
  },
  {
    arab: "لَا ضَرَرَ وَلَا ضِرَارَ فِي أَحْكَامِ الْمُعَامَلَاتِ",
    arti: "Tidak boleh membahayakan diri sendiri maupun membahayakan orang lain dalam muamalah.",
  },
  {
    arab: "الْيَقِينُ لَا يَزُولُ بِالشَّكِّ",
    arti: "Keyakinan tidak hilang hanya karena keraguan yang datang belakangan.",
  },
  {
    arab: "أَصْلُ التَّوْحِيدِ إِفْرَادُ اللَّهِ بِالرُّبُوبِيَّةِ وَالْأُلُوهِيَّةِ وَالْأَسْمَاءِ وَالصِّفَاتِ",
    arti: "Dasar tauhid adalah mengesakan Allah dalam rububiah, uluhiah, nama, dan sifat-Nya.",
  },
  {
    arab: "الْقُرْآنُ كَلَامُ اللَّهِ تَعَالَى وَتِلَاوَتُهُ عِبَادَةٌ",
    arti: "Al-Qur'an adalah kalam Allah Ta'ala, dan membacanya bernilai ibadah.",
  },
  {
    arab: "مَقَاصِدُ الشَّارِعِ حِفْظُ الدِّينِ وَالنَّفْسِ وَالْعَقْلِ وَالنَّسْلِ وَالْمَالِ",
    arti: "Tujuan syariat adalah menjaga agama, jiwa, akal, keturunan, dan harta.",
  },
  {
    arab: "الْإِسْنَادُ مِنَ الدِّينِ وَلَوْلَا الْإِسْنَادُ لَقَالَ مَنْ شَاءَ مَا شَاءَ",
    arti: "Sanad itu bagian dari agama; seandainya tidak ada sanad, siapa pun akan berkata sesuai keinginannya.",
  },
  {
    arab: "الْحِكْمَةُ ضَالَّةُ الْمُؤْمِنِ حَيْثُمَا وَجَدَهَا هُوَ أَحَقُّ بِهَا",
    arti: "Hikmah adalah barang yang hilang milik orang beriman; di mana pun ia menemukannya, dialah yang paling berhak.",
  },
  {
    arab: "تَزْكِيَةُ النَّفْسِ فَرْضٌ عَيْنٍ قَبْلَ فُرُوضِ الْجَوَارِحِ",
    arti: "Membersihkan jiwa itu kewajiban individual sebelum kewajiban anggota lahir.",
  },
  {
    arab: "الصَّبْرُ حَبْسُ النَّفْسِ عَنِ الْجَزَعِ وَاللِّسَانِ عَنِ الشَّكْوَى",
    arti: "Sabar adalah menahan diri dari keluh kesah dan menahan lisan dari pengaduan.",
  },
  {
    arab: "الشَّرَفُ فِي طَلَبِ الْعِلْمِ أَعْظَمُ مِنَ الشَّرَفِ فِي كَثْرَةِ الْمَالِ",
    arti: "Kemuliaan dalam menuntut ilmu lebih besar daripada kemuliaan karena banyak harta.",
  },
  {
    arab: "مَنْ عَمِلَ بِمَا عَلِمَ وَرَّثَهُ اللَّهُ عِلْمَ مَا لَمْ يَعْلَمْ",
    arti: "Barang siapa mengamalkan ilmu yang ia ketahui, Allah mewariskan ilmu yang belum ia ketahui.",
  },
]

const BAB_FAN: Record<string, string[]> = {
  nahwu: [
    "Pembagian Kalimah",
    "Tanda-Tanda Isim",
    "Bab I'rab",
    "Bab Na'at dan mafquh",
    "Bab 'Athaf",
    "Bab Idhafah",
    "Amil yang Menashabkan",
    "Bab Shalah",
  ],
  sharaf: [
    "Fi'il Mujarad dan Mazid",
    "Wazan Tsulasi",
    "Bab Isim Fa'il",
    "Bab Isim Maf'ul",
    "Mu'rob dan Mabni",
    "Bab Jamak",
    "Isim Tamyiz",
    "Bab Shighat Mubalaghah",
  ],
  fiqih: [
    "Bab Thaharah",
    "Syarat Sah Wudhu",
    "Bab Shalat",
    "Bab Zakat",
    "Bab Puasa",
    "Rukun Jual Beli",
    "Bab Riba",
    "Bab Gadai",
  ],
  tauhid: [
    "Dalil Adanya Allah",
    "Sifat Dua Puluh",
    "Bab Syirik",
    "Kalam dan Sifat Khabariyah",
    "Bab Qada dan Qadar",
    "Iman dan Islam",
    "Bab Rasul dan Sifatnya",
    "Bahasan Ahwal",
  ],
  tafsir: [
    "Muqaddimah Ilmu Tafsir",
    "Tafsir Ayat Al-Fatihah",
    "Tafsir Ayat Kursi",
    "Ayat Ahkam",
    "Sebab Nuzul",
    "Bab Nasikh dan Mansukh",
    "Qira'at",
    "Balaghah Al-Qur'an",
  ],
  hadis: [
    "Hadis Arba'in Pertama",
    "Sanad dan Matan",
    "Bab Hadis Shahih",
    "Bab Hadis Hasan",
    "Ilmu Mustalah",
    "Syarah Gharib",
    "Bab Amr dan Nahy",
    "Hadis Ahad",
  ],
  "akhlak-tasawuf": [
    "Bab Ikhlas",
    "Bab Sabar dan Syukur",
    "Adab Makan dan Minum",
    "Adab Memilih Guru",
    "Bab Muhasabah",
    "Bahaya Riya' dan Ujub",
    "Bab Tawakal",
    "Hikmah dan Mauidzah",
  ],
  "ushul-fiqih": [
    "Definisi Ushul Fikih",
    "Bab Amr",
    "Bab Nahy",
    "'Am dan Khash",
    "Qiyas dan Rukunnya",
    "Ijma dan Ikhtilaf",
    "Bab Istishhab",
    "Maqashid Syariah",
  ],
}

const BAB_PENGANTAR = "Muqaddimah"
const BAB_PENUTUP = "Khatimah"

const PARAGRAF_UMUM = [
  "Pengajian pagi di serambi musala biasanya membahas satu bab kecil ini tiga sampai empat kali pertemuan. Santri menandai baris yang sering ditanyakan agar mudah diulang ketika muraja'ah malam Ahad.",
  "Ungkapan pendek di halaman ini mengandung syarat dan pengikat yang sering tertukar hafalannya. Karena itu Kiai menganjurkan menuliskan contoh penerapannya di samping matan.",
  "Bagian ini menjadi pintu masuk menuju pembahasan berikutnya. Setelah mantap pada halaman ini, rangkaian bab sesudahnya terasa lebih ringan diikuti.",
  "Pada edisi cetak yang lama, penjelasan tambahan diletakkan sebagai hasyiyah di pinggir halaman. Dalam tampilan ini penjelasan tersebut diringkas dalam bahasa Indonesia.",
  "Cobalah menutup halaman lalu menyebutkan ulang intinya tanpa melihat. Cara sederhana ini terbukti membuat matan lebih melekat daripada membaca berulang tanpa dihafalkan.",
  "Catatan penting: penulis memulai dengan definisi, dilanjutkan contoh, lalu menyebutkan pendapat yang kuat di antara beberapa pendapat yang beredar di pesantren.",
  "Jika masih ragu, tandai halaman ini dengan bookmark agar dapat ditanyakan langsung kepada ustadz pengampu bandongan sebelum giliran bacaan bergeser jauh.",
  "Kandungan halaman ini sering dijadikan bahan kultum karena ringkas dan mudah dipraktikkan sehari-hari di lingkungan pesantren.",
]

const PARAGRAF_FAN: Record<string, string[]> = {
  nahwu: [
    "Contoh penerapan bab ini biasanya diambil dari kalimat pendek yang sering muncul dalam kitab turats, lalu diurai satu per satu kedudukannya sebagai mubtada, khobar, fa'il, atau maf'ul.",
  ],
  sharaf: [
    "Perubahan bentuk kata dipaparkan berdasar wazan agar santri dapat mengenali pola, bukan sekadar menghafal satu kata.",
  ],
  fiqih: [
    "Urutan rukun dan syarat ditulis bertingkat supaya mudah dicek ketika mempraktikkan ibadah atau menyusun akad.",
  ],
  tauhid: [
    "Pembahasan akidah disajikan dengan dalil aqli dan naqli berdampingan agar mudah dijelaskan kepada santri tingkat awal.",
  ],
  tafsir: [
    "Ayat diterangkan dari sisi makna kosakata, susunan kalimat, dan sebab turunnya, kemudian ditutup dengan pelajaran yang dapat diambil.",
  ],
  hadis: [
    "Hadis disajikan lengkap dengan sanad ringkas, penjelasan kata asing, dan faedah hukum yang dapat dipraktikkan.",
  ],
  "akhlak-tasawuf": [
    "Nasehat dalam bab ini lebih banyak menyentuh sikap batin, sehingga cocok dibaca pelan disertai muhasabah.",
  ],
  "ushul-fiqih": [
    "Kaidah ushul diuraikan dengan contoh penerapan pada cabang fikih agar tidak berhenti sebagai definisi kosong.",
  ],
}

function hashTeks(teks: string) {
  let hash = 5381
  for (let i = 0; i < teks.length; i += 1) {
    hash = (hash * 33) ^ teks.charCodeAt(i)
  }
  return Math.abs(hash >>> 0)
}

/** Pembangkit angka acak yang hasilnya selalu sama untuk seed yang sama. */
function acakTerpancing(seed: number) {
  let state = seed || 1
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

export function namaBab(
  kategoriSlug: string,
  nomor: number,
  jumlahHalaman: number,
) {
  if (nomor <= 2) return BAB_PENGANTAR
  if (nomor >= jumlahHalaman - 1) return BAB_PENUTUP
  const daftar = BAB_FAN[kategoriSlug] ?? BAB_FAN.nahwu
  const urutanBab = Math.floor((nomor - 3) / 6)
  return daftar[urutanBab % daftar.length]
}

export type HalamanDummy = {
  nomor: number
  bab: string
  kutipan: Kutipan[]
  paragraf: string[]
  hiasan: boolean
}

/**
 * Mensimulasikan satu halaman kitab: beberapa baris Arab beserta terjemahnya
 * dan paragraf penjelasan. Konten ditentukan oleh slug dan nomor halaman
 * sehingga berpindah bolak-balik tidak mengubah isi halaman.
 */
export function buatHalamanDummy(
  kitab: Pick<KitabVe, "slug" | "jumlahHalaman"> & { kategori: { slug: string } },
  nomor: number,
): HalamanDummy {
  const acak = acakTerpancing(hashTeks(`${kitab.slug}:${nomor}`))
  const jumlahKutipan = 2 + Math.floor(acak() * 3)
  const awal = Math.floor(acak() * (KUTIPAN.length - jumlahKutipan))
  const kutipan = KUTIPAN.slice(awal, awal + jumlahKutipan)

  const khusus = PARAGRAF_FAN[kitab.kategori.slug] ?? []
  const paragraf: string[] = []
  if (khusus.length > 0) paragraf.push(khusus[Math.floor(acak() * khusus.length)])
  const jumlahParagraf = 2 + Math.floor(acak() * 2)
  let penjaga = 0
  while (paragraf.length < jumlahParagraf && penjaga < 12) {
    const kandidat = PARAGRAF_UMUM[Math.floor(acak() * PARAGRAF_UMUM.length)]
    if (!paragraf.includes(kandidat)) paragraf.push(kandidat)
    penjaga += 1
  }

  return {
    nomor,
    bab: namaBab(kitab.kategori.slug, nomor, kitab.jumlahHalaman),
    kutipan,
    paragraf,
    hiasan: acak() > 0.72,
  }
}
