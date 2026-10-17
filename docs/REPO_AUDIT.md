# Leteći Rođa — audit, reprodukcija problema i popravni plan

> **Datum pregleda:** 2026-10-17 · **Grana:** `master` · **Izvor:** `README.md`, `server.js`, GitHub root listing.  
> **Limit:** Nije pokrenut Node server, Ollama, audio stream ili browser.

## Rezultati

| ID | Ozbiljnost | Nalaz | Dokaz |
|---|---|---|---|
| LR-001 | P1 pokretanje | README nalaže `npm start`, ali u root listing-u nema `package.json` | GitHub root sadrži samo `README.md`, `public/`, `server.js` |
| LR-002 | P1 istinitost odgovora | Offline fallback šalje unapred pripremljen SSE odgovor i tekst `ZERO-ERROR`, umesto jasnog statusa da model nije dostupan | `server.js`, `app.post('/api/chat')`, `catch` |
| LR-003 | P1 mrežna zaštita | `app.listen(PORT, '0.0.0.0')`, globalni `cors()` i bez autentifikacije na `/api/chat` | `server.js` |
| LR-004 | P2 stream korektnost | `chunk.split('\n')` i neuspešno parciranje parcijalnog JSON-a uz `catch` koji ignoriše ostatak | `server.js`, Ollama streaming reader |
| LR-005 | P2 dokumentacija | README tvrdi „AIR-GAPPED LOOPBACK“ i „100% PRODUCTION READY“, ali server osluškuje sve interfejse i nudi online audio URL-ove | README + `server.js` |

## LR-001 — Projektni manifest nedostaje

**Tačan kvar:** Bez `package.json`, komanda `npm start` ne može pronaći definisanu `start` skriptu. Dodatno, `server.js` poziva `require('express')` i `require('cors')`, pa je potrebna instalacija paketa.

**Bezbedna početna popravka:** dodati `package.json` sa `start: node server.js`, `check: node --check server.js` i postojećim potrebnim zavisnostima. Zatim generisati i proveriti lockfile sa `npm install --package-lock-only` / `npm install` u kontrolisanom okruženju; **ne tvrditi da je runtime prošao bez testa**.

## LR-002 — Lažan osećaj da je lokalna AI aktivna

**Dokaz:** Nakon neuspele veze sa `/api/generate`, `catch` emituje fiksne fraze putem `text/event-stream`, uključujući „Svi moduli su u statusu ZERO-ERROR“. U tom trenutku odgovor nije generisao model.

**Popravni test:** Stubovati neuspešan `fetch` prema lokalnoj Ollami; proveriti da API vraća eksplicitan `offline` status i da UI prikazuje „Lokalni model nedostupan“, ne sadržaj predstavljen kao AI odgovor. Dodati slučaj u kome je upstream već poslao deo toka i zatim prekinuo; nikada ne šalji drugi status HTTP-a posle prvog bajta.

## LR-003 — Mrežna izloženost

**Dokaz:** Trenutni kod osluškuje `0.0.0.0`, `cors()` je otvoren za sve origin-e i `/api/chat` nema autentifikaciju ni rate limit.

**Uticaj:** Ako je port izložen mreži, drugi klijenti mogu pokušavati da koriste proxy i lokalne modele. Ovo **ne potvrđuje** da je stvarno otvoren kroz Windows Firewall ili ruter.

**Predlog:** Podrazumevani bind `127.0.0.1` (ili eksplicitni bind preko `HOST`), restriktivni CORS i limit veličine prompta, namenska autentifikacija pre udaljenog pristupa. U WSL2 pristup sa Windows hosta proveriti eksplicitno, bez nepotrebnog otvaranja porta.

## LR-004 — Streaming granice

TCP/Web Streams chunk ne mora da se završi na granici JSON reda; `chunk.split('\n')` može iseći jedan JSON objekat na dva `read()` poziva. Trenutni `catch` takve delove odbacuje, pa tokeni mogu nedostajati.

**Predlog testa:** Simulirati jedno validno JSONL ažuriranje razdeljeno na dva buffera i potvrditi da se poruka dobije jednom, u celosti. Tek zatim uvesti akumulacioni buffer i postaviti maksimalnu veličinu reda.

## Provera u kontrolisanom okruženju (Windows PowerShell)

```powershell
node --version
npm.cmd --version
npm.cmd install
npm.cmd run check
npm.cmd start
```

Ovo je **plan za lokalnu proveru nakon spajanja minimalne manifest ispravke**, a ne tvrdnja da je komanda izvršena. Ne otvarati port na ruteru i ne prosleđivati credentials u chat.

## Evidencija

- [x] Stanje root direktorijuma i `server.js` pregledano na GitHub-u.
- [x] Nedostajući manifest i sporna offline fallback logika provereni statički.
- [ ] Node parser, npm instalacija i stvarni server — nisu testirani.
- [ ] Streaming pod delimičnim JSONL chunkovima — nema izvršenog regresionog testa.
- [ ] Ollama online/offline E2E — nije potvrđen.
- [ ] LAN ekspozicija i firewall — nisu testirani.

## Redosled implementacije

1. Manifest i deterministički `node --check` za deblokadu pokretanja.
2. Test za offline/partial-stream grane.
3. Fail-closed status i bezbedan SSE framing.
4. Ograničenje loopback vezivanja, CORS i pristupa.
5. Ispraviti README marketinške tvrdnje prema testiranim rezultatima.

Ovaj audit je činjenični pregled koda; ne predstavlja produkcijsku sertifikaciju.
