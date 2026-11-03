"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/** Tombol ikon reader dengan tooltip; `aktif` memberi warna emas, `tertekan` sekadar tanda. */
export function TombolToolbar({
  label,
  aktif,
  tertekan,
  onClick,
  children,
}: {
  label: string
  aktif?: boolean
  tertekan?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-pressed={aktif}
          onClick={onClick}
          className={cn(
            "size-9 rounded-xl text-foreground hover:bg-white/10 hover:text-white",
            aktif && "bg-gold/15 text-gold hover:bg-gold/20 hover:text-gold",
            tertekan && "text-gold",
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="border-white/10 bg-popover">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
