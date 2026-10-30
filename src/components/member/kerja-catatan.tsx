"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { LoaderCircle, NotebookPen, Pencil, Search, Trash2, X } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/site/primitives"
import { MAKS_ISI_CATATAN, skemaIsiCatatan } from "@/lib/baca"
import { hapusCatatanId, ubahCatatanIsi } from "@/actions/baca"
import type { CatatanVe, KitabVe } from "@/db/queries"
import { formatTanggalSingkat, waktuRelatif } from "@/lib/format"
import { toast } from "sonner"

export type BarisCatatan = { catatan: CatatanVe; kitab: KitabVe }

const SEMUA_KITAB = "semua"

/** Batas 2 detik: perbedaan milidetik saat insert bukan tanda catatan diedit. */
function pernahDiubah(row: BarisCatatan) {
  return row.catatan.updatedAt.getTime() - row.catatan.createdAt.getTime() > 2000
}

export function KerjaCatatan({ awal }: { awal: BarisCatatan[] }) {
  const [kitabTerpilih, setKitabTerpilih] = useState(SEMUA_KITAB)
  const [kata, setKata] = useState("")
  const [kataDiterapkan, setKataDiterapkan] = useState("")
  const [sunting, setSunting] = useState<BarisCatatan | null>(null)
  const [teksSunting, setTeksSunting] = useState("")
  const [hapus, setHapus] = useState<BarisCatatan | null>(null)
  const [isPending, jalankan] = useTransition()

  /* Penundaan 300 ms agar saringan tidak berjalan pada tiap ketikan. */
  useEffect(() => {
    const jeda = setTimeout(() => setKataDiterapkan(kata.trim().toLowerCase()), 300)
    return () => clearTimeout(jeda)
  }, [kata])

  const pilihanKitab = useMemo(() => {
    const peta = new Map<string, string>()
    for (const row of awal) peta.set(row.kitab.id, row.kitab.judulLatin)
    return [...peta.entries()].sort((a, b) => a[1].localeCompare(b[1], "id"))
  }, [awal])

  const hasil = useMemo(
    () =>
      awal.filter((row) => {
        if (kitabTerpilih !== SEMUA_KITAB && row.kitab.id !== kitabTerpilih) return false
        if (!kataDiterapkan) return true
        return (
          row.catatan.isi.toLowerCase().includes(kataDiterapkan) ||
          row.kitab.judulLatin.toLowerCase().includes(kataDiterapkan) ||
          String(row.catatan.halaman) === kataDiterapkan
        )
      }),
    [awal, kitabTerpilih, kataDiterapkan],
  )

  function simpanSuntingan() {
    const target = sunting
    if (!target) return
    const valid = skemaIsiCatatan.safeParse(teksSunting)
    if (!valid.success) {
      toast.error(valid.error.issues[0]?.message ?? "Catatan belum valid.")
      return
    }
    jalankan(async () => {
      const respons = await ubahCatatanIsi(target.catatan.id, valid.data)
      if (!respons.ok) {
        toast.error(respons.pesan)
        return
      }
      setSunting(null)
      toast.success("Catatan diperbarui")
    })
  }

  function konfirmasiHapus() {
    const target = hapus
    if (!target) return
    setHapus(null)
    jalankan(async () => {
      const respons = await hapusCatatanId(target.catatan.id)
      if (!respons.ok) {
        toast.error(respons.pesan)
        return
      }
      toast.success("Catatan dihapus")
    })
  }

  if (awal.length === 0) {
    return (
      <EmptyState
        ikon={<NotebookPen className="size-6" strokeWidth={1.75} />}
        judul="Belum ada catatan pemahaman"
        pesan="Setiap catatan yang Anda tulis di reader akan muncul di sini, lengkap dengan nomor halaman kitabnya."
        aksi={
          <Button asChild>
            <Link href="/katalog">Mulai membaca kitab</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="surface-card flex flex-col gap-3 p-4 md:flex-row md:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="cari-catatan">Cari isi catatan</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="cari-catatan"
              value={kata}
              onChange={(e) => setKata(e.target.value)}
              placeholder="misal: rukun jual beli, i'rab fa'il"
              className="ps-9"
            />
            {kata && (
              <button
                type="button"
                onClick={() => setKata("")}
                aria-label="Kosongkan pencarian"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>

        <div className="w-full space-y-1.5 md:w-72">
          <Label htmlFor="filter-kitab">Saring per kitab</Label>
          <Select value={kitabTerpilih} onValueChange={setKitabTerpilih}>
            <SelectTrigger id="filter-kitab" className="w-full">
              <SelectValue placeholder="Semua kitab" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SEMUA_KITAB}>Semua kitab</SelectItem>
              {pilihanKitab.map(([id, nama]) => (
                <SelectItem key={id} value={id}>
                  {nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Menampilkan {hasil.length} dari {awal.length} catatan
        {kataDiterapkan && ` untuk kata "${kataDiterapkan}"`}.
      </p>

      {hasil.length === 0 ? (
        <EmptyState
          ikon={<Search className="size-6" strokeWidth={1.75} />}
          judul="Catatan tidak ditemukan"
          pesan="Coba kata kunci lain atau pilih kitab yang berbeda dari daftar filter."
          aksi={
            <Button
              variant="outline"
              onClick={() => {
                setKata("")
                setKitabTerpilih(SEMUA_KITAB)
              }}
            >
              Bersihkan saringan
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {hasil.map((row) => (
            <article key={row.catatan.id} className="surface-card flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/kitab/${row.kitab.slug}`}
                    className="truncate font-heading text-sm font-semibold hover:text-gold"
                  >
                    {row.kitab.judulLatin}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {row.kitab.kategori.nama} · {row.kitab.pengarang.namaLatin}
                  </p>
                </div>
                <Link
                  href={`/baca/${row.kitab.slug}?halaman=${row.catatan.halaman}`}
                  className="shrink-0 rounded-lg bg-gold/15 px-2.5 py-1 font-heading text-xs font-bold text-gold tabular-nums transition-colors hover:bg-gold/25"
                >
                  hlm {row.catatan.halaman}
                </Link>
              </div>

              <p className="flex-1 text-sm leading-relaxed whitespace-pre-line text-slate-200">
                {row.catatan.isi}
              </p>

              <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3">
                <p className="text-[11px] text-muted-foreground">
                  Dibuat {formatTanggalSingkat(row.catatan.createdAt)}
                  {pernahDiubah(row) &&
                    ` · diubah ${waktuRelatif(row.catatan.updatedAt)}`}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Sunting catatan halaman ${row.catatan.halaman}`}
                    onClick={() => {
                      setSunting(row)
                      setTeksSunting(row.catatan.isi)
                    }}
                  >
                    <Pencil className="size-4" strokeWidth={1.75} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Hapus catatan halaman ${row.catatan.halaman}`}
                    onClick={() => setHapus(row)}
                  >
                    <Trash2 className="size-4" strokeWidth={1.75} />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={sunting !== null} onOpenChange={(buka) => !buka && setSunting(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Sunting catatan</DialogTitle>
            <DialogDescription>
              {sunting
                ? `Catatan pada halaman ${sunting.catatan.halaman} kitab ${sunting.kitab.judulLatin}.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="teks-sunting">Isi catatan</Label>
            <Textarea
              id="teks-sunting"
              value={teksSunting}
              onChange={(e) => setTeksSunting(e.target.value)}
              rows={7}
              maxLength={MAKS_ISI_CATATAN}
              className="min-h-40"
            />
            <p className="text-right text-[11px] text-muted-foreground tabular-nums">
              {teksSunting.length}/{MAKS_ISI_CATATAN}
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSunting(null)}>
              Batal
            </Button>
            <Button onClick={simpanSuntingan} disabled={isPending}>
              {isPending && (
                <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />
              )}
              Simpan perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={hapus !== null} onOpenChange={(buka) => !buka && setHapus(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus catatan ini?</DialogTitle>
            <DialogDescription>
              {hapus
                ? `Catatan "${hapus.catatan.isi.slice(0, 80)}${hapus.catatan.isi.length > 80 ? "…" : ""}" akan hilang permanen.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setHapus(null)}>
              Batal
            </Button>
            <Button variant="solidDestructive" onClick={konfirmasiHapus} disabled={isPending}>
              {isPending && (
                <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />
              )}
              Ya, hapus catatan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
