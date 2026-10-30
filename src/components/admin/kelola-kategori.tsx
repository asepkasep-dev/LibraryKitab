"use client"

import { Badge } from "@/components/ui/badge"
import {
  KerjaEntitas,
  type BidangEntitas,
  type EntitasBaris,
  type KolomEntitas,
} from "@/components/admin/kerja-entitas"
import { hapusKategori, simpanKategori } from "@/actions/kategori"
import { potongTeks } from "@/lib/format"
import { skemaKategori } from "@/lib/validasi"

const BIDANG: BidangEntitas[] = [
  {
    kunci: "nama",
    label: "Nama kategori / fan",
    jenis: "teks",
    petunjuk: "Contoh: Ushul Fiqih",
  },
  {
    kunci: "slug",
    label: "Slug",
    jenis: "slug",
    slugDari: "nama",
    petunjuk: "Otomatis dari nama, dipakai pada parameter filter katalog.",
  },
  {
    kunci: "deskripsi",
    label: "Deskripsi fan",
    jenis: "textarea",
    petunjuk: "20–400 karakter. Jelaskan cakupan ilmu dan contoh kitabnya.",
    baris: 5,
  },
]

export function KelolaKategori({ barisAwal }: { barisAwal: EntitasBaris[] }) {
  const kolom: KolomEntitas[] = [
    {
      label: "Nama fan",
      className: "min-w-44 px-5",
      sel: (row) => <span className="font-medium">{row.nilai.nama}</span>,
    },
    {
      label: "Slug",
      className: "min-w-36",
      sel: (row) => (
        <code className="rounded-lg bg-white/5 px-2 py-1 font-mono text-xs text-teal-300">
          {row.nilai.slug}
        </code>
      ),
    },
    {
      label: "Deskripsi",
      className: "min-w-72 text-sm text-muted-foreground",
      sel: (row) => <span className="line-clamp-2">{potongTeks(row.nilai.deskripsi, 110)}</span>,
    },
    {
      label: "Kitab",
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
      namaEntitas="Kategori"
      deskripsi="Kategori menjadi penyaring utama di katalog. Slug dibuat otomatis dari nama agar tautan filter tetap stabil."
      kolom={kolom}
      bidang={BIDANG}
      skema={skemaKategori}
      barisAwal={barisAwal}
      contohNilai={{ nama: "", slug: "", deskripsi: "" }}
      onSimpan={simpanKategori}
      onHapus={hapusKategori}
    />
  )
}
