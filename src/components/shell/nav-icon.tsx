import {
  Bookmark,
  BookOpen,
  Feather,
  History,
  LayoutDashboard,
  NotebookPen,
  ScrollText,
  Shapes,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"

/** Menamesuaikan nama ikon pada konfigurasi navigasi dengan komponen Lucide. */
const IKON: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  bookmark: Bookmark,
  "notebook-pen": NotebookPen,
  history: History,
  "user-round": UserRound,
  "book-open": BookOpen,
  shapes: Shapes,
  feather: Feather,
  "scroll-text": ScrollText,
  users: Users,
}

export function NavIcon({
  nama,
  className,
}: {
  nama?: string
  className?: string
}) {
  const Icon = (nama && IKON[nama]) || LayoutDashboard
  return <Icon className={className} strokeWidth={1.75} aria-hidden />
}
