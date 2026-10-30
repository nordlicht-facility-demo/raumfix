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

const ostsee = (start, end) => ({ room: "ostsee", date: "2026-11-03", start, end });
const ostseeBooking = existing.slice(0, 1);

test("erkennt identischen Zeitraum als Konflikt", () => {
  assert.strictEqual(findConflicts(ostsee("10:00", "11:00"), ostseeBooking).length, 1);
});

test("erkennt Überschneidung am Anfang als Konflikt", () => {
  assert.strictEqual(findConflicts(ostsee("09:30", "10:30"), ostseeBooking).length, 1);
});

test("erkennt Überschneidung am Ende als Konflikt (KAN-21)", () => {
  assert.strictEqual(findConflicts(ostsee("10:30", "11:30"), ostseeBooking).length, 1);
});

test("erkennt Buchung innerhalb einer bestehenden Buchung als Konflikt", () => {
  assert.strictEqual(findConflicts(ostsee("10:15", "10:45"), ostseeBooking).length, 1);
});

test("erkennt Buchung, die eine bestehende Buchung umschließt, als Konflikt", () => {
  assert.strictEqual(findConflicts(ostsee("09:00", "12:00"), ostseeBooking).length, 1);
});

test("erlaubt direkt anschließende Buchung danach", () => {
  assert.strictEqual(findConflicts(ostsee("11:00", "12:00"), ostseeBooking).length, 0);
});

test("erlaubt direkt anschließende Buchung davor", () => {
  assert.strictEqual(findConflicts(ostsee("09:00", "10:00"), ostseeBooking).length, 0);
});

test("erlaubt denselben Zeitraum in einem anderen Raum", () => {
  assert.strictEqual(findConflicts({ room: "elbe", date: "2026-11-03", start: "10:00", end: "11:00" }, ostseeBooking).length, 0);
});

test("erlaubt überlappende Zeit an einem anderen Tag", () => {
  assert.strictEqual(findConflicts({ ...ostsee("10:30", "11:30"), date: "2026-11-04" }, ostseeBooking).length, 0);
});
