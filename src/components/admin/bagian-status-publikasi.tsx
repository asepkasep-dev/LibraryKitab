"use client"

import { Globe } from "lucide-react"
import type { UseFormRegister } from "react-hook-form"
import type { KitabInput } from "@/lib/validasi"
import type { StatusKitab } from "@/db/queries"
import { cn } from "@/lib/utils"

const STATUS_OPSI: { nilai: StatusKitab; judul: string; keterangan: string }[] = [
  {
    nilai: "draft",
    judul: "Draf",
    keterangan: "Hanya terlihat di panel pengelola, belum muncul di katalog.",
  },
  {
    nilai: "published",
    judul: "Tayang",
    keterangan: "Muncul di katalog publik, pencarian, dan dapat dibuka santri.",
  },
  {
    nilai: "archived",
    judul: "Arsip",
    keterangan: "Ditarik dari peredaran, riwayat baca tetap tersimpan.",
  },
]

export function BagianStatusPublikasi({
  register,
  status,
  galatStatus,
}: {
  register: UseFormRegister<KitabInput>
  status: StatusKitab
  galatStatus?: string
}) {
  return (
    <section className="surface-card space-y-4 p-5 sm:p-6">
      <div>
        <h2 className="font-heading text-lg font-semibold">Status publikasi</h2>
        <p className="text-sm text-muted-foreground">
          Hanya status “Tayang” yang muncul di katalog, pencarian, dan halaman
          detail publik.
        </p>
      </div>

      <div className="grid gap-2">
        {STATUS_OPSI.map((item) => (
          <label
            key={item.nilai}
            className={cn(
              "surface-inset flex cursor-pointer items-start gap-3 p-3 transition-colors",
              status === item.nilai && "border-gold/40 bg-gold/[0.07]",
            )}
          >
            <input
              type="radio"
              value={item.nilai}
              {...register("status")}
              className="mt-1 size-4 accent-gold"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium">{item.judul}</span>
              <span className="block text-xs text-muted-foreground">
                {item.keterangan}
              </span>
            </span>
          </label>
        ))}
      </div>

      {status === "published" && (
        <p className="inline-flex items-center gap-2 text-xs text-gold/85">
          <Globe className="size-3.5" strokeWidth={1.75} />
          Kitab akan langsung dapat dibaca publik melalui tautan reader.
        </p>
      )}
      {galatStatus && (
        <p className="text-xs text-destructive">{galatStatus}</p>
      )}
    </section>
  )
}
