"use client"

import { Layers, LoaderCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { EntitasBaris } from "@/lib/admin-entitas"

export function DialogHapusEntitas({
  namaEntitas,
  target,
  sedangDikerjakan,
  onBatal,
  onKonfirmasi,
}: {
  namaEntitas: string
  target: EntitasBaris | null
  sedangDikerjakan: boolean
  onBatal: () => void
  onKonfirmasi: (target: EntitasBaris) => void
}) {
  return (
    <Dialog
      open={target !== null}
      onOpenChange={(buka) => !buka && onBatal()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus {namaEntitas.toLowerCase()} ini?</DialogTitle>
          <DialogDescription>
            Barisnya dihapus dari database dan tindakannya dicatat pada
            log_admin. Kitab yang memakai entitas ini tidak ikut terhapus.
          </DialogDescription>
        </DialogHeader>

        {(target?.terkait ?? 0) > 0 && (
          <Alert>
            <Layers className="size-4" strokeWidth={1.75} />
            <AlertTitle>Masih dipakai {target?.terkait} kitab</AlertTitle>
            <AlertDescription>
              Pindahkan atau hapus dulu kitab yang memakai data ini, baru
              entitas dapat dihapus.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onBatal}>
            Batal
          </Button>
          <Button
            variant="solidDestructive"
            className="gap-2"
            disabled={(target?.terkait ?? 0) > 0 || sedangDikerjakan}
            onClick={() => target && onKonfirmasi(target)}
          >
            {sedangDikerjakan ? (
              <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />
            ) : (
              <Trash2 className="size-4" strokeWidth={1.75} />
            )}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
