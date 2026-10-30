import type { Metadata } from "next"
import Link from "next/link"
import {
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { KontakForm } from "@/components/site/kontak-form"
import { SectionHeading } from "@/components/site/section-heading"
import {
  KONTAK_ALAMAT,
  KONTAK_EMAIL,
  KONTAK_JAM,
  KONTAK_TELEPON,
  PENYELENGGARA,
} from "@/lib/site"

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Sampaikan usulan kitab, laporan kendala, atau pertanyaan seputar layanan perpustakaan digital kepada pengelola.",
}

export default function KontakPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Kami bantu"
        judul="Hubungi pengelola perpustakaan"
        deskripsi="Punya usulan kitab yang perlu dipindai, menemukan halaman yang tampilannya rusak, atau kesulitan masuk akun? Kirim pesan lewat formulir ini, dan kami membaca setiap masukannya."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <KontakForm />

        <aside className="space-y-5">
          <Card className="gap-0 p-0">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-heading text-base font-semibold">
                {PENYELENGGARA}
              </h2>
              <ul className="space-y-3.5 text-sm">
                <Item ikon={MapPin} judul="Alamat">
                  {KONTAK_ALAMAT}
                </Item>
                <Item ikon={Mail} judul="Email">
                  <a href={`mailto:${KONTAK_EMAIL}`} className="hover:text-gold">
                    {KONTAK_EMAIL}
                  </a>
                </Item>
                <Item ikon={Phone} judul="Telepon / WA">
                  <a
                    href={`tel:${KONTAK_TELEPON.replace(/[^0-9+]/g, "")}`}
                    className="hover:text-gold"
                  >
                    {KONTAK_TELEPON}
                  </a>
                </Item>
                <Item ikon={Clock} judul="Jam layanan">
                  {KONTAK_JAM}
                </Item>
              </ul>
            </CardContent>
          </Card>

          <Card className="gap-3 p-6">
            <CardContent className="space-y-2.5 px-0">
              <MessageSquare className="size-5 text-teal-300" strokeWidth={1.75} />
              <h2 className="font-heading text-base font-semibold">
                Sedang membaca kitab?
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Buka halaman kitab mana pun, lalu gunakan tombol catatan di
                reader bila ada penjelasan yang ingin Anda tanyakan ke ustadz.
              </p>
              <Link
                href="/katalog"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-hover"
              >
                Ke katalog kitab
              </Link>
            </CardContent>
          </Card>

          <Card className="gap-3 p-6">
            <CardContent className="space-y-2.5 px-0">
              <HelpCircle className="size-5 text-gold" strokeWidth={1.75} />
              <h2 className="font-heading text-base font-semibold">
                Kemungkinan sudah terjawab
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Sebagian besar pertanyaan tentang cara membaca, bookmark, dan
                pendaftaran sudah kami rangkum pada halaman FAQ.
              </p>
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-hover"
              >
                Buka pertanyaan umum
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function Item({
  ikon: Ikon,
  judul,
  children,
}: {
  ikon: typeof Mail
  judul: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-3">
      <Ikon className="mt-0.5 size-4 shrink-0 text-gold/70" strokeWidth={1.75} />
      <div>
        <p className="text-xs text-muted-foreground">{judul}</p>
        <p className="text-sm leading-relaxed">{children}</p>
      </div>
    </li>
  )
}
