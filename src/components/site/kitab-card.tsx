import Link from "next/link"
import { Eye, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { KitabCover } from "@/components/site/kitab-cover"
import { formatAngka } from "@/lib/format"
import type { KitabVe } from "@/db/queries"

export function KitabCard({ kitab }: { kitab: KitabVe }) {
  return (
    <Card interactive className="h-full gap-0 overflow-hidden p-0">
      <Link
        href={`/kitab/${kitab.slug}`}
        className="group flex h-full flex-col focus-visible:outline-none"
        aria-label={`Buka detail ${kitab.judulLatin}`}
      >
        <div className="relative p-3 pb-0">
          <KitabCover
            kitab={kitab}
            className="transition-transform duration-300 group-hover:scale-[1.015]"
          />
          <span className="badge-fan absolute left-5 top-5 backdrop-blur-md">
            {kitab.kategori.nama.split(" ")[0]}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="font-heading text-base leading-snug font-semibold text-pretty transition-colors group-hover:text-gold">
            {kitab.judulLatin}
          </h3>
          <p className="text-arabic text-sm text-muted-foreground">
            {kitab.judulArab}
          </p>
          <p className="text-sm text-muted-foreground">
            {kitab.pengarang.namaLatin}
            {kitab.syarah && (
              <span className="text-muted-foreground/80">
                {" "}
                · syarah {kitab.syarah.namaLatin}
              </span>
            )}
          </p>

          <div className="mt-auto flex items-center gap-4 pt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="size-3.5" strokeWidth={1.75} />
              {formatAngka(kitab.jumlahHalaman)} hlm
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-3.5" strokeWidth={1.75} />
              {formatAngka(kitab.jumlahDibuka)}× dibaca
            </span>
          </div>
        </div>
      </Link>
    </Card>
  )
}
