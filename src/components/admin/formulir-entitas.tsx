"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ZodType } from "zod"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  hitungSlugOtomatis,
  type BidangEntitas,
  type EntitasNilai,
} from "@/lib/admin-entitas"

export function FormulirEntitas({
  bidang,
  skema,
  nilai,
  errorBidang,
  sedangDikerjakan,
  onSimpan,
  onBatal,
}: {
  bidang: BidangEntitas[]
  skema: ZodType<EntitasNilai, EntitasNilai>
  nilai?: EntitasNilai
  errorBidang: EntitasNilai
  sedangDikerjakan: boolean
  onSimpan: (nilai: EntitasNilai) => void
  onBatal: () => void
}) {
  const awal = useMemo(() => {
    const kosong: EntitasNilai = {}
    for (const item of bidang) kosong[item.kunci] = nilai?.[item.kunci] ?? ""
    return kosong
  }, [bidang, nilai])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<EntitasNilai>({
    resolver: zodResolver(skema),
    defaultValues: awal,
  })

  /** Tabrakan nama atau slug baru diketahui setelah server action berjalan. */
  useEffect(() => {
    for (const [kunci, pesan] of Object.entries(errorBidang)) {
      setError(kunci, { type: "server", message: pesan })
    }
  }, [errorBidang, setError])

  const kunciSlug = bidang.find((item) => item.jenis === "slug")
  const [slugDimanual, setSlugDimanual] = useState(
    Boolean(nilai && kunciSlug && nilai[kunciSlug.kunci]),
  )
  const nilaiSumber = watch(kunciSlug?.slugDari ?? "__tanpa_sumber")

  useEffect(() => {
    if (slugDimanual) return
    const hasil = hitungSlugOtomatis(bidang, nilaiSumber)
    if (hasil) setValue(hasil.kunci, hasil.nilai, { shouldDirty: true })
  }, [bidang, nilaiSumber, slugDimanual, setValue])

  return (
    <form onSubmit={handleSubmit(onSimpan)} className="space-y-4">
      {bidang.map((item) => {
        const error = errors[item.kunci]?.message
        const id = `bidang-${item.kunci}`

        if (item.jenis === "textarea") {
          return (
            <div key={item.kunci} className="space-y-1.5">
              <Label htmlFor={id}>{item.label}</Label>
              <Textarea
                id={id}
                rows={item.baris ?? 4}
                className="min-h-24"
                {...register(item.kunci)}
              />
              {item.petunjuk && (
                <p className="text-xs text-muted-foreground">{item.petunjuk}</p>
              )}
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          )
        }

        if (item.jenis === "slug") {
          return (
            <div key={item.kunci} className="space-y-1.5">
              <Label htmlFor={id}>{item.label}</Label>
              <Controller
                control={control}
                name={item.kunci}
                render={({ field }) => (
                  <Input
                    id={id}
                    className="h-10 font-mono"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      setSlugDimanual(true)
                      field.onChange(e.target.value)
                    }}
                    placeholder="contoh: ushul-fiqih"
                  />
                )}
              />
              {item.petunjuk && (
                <p className="text-xs text-muted-foreground">{item.petunjuk}</p>
              )}
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          )
        }

        return (
          <div key={item.kunci} className="space-y-1.5">
            <Label htmlFor={id}>{item.label}</Label>
            <Input
              id={id}
              className={cn("h-10", item.jenis === "arab" && "text-arabic text-base")}
              placeholder={item.petunjuk}
              {...register(item.kunci)}
            />
            {item.petunjuk && item.jenis !== "teks" && (
              <p className="text-xs text-muted-foreground">{item.petunjuk}</p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        )
      })}

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onBatal}>
          Batal
        </Button>
        <Button type="submit" disabled={sedangDikerjakan} className="gap-2">
          {sedangDikerjakan && (
            <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />
          )}
          Simpan
        </Button>
      </DialogFooter>
    </form>
  )
}
