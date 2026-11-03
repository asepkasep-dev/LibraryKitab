"use client"

import { Search, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SEMUA } from "@/lib/admin-pengguna"

export function SaringanPengguna({
  kata,
  peran,
  akses,
  jumlah,
  onKata,
  onPeran,
  onAkses,
}: {
  kata: string
  peran: string
  akses: string
  jumlah: { total: number; nonaktif: number; pengelola: number }
  onKata: (nilai: string) => void
  onPeran: (nilai: string) => void
  onAkses: (nilai: string) => void
}) {
  return (
    <div className="surface-card space-y-4 p-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem_13rem]">
        <div className="space-y-1.5">
          <Label htmlFor="cari-pengguna">Cari pengguna</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="cari-pengguna"
              value={kata}
              onChange={(e) => onKata(e.target.value)}
              placeholder="nama, email, atau kelas…"
              className="h-10 ps-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-peran">Jenis peran</Label>
          <Select value={peran} onValueChange={onPeran}>
            <SelectTrigger id="filter-peran" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SEMUA}>Semua peran</SelectItem>
              <SelectItem value="santri">Santri</SelectItem>
              <SelectItem value="ustadz">Ustadz</SelectItem>
              <SelectItem value="belum-diisi">Belum diisi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-akses">Hak akses</Label>
          <Select value={akses} onValueChange={onAkses}>
            <SelectTrigger id="filter-akses" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SEMUA}>Semua akun</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="surface-inset px-2.5 py-1 tabular-nums">
          {jumlah.total} akun terdaftar
        </span>
        <span className="surface-inset px-2.5 py-1 tabular-nums">
          {jumlah.nonaktif} nonaktif
        </span>
        <span className="surface-inset px-2.5 py-1 tabular-nums">
          {jumlah.pengelola} pengelola
        </span>
        <span className="ms-auto inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-gold/85" strokeWidth={1.75} />
          Menonaktifkan akun tidak menghapus bookmark dan catatan.
        </span>
      </div>
    </div>
  )
}
