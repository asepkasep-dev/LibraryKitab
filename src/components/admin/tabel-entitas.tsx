"use client"

import { Layers, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/site/primitives"
import { cn } from "@/lib/utils"
import type { EntitasBaris, KolomEntitas } from "@/lib/admin-entitas"

export function TabelEntitas({
  namaEntitas,
  kolom,
  hasil,
  adaData,
  sedangDikerjakan,
  onUbah,
  onAjukanHapus,
}: {
  namaEntitas: string
  kolom: KolomEntitas[]
  hasil: EntitasBaris[]
  adaData: boolean
  sedangDikerjakan: boolean
  onUbah: (target: EntitasBaris) => void
  onAjukanHapus: (target: EntitasBaris) => void
}) {
  return (
    <div className="surface-card overflow-hidden">
      {hasil.length === 0 ? (
        <EmptyState
          ikon={<Layers className="size-6" strokeWidth={1.75} />}
          judul={adaData ? "Belum ada data yang cocok" : "Belum ada data"}
          pesan={
            adaData
              ? `Ubah kata kunci pencarian, atau tambahkan ${namaEntitas.toLowerCase()} baru lewat tombol di atas.`
              : `Tambahkan ${namaEntitas.toLowerCase()} pertama lewat tombol di atas agar kitab dapat memakai data ini.`
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                {kolom.map((item) => (
                  <TableHead key={item.label} className={item.className}>
                    {item.label}
                  </TableHead>
                ))}
                <TableHead className="px-5 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasil.map((row) => {
                const terpakai = (row.terkait ?? 0) > 0
                return (
                  <TableRow key={row.id} className="border-white/5">
                    {kolom.map((item) => (
                      <TableCell key={item.label} className={item.className}>
                        {item.sel(row)}
                      </TableCell>
                    ))}
                    <TableCell className="px-5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Ubah ${namaEntitas}`}
                          disabled={sedangDikerjakan}
                          onClick={() => onUbah(row)}
                        >
                          <Pencil className="size-4" strokeWidth={1.75} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className={cn(
                            "text-muted-foreground",
                            !terpakai && "hover:text-destructive",
                          )}
                          disabled={sedangDikerjakan}
                          aria-label={
                            terpakai
                              ? `${namaEntitas} masih dipakai kitab`
                              : `Hapus ${namaEntitas}`
                          }
                          onClick={() => onAjukanHapus(row)}
                        >
                          <Trash2 className="size-4" strokeWidth={1.75} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
