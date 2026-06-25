# Deploy & Infrastruktur — Casomorphin

## Zwei Rollen, klar getrennt

- **Werkstatt** (`~/Charite /Klausur Semester 1 /`, **nicht** dieses Repo):
  Pipeline (`pipeline/`), Roh-Altklausuren, Modulskripte, `semesters/`-Quelldaten, `output/`.
  Hier liegen auch die **Deploy-Steuerdateien** `deploy.sh` und `wrangler.toml`
  (bewusst hier, damit sie nicht mit ausgeliefert werden).
- **Deploy-Repo** (DIESES Repo, GitHub `CasparSchumacher/ExamSemester1`):
  ausschließlich die ausgelieferte Website + `functions/`. Reiner Inhalt, keine Config.

## Deploy-Modell: Cloudflare Pages (Direct Upload), Ein-Befehl

> Hinweis: „push = live" über Git ist nicht möglich — Cloudflares „Connect to Git"
> erzeugt heute einen **Worker** (ohne `*.pages.dev`-URL), und Direct-Upload-Pages-Projekte
> lassen sich nicht auf Git umstellen. Deshalb: bewusst **Direct Upload per Skript**.

**Deployen — ein Befehl, aus der Werkstatt:**
```bash
./deploy.sh            # Production → https://casomorphin.pages.dev
./deploy.sh test       # Preview    → https://test.casomorphin.pages.dev
```
`deploy.sh` macht `cd publish && npx wrangler pages deploy . --project-name=casomorphin`.
Das KV-Binding `REPORTS` kommt aus `../wrangler.toml` (Werkstatt), das `wrangler` beim
Deploy automatisch findet.

**Git nutzt du weiter** für History, Branches und Backup (genau wie beim Design-Refresh).
Nur das *Live-Schalten* ist ein expliziter `./deploy.sh` statt Auto-Deploy.
Typischer Ablauf: ändern → `git commit && git push` (Sicherung) → `./deploy.sh` (live).

## Projekt-Eckdaten

- Cloudflare-Account-ID: `67c87e8bfa3c43c7905d9340d3a34b8a`
- Pages-Projekt: **`casomorphin`** (Direct Upload) → `casomorphin.pages.dev`
- Pages-Function: `functions/api/report.js` → Endpoint `/api/report` (Fehler-Meldungen)
- KV-Binding: `REPORTS` → Namespace-ID `884e88c78caf45a0a8f08e4ec1b2aabf`
  (definiert in der Werkstatt-`wrangler.toml`)

## Inhalt dieses Repos

`index.html`, `start.html` (Semester-Hub), `semester-N.html`, `data/semester-N.js`,
`img/`, `skript/`, `fonts/` (self-hosted Hanken Grotesk), `Abbildungen.html`,
`Lernkartei_Gesamt.html`, `functions/api/report.js`.

## Neues Semester hinzufügen

1. Werkstatt: `cp -r semesters/_TEMPLATE semesters/sN`, Klausur-PDFs + Lernziele rein,
   `semesters/sN/config.json` füllen.
2. `python3 pipeline/run_semester.py sN` (LLM-Stufen lt. `pipeline/PIPELINE_AGENT.md`
   abarbeiten, dann erneut starten — resumiert per Content-Hash).
3. Build-Stufe erzeugt `semester-N.html` + `data/semester-N.js` (+ Bilder) → in **dieses** Repo.
4. Im Semester-Hub `start.html` das Semester N freischalten.
5. `git commit && git push` (Sicherung) → `./deploy.sh` (live).

## Rollback

- Dashboard → Workers & Pages → `casomorphin` → *Deployments* → früheren Deploy → **Rollback**.
- Oder lokal: `git revert <commit>` → `./deploy.sh`.

## Aufgeräumt / zu beachten

- Der alte Ordner `../site/` (frühere Deploy-Quelle) wird **nicht mehr gebraucht** —
  kann gelöscht werden.
- Ein versehentlich angelegter **Worker** namens `casomorphin` sollte im Dashboard
  gelöscht werden (das **Pages**-Projekt `casomorphin` bleibt!).
