"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type Konfirmasi = {
  judul: string
  penjelasan: string
  lakukan: () => void
} | null

/** Satu dialog hapus untuk kedua tab panel; pemanggil yang menyusun judul dan penjelasannya. */
export function DialogKonfirmasiBaca({
  konfirmasi,
  onTutup,
}: {
  konfirmasi: Konfirmasi
  onTutup: () => void
}) {
  return (
    <Dialog open={konfirmasi !== null} onOpenChange={(buka) => !buka && onTutup()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{konfirmasi?.judul}</DialogTitle>
          <DialogDescription>{konfirmasi?.penjelasan}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onTutup()}>
            Batal
          </Button>
          <Button
            variant="solidDestructive"
            onClick={() => {
              konfirmasi?.lakukan()
              onTutup()
            }}
          >
            Ya, hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
