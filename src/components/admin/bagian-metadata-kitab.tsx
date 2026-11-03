"use client"

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form"
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
import type { KitabInput } from "@/lib/validasi"
import type { OpsiPilhan } from "@/db/queries"

const TIDAK_ADA = "tidak-ada"

export function BagianMetadataKitab({
  register,
  control,
  errors,
  kategori,
  pengarang,
  syarah,
  slugPratinjau,
  punyaPdf,
}: {
  register: UseFormRegister<KitabInput>
  control: Control<KitabInput>
  errors: FieldErrors<KitabInput>
  kategori: OpsiPilhan[]
  pengarang: OpsiPilhan[]
  syarah: OpsiPilhan[]
  slugPratinjau: string
  punyaPdf: boolean
}) {
  return (
    <section className="surface-card space-y-5 p-5 sm:p-6">
      <div>
        <h2 className="font-heading text-lg font-semibold">Metadata kitab</h2>
        <p className="text-sm text-muted-foreground">
          Kolom bertanda bintang wajib diisi. Slug dibuat otomatis dari judul
          Latin dan hanya boleh diubah lewat migrasi terkendali.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="judulLatin">Judul Latin *</Label>
          <Input id="judulLatin" className="h-10" {...register("judulLatin")} />
          <p className="text-xs text-muted-foreground">
            URL reader: <span className="font-mono text-gold/85">/baca/{slugPratinjau}</span>
          </p>
          {errors.judulLatin && (
            <p className="text-xs text-destructive">{errors.judulLatin.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="judulArab">Judul Arab *</Label>
          <Input
            id="judulArab"
            className="text-arabic h-10 text-base"
            {...register("judulArab")}
          />
          {errors.judulArab && (
            <p className="text-xs text-destructive">{errors.judulArab.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="kategoriId">Kategori / fan *</Label>
          <Controller
            control={control}
            name="kategoriId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="kategoriId" className="w-full">
                  <SelectValue placeholder="Pilih fan ilmu" />
                </SelectTrigger>
                <SelectContent>
                  {kategori.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.kategoriId && (
            <p className="text-xs text-destructive">{errors.kategoriId.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pengarangId">Pengarang *</Label>
          <Controller
            control={control}
            name="pengarangId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="pengarangId" className="w-full">
                  <SelectValue placeholder="Pilih pengarang" />
                </SelectTrigger>
                <SelectContent>
                  {pengarang.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.pengarangId && (
            <p className="text-xs text-destructive">{errors.pengarangId.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="syarahId">Syarah / hasyiyah</Label>
          <Controller
            control={control}
            name="syarahId"
            render={({ field }) => (
              <Select
                value={field.value || TIDAK_ADA}
                onValueChange={(nilai) =>
                  field.onChange(nilai === TIDAK_ADA ? "" : nilai)
                }
              >
                <SelectTrigger id="syarahId" className="w-full">
                  <SelectValue placeholder="Tanpa syarah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TIDAK_ADA}>Tanpa syarah</SelectItem>
                  {syarah.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tahunTerbit">Tahun terbit *</Label>
            <Input id="tahunTerbit" className="h-10" {...register("tahunTerbit")} />
            {errors.tahunTerbit && (
              <p className="text-xs text-destructive">{errors.tahunTerbit.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jumlahHalaman">Jumlah halaman *</Label>
            <Input
              id="jumlahHalaman"
              className="h-10 tabular-nums"
              inputMode="numeric"
              readOnly={punyaPdf}
              aria-readonly={punyaPdf}
              {...register("jumlahHalaman", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              {punyaPdf
                ? "Dihitung server dari berkas PDF, tidak dapat diubah manual."
                : "Diisi otomatis begitu berkas PDF diunggah."}
            </p>
            {errors.jumlahHalaman && (
              <p className="text-xs text-destructive">{errors.jumlahHalaman.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deskripsi">Deskripsi singkat *</Label>
        <Textarea
          id="deskripsi"
          rows={5}
          className="min-h-32"
          placeholder="Ringkas isi kitab, metode pembahasan, dan cocok untuk santri tingkat berapa."
          {...register("deskripsi")}
        />
        <p className="text-xs text-muted-foreground">
          40 s.d. 2.000 karakter. Teks ini tampil pada kartu katalog dan halaman detail.
        </p>
        {errors.deskripsi && (
          <p className="text-xs text-destructive">{errors.deskripsi.message}</p>
        )}
      </div>
    </section>
  )
}
