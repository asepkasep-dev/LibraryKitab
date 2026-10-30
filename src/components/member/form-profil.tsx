"use client"

import { useState, useEffect, type ReactNode } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Bookmark, Check, LoaderCircle, NotebookPen, Save, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { StatusPenggunaBadge } from "@/components/site/status-badge"
import { formatTanggal, formatAngka } from "@/lib/format"
import { KUNCI_PREFERENSI_BACA } from "@/lib/baca"
import { skemaProfil, type ProfilInput } from "@/lib/validasi"
import { perbaruiProfilAksi } from "@/actions/profil"
import type { PenggunaVe } from "@/db/queries"

type Props = {
  pengguna: PenggunaVe
  jumlahBookmark: number
  jumlahCatatan: number
  jumlahRiwayat: number
}

/** Mode reader tidak punya kolom di database: preferensinya per perangkat. */
function bacaModePerangkat(): "gelap" | "sepia" {
  try {
    const mentah = localStorage.getItem(KUNCI_PREFERENSI_BACA)
    if (!mentah) return "gelap"
    const data = JSON.parse(mentah) as { sepia?: boolean }
    return data.sepia ? "sepia" : "gelap"
  } catch {
    return "gelap"
  }
}

function tulisModePerangkat(mode: "gelap" | "sepia") {
  try {
    const mentah = localStorage.getItem(KUNCI_PREFERENSI_BACA)
    const data = mentah ? (JSON.parse(mentah) as Record<string, unknown>) : {}
    localStorage.setItem(
      KUNCI_PREFERENSI_BACA,
      JSON.stringify({ ...data, sepia: mode === "sepia" }),
    )
  } catch {
    /* penyimpanan perangkat sedang penuh atau diblokir; mode hanya berubah sesi ini */
  }
}

