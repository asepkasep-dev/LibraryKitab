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
import type { KitabVe, StatusKitab } from "@/db/queries"

const LABEL_STATUS: Record<StatusKitab, string> = {
  published: "Tayang",
  draft: "Draf",
  archived: "Arsip",
}

export function DialogHapusKitab({
  target,
  sedangDikerjakan,
  onBatal,
  onKonfirmasi,
}: {
  target: KitabVe | null
  sedangDikerjakan: boolean
  onBatal: () => void
  onKonfirmasi: (target: KitabVe) => void
}) {
  return (
    <Dialog open={target !== null} onOpenChange={(buka) => !buka && onBatal()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Hapus kitab ini?</DialogTitle>
          <DialogDescription>
            {target
              ? `${target.judulLatin} (${LABEL_STATUS[target.status]}) akan dihapus dari perpustakaan beserta bookmark dan catatan yang menunjuk halaman kitab ini.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="surface-inset space-y-1 p-3 text-xs text-muted-foreground">
          <p>
            Slug: <span className="font-mono text-foreground">{target?.slug}</span>
          </p>
          <p>
            Berkas: <span className="text-foreground">{target?.urlPdf}</span>
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onBatal}>
            Batal
          </Button>
          <Button variant="solidDestructive" className="gap-2" disabled={sedangDikerjakan} onClick={() => target && onKonfirmasi(target)}>
            {sedangDikerjakan && <LoaderCircle className="size-4 animate-spin" strokeWidth={1.75} />}
            Hapus kitab
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
