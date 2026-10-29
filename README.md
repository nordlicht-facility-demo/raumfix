# RaumFix

Interne Web-App der Nordlicht Facility GmbH zur Buchung von Besprechungsräumen.

## Struktur

- `src/booking/conflicts.js`: Konfliktprüfung zwischen Buchungen im selben Raum
- `test/`: automatisierte Tests

## Tests ausführen

```
npm test
```

## Fachliche Regeln

- Ein Raum kann zu jedem Zeitpunkt nur einmal belegt sein.
- Direkt anschließende Buchungen sind erlaubt (Ende 11:00, nächster Start 11:00).
- Stornierte Buchungen zählen bei der Konfliktprüfung nicht.

Details: Confluence-Space RaumFix, Seite „Architekturübersicht RaumFix".
