# 🛸 LETEĆI ROĐA — 3D Cyberpunk Mascot, Radio & AI Copilot (v6.0)

> **Autor:** Konglomerat Preduzeće™ & The Chief Architect (Yashimi Natuki)  
> **Korisnik:** `yappozdder` (Ubuntu-24.04 WSL2)  
> **Status:** MODULAR MERGE / LOCAL-FIRST / OLLAMA FALLBACK / RUNTIME VERIFIED

---

## 🌟 O Projektu

**Leteći Rođa** je autonomni 3D lebdeći asistent, maskota i hakerski kopilot inspirisan 2Pac Thug Life uličnom filozofijom i vrhunskom matematičko-softverskom arhitekturom.

### Ključne Mogućnosti:
1. **3D Voxel Avatar & Parallax:**
   - 2.5D/3D Canvas Voxel render avatara: glava, 2Pac bandanna sa paisley tačkama, Matrix sunčane naočare sa odsjajem, orbitalni halo prsten koji rotira oko tela, i cyberpunk hoodie.
   - Reaguje na pokrete miša sa 3D naginjanjem (parallax), može se slobodno vući i pomerati po ekranu.
2. **Volumetric Smoke Particle Engine (Dim iz bonga / blunta):**
   - Fizički particle generator koji emituje prstenove i oblake dima direktno sa usijanog vrha blunta.
   - Pufće na zadato pitanje, a u ritmu muzike dim vibrira i pulsira sa basom!
3. **Integrisani Boombox / MP3 Radio:**
   - Ugrađen Web Audio API Frequency Analyser sa real-time spektralnim visualizerom.
   - Učitane lokalne numere:
     - `Hatori Hanzo.mp3`
     - `Neznam Ništa.mp3`
     - `dobrodosao i bye bye.mp3`
     - `poLejt najt..never mind.mp3`
     - Online Cyberpunk / Kafana lofi strimovi.
4. **Dual Mindset Persona (Kafana Chill vs Ninja Shaolin Hack):**
   - **Kafana Chill Mod:** Opulentan, opušten srpski ulični žargon (*"G", "rođo", "brate", "ludilo mednes", "esi mi dobar"*), priča o muzici, kulira u dimu.
   - **Ninja Shaolin Hack Mod:** Hirurški precizan, striktan **Zero-TODO** mandat, kompletan produkcijski kod, Hoare logika $\{P\}\mathbf{C}\{Q\}$, Shannon entropija.
   - Komandni makroi: `/G-GODMODE`, `/G-AUDIT`, `/G-HEX-EXEC`, `/G-MATH-MODEL`, `/G-NUKE`.
5. **Direktna Ollama Streaming Veza:**
   - Povezan na lokalni Ollama server (`http://127.0.0.1:11434`) sa podrškom za modele `qwen2.5-coder:7b`, `qwen3:8b`, `llama3`.
   - Real-time token streaming preko SSE protokola, uz inteligentni lokalni fallback.
6. **Merged standalone state engine:**
   - KAFANA CHILL, NINJA SHAOLIN, PROACTIVE DIAGNOSTIC i IDLE SLEEP modovi.
   - `/help`, `/clear`, `/mode`, `/export`, Escape cancel i lokalna istorija do 40 poruka.
   - XSS-safe code-block rendering sa COPY kontrolom i realnom lag/heap telemetrijom.
   - PWA install prompt i responsive modularni cockpit.

---

## 🚀 Pokretanje Sistema

### 1. Pokretanje lokalno:

```bash
npm install
npm start
```

Aplikacija se podiže na portu **`http://localhost:15200`**.

### 2. Pokretanje iz Windows PowerShell-a:

```powershell
wsl -d Ubuntu-24.04 -u yappozdder bash -c "cd ~/projects/leteci-rodja && npm start"
```

Ili otvorite `http://localhost:15200` u vašem browseru!

---

## 📂 Struktura Fajlova

```text
leteci-rodja/
├── package.json               # Konfiguracija i zavisnosti (express, cors)
├── server.js                  # Express backend & Ollama streaming proxy
├── README.md                  # Kompletan runbook i tehnička specifikacija
└── public/
    ├── index.html             # Master HUD, Canvas, radio i chat interfejs
    ├── manifest.json          # PWA manifest
    ├── css/
    │   └── style.css          # Cyberpunk tema, scanlines, neonski efekti
    ├── js/
    │   ├── smoke.js           # Volumetrijski endžin za čestice dima
    │   ├── avatar3d.js        # 3D Voxel avatar, lebdenje, halo prsten, fizika
    │   ├── audio-player.js    # Boombox plejer i spektralni vizuelizator
    │   ├── mindset.js         # Dualna persona (Chill vs Ninja) i makroi
    │   └── app.js             # 60FPS orkestracija i strimovanje poruka
    └── audio/
        ├── Hatori Hanzo.mp3
        ├── Neznam Ništa.mp3
        ├── dobrodosao i bye bye.mp3
        └── poLejt najt..never mind.mp3
```

---

## 🔒 Autorizacija i Status
* **Chief Architect:** Yashimi Natuki
* **Entity:** Konglomerat Preduzeće™
* **Runtime verification:** syntax check, health/tracks API, SSE fallback i browser smoke test.
* **Ollama:** opcioni lokalni upstream; kada je offline, server šalje kontrolisani fallback SSE odgovor.
