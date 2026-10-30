"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { SearchX, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { KitabCard } from "@/components/site/kitab-card"
import { EmptyState } from "@/components/site/primitives"
import { Reveal } from "@/components/site/reveal"
import type {
  HasilKatalog,
  KategoriVe,
  PengarangVe,
} from "@/db/queries"
import { OPSI_URUT, type UrutanKatalog } from "@/lib/site"
import { formatAngka } from "@/lib/format"

const SEMUA = "semua"

export type QueryKatalog = {
  q: string
  kategori: string
  pengarang: string
  syarah: string
  urut: UrutanKatalog
  halaman: number
}

type Props = {
  awal: QueryKatalog
  hasil: HasilKatalog
  opsiKategori: KategoriVe[]
  opsiPengarang: PengarangVe[]
  opsiSyarah: PengarangVe[]
}

/**
 * Hasil pencarian sudah dihitung di sisi server (ILIKE + pagination database).
 * Komponen ini hanya menjaga kolom pencarian tetap terasa instan dengan
 * mengirim ulang parameter ke URL.
 */
export function KatalogExplorer({
  awal,
  hasil,
  opsiKategori,
  opsiPengarang,
  opsiSyarah,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const { q, kategori, pengarang, syarah, urut } = awal

  const [teks, setTeks] = useState(q)

  useEffect(() => setTeks(q), [q])

  // Pembaruan hasil dengan debounce 300 ms (Bab 6.B) sambil menyimpan parameter ke URL.
  const perbarui = useCallback(
    (ubah: Partial<QueryKatalog>) => {
      startTransition(() => {
        const berikut: QueryKatalog = {
          q: ubah.q ?? q,
          kategori: ubah.kategori ?? kategori,
          pengarang: ubah.pengarang ?? pengarang,
          syarah: ubah.syarah ?? syarah,
          urut: ubah.urut ?? urut,
          halaman: ubah.halaman ?? 1,
        }
        const query = rumusQuery(berikut)
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        })
      })
    },
    [kategori, pathname, pengarang, q, router, syarah, urut],
  )

  useEffect(() => {
    if (teks === q) return
    const id = window.setTimeout(() => perbarui({ q: teks.trim() }), 300)
    return () => window.clearTimeout(id)
  }, [teks, q, perbarui])

  const adaFilter =
    q !== "" ||
    kategori !== SEMUA ||
    pengarang !== SEMUA ||
    syarah !== SEMUA ||
    urut !== "terbaru"

  const kontrol = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Select value={kategori} onValueChange={(v) => perbarui({ kategori: v })}>
        <SelectTrigger className="w-full" aria-label="Filter kategori fan">
          <SelectValue placeholder="Semua fan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SEMUA}>Semua fan</SelectItem>
          {opsiKategori.map((k) => (
            <SelectItem key={k.id} value={k.slug}>
              {k.nama}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={pengarang} onValueChange={(v) => perbarui({ pengarang: v })}>
        <SelectTrigger className="w-full" aria-label="Filter pengarang">
          <SelectValue placeholder="Semua pengarang" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SEMUA}>Semua pengarang</SelectItem>
          {opsiPengarang.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.namaLatin}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={syarah} onValueChange={(v) => perbarui({ syarah: v })}>
        <SelectTrigger className="w-full" aria-label="Filter penyusun syarah">
          <SelectValue placeholder="Semua syarah" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SEMUA}>Semua penyusun syarah</SelectItem>
          {opsiSyarah.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.namaLatin}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={urut} onValueChange={(v) => perbarui({ urut: v as UrutanKatalog })}>
        <SelectTrigger className="w-full" aria-label="Urutan hasil">
          <SelectValue placeholder="Urutkan" />
        </SelectTrigger>
        <SelectContent>
          {OPSI_URUT.map((opsi) => (
            <SelectItem key={opsi.nilai} value={opsi.nilai}>
              {opsi.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gold/80">
            Katalog kitab
          </span>
          <h1 className="text-3xl font-bold md:text-4xl">
            {hasil.total} kitab tersedia
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Cari lewat judul Latin, judul Arab, nama pengarang, atau penyusun
            syarah. Filter tersimpan di alamat halaman sehingga hasilnya bisa
            Anda bagikan ke teman halaqah.
          </p>
        </div>

        {adaFilter && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTeks("")
              router.replace(pathname, { scroll: false })
            }}
          >
            <X className="size-4" strokeWidth={1.75} />
            Bersihkan filter
          </Button>
        )}
      </header>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Input
            type="search"
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            aria-label="Cari kitab"
            placeholder="Coba cari: ajurrumiyyah, nawawi, fiqih…"
            className="pr-4"
          />
        </div>

        <div className="hidden flex-1 lg:block">{kontrol}</div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <SlidersHorizontal className="size-4" strokeWidth={1.75} />
              Filter & urutan
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[72vh] rounded-t-3xl border-t border-white/10 bg-navy-card/95 backdrop-blur-2xl"
          >
            <SheetHeader>
              <SheetTitle>Filter & urutan hasil</SheetTitle>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto pb-6">{kontrol}</div>
          </SheetContent>
        </Sheet>
      </div>

      {isPending && hasil.items.length > 0 ? (
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : hasil.items.length === 0 ? (
        <Reveal className="mt-12">
          <EmptyState
            ikon={<SearchX className="size-6" strokeWidth={1.75} />}
            judul="Belum ada yang cocok"
            pesan={`Tidak ditemukan kitab untuk “${q || kategori}”. Coba kata kunci yang lebih umum seperti nahwu, fiqih, tafsir, atau nama pengarangnya saja.`}
            aksi={
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {["nahwu", "fiqih", "tafsir", "hadis"].map((saran) => (
                  <Link
                    key={saran}
                    href={`/katalog?q=${saran}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-gold/30 hover:text-gold"
                  >
                    {saran}
                  </Link>
                ))}
              </div>
            }
          />
        </Reveal>
      ) : (
        <>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {hasil.items.map((kitab, indeks) => (
              <Reveal key={kitab.id} delay={Math.min(indeks, 7) * 0.04}>
                <KitabCard kitab={kitab} />
              </Reveal>
            ))}
          </div>

          {hasil.totalHalaman > 1 && (
            <div className="mt-12 flex flex-col items-center gap-3">
              <p className="text-xs text-muted-foreground">
                Menampilkan {formatAngka((hasil.halaman - 1) * hasil.perHalaman + 1)}
                –
                {formatAngka(
                  Math.min(hasil.halaman * hasil.perHalaman, hasil.total),
                )}{" "}
                dari {formatAngka(hasil.total)} kitab · halaman {hasil.halaman} dari{" "}
                {hasil.totalHalaman}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={tautanHalaman(pathname, awal, hasil.halaman - 1)}
                      aria-hidden={hasil.halaman === 1}
                      className={
                        hasil.halaman === 1
                          ? "pointer-events-none opacity-40"
                          : ""
                      }
                    />
                  </PaginationItem>
                  {nomorHalaman(hasil.halaman, hasil.totalHalaman).map((nomor, i) =>
                    nomor === "..." ? (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={nomor}>
                        <PaginationLink
                          href={tautanHalaman(pathname, awal, nomor)}
                          isActive={nomor === hasil.halaman}
                        >
                          {nomor}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href={tautanHalaman(pathname, awal, hasil.halaman + 1)}
                      aria-hidden={hasil.halaman === hasil.totalHalaman}
                      className={
                        hasil.halaman === hasil.totalHalaman
                          ? "pointer-events-none opacity-40"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function rumusQuery(query: QueryKatalog) {
  const params = new URLSearchParams()
  if (query.q.trim()) params.set("q", query.q.trim())
  if (query.kategori !== SEMUA) params.set("kategori", query.kategori)
  if (query.pengarang !== SEMUA) params.set("pengarang", query.pengarang)
  if (query.syarah !== SEMUA) params.set("syarah", query.syarah)
  if (query.urut !== "terbaru") params.set("urut", query.urut)
  if (query.halaman > 1) params.set("halaman", String(query.halaman))
  return params.toString()
}

function tautanHalaman(pathname: string, query: QueryKatalog, nomor: number) {
  const params = rumusQuery({ ...query, halaman: nomor })
  return params ? `${pathname}?${params}` : pathname
}

function nomorHalaman(aktif: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (aktif <= 3) return [1, 2, 3, 4, "...", total]
  if (aktif >= total - 2)
    return [1, "...", total - 3, total - 2, total - 1, total]
  return [1, "...", aktif - 1, aktif, aktif + 1, "...", total]
}
