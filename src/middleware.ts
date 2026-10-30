import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isMemberRoute = createRouteMatcher(["/dashboard(.*)"])
const isAdminRoute = createRouteMatcher(["/admin(.*)"])
const isNonaktifRoute = createRouteMatcher(["/akun-nonaktif"])

/**
 * Middleware hanya menjaga gerbang sesi. Peran (member/admin) dan status akun
 * diverifikasi ulang lewat tabel users di layout (member) dan (admin), karena
 * Clerk bukan sumber kebenaran hak akses menurut PRD Bab 5.
 */
export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()

  if (isNonaktifRoute(req)) {
    // Halaman pemberitahuan tidak bermakna tanpa akun; jangan tampilkan untuk anonim.
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.nextUrl.origin))
    }
    return NextResponse.next()
  }

  if (!userId && (isMemberRoute(req) || isAdminRoute(req))) {
    const returnBackUrl = req.nextUrl.origin + req.nextUrl.pathname + req.nextUrl.search
    return redirectToSignIn({ returnBackUrl })
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Lewati aset statis dan berkas internal Next.js.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
