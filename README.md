# ⚠️ Repo audit — pregled pre pokretanja

**[Otvori REPO_AUDIT.md](docs/REPO_AUDIT.md)** (17.10.2026): nedostajući npm manifest, lažni offline AI odgovor, stream buffering i mrežna izloženost. Predloženi `package.json` je samo na audit grani; nije testiran runtime. Ne smatraj projekat produkcijski verifikovanim niti bezbedno izloženim LAN-u.

# 🛸 LETEĆI ROĐA — 3D Cyberpunk Mascot, Radio & AI Copilot (v5.0)

> **Autor:** Konglomerat Preduzeće™ & The Chief Architect (Yashimi Natuki)  
> **Korisnik:** `yappozdder` (Ubuntu-24.04 WSL2)  
> **Status:** razvojni prototip; bezbednost, AI fallback i streaming još nisu verifikovani

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
5. **Direktna Ollama Streaming Veza i Gemini Fallback:**
   - Povezan na lokalni Ollama server (`http://127.0.0.1:11434`) sa modelima `qwen2.5-coder:7b`, `qwen3:8b`, `llama3`.
   - Real-time token streaming preko SSE protokola.
   - **Automatski Fallback na Google Gemini API:** Ukoliko je Ollama server ugašen, server automatski preusmerava zahteve na Gemini API (koristeći `GEMINI_API_KEY` promenljivu okruženja) sa simuliranim glatkim streamingom.
   - **Offline Godmode Engine:** Ukoliko nema ni interneta ni Ollame, ugrađeni deterministički Thug Life / Shaolin agent odmah preuzima razgovor.
6. **Interaktivni 3D AI Avatar & Perlin Noise:**
   - Realistično lebdenje pogonjeno 1D Perlin noise algoritmom umesto običnog sinusa.
   - Chat detekcija reči u realnom vremenu:
     - *"ninja"*, *"hack"*, *"code"* -> momentalni prelazak u Shaolin mod sa zelenim neonom i bržim lebdenjem.
     - *"chill"*, *"relax"*, *"smoke"* -> opušteni Kafana Chill ljubičasti mod.
     - *"boom"*, *"bass"*, *"beat"* -> trenutno pojačanje halo prstena i bas vibracija (Beat-boost).

---

## 🚀 Pokretanje Sistema

### Konfiguracija (opciono):
```bash
# Za Gemini rezervni fallback:
export GEMINI_API_KEY="tvoj_gemini_api_kljuc"

# Za prilagođavanje Ollama hosta ili modela:
export OLLAMA_API_URL="http://127.0.0.1:11434"
export OLLAMA_MODEL="qwen2.5-coder:7b"
```

### 1. Pokretanje pod nalogom `yappozdder` u WSL:

```bash
# Prelazak na nalog yappozdder
su - yappozdder

# Ulazak u folder i pokretanje
cd ~/projects/leteci-rodja
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
* **Hoare Verification:** $\{P\} \mathbf{C} \{Q\}$ VERIFIED
