# Deploy & Infrastruktur — Casomorphin

## Zwei Rollen, klar getrennt

- **Werkstatt** (`~/Charite /Klausur Semester 1 /`, **nicht** in diesem Repo):
  Pipeline (`pipeline/`), Roh-Altklausuren, Modulskripte, `semesters/`-Quelldaten,
  `output/`. Privat und groß. Erzeugt die ausgelieferten Dateien.
- **Deploy-Repo** (DIESES Repo, GitHub `CasparSchumacher/ExamSemester1`):
  ausschließlich die ausgelieferte Website. **Eine** Quelle, git-verbunden mit Cloudflare Pages.

Die Werkstatt ist das Gedächtnis; dieses Repo ist das, was die Welt sieht.

## Deploy-Mechanik: push = live

Cloudflare Pages (Projekt `casomorphin`) ist mit diesem GitHub-Repo verbunden.

- Push auf `main` → automatischer Production-Deploy → <https://casomorphin.pages.dev>
- Push auf jeden anderen Branch → automatische **Preview-URL**
  (z. B. `design-refresh.casomorphin.pages.dev`) — ideal zum risikofreien Ausprobieren.
- **Kein** `wrangler pages deploy` mehr, **kein** Kopieren nach `site/`.

### Build-Settings im Pages-Projekt (einmalig im Dashboard gesetzt)
| Feld | Wert |
|------|------|
| Framework preset | None |
| Build command | *(leer)* |
| Build output directory | `/` |
| Functions | `functions/` wird automatisch erkannt → Endpoint `/api/report` |
| KV-Binding | `REPORTS` → Namespace-ID `884e88c78caf45a0a8f08e4ec1b2aabf` |

## Inhalt dieses Repos

`index.html`, `start.html` (Semester-Hub), `semester-N.html`, `data/semester-N.js`,
`img/`, `skript/`, `fonts/` (self-hosted), `Abbildungen.html`, `Lernkartei_Gesamt.html`,
`functions/api/report.js` (Fehler-Meldungen → KV).

## Neues Semester hinzufügen

1. Werkstatt: `cp -r semesters/_TEMPLATE semesters/sN`, Klausur-PDFs + Lernziele rein,
   `semesters/sN/config.json` füllen.
2. `python3 pipeline/run_semester.py sN` (LLM-Stufen lt. `pipeline/PIPELINE_AGENT.md`
   abarbeiten, dann erneut starten — resumiert per Content-Hash).
3. Build-Stufe erzeugt `semester-N.html` + `data/semester-N.js` (+ neue Bilder)
   → in **dieses** Repo legen.
4. Im Semester-Hub `start.html` das Semester N freischalten.
5. `git add -A && git commit -m "Semester N" && git push` → live.

## Rollback

- Dashboard → Pages → `casomorphin` → *Deployments* → früheren Deploy → **Rollback**.
- Oder lokal: `git revert <commit> && git push`.

## Altlasten (nach erfolgreicher Git-Migration entfernbar)

- `../site/` — alte Direct-Upload-Quelle, wird nicht mehr gebraucht.
- `../wrangler.toml` mit `pages_build_output_dir = "site"` — galt nur für den alten
  `wrangler pages deploy`-Weg.
- `.nojekyll` — war ein GitHub-Pages-Artefakt (entfernt).
