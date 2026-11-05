"use client"

import { useCallback, useRef, useState } from "react"
import { perpanjangUrlBaca } from "@/actions/baca"
import { putuskanSegarkanUrl } from "@/lib/baca-alur"

/**
 * URL baca bertanda tangan punya masa berlaku, sedangkan pdf.js mengikat URL itu
 * sekali saja saat dokumen dibuka. Sesi membaca yang lebih panjang dari masa
 * berlaku berakhir dengan penolakan CDN pada halaman berikutnya.
 *
 * Hook ini menyimpan URL aktif dan menandatangani ulang lewat aksi server.
 * `segarkan(true)` untuk pemulihan otomatis yang dibatasi sekali per episode;
 * `segarkan(false)` untuk tombol "Muat ulang" yang tidak boleh ikut dibatasi.
 * `tandaiBerhasil` membuka penjaga itu lagi setelah dokumen selesai dimuat.
 */
export function useUrlPdfSegar(slug: string, urlAwal: string | null) {
  const [url, setUrl] = useState(urlAwal)
  const [sedangMenyegarkan, setSedangMenyegarkan] = useState(false)
  const sudahOtomatis = useRef(false)

  // Cermin `url` lewat ref supaya `segarkan` tidak bergantung pada state dan
  // identitasnya tetap stabil. Identitas yang berubah setiap penyegaran akan
  // ikut menjalankan ulang efek pemuatan di komponen pemanggil.
  const urlAktif = useRef(url)
  urlAktif.current = url

  const segarkan = useCallback(
    async (otomatis: boolean) => {
      if (urlAktif.current === null) return false
      setSedangMenyegarkan(true)
      try {
        const hasil = await perpanjangUrlBaca(slug)
        const keputusan = putuskanSegarkanUrl({
          sudahOtomatis: otomatis && sudahOtomatis.current,
          urlAktif: urlAktif.current,
          hasil: { ok: hasil.ok, url: hasil.ok ? hasil.url : null },
        })
        if (keputusan.tindak === "diam") return false

        sudahOtomatis.current = true
        urlAktif.current = keputusan.url
        setUrl(keputusan.url)
        return true
      } catch {
        // Panggilan aksi server bisa gagal di lapisan transport (jaringan putus,
        // 5xx) sebelum sempat mengembalikan { ok: false }. Tanpa catch di sini
        // penolakan menyebar ke pemanggil dan panel gagal tidak pernah muncul.
        return false
      } finally {
        setSedangMenyegarkan(false)
      }
    },
    [slug],
  )

  const tandaiBerhasil = useCallback(() => {
    sudahOtomatis.current = false
  }, [])

  return { url, sedangMenyegarkan, segarkan, tandaiBerhasil }
}
