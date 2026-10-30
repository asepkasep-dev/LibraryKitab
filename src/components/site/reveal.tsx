"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

/** Muncul dengan efek fade-in + slide-up saat digulir (Bab 4: Nuansa & Vibe). */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: "div" | "section" | "li"
}) {
  const Comp = motion[as]

  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Comp>
  )
}
