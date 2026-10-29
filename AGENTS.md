# Regeln für Coding-Agenten (RaumFix)

Diese Datei lesen KI-Agenten, bevor sie im Repository arbeiten. Sie entspricht der Confluence-Seite „Coding-Konventionen“ im Space RaumFix.

## Ablauf
- Arbeite nur am freigegebenen Lösungsplan aus dem Jira-Vorgang. Keine Änderungen außerhalb des Plans.
- Lege einen Branch an und öffne einen Pull Request gegen `main`. Nie direkt auf `main` pushen.
- Erhöhe bei jedem Fehlerfix die Patch-Version in `package.json` (z. B. 2.4.1 → 2.4.2). Die Version wird unten in der App angezeigt.
- Erkläre im Pull Request in einfacher Sprache: Ursache, Änderung, Tests.

## Code
- Buchungslogik liegt in `src/booking/`. Die Web-Oberfläche (`index.html`) nutzt diesen Code direkt, ändere dort nur, was der Plan verlangt.
- Zeiten werden als `"HH:MM"` übergeben und in Minuten seit Mitternacht verglichen (`toMinutes`).
- Texte für Nutzer sind Deutsch, Code-Bezeichner Englisch.
- Die Exporte am Ende von `conflicts.js` müssen für Node und Browser erhalten bleiben.

## Tests
- Jede Änderung braucht Tests in `test/`. Ausführen mit `npm test` (Node, ohne Abhängigkeiten).
- Alle Tests müssen grün sein, bevor der Pull Request geöffnet wird.
- Teste die Akzeptanzkriterien aus dem Vorgang und die Randfälle (z. B. direkt anschließende Buchungen).
