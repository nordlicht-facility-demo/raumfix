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

const weekly = existing.slice(0, 1);
const overlapCases = [
  ["identischer Zeitraum", "10:00", "11:00", 1],
  ["Überschneidung am Anfang", "09:30", "10:30", 1],
  ["Überschneidung am Ende", "10:30", "11:30", 1],
  ["vollständig innerhalb des bestehenden Zeitraums", "10:15", "10:45", 1],
  ["umschließt den bestehenden Zeitraum", "09:00", "12:00", 1],
  ["schließt direkt an", "11:00", "12:00", 0],
  ["endet direkt vor Beginn", "09:00", "10:00", 0]
];

for (const [name, start, end, expected] of overlapCases) {
  test(`Überlappung: ${name} (${start}-${end})`, () => {
    const conflicts = findConflicts({ room: "ostsee", date: "2026-11-03", start, end }, weekly);
    assert.strictEqual(conflicts.length, expected);
  });
}

test("Fehlermeldung nennt die bestehende Buchung", () => {
  assert.strictEqual(
    conflictMessage(existing[0]),
    "Raum ist bereits gebucht: „Weekly Team Facility\" 10:00–11:00."
  );
});
