import assert from "node:assert/strict"
import { test } from "node:test"
import { LEBAR_MIN_WADAH, rasioKanvas, skalaHalaman } from "../src/lib/baca"

test("halaman dilebarkan mengikuti wadah saat zoom 100", () => {
  assert.equal(skalaHalaman(840, 420, 100), 2)
})

test("zoom memperbesar skala hasil muat wadah", () => {
  assert.equal(skalaHalaman(420, 420, 150), 1.5)
})

test("wadah lebih sempit dari minimum tetap memakai lebar minimum", () => {
  assert.equal(skalaHalaman(120, 420, 100), LEBAR_MIN_WADAH / 420)
})

test("lebar dasar atau wadah tidak valid jatuh ke skala zoom saja", () => {
  assert.equal(skalaHalaman(600, 0, 90), 0.9)
  assert.equal(skalaHalaman(Number.NaN, 420, 100), 1)
})

test("rasio kanvas dikunci antara 1x sampai 2x", () => {
  assert.equal(rasioKanvas(0.5), 1)
  assert.equal(rasioKanvas(1), 1)
  assert.equal(rasioKanvas(3), 2)
  assert.equal(rasioKanvas(Number.NaN), 1)
})
