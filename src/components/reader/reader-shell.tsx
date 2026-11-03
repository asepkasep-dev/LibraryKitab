"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { KanvasBaca } from "@/components/reader/kanvas-baca"
import { KopBaca } from "@/components/reader/kop-baca"
import { PanelSamping } from "@/components/reader/panel-samping"
import { SaranLanjutBaca } from "@/components/reader/saran-lanjut-baca"
import { ToolbarBaca, type PanelBaca } from "@/components/reader/toolbar-baca"
import { WadahPanelBaca } from "@/components/reader/wadah-panel-baca"
import { useBookmarkBaca } from "@/components/reader/use-bookmark-baca"
import { useCatatanBaca } from "@/components/reader/use-catatan-baca"
import { useNavigasiBaca } from "@/components/reader/use-navigasi-baca"
import { usePreferensiBaca } from "@/components/reader/use-preferensi-baca"
import { useProgresBaca } from "@/components/reader/use-progres-baca"
import { bukaSesiBaca } from "@/actions/baca"
import type { BookmarkVe, CatatanVe, KitabVe } from "@/db/queries"

export function ReaderShell({
  kitab,
  pdfBaca,
  halamanAwal,
  sumberAwal = "riwayat",
  bookmarkAwal,
  catatanAwal,
  masuk,
  penggunaId,
  namaPengguna,
}: {
  kitab: KitabVe
  /** Alamat PDF yang siap dimuat reader; sudah ditandatangani `urlBaca`. */
  pdfBaca: string | null
  halamanAwal: number
  sumberAwal?: "riwayat" | "tautan"
  bookmarkAwal: BookmarkVe[]
  catatanAwal: CatatanVe[]
  masuk: boolean
  penggunaId: string
  namaPengguna: string | null
}) {
  const total = kitab.jumlahHalaman
  const [panel, setPanel] = useState<PanelBaca | null>(null)
  const [tabPanel, setTabPanel] = useState<PanelBaca>("bookmark")
  const [layarLebar, setLayarLebar] = useState(false)
  const sesiTerbuka = useRef(false)

  const { zoom, sepia, ubahZoom, aturZoomBaku, beralihSepia } = usePreferensiBaca()
  /* Callback stabil supaya listener keyboard hanya dipasang ulang ketika halaman,
     total, atau panel berpindah, persis seperti sebelum efeknya pindah ke hook. */
  const onTutupPanel = useCallback(() => setPanel(null), [])
  const { halaman, pindah } = useNavigasiBaca({
    halamanAwal,
    total,
    panel,
    onTutupPanel,
  })
  const { statusProgres, halamanTersimpan } = useProgresBaca({
    kitabId: kitab.id,
    halaman,
    masuk,
    halamanAwal,
  })
  const { bookmark, bookmarkHalamanIni, tandaiHalaman, gantiLabel, hapusBookmark } =
    useBookmarkBaca({
      kitabId: kitab.id,
      penggunaId,
      halaman,
      masuk,
      bookmarkAwal,
      onPilihPanel: (tab) => {
        setTabPanel(tab)
        setPanel(tab)
      },
    })
  const { catatan, tambahCatatan, ubahCatatan, hapusCatatan } = useCatatanBaca({
    kitabId: kitab.id,
    penggunaId,
    halaman,
    catatanAwal,
  })

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    const salin = () => setLayarLebar(media.matches)
    salin()
    media.addEventListener("change", salin)
    return () => media.removeEventListener("change", salin)
  }, [])

  useEffect(() => {
    if (!masuk || sesiTerbuka.current) return
    sesiTerbuka.current = true
    void bukaSesiBaca(kitab.id)
  }, [masuk, kitab.id])

  function bukaPanel(tab: PanelBaca) {
    if (panel && tabPanel === tab) {
      setPanel(null)
      return
    }
    setTabPanel(tab)
    setPanel(tab)
  }

  const panelBaca = (
    <PanelSamping
      kitab={kitab}
      halaman={halaman}
      totalHalaman={total}
      tab={tabPanel}
      onTab={(tab) => {
        setTabPanel(tab)
        setPanel(tab)
      }}
      bookmark={bookmark}
      catatan={catatan}
      bolehSimpan={masuk}
      onLompat={pindah}
      onTandaiHalamanIni={tandaiHalaman}
      onGantiLabel={gantiLabel}
      onHapusBookmark={hapusBookmark}
      onTambahCatatan={tambahCatatan}
      onUbahCatatan={ubahCatatan}
      onHapusCatatan={hapusCatatan}
    />
  )

  return (
    <div className="flex h-full min-h-0">
      <main className="relative flex min-w-0 flex-1 flex-col">
        <KopBaca
          kitab={kitab}
          masuk={masuk}
          namaPengguna={namaPengguna}
          statusProgres={statusProgres}
          halamanTersimpan={halamanTersimpan}
          total={total}
        />
        <SaranLanjutBaca
          sumberAwal={sumberAwal}
          halamanAwal={halamanAwal}
          onMulaiDariAwal={() => pindah(1)}
        />
        <KanvasBaca
          url={pdfBaca}
          slug={kitab.slug}
          judul={kitab.judulLatin}
          halaman={halaman}
          zoom={zoom}
          sepia={sepia}
          onLompat={pindah}
        />
        <ToolbarBaca
          halaman={halaman}
          totalHalaman={total}
          zoom={zoom}
          sepia={sepia}
          sudahBookmark={Boolean(bookmarkHalamanIni)}
          panelTerbuka={panel}
          bolehSimpan={masuk}
          onLompat={pindah}
          onZoom={ubahZoom}
          onResetZoom={aturZoomBaku}
          onSepia={beralihSepia}
          onBookmark={tandaiHalaman}
          onPanel={bukaPanel}
        />
      </main>

      <WadahPanelBaca
        terbuka={panel !== null}
        layarLebar={layarLebar}
        onTutup={() => setPanel(null)}
      >
        {panelBaca}
      </WadahPanelBaca>
    </div>
  )
}
