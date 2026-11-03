"use client"

import Link from "next/link"
import { Eye, FileText, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import type { KitabVe, StatusKitab } from "@/db/queries"
import { formatTanggalSingkat, formatUkuranBerkas, waktuRelatif } from "@/lib/format"

export function DaftarKitab({
  hasil,
  sedangDikerjakan,
  onGantiStatus,
  onAjukanHapus,
}: {
  hasil: KitabVe[]
  sedangDikerjakan: boolean
  onGantiStatus: (target: KitabVe, berikutnya: StatusKitab) => void
  onAjukanHapus: (target: KitabVe) => void
}) {
  return hasil.length === 0 ? (
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
                      onValueChange={(nilai) => onGantiStatus(kitab, nilai as StatusKitab)}
                      disabled={sedangDikerjakan}
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
                      onClick={() => onAjukanHapus(kitab)}
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
  )
}
