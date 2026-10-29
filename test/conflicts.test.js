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
const overlapCases = [
  ["identischer Zeitraum", "10:00", "11:00", 1],
  ["Überschneidung am Anfang", "09:30", "10:30", 1],
  ["Überschneidung am Ende", "10:30", "11:30", 1],
  ["vollständig innerhalb einer bestehenden Buchung", "10:15", "10:45", 1],
  ["direkt im Anschluss (11:00–12:00)", "11:00", "12:00", 0],
  ["direkt davor endend (09:00–10:00)", "09:00", "10:00", 0]
];

for (const [name, start, end, expected] of overlapCases) {
  test(`Zeitüberschneidung: ${name}`, () => {
    const conflicts = findConflicts({ room: "ostsee", date: "2026-11-03", start, end }, ostsee);
    assert.strictEqual(conflicts.length, expected);
  });
}
