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

const nordsee = [{ id: 4, room: "nordsee", date: "2026-11-04", start: "10:00", end: "12:00", title: "Blockierung", status: "aktiv" }];
const check = (start, end, list = nordsee) => findConflicts({ room: "nordsee", date: "2026-11-04", start, end }, list).length;

test("erkennt Buchung, die komplett innerhalb einer bestehenden liegt (11:00–11:30)", () => {
  assert.strictEqual(check("11:00", "11:30"), 1);
});

test("erkennt Buchung, die eine bestehende vollständig umschließt (09:00–13:00)", () => {
  assert.strictEqual(check("09:00", "13:00"), 1);
});

test("erkennt teilweise Überschneidung am Anfang (09:00–10:30)", () => {
  assert.strictEqual(check("09:00", "10:30"), 1);
});

test("erkennt teilweise Überschneidung am Ende (11:30–12:30)", () => {
  assert.strictEqual(check("11:30", "12:30"), 1);
});

test("erkennt identischen Zeitraum", () => {
  assert.strictEqual(check("10:00", "12:00"), 1);
});

test("erlaubt direkt anschließende Buchung danach (Ende 11:00, Start 11:00)", () => {
  const list = [{ ...nordsee[0], end: "11:00" }];
  assert.strictEqual(check("11:00", "12:00", list), 0);
});

test("erlaubt direkt anschließende Buchung davor (Ende 10:00, Bestand ab 10:00)", () => {
  assert.strictEqual(check("09:00", "10:00"), 0);
});

test("erlaubt Buchung an einem anderen Tag", () => {
  assert.strictEqual(findConflicts({ room: "nordsee", date: "2026-11-05", start: "11:00", end: "11:30" }, nordsee).length, 0);
});

test("Fehlermeldung nennt die Belegung und rät zu anderem Termin oder Raum", () => {
  const msg = conflictMessage(nordsee[0]);
  assert.match(msg, /bereits gebucht/);
  assert.match(msg, /10:00–12:00/);
  assert.match(msg, /anderen Termin oder einen anderen Raum/);
});
