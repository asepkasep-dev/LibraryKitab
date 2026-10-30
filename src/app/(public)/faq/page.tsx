import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MessageCircleQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FaqAccordion } from "@/components/site/faq-accordion"
import { SectionHeading } from "@/components/site/section-heading"
import { FAQ_ITEMS } from "@/lib/konten"
import { KONTAK_EMAIL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Pertanyaan Umum",
  description:
    "Jawaban singkat seputar akses kitab, cara membaca di ponsel, bookmark, catatan pribadi, dan pendaftaran akun.",
}

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="FAQ"
        judul="Pertanyaan yang paling sering masuk"
        deskripsi="Dihimpun dari pertanyaan santri dan ustadz sehari-hari. Bila yang Anda cari belum ada, kirimkan pesan kepada pengelola."
        align="center"
        className="mx-auto max-w-2xl items-center text-center"
      />

      <div className="mt-10">
        <FaqAccordion items={FAQ_ITEMS} />
      </div>

      <Card className="mt-10 gap-0 p-0">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold">
              <MessageCircleQuestion className="size-4 text-gold" strokeWidth={1.75} />
              Masih ada yang belum jelas?
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pengelola membuka ruang tanya lewat formulir kontak atau email
              langsung pada jam layanan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button asChild size="sm">
              <Link href="/kontak">Kirim pesan</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href={`mailto:${KONTAK_EMAIL}`}>
                <Mail className="size-4" strokeWidth={1.75} />
                Email
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
