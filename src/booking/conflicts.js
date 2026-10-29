// Buchungslogik: Konfliktprüfung zwischen Buchungen im selben Raum.
// Zeiten werden als "HH:MM" übergeben und intern in Minuten seit Mitternacht verglichen.

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Liefert alle aktiven Buchungen, die mit der neuen Buchung kollidieren.
function findConflicts(newBooking, existingBookings) {
  return existingBookings.filter(
    (booking) =>
      booking.status !== "storniert" &&
      booking.room === newBooking.room &&
      booking.date === newBooking.date &&
      toMinutes(booking.start) === toMinutes(newBooking.start)
  );
}

// Fehlermeldung für die Oberfläche.
function conflictMessage(conflict) {
  return `Raum ist bereits gebuct: „${conflict.title}" ${conflict.start}–${conflict.end}.`;
}

module.exports = { toMinutes, findConflicts, conflictMessage };
