"use client"

import { UserRound } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusPenggunaBadge } from "@/components/site/status-badge"
import { EmptyState } from "@/components/site/primitives"
import type { BarisPengguna } from "@/lib/admin-pengguna"
import { formatTanggal, inisialNama } from "@/lib/format"

export function DaftarPengguna({
  hasil,
  adaData,
  sedangDikerjakan,
  pengelolaId,
  onUbahPeran,
  onAjukanUbahStatus,
}: {
  hasil: BarisPengguna[]
  adaData: boolean
  sedangDikerjakan: boolean
  pengelolaId: string
  onUbahPeran: (target: BarisPengguna, role: string) => void
  onAjukanUbahStatus: (target: BarisPengguna) => void
}) {
  return hasil.length === 0 ? (
    <EmptyState
      ikon={<UserRound className="size-6" strokeWidth={1.75} />}
      judul={adaData ? "Pengguna tidak ditemukan" : "Belum ada akun tercatat"}
      pesan={
        adaData
          ? "Coba ubah kata kunci pencarian atau kembalikan filter peran dan hak akses ke semua."
          : "Akun muncul di sini setelah santri mendaftar lewat Clerk atau setelah webhook tersambung."
      }
    />
  ) : (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="min-w-[17rem] px-5">Pengguna</TableHead>
              <TableHead className="min-w-[11rem]">Peran</TableHead>
              <TableHead className="min-w-[13rem]">Aktivitas</TableHead>
              <TableHead className="min-w-[11rem]">Bergabung</TableHead>
              <TableHead className="min-w-[13rem]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasil.map((row) => (
              <TableRow key={row.pengguna.id} className="border-white/5">
                <TableCell className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-gold/15 font-heading text-xs text-gold">
                        {inisialNama(row.pengguna.namaLengkap)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {row.pengguna.namaLengkap}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {row.pengguna.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Select
                      value={row.pengguna.role}
                      onValueChange={(nilai) => onUbahPeran(row, nilai)}
                      disabled={sedangDikerjakan || row.pengguna.id === pengelolaId}
                    >
                      <SelectTrigger
                        size="sm"
                        className="w-[10rem]"
                        aria-label={`Ubah hak akses ${row.pengguna.namaLengkap}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Pengelola</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {row.pengguna.jenisPeran === "ustadz"
                        ? "Ustadz"
                        : row.pengguna.jenisPeran === "santri"
                          ? "Santri"
                          : "Peran belum diisi"}
                      {row.pengguna.kelas && ` · ${row.pengguna.kelas}`}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground tabular-nums">
                  <span className="block">
                    {row.jumlahBookmark} bookmark · {row.jumlahCatatan} catatan
                  </span>
                  <span className="block text-muted-foreground/80">
                    {row.jumlahRiwayat} kitab dibuka
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatTanggal(row.pengguna.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <StatusPenggunaBadge status={row.pengguna.status} />
                    <Switch
                      id={`status-${row.pengguna.id}`}
                      checked={row.pengguna.status === "aktif"}
                      disabled={sedangDikerjakan || row.pengguna.id === pengelolaId}
                      onCheckedChange={() => onAjukanUbahStatus(row)}
                      aria-label={`Ubah status akun ${row.pengguna.namaLengkap}`}
                    />
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
