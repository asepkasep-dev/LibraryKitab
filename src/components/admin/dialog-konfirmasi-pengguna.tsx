"use client"

import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { BarisPengguna } from "@/lib/admin-pengguna"

export function DialogKonfirmasiPengguna({
  target,
  sedangDikerjakan,
  onBatal,
  onKonfirmasi,
}: {
  target: BarisPengguna | null
  sedangDikerjakan: boolean
  onBatal: () => void
  onKonfirmasi: (target: BarisPengguna) => void
}) {
  return (
    <Dialog
      open={target !== null}
      onOpenChange={(buka) => !buka && onBatal()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {target?.pengguna.status === "aktif"
              ? "Nonaktifkan akun ini?"
              : "Aktifkan kembali akun ini?"}
          </DialogTitle>
          <DialogDescription>
            {target
              ? target.pengguna.status === "aktif"
                ? `${target.pengguna.namaLengkap} tidak dapat masuk dan seluruh tautan dasbornya diblokir sampai akun diaktifkan lagi. Data baca tetap tersimpan.`
                : `${target.pengguna.namaLengkap} kembali dapat masuk, membaca kitab, serta mengelola bookmark dan catatannya.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onBatal}>
            Batal
          </Button>
          <Button
            variant={target?.pengguna.status === "aktif" ? "solidDestructive" : "default"}
            className="gap-2"
            disabled={sedangDikerjakan}
            onClick={() => target && onKonfirmasi(target)}
          >
            {sedangDikerjakan && <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />}
            {target?.pengguna.status === "aktif"
              ? "Nonaktifkan"
              : "Aktifkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
