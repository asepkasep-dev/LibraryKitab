import assert from "node:assert/strict"
import { test } from "node:test"
import { bacaKonfigurasiAdmin } from "../src/db/admin-seed"

const CLERK_ID = "user_2abc1def2gh3ij4kl5mn6op7qr"

test("ADMIN_CLERK_ID kosong berarti peran tidak diubah", () => {
  assert.equal(bacaKonfigurasiAdmin({}), null)
  assert.equal(bacaKonfigurasiAdmin({ ADMIN_CLERK_ID: "   " }), null)
})

test("clerkId yang benar memakai email turunan bila ADMIN_EMAIL kosong", () => {
  const hasil = bacaKonfigurasiAdmin({ ADMIN_CLERK_ID: CLERK_ID })
  assert.deepEqual(hasil, { clerkId: CLERK_ID, email: `${CLERK_ID}@pengguna.kitabku` })
})

test("ADMIN_EMAIL dipakai bila diisi", () => {
  const hasil = bacaKonfigurasiAdmin({
    ADMIN_CLERK_ID: CLERK_ID,
    ADMIN_EMAIL: "pengasuh@pesantren.id",
  })
  assert.equal(hasil?.email, "pengasuh@pesantren.id")
})

test("clerkId di luar bentuk Clerk ditolak", () => {
  assert.throws(
    () => bacaKonfigurasiAdmin({ ADMIN_CLERK_ID: "admin-lama" }),
    /ADMIN_CLERK_ID/,
  )
})

test("ADMIN_EMAIL yang tidak valid ditolak tanpa menampilkannya", () => {
  assert.throws(
    () => bacaKonfigurasiAdmin({ ADMIN_CLERK_ID: CLERK_ID, ADMIN_EMAIL: "bukan-email" }),
    (error: Error) => {
      assert.match(error.message, /ADMIN_EMAIL/)
      assert.doesNotMatch(error.message, /bukan-email/)
      return true
    },
  )
})
