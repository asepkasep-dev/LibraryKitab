"use client"

import { Badge } from "@/components/ui/badge"
import {
  KerjaEntitas,
  type BidangEntitas,
  type EntitasBaris,
  type KolomEntitas,
} from "@/components/admin/kerja-entitas"
import { hapusPengarang, simpanPengarang } from "@/actions/pengarang"
import { potongTeks } from "@/lib/format"
import { skemaPengarang } from "@/lib/validasi"

const BIDANG: BidangEntitas[] = [
  {
    kunci: "namaArab",
    label: "Nama Arab",
    jenis: "arab",
    petunjuk: "Tulis nama sebagaimana tercantum pada sampul kitab.",
  },
  {
    kunci: "namaLatin",
    label: "Nama Latin",
    jenis: "teks",
    petunjuk: "Transliterasi yang dipakai pada katalog, contoh: Ibnu Ajurrum.",
  },
  {
    kunci: "tahunWafat",
    label: "Tahun wafat",
    jenis: "teks",
    petunjuk: "Contoh: 723 H / 1323 M, atau “aktif abad ke-7 H”.",
  },
  {
    kunci: "biografiSingkat",
    label: "Biografi singkat",
    jenis: "textarea",
    petunjuk: "30 s.d. 600 karakter. Cukup guru, karya utama, dan aliran keilmuannya.",
    baris: 5,
  },
]

export function KelolaPengarang({
  namaEntitas,
  deskripsi,
  keteranganKolom,
  barisAwal,
}: {
  namaEntitas: string
  deskripsi: string
  /** Judul kolom jumlah kitab; peran berbeda pada halaman pengarang dan syarah. */
  keteranganKolom: string
  barisAwal: EntitasBaris[]
}) {
  const kolom: KolomEntitas[] = [
    {
      label: "Nama Latin",
      className: "min-w-52 px-5",
      sel: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.nilai.namaLatin}</p>
          <p className="truncate text-xs text-muted-foreground">{row.nilai.tahunWafat}</p>
        </div>
      ),
    },
    {
      label: "Nama Arab",
      className: "min-w-44",
      sel: (row) => (
        <span className="text-arabic text-base text-gold/90">{row.nilai.namaArab}</span>
      ),
    },
    {
      label: "Biografi",
      className: "min-w-72 text-sm text-muted-foreground",
      sel: (row) => potongTeks(row.nilai.biografiSingkat, 96),
    },
    {
      label: keteranganKolom,
      className: "text-center",
      sel: (row) => (
        <Badge variant="secondary" className="tabular-nums">
          {row.terkait ?? 0}
        </Badge>
      ),
    },
  ]

  return (
    <KerjaEntitas
      namaEntitas={namaEntitas}
      deskripsi={deskripsi}
      kolom={kolom}
      bidang={BIDANG}
      skema={skemaPengarang}
      barisAwal={barisAwal}
      contohNilai={{
        namaArab: "",
        namaLatin: "",
        tahunWafat: "",
        biografiSingkat: "",
      }}
      onSimpan={simpanPengarang}
      onHapus={hapusPengarang}
    />
  )
}
