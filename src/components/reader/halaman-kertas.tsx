import type { KitabTayang } from "@/lib/dummy-data"
import type { HalamanDummy } from "@/lib/baca"
import { cn } from "@/lib/utils"

const ANGKA_ARAB = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]

function angkaArab(nilai: number) {
  return String(nilai)
    .split("")
    .map((d) => ANGKA_ARAB[Number(d)] ?? d)
    .join("")
}

/**
 * Halaman kanvas dummy: bentuk dan susunannya meniru halaman kitab yang
 * dipindai (matn Arab di atas, terjemah dan penjelasan di bawah).
 */
export function HalamanKertas({
  kitab,
  isi,
  zoom,
  sepia,
}: {
  kitab: KitabTayang
  isi: HalamanDummy
  zoom: number
  sepia: boolean
}) {
  const skala = zoom / 100

  return (
    <article
      aria-label={`Halaman ${isi.nomor} kitab ${kitab.judulLatin}, bab ${isi.bab}`}
      style={{
        width: `calc(min(46rem, 88vw) * ${skala})`,
        fontSize: `calc(0.95rem * ${skala})`,
      }}
      className={cn(
        "shrink-0 rounded-2xl bg-[#f8f5ec] px-[2.4em] py-[2.2em] text-slate-800 ring-1 ring-black/5",
        "shadow-[0_30px_70px_-20px_rgb(0_0_0/0.75)] transition-[width] duration-200 ease-out",
        sepia && "page-sepia",
      )}
    >
      <header className="mb-[1.6em] space-y-[0.9em]">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[0.72em] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {kitab.judulLatin}
          </p>
          <p className="text-arabic text-[1.15em] leading-tight font-semibold text-[hsl(36_45%_22%)]">
            {kitab.judulArab}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[0.8em]">
          <span className="h-px flex-1 bg-slate-400/40" />
          <span className="font-semibold tracking-wide text-[hsl(36_45%_24%)]">
            {isi.bab}
          </span>
          <span className="h-px flex-1 bg-slate-400/40" />
        </div>
      </header>

      <div className="space-y-[1.4em]">
        {isi.kutipan.map((kutipan, indeks) => (
          <section key={`${isi.nomor}-${indeks}`} className="space-y-[0.55em]">
            <p className="text-arabic text-[1.45em] leading-[2.1] text-start text-[hsl(36_50%_16%)]">
              {kutipan.arab}
            </p>
            <p className="border-s-2 border-[hsl(36_40%_70%)] ps-[0.9em] text-[0.92em] leading-[1.7] text-slate-600">
              {kutipan.arti}
            </p>
          </section>
        ))}
      </div>

      {isi.hiasan && (
        <div className="my-[1.4em] flex items-center gap-3 text-[hsl(36_40%_45%)]">
          <span className="h-px flex-1 bg-current opacity-40" />
          <span aria-hidden className="text-[1.1em] leading-none">
            ۞
          </span>
          <span className="h-px flex-1 bg-current opacity-40" />
        </div>
      )}

      <div className="space-y-[0.9em] text-[0.95em] leading-[1.85] text-justify text-slate-700">
        {isi.paragraf.map((paragraf, indeks) => (
          <p key={`${isi.nomor}-p-${indeks}`}>{paragraf}</p>
        ))}
      </div>

      <footer className="mt-[2em] flex items-center justify-between gap-4 border-t border-slate-400/35 pt-[1em] text-[0.78em] text-slate-500">
        <span>{kitab.kategori.nama}</span>
        <span className="text-arabic text-[1.25em] leading-none">
          صَفْحَة {angkaArab(isi.nomor)}
        </span>
        <span>{kitab.tahunTerbit}</span>
      </footer>
    </article>
  )
}
