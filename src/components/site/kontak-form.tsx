"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, LoaderCircle, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { KEPERLUAN, skemaPesanKontak, type PesanKontak } from "@/lib/validasi"

export function KontakForm() {
  const [terkirim, setTerkirim] = useState<null | { nama: string; subjek: string }>(
    null,
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PesanKontak>({
    resolver: zodResolver(skemaPesanKontak),
    defaultValues: {
      nama: "",
      email: "",
      keperluan: "",
      subjek: "",
      pesan: "",
      setujui: false,
    },
  })

  async function onSubmit(data: PesanKontak) {
    // Tahap 1: belum ada Server Action. Pesan disimulasikan terkirim.
    await new Promise((r) => setTimeout(r, 750))
    setTerkirim({ nama: data.nama, subjek: data.subjek })
    reset()
    toast.success("Pesan Anda tercatat", {
      description: "Pengelola biasanya membalas dalam 1 atau 2 hari kerja.",
    })
  }

  if (terkirim) {
    return (
      <Card className="gap-0 p-0">
        <CardContent className="space-y-4 p-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/25">
            <CheckCircle2 className="size-7 text-emerald-300" strokeWidth={1.75} />
          </span>
          <div className="space-y-2">
            <h2 className="font-heading text-xl font-semibold">
              Jazakumullah khairan, {terkirim.nama}
            </h2>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
              Pesan tentang “{terkirim.subjek}” sudah masuk ke antrean
              pengelola perpustakaan. Kami membalas melalui email yang Anda
              tulis, biasanya dalam 1 atau 2 hari kerja pada jam layanan.
            </p>
          </div>
          <Button variant="outline" onClick={() => setTerkirim(null)}>
            Tulis pesan lain
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gap-0 p-0">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nama lengkap" htmlFor="nama" error={errors.nama?.message}>
              <Input id="nama" placeholder="Misal: Ahmad Fauzi" {...register("nama")} />
            </Field>
            <Field
              label="Email aktif"
              htmlFor="email"
              error={errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                placeholder="nama@pesantren.id"
                {...register("email")}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="keperluan">Keperluan</Label>
              <Controller
                control={control}
                name="keperluan"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="keperluan" className="w-full">
                      <SelectValue placeholder="Pilih keperluan" />
                    </SelectTrigger>
                    <SelectContent>
                      {KEPERLUAN.map((opsi) => (
                        <SelectItem key={opsi} value={opsi}>
                          {opsi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.keperluan && <FieldError>{errors.keperluan.message}</FieldError>}
            </div>
            <Field
              label="Subjek"
              htmlFor="subjek"
              error={errors.subjek?.message}
            >
              <Input
                id="subjek"
                placeholder="Misal: Usulan pindaian kitab Al-Hidayah"
                {...register("subjek")}
              />
            </Field>
          </div>

          <Field
            label="Isi pesan"
            htmlFor="pesan"
            error={errors.pesan?.message}
            hint="Sertakan judul kitab, pengarang, dan edisi yang Anda maksud."
          >
            <Textarea
              id="pesan"
              rows={6}
              placeholder="Tuliskan pesan Anda di sini…"
              {...register("pesan")}
            />
          </Field>

          <div className="space-y-1.5">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 rounded border-white/20 bg-white/5 accent-[hsl(43,74%,56%)]"
                {...register("setujui")}
              />
              <span>
                Saya bersedia nama dan email ini digunakan untuk membalas pesan
                tersebut, sesuai kebijakan privasi.
              </span>
            </label>
            {errors.setujui && <FieldError>{errors.setujui.message}</FieldError>}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />
                  Mengirim…
                </>
              ) : (
                <>
                  <Send className="size-4" strokeWidth={1.75} />
                  Kirim pesan
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Kolom wajib diisi. Validasi berjalan di sisi klien.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <FieldError>{error}</FieldError>}
    </div>
  )
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-red-400">{children}</p>
}
