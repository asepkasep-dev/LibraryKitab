"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { BagianBerkasPdf } from "@/components/admin/bagian-berkas-pdf"
import { BagianMetadataKitab } from "@/components/admin/bagian-metadata-kitab"
import { BagianStatusPublikasi } from "@/components/admin/bagian-status-publikasi"
import { simpanKitab } from "@/actions/kitab"
import { MAKS_PDF_MB } from "@/lib/site"
import { slugify, waktuRelatif } from "@/lib/format"
import { bacaResponsUnggah, buatMuatanPdf, persenProgres, validasiBerkasPdf } from "@/lib/unggah-pdf-klien"
import type { BerkasTersimpan } from "@/lib/unggah-pdf-klien"
import { skemaKitab, type KitabInput } from "@/lib/validasi"
import type { KitabVe, OpsiPilhan } from "@/db/queries"

export function FormKitab({
  mode,
  awal,
  kategori,
  pengarang,
  syarah,
}: {
  mode: "baru" | "ubah"
  awal: KitabVe | null
  kategori: OpsiPilhan[]
  pengarang: OpsiPilhan[]
  syarah: OpsiPilhan[]
}) {
  const router = useRouter()
  const berkasInput = useRef<HTMLInputElement>(null)
  const [berkas, setBerkas] = useState<File | null>(null)
  const [tersimpan, setTersimpan] = useState<BerkasTersimpan | null>(null)
  const [progres, setProgres] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<KitabInput>({
    resolver: zodResolver(skemaKitab),
    defaultValues: {
      judulLatin: awal?.judulLatin ?? "",
      judulArab: awal?.judulArab ?? "",
      kategoriId: awal?.kategoriId ?? "",
      pengarangId: awal?.pengarangId ?? "",
      syarahId: awal?.syarahId ?? "",
      tahunTerbit: awal?.tahunTerbit ?? String(new Date().getFullYear()),
      jumlahHalaman: awal?.jumlahHalaman ?? 0,
      deskripsi: awal?.deskripsi ?? "",
      status: awal?.status ?? "draft",
    },
  })

  const judulLatin = watch("judulLatin")
  const status = watch("status")
  const slugPratinjau = slugify(judulLatin || "tanpa-judul")
  const berkasDitampilkan = tersimpan?.path ?? awal?.urlPdf ?? null
  /** Selama berkas ada, bilangan halaman milik server; formulir hanya menampilkan. */
  const punyaPdf = Boolean(tersimpan ?? awal?.urlPdf)

  function pilihBerkas(file: File | undefined | null) {
    if (!file) return
    const galat = validasiBerkasPdf(file, MAKS_PDF_MB)
    if (galat) {
      toast.error(galat.judul, galat.deskripsi ? { description: galat.deskripsi } : undefined)
      return
    }
    setBerkas(file)
    setTersimpan(null)
    setProgres(null)
  }

  /**
   * XHR dipakai karena `fetch` tidak memberi progres unggahan, padahal bilangan
   * halaman dan berkas besar butuh indikator berjalan.
   */
  function unggahSekarang() {
    if (!berkas) {
      toast.error("Pilih berkas PDF terlebih dahulu.")
      return
    }
    const muatan = buatMuatanPdf(berkas, judulLatin.trim() || berkas.name.replace(/\.pdf$/i, ""), awal?.id ?? "")
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/admin/upload-pdf")
    xhr.upload.addEventListener("progress", (event) => {
      const nilai = persenProgres(event.loaded, event.total, event.lengthComputable)
      if (nilai !== null) setProgres(nilai)
    })
    xhr.addEventListener("load", () => {
      const hasil = bacaResponsUnggah(xhr.responseText, xhr.status, berkas.size)
      if (!hasil.ok) {
        setProgres(null)
        toast.error(hasil.pesan)
        return
      }
      setTersimpan(hasil.berkas)
      setProgres(100)
      setValue("jumlahHalaman", hasil.berkas.halaman, { shouldDirty: true, shouldValidate: true })
      toast.success("Berkas tersimpan di Bunny Storage", {
        description: `Parser membaca ${hasil.berkas.halaman} halaman; kolom jumlah halaman terisi otomatis.`,
      })
    })
    xhr.addEventListener("error", () => {
      setProgres(null)
      toast.error("Koneksi unggahan terputus", {
        description: "Periksa jaringan Anda, lalu unggah berkas ulang.",
      })
    })
    setProgres(0)
    xhr.send(muatan)
  }

  function buangBerkas() {
    setBerkas(null)
    setTersimpan(null)
    setProgres(null)
    if (berkasInput.current) berkasInput.current.value = ""
  }

  async function onSubmit(data: KitabInput) {
    const hasil = await simpanKitab(awal?.id ?? null, data, { tanda: tersimpan?.tanda })
    if (!hasil.ok) {
      toast.error(hasil.pesan)
      return
    }

    toast.success(hasil.pesan, {
      description:
        data.status === "published"
          ? "Kitab tayang dan sudah muncul di katalog publik."
          : "Belum tayang, hanya terlihat di panel pengelola.",
    })
    router.push("/admin/kitab")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <BagianMetadataKitab
        register={register}
        control={control}
        errors={errors}
        kategori={kategori}
        pengarang={pengarang}
        syarah={syarah}
        slugPratinjau={slugPratinjau}
        punyaPdf={punyaPdf}
      />
      <BagianBerkasPdf
        berkas={berkas}
        tersimpan={tersimpan}
        progres={progres}
        berkasDitampilkan={berkasDitampilkan}
        awal={awal}
        inputRef={berkasInput}
        onPilihBerkas={pilihBerkas}
        onUnggah={unggahSekarang}
        onBuang={buangBerkas}
      />
      <BagianStatusPublikasi register={register} status={status} galatStatus={errors.status?.message} />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />
          ) : (
            <Save className="size-4" strokeWidth={1.75} />
          )}
          {isSubmitting
            ? "Menyimpan…"
            : mode === "baru"
              ? "Simpan kitab"
              : "Simpan perubahan"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/kitab">Batal, kembali ke daftar</Link>
        </Button>
        {awal && (
          <span className="text-xs text-muted-foreground">
            Terakhir diperbarui {waktuRelatif(awal.updatedAt)} · {awal.jumlahDibuka}{" "}
            sesi baca
          </span>
        )}
      </div>
    </form>
  )
}