export function FormProfil({ pengguna, jumlahBookmark, jumlahCatatan, jumlahRiwayat }: Props) {
  const [tersimpanPada, setTersimpanPada] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfilInput>({
    resolver: zodResolver(skemaProfil),
    defaultValues: {
      namaLengkap: pengguna.namaLengkap,
      jenisPeran: pengguna.jenisPeran ?? "santri",
      kelas: pengguna.kelas,
      fontSizePreferensi: pengguna.fontSizePreferensi,
      modeReader: "gelap",
    },
  })

  useEffect(() => {
    setValue("modeReader", bacaModePerangkat())
  }, [setValue])

  const ukuranHuruf = watch("fontSizePreferensi")
  const modeReader = watch("modeReader")

  async function onSubmit(data: ProfilInput) {
    const hasil = await perbaruiProfilAksi(data)
    if (!hasil.ok) {
      toast.error(hasil.pesan)
      return
    }
    setTersimpanPada(new Date().toISOString())
    toast.success(hasil.pesan, {
      description: `${data.namaLengkap} · ukuran huruf ${data.fontSizePreferensi}px.`,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <section className="surface-card space-y-5 p-5 sm:p-6">
          <div>
            <h2 className="font-heading text-lg font-semibold">Identitas</h2>
            <p className="text-sm text-muted-foreground">
              Data ini dipakai untuk sapaan di dasbor dan pada catatan pengajian Anda.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="namaLengkap">Nama lengkap</Label>
              <Input id="namaLengkap" className="h-10" {...register("namaLengkap")} />
              {errors.namaLengkap && (
                <p className="text-xs text-red-400">{errors.namaLengkap.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kelas">Kelas / liwan</Label>
              <Input id="kelas" className="h-10" {...register("kelas")} />
              {errors.kelas && (
                <p className="text-xs text-red-400">{errors.kelas.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenisPeran">Jenis peran</Label>
              <Controller
                control={control}
                name="jenisPeran"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="jenisPeran" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="santri">Santri</SelectItem>
                      <SelectItem value="ustadz">Ustadz</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.jenisPeran && (
                <p className="text-xs text-red-400">{errors.jenisPeran.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={pengguna.email} readOnly className="h-10 opacity-70" />
              <p className="text-xs text-muted-foreground">
                Email terhubung dengan akun Clerk Anda dan tidak diubah dari halaman ini.
              </p>
            </div>
          </div>
        </section>

        <section className="surface-card space-y-5 p-5 sm:p-6">
          <div>
            <h2 className="font-heading text-lg font-semibold">Preferensi baca</h2>
            <p className="text-sm text-muted-foreground">
              Ukuran huruf default dipakai reader ketika membuka kitab di perangkat baru.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="fontSizePreferensi">Ukuran huruf bacaan</Label>
              <span className="font-heading text-sm font-semibold text-gold tabular-nums">
                {Number(ukuranHuruf)} px
              </span>
            </div>
            <input
              id="fontSizePreferensi"
              type="range"
              min={14}
              max={24}
              step={1}
              className="w-full accent-[hsl(43_74%_56%)]"
              {...register("fontSizePreferensi", { valueAsNumber: true })}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Kecil (14 px)</span>
              <span>Besar (24 px)</span>
            </div>
            {errors.fontSizePreferensi && (
              <p className="text-xs text-red-400">{errors.fontSizePreferensi.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tampilan reader</Label>
            <Controller
              control={control}
              name="modeReader"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={(nilai) => {
                    const mode = nilai as "gelap" | "sepia"
                    field.onChange(mode)
                    tulisModePerangkat(mode)
                  }}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <div className="surface-inset flex items-start gap-3 p-3">
                    <RadioGroupItem value="gelap" id="mode-gelap" className="mt-0.5" />
                    <div className="space-y-0.5">
                      <Label htmlFor="mode-gelap" className="cursor-pointer">
                        Gelap (bawaan)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Latar halaman terang di atas dasar navy, nyaman untuk muraja&apos;ah siang.
                      </p>
                    </div>
                  </div>
                  <div className="surface-inset flex items-start gap-3 p-3">
                    <RadioGroupItem value="sepia" id="mode-sepia" className="mt-0.5" />
                    <div className="space-y-0.5">
                      <Label htmlFor="mode-sepia" className="cursor-pointer">
                        Sepia Malam
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Nuansa kertas kuning gelap untuk membaca sebelum tidur.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          <div className="surface-inset space-y-3 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Pratinjau
            </p>
            <div
              className={
                modeReader === "sepia"
                  ? "rounded-xl bg-[hsl(36_32%_16%)] p-4"
                  : "rounded-xl bg-[#f8f5ec] p-4 text-slate-800"
              }
              style={{ fontSize: `${Number(ukuranHuruf)}px`, lineHeight: 1.9 }}
            >
              <p className="text-arabic text-[1.4em] leading-[2]">
                اِعْلَمْ أَنَّ الطَّلَبَ لَا يَتِمُّ إِلَّا بِصِدْقِ الْمُتَابَعَةِ
              </p>
              <p className={modeReader === "sepia" ? "text-slate-300" : "text-slate-600"}>
                Ketahuilah bahwa menuntut ilmu tidak sempurna kecuali dengan sungguh-sungguh
                mengikuti guru.
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />
            ) : (
              <Save className="size-4" strokeWidth={1.75} />
            )}
            {isSubmitting ? "Menyimpan…" : "Simpan perubahan"}
          </Button>
          {!isSubmitting && isDirty && (
            <span className="text-xs text-muted-foreground">
              Ada perubahan yang belum disimpan.
            </span>
          )}
          {tersimpanPada && !isDirty && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
              <Check className="size-4" strokeWidth={1.75} />
              Tersimpan pada {new Date(tersimpanPada).toLocaleTimeString("id-ID")}
            </span>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="surface-card space-y-3 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Status akun
          </p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Keanggotaan</span>
            <StatusPenggunaBadge status={pengguna.status} />
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Peran sistem</span>
            <span className="font-medium capitalize">{pengguna.role}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Bergabung</span>
            <span className="font-medium">{formatTanggal(pengguna.createdAt)}</span>
          </div>
          <Separator className="bg-white/10" />
          <p className="inline-flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal-300" strokeWidth={1.75} />
            Nonaktifkan akun hanya melalui panel pengelola. Santri yang dinonaktifkan tidak
            dapat membuka bookmark dan catatannya sampai akun diaktifkan lagi.
          </p>
        </div>

        <div className="surface-card space-y-2 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Aktivitas baca
          </p>
          <StatistikRingkas
            ikon={<Bookmark className="size-4" strokeWidth={1.75} />}
            label="Bookmark"
            nilai={formatAngka(jumlahBookmark)}
          />
          <StatistikRingkas
            ikon={<NotebookPen className="size-4" strokeWidth={1.75} />}
            label="Catatan"
            nilai={formatAngka(jumlahCatatan)}
          />
          <StatistikRingkas
            ikon={<Check className="size-4" strokeWidth={1.75} />}
            label="Kitab dibuka"
            nilai={formatAngka(jumlahRiwayat)}
          />
        </div>

        <div className="surface-inset p-5 text-xs leading-relaxed text-muted-foreground">
          Nama, peran, kelas, dan ukuran huruf tersimpan di akun Anda sehingga ikut
          saat membuka perangkat lain. Mode reader (Gelap/Sepia Malam) sengaja
          disimpan di perangkat ini lewat <code className="text-foreground">localStorage</code>,
          karena nyaman tidaknya cahaya berbeda antara ponsel di asrama dan laptop di rumah.
        </div>
      </aside>
    </form>
  )
}

function StatistikRingkas({
  ikon,
  label,
  nilai,
}: {
  ikon: ReactNode
  label: string
  nilai: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-gold">{ikon}</span>
        {label}
      </span>
      <span className="font-heading text-lg font-bold tabular-nums">{nilai}</span>
    </div>
  )
}
