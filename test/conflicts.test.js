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
const room = (start, end) => ({ room: "ostsee", date: "2026-11-03", start, end });

test("erkennt Überschneidung bei späterem Start innerhalb der bestehenden Buchung", () => {
  assert.strictEqual(findConflicts(room("10:30", "11:30"), existing).length, 1);
});

test("erkennt Überschneidung bei früherem Start und Ende innerhalb der bestehenden Buchung", () => {
  assert.strictEqual(findConflicts(room("09:30", "10:30"), existing).length, 1);
});

test("erkennt neue Buchung, die die bestehende vollständig umschließt", () => {
  assert.strictEqual(findConflicts(room("09:00", "12:00"), existing).length, 1);
});

test("erkennt neue Buchung, die vollständig innerhalb der bestehenden liegt", () => {
  assert.strictEqual(findConflicts(room("10:15", "10:45"), existing).length, 1);
});

test("erlaubt direkt anschließende Buchung (Start == Ende der bestehenden)", () => {
  assert.strictEqual(findConflicts(room("11:00", "12:00"), existing).length, 0);
});

test("erlaubt direkt vorausgehende Buchung (Ende == Start der bestehenden)", () => {
  assert.strictEqual(findConflicts(room("09:00", "10:00"), existing).length, 0);
});

test("erlaubt Buchung an einem anderen Tag", () => {
  assert.strictEqual(findConflicts({ ...room("10:00", "11:00"), date: "2026-11-04" }, existing).length, 0);
});

test("ignoriert stornierte Buchung auch bei Überschneidung", () => {
  assert.strictEqual(findConflicts({ room: "elbe", date: "2026-11-03", start: "10:30", end: "11:30" }, existing).length, 0);
});

test("Fehlermeldung nennt die bestehende Buchung und ist korrekt geschrieben", () => {
  assert.strictEqual(conflictMessage(existing[0]), "Raum ist bereits gebucht: „Weekly Team Facility\" 10:00–11:00.");
});
