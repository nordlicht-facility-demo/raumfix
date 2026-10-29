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

const ostsee = existing.slice(0, 1);
const neu = (start, end) => ({ room: "ostsee", date: "2026-11-03", start, end });

test("identischer Zeitraum ist ein Konflikt", () => {
  assert.strictEqual(findConflicts(neu("10:00", "11:00"), ostsee).length, 1);
});

test("Überschneidung am Anfang ist ein Konflikt", () => {
  assert.strictEqual(findConflicts(neu("09:30", "10:30"), ostsee).length, 1);
});

test("Überschneidung am Ende ist ein Konflikt", () => {
  assert.strictEqual(findConflicts(neu("10:30", "11:30"), ostsee).length, 1);
});

test("Buchung innerhalb eines bestehenden Zeitraums ist ein Konflikt", () => {
  assert.strictEqual(findConflicts(neu("10:15", "10:45"), ostsee).length, 1);
});

test("Buchung, die direkt anschließt, ist kein Konflikt", () => {
  assert.strictEqual(findConflicts(neu("11:00", "12:00"), ostsee).length, 0);
});

test("Buchung, die direkt vor Beginn endet, ist kein Konflikt", () => {
  assert.strictEqual(findConflicts(neu("09:00", "10:00"), ostsee).length, 0);
});

test("Fehlermeldung enthält korrekt geschriebenes Wort und bestehende Buchung", () => {
  const msg = conflictMessage(existing[0]);
  assert.ok(msg.includes("gebucht"));
  assert.ok(msg.includes("Weekly Team Facility"));
});
