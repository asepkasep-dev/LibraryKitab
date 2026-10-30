"use client"

import { useMemo, useState, useTransition } from "react"
import { LoaderCircle, Search, ShieldCheck, UserRound } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { toast } from "sonner"
import { ubahPeranAnggota, ubahStatusAnggota } from "@/actions/pengguna"
import type { PenggunaVe, Role } from "@/db/queries"
import { formatTanggal, inisialNama } from "@/lib/format"

export type BarisPengguna = {
  pengguna: PenggunaVe
  jumlahBookmark: number
  jumlahCatatan: number
  jumlahRiwayat: number
}

const SEMUA = "semua"

export function KerjaPengguna({
  awal,
  pengelolaId,
}: {
  awal: BarisPengguna[]
  /** Akun yang sedang masuk tidak boleh diubah peran/statusnya sendiri. */
  pengelolaId: string
}) {
  const [kata, setKata] = useState("")
  const [peran, setPeran] = useState(SEMUA)
  const [akses, setAkses] = useState(SEMUA)
  const [konfirmasi, setKonfirmasi] = useState<BarisPengguna | null>(null)
  const [isPending, jalankan] = useTransition()

  const hasil = useMemo(() => {
    const q = kata.trim().toLowerCase()
    return awal.filter((row) => {
      if (peran !== SEMUA) {
        const nilai = row.pengguna.jenisPeran ?? "belum-diisi"
        if (nilai !== peran) return false
      }
      if (akses !== SEMUA && row.pengguna.role !== akses) return false
      if (!q) return true
      return [row.pengguna.namaLengkap, row.pengguna.email, row.pengguna.kelas].some(
        (teks) => teks.toLowerCase().includes(q),
      )
    })
  }, [awal, kata, peran, akses])

  const jumlahNonaktif = awal.filter((r) => r.pengguna.status === "nonaktif").length

  function ubahStatus(target: BarisPengguna) {
    const berikutnya = target.pengguna.status === "aktif" ? "nonaktif" : "aktif"
    setKonfirmasi(null)
    jalankan(async () => {
      const respons = await ubahStatusAnggota(target.pengguna.id, berikutnya)
      if (!respons.ok) {
        toast.error(respons.pesan)
        return
      }
      toast.success(respons.pesan, {
        description:
          berikutnya === "nonaktif"
            ? "Akun tidak dapat masuk atau membuka bookmark sampai diaktifkan lagi."
            : "Akun kembali memperoleh akses penuh sebagai member.",
      })
    })
  }

  function ubahPeran(target: BarisPengguna, role: string) {
    if (role === target.pengguna.role) return
    jalankan(async () => {
      const respons = await ubahPeranAnggota(target.pengguna.id, role as Role)
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
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem_13rem]">
          <div className="space-y-1.5">
            <Label htmlFor="cari-pengguna">Cari pengguna</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="cari-pengguna"
                value={kata}
                onChange={(e) => setKata(e.target.value)}
                placeholder="nama, email, atau kelas…"
                className="h-10 ps-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filter-peran">Jenis peran</Label>
            <Select value={peran} onValueChange={setPeran}>
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
            <Select value={akses} onValueChange={setAkses}>
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
            {awal.length} akun terdaftar
          </span>
          <span className="surface-inset px-2.5 py-1 tabular-nums">
            {jumlahNonaktif} nonaktif
          </span>
          <span className="surface-inset px-2.5 py-1 tabular-nums">
            {awal.filter((row) => row.pengguna.role === "admin").length} pengelola
          </span>
          <span className="ms-auto inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-teal-300" strokeWidth={1.75} />
            Menonaktifkan akun tidak menghapus bookmark dan catatan.
          </span>
        </div>
      </div>

      {hasil.length === 0 ? (
        <EmptyState
          ikon={<UserRound className="size-6" strokeWidth={1.75} />}
          judul={awal.length === 0 ? "Belum ada akun tercatat" : "Pengguna tidak ditemukan"}
          pesan={
            awal.length === 0
              ? "Akun muncul di sini setelah santri mendaftar lewat Clerk atau setelah webhook tersambung."
              : "Coba ubah kata kunci pencarian atau kembalikan filter peran dan hak akses ke semua."
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
                          onValueChange={(nilai) => ubahPeran(row, nilai)}
                          disabled={isPending || row.pengguna.id === pengelolaId}
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
                          disabled={isPending || row.pengguna.id === pengelolaId}
                          onCheckedChange={() => setKonfirmasi(row)}
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
      )}

      <Dialog
        open={konfirmasi !== null}
        onOpenChange={(buka) => !buka && setKonfirmasi(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {konfirmasi?.pengguna.status === "aktif"
                ? "Nonaktifkan akun ini?"
                : "Aktifkan kembali akun ini?"}
            </DialogTitle>
            <DialogDescription>
              {konfirmasi
                ? konfirmasi.pengguna.status === "aktif"
                  ? `${konfirmasi.pengguna.namaLengkap} tidak dapat masuk dan seluruh tautan dasbornya diblokir sampai akun diaktifkan lagi. Data baca tetap tersimpan.`
                  : `${konfirmasi.pengguna.namaLengkap} kembali dapat masuk, membaca kitab, serta mengelola bookmark dan catatannya.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setKonfirmasi(null)}>
              Batal
            </Button>
            <Button
              variant={konfirmasi?.pengguna.status === "aktif" ? "solidDestructive" : "default"}
              className="gap-2"
              disabled={isPending}
              onClick={() => konfirmasi && ubahStatus(konfirmasi)}
            >
              {isPending && <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />}
              {konfirmasi?.pengguna.status === "aktif"
                ? "Nonaktifkan"
                : "Aktifkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
