"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { Plus, Search, Eye, FileText, LoaderCircle, Pencil, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { KitabCover } from "@/components/site/kitab-cover"
import { StatusKitabBadge } from "@/components/site/status-badge"
import { EmptyState } from "@/components/site/primitives"
import { toast } from "sonner"
import { gantiStatusKitab, hapusKitab } from "@/actions/kitab"
import type { KitabVe, StatusKitab } from "@/db/queries"
import { formatTanggalSingkat, formatUkuranBerkas, waktuRelatif } from "@/lib/format"

const SEMUA = "semua"

const LABEL_STATUS: Record<StatusKitab, string> = {
  published: "Tayang",
  draft: "Draf",
  archived: "Arsip",
}

export function TabelKitab({ awal }: { awal: KitabVe[] }) {
  const [kata, setKata] = useState("")
  const [kataDiterapkan, setKataDiterapkan] = useState("")
  const [status, setStatus] = useState<string>(SEMUA)
  const [kategori, setKategori] = useState<string>(SEMUA)
  const [konfirmasi, setKonfirmasi] = useState<KitabVe | null>(null)
  const [isPending, jalankan] = useTransition()

  useEffect(() => {
    const jeda = setTimeout(() => setKataDiterapkan(kata.trim().toLowerCase()), 300)
    return () => clearTimeout(jeda)
  }, [kata])

  const kategoriOpsion = useMemo(() => {
    const peta = new Map<string, string>()
    for (const kitab of awal) peta.set(kitab.kategoriId, kitab.kategori.nama)
    return [...peta.entries()].sort((a, b) => a[1].localeCompare(b[1], "id"))
  }, [awal])

  const hasil = useMemo(
    () =>
      awal
        .filter((kitab) => (status === SEMUA ? true : kitab.status === status))
        .filter((kitab) => (kategori === SEMUA ? true : kitab.kategoriId === kategori))
        .filter((kitab) => {
          if (!kataDiterapkan) return true
          return [
            kitab.judulLatin,
            kitab.judulArab,
            kitab.pengarang.namaLatin,
            kitab.kategori.nama,
            kitab.slug,
          ].some((teks) => teks.toLowerCase().includes(kataDiterapkan))
        })
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
    [awal, status, kategori, kataDiterapkan],
  )

  const jumlah = {
    tayang: awal.filter((k) => k.status === "published").length,
    draf: awal.filter((k) => k.status === "draft").length,
    arsip: awal.filter((k) => k.status === "archived").length,
  }

  /** Daftar dibaca ulang lewat `revalidatePath` pada aksi, jadi tidak ada salinan lokal. */
  function hapus() {
    const target = konfirmasi
    if (!target) return
    setKonfirmasi(null)
    jalankan(async () => {
      const respons = await hapusKitab(target.id)
      if (!respons.ok) {
        toast.error(respons.pesan)
        return
      }
      toast.success(respons.pesan)
    })
  }

  function gantiStatus(target: KitabVe, berikutnya: string) {
    if (berikutnya === target.status) return
    jalankan(async () => {
      const respons = await gantiStatusKitab(target.id, berikutnya as StatusKitab)
      if (!respons.ok) {
        toast.error(respons.pesan)
        return
      }
      toast.success(respons.pesan)
    })
  }

  return (
    <div className="space-y-5">
      <div className="surface-card space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_14rem]">
          <div className="space-y-1.5">
            <Label htmlFor="cari-kitab">Cari kitab</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="cari-kitab"
                value={kata}
                onChange={(e) => setKata(e.target.value)}
                placeholder="judul, pengarang, atau slug…"
                className="h-10 ps-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filter-status">Status publikasi</Label>
            <Select value={status} onValueChange={setStatus}>
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
            <Select value={kategori} onValueChange={setKategori}>
              <SelectTrigger id="filter-kategori" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SEMUA}>Semua fan</SelectItem>
                {kategoriOpsion.map(([id, nama]) => (
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
            {awal.length} kitab
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
          {(kataDiterapkan || status !== SEMUA || kategori !== SEMUA) && (
            <Button
              variant="ghost"
              size="xs"
              className="gap-1"
              onClick={() => {
                setKata("")
                setStatus(SEMUA)
                setKategori(SEMUA)
              }}
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

      {hasil.length === 0 ? (
        <EmptyState
          ikon={<FileText className="size-6" strokeWidth={1.75} />}
          judul="Tidak ada kitab yang cocok"
          pesan="Longgarkan saringan status dan kategori, atau unggah kitab baru untuk menambah koleksi."
          aksi={
            <Button asChild>
              <Link href="/admin/kitab/baru">Unggah kitab baru</Link>
            </Button>
          }
        />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="min-w-[20rem] px-5">Judul</TableHead>
                  <TableHead className="min-w-[12rem]">Kategori</TableHead>
                  <TableHead className="min-w-[9rem]">Status</TableHead>
                  <TableHead className="min-w-[9rem]">Berkas</TableHead>
                  <TableHead className="min-w-[11rem]">Diperbarui</TableHead>
                  <TableHead className="min-w-[12rem] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasil.map((kitab) => (
                  <TableRow key={kitab.id} className="border-white/5">
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <KitabCover kitab={kitab} sizes="micro" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{kitab.judulLatin}</p>
                          <p className="text-arabic truncate text-xs text-muted-foreground">
                            {kitab.judulArab}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {kitab.pengarang.namaLatin}
                            {kitab.syarah && ` · syarah ${kitab.syarah.namaLatin}`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {kitab.kategori.nama}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <StatusKitabBadge status={kitab.status} />
                        <Select
                          value={kitab.status}
                          onValueChange={(nilai) => gantiStatus(kitab, nilai)}
                          disabled={isPending}
                        >
                          <SelectTrigger
                            size="sm"
                            className="w-[10rem]"
                            aria-label={`Ubah status ${kitab.judulLatin}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Simpan sebagai draf</SelectItem>
                            <SelectItem value="published">Tayangkan</SelectItem>
                            <SelectItem value="archived">Arsipkan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {formatUkuranBerkas(kitab.ukuranPdfByte)}
                      <span className="block">
                        {kitab.jumlahHalaman} hlm · {kitab.jumlahDibuka}× dibuka
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {waktuRelatif(kitab.updatedAt)}
                      <span className="block text-[11px] text-muted-foreground/80">
                        {formatTanggalSingkat(kitab.updatedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon-sm" aria-label={`Pratinjau ${kitab.judulLatin}`}>
                          <Link href={`/baca/${kitab.slug}`}>
                            <Eye className="size-4" strokeWidth={1.75} />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon-sm" aria-label={`Ubah ${kitab.judulLatin}`}>
                          <Link href={`/admin/kitab/${kitab.id}/edit`}>
                            <Pencil className="size-4" strokeWidth={1.75} />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Hapus ${kitab.judulLatin}`}
                          onClick={() => setKonfirmasi(kitab)}
                        >
                          <Trash2 className="size-4" strokeWidth={1.75} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Dialog open={konfirmasi !== null} onOpenChange={(buka) => !buka && setKonfirmasi(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Hapus kitab ini?</DialogTitle>
            <DialogDescription>
              {konfirmasi
                ? `${konfirmasi.judulLatin} (${LABEL_STATUS[konfirmasi.status]}) akan dihapus dari perpustakaan beserta bookmark dan catatan yang menunjuk halaman kitab ini.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="surface-inset space-y-1 p-3 text-xs text-muted-foreground">
            <p>
              Slug: <span className="font-mono text-foreground">{konfirmasi?.slug}</span>
            </p>
            <p>
              Berkas: <span className="text-foreground">{konfirmasi?.urlPdf}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setKonfirmasi(null)}>
              Batal
            </Button>
            <Button variant="solidDestructive" className="gap-2" disabled={isPending} onClick={hapus}>
              {isPending && <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />}
              Hapus kitab
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
