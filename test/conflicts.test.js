const { test } = require("node:test");
const assert = require("node:assert");
const { toMinutes, findConflicts, conflictMessage } = require("../src/booking/conflicts");

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

test("erkennt eine teilweise Überschneidung (10:30–11:30 gegen 10:00–11:00)", () => {
  const conflicts = findConflicts({ room: "ostsee", date: "2026-11-03", start: "10:30", end: "11:30" }, existing);
  assert.strictEqual(conflicts.length, 1);
  assert.strictEqual(conflicts[0].id, 1);
});

test("erkennt eine Überschneidung, wenn die neue Buchung früher beginnt", () => {
  const conflicts = findConflicts({ room: "ostsee", date: "2026-11-03", start: "09:30", end: "10:30" }, existing);
  assert.strictEqual(conflicts.length, 1);
});

test("erkennt eine Buchung, die eine bestehende vollständig umschließt", () => {
  const conflicts = findConflicts({ room: "ostsee", date: "2026-11-03", start: "09:00", end: "12:00" }, existing);
  assert.strictEqual(conflicts.length, 1);
});

test("erkennt eine Buchung innerhalb einer bestehenden", () => {
  const conflicts = findConflicts({ room: "ostsee", date: "2026-11-03", start: "10:15", end: "10:45" }, existing);
  assert.strictEqual(conflicts.length, 1);
});

test("erlaubt direkt anschließende Buchungen", () => {
  assert.strictEqual(findConflicts({ room: "ostsee", date: "2026-11-03", start: "11:00", end: "12:00" }, existing).length, 0);
  assert.strictEqual(findConflicts({ room: "ostsee", date: "2026-11-03", start: "09:00", end: "10:00" }, existing).length, 0);
});

test("erlaubt dieselbe Zeit an einem anderen Tag", () => {
  const conflicts = findConflicts({ room: "ostsee", date: "2026-11-04", start: "10:30", end: "11:30" }, existing);
  assert.strictEqual(conflicts.length, 0);
});

test("Fehlermeldung nennt die bestehende Buchung", () => {
  assert.strictEqual(
    conflictMessage(existing[0]),
    "Raum ist bereits gebucht: „Weekly Team Facility\" 10:00–11:00."
  );
});
