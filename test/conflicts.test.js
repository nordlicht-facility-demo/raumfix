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

const { conflictMessage } = require("../src/booking/conflicts");

const ostsee = existing.slice(0, 1);
const request = (start, end) => ({ room: "ostsee", date: "2026-11-03", start, end });

test("erkennt eine Überlappung am Ende der bestehenden Buchung (10:30–11:30)", () => {
  assert.strictEqual(findConflicts(request("10:30", "11:30"), ostsee).length, 1);
});

test("erkennt eine Überlappung am Anfang der bestehenden Buchung (09:30–10:30)", () => {
  assert.strictEqual(findConflicts(request("09:30", "10:30"), ostsee).length, 1);
});

test("erkennt eine neue Buchung, die die bestehende komplett umschließt", () => {
  assert.strictEqual(findConflicts(request("09:00", "12:00"), ostsee).length, 1);
});

test("erkennt eine neue Buchung innerhalb der bestehenden", () => {
  assert.strictEqual(findConflicts(request("10:15", "10:45"), ostsee).length, 1);
});

test("erlaubt direkt anschließende Buchung (Start = Ende der bestehenden)", () => {
  assert.strictEqual(findConflicts(request("11:00", "12:00"), ostsee).length, 0);
});

test("erlaubt direkt vorangehende Buchung (Ende = Start der bestehenden)", () => {
  assert.strictEqual(findConflicts(request("09:00", "10:00"), ostsee).length, 0);
});

test("erlaubt dieselbe Zeit an einem anderen Tag", () => {
  const other = { room: "ostsee", date: "2026-11-04", start: "10:00", end: "11:00" };
  assert.strictEqual(findConflicts(other, ostsee).length, 0);
});

test("Fehlermeldung nennt „Raum ist bereits gebucht“ und Details zur bestehenden Buchung", () => {
  const message = conflictMessage(ostsee[0]);
  assert.ok(message.startsWith("Raum ist bereits gebucht"));
  assert.ok(message.includes("Weekly Team Facility"));
  assert.ok(message.includes("10:00–11:00"));
});
