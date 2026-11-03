const { test } = require("node:test");
const assert = require("node:assert");
const { toMinutes, findConflicts } = require("../src/booking/conflicts");

const existing = [
  { id: 1, room: "ostsee", date: "2026-11-03", start: "10:00", end: "11:00", title: "Weekly Team Facility", status: "aktiv" },
  { id: 2, room: "nordsee", date: "2026-11-03", start: "10:00", end: "11:00", title: "Quartalsplanung", status: "aktiv" },
  { id: 3, room: "elbe", date: "2026-11-03", start: "10:00", end: "11:00", title: "Abgesagtes Meeting", status: "storniert" }
];

test("rechnet Uhrzeiten in Minuten um", () => {
  assert.strictEqual(toMinutes("10:30"), 630);
});

test("erkennt eine Buchung mit identischer Startzeit im selben Raum", () => {
  const conflicts = findConflicts({ room: "ostsee", date: "2026-11-03", start: "10:00", end: "10:30" }, existing);
  assert.strictEqual(conflicts.length, 1);
});

test("erlaubt dieselbe Zeit in einem anderen Raum", () => {
  const conflicts = findConflicts({ room: "elbe", date: "2026-11-03", start: "10:00", end: "11:00" }, existing.slice(0, 1));
  assert.strictEqual(conflicts.length, 0);
});

test("ignoriert stornierte Buchungen", () => {
  const conflicts = findConflicts({ room: "elbe", date: "2026-11-03", start: "10:00", end: "11:00" }, existing);
  assert.strictEqual(conflicts.length, 0);
});

const ostsee = existing.slice(0, 1);
const request = (start, end) => ({ room: "ostsee", date: "2026-11-03", start, end });

test("erkennt eine Überlappung am Ende der bestehenden Buchung (10:30–11:30)", () => {
  assert.strictEqual(findConflicts(request("10:30", "11:30"), ostsee).length, 1);
});

test("erkennt eine Überlappung am Anfang der bestehenden Buchung (09:30–10:30)", () => {
  assert.strictEqual(findConflicts(request("09:30", "10:30"), ostsee).length, 1);
});

test("erkennt eine Buchung, die komplett in der bestehenden liegt (10:15–10:45)", () => {
  assert.strictEqual(findConflicts(request("10:15", "10:45"), ostsee).length, 1);
});

test("erkennt eine Buchung, die die bestehende komplett umschließt (09:00–12:00)", () => {
  assert.strictEqual(findConflicts(request("09:00", "12:00"), ostsee).length, 1);
});

test("erlaubt eine direkt anschließende Buchung (11:00–12:00)", () => {
  assert.strictEqual(findConflicts(request("11:00", "12:00"), ostsee).length, 0);
});

test("erlaubt eine Buchung, die direkt vor der bestehenden endet (09:00–10:00)", () => {
  assert.strictEqual(findConflicts(request("09:00", "10:00"), ostsee).length, 0);
});

test("erlaubt dieselbe überlappende Zeit an einem anderen Tag", () => {
  const other = { room: "ostsee", date: "2026-11-04", start: "10:30", end: "11:30" };
  assert.strictEqual(findConflicts(other, ostsee).length, 0);
});

test("ignoriert stornierte Buchungen auch bei Überlappung", () => {
  const cancelled = [{ ...ostsee[0], status: "storniert" }];
  assert.strictEqual(findConflicts(request("10:30", "11:30"), cancelled).length, 0);
});

test("Fehlermeldung nennt die belegte Buchung", () => {
  const { conflictMessage } = require("../src/booking/conflicts");
  assert.strictEqual(
    conflictMessage(ostsee[0]),
    "Raum ist bereits gebucht: „Weekly Team Facility\" 10:00–11:00."
  );
});
