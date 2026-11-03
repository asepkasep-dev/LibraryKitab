"use client"

import Link from "next/link"
import { Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SEMUA } from "@/lib/admin-kitab"

export function SaringanKitab({
  kata,
  status,
  kategori,
  kategoriOpsi,
  jumlah,
  adaSaringan,
  onKata,
  onStatus,
  onKategori,
  onBersihkan,
}: {
  kata: string
  status: string
  kategori: string
  kategoriOpsi: [string, string][]
  jumlah: { total: number; tayang: number; draf: number; arsip: number }
  adaSaringan: boolean
  onKata: (nilai: string) => void
  onStatus: (nilai: string) => void
  onKategori: (nilai: string) => void
  onBersihkan: () => void
}) {
  return (
    <div className="surface-card space-y-4 p-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_14rem]">
        <div className="space-y-1.5">
          <Label htmlFor="cari-kitab">Cari kitab</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="cari-kitab"
              value={kata}
              onChange={(e) => onKata(e.target.value)}
              placeholder="judul, pengarang, atau slug…"
              className="h-10 ps-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-status">Status publikasi</Label>
          <Select value={status} onValueChange={onStatus}>
            <SelectTrigger id="filter-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SEMUA}>Semua status</SelectItem>
              <SelectItem value="published">Tayang</SelectItem>
              <SelectItem value="draft">Draf</SelectItem>
              <SelectItem value="archived">Arsip</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-kategori">Kategori / fan</Label>
          <Select value={kategori} onValueChange={onKategori}>
            <SelectTrigger id="filter-kategori" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SEMUA}>Semua fan</SelectItem>
              {kategoriOpsi.map(([id, nama]) => (
                <SelectItem key={id} value={id}>
                  {nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="surface-inset px-2.5 py-1 tabular-nums">
          {jumlah.total} kitab
        </span>
        <span className="surface-inset px-2.5 py-1 tabular-nums">
          {jumlah.tayang} tayang
        </span>
        <span className="surface-inset px-2.5 py-1 tabular-nums">
          {jumlah.draf} draf
        </span>
        <span className="surface-inset px-2.5 py-1 tabular-nums">
          {jumlah.arsip} arsip
        </span>
        {adaSaringan && (
          <Button
            variant="ghost"
            size="xs"
            className="gap-1"
            onClick={onBersihkan}
          >
            <X className="size-3.5" strokeWidth={1.75} />
            Bersihkan saringan
          </Button>
        )}
        <Button asChild size="xs" variant="outline" className="ms-auto gap-1.5">
          <Link href="/admin/kitab/baru">
            <Plus className="size-3.5" strokeWidth={1.75} />
            Unggah kitab
          </Link>
        </Button>
      </div>
    </div>
  )
}
