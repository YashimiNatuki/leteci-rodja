/**
 * ==============================================================================
 * 🛸 COMPANION 3D STAGE — HIGH-END CINEMATIC WEBGL RUNTIME (v5.0-GODMODE)
 * Konglomerat Preduzeće™ & The Chief Architect (Yashimi Natuki)
 * - Mixamo Rigged SkinnedMesh GLBs (AiGad & ChatBrat)
 * - Articulated Three.js Procedural 3D Rigs with Talking Skull Jaw
 * - Noir Cinematic Illustration Mode & Fallbacks
 * - Parallax Cursor Tilt & Speech Synchronization
 * ==============================================================================
 */

import * as T from './vendor/three.module.js';
import { createAvatarRig, poseAvatarRig, disposeAvatarRig, RIG_IDS, RIG_STATES } from './avatar-rig.mjs';
import { CHARACTER_ASSETS, pickCinematicMode, nextCinematicPreference, cinematicBudget } from './cinematic-policy.mjs';

export class Companion3DStage {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.options = options;

    // Visual state
    this.agent = options.agent || 'aigad';
    this.state = options.state || 'idle';
    this.requestedMode = options.mode || 'auto';
    this.currentMode = '3d';
    this.assetStatus = 'not-loaded';

    // Parallax Tilt & Physics
    this.tiltX = 0;
    this.tiltY = 0;
    this.targetTiltX = 0;
    this.targetTiltY = 0;

    // Three.js Core
    this.renderer = null;
    this.world = null;
    this.camera = null;
    this.host = null;
    this.rig = null;
    this.lights = {};

    // Animation & Lifecycle
    this.clock = 0;
    this.raf = 0;
    this.lastTime = 0;
    this.disposed = false;
    this.stopped = false;

    // Cache & Loaders
    this.cache = new Map();
    this.loading = new Map();
    this.failed = new Set();
    this.loaderPromise = null;
    this.renderSupported = false;

    // DOM Elements for 2D Portrait Fallback
    this.portraitContainer = document.createElement('div');
    this.portraitContainer.className = 'companion-portrait-layer';
    this.portraitContainer.style.cssText = 'position:absolute;inset:0;display:none;align-items:center;justify-content:center;pointer-events:none;z-index:2;';
    
    this.portraitImg = document.createElement('img');
    this.portraitImg.alt = 'Noir Character';
    this.portraitImg.style.cssText = 'width:90%;height:90%;object-fit:contain;filter:drop-shadow(0 0 25px rgba(168,85,247,0.45));transition:transform 0.15s ease-out;';
    this.portraitContainer.appendChild(this.portraitImg);
    this.container.appendChild(this.portraitContainer);

    this.init();
  }

  init() {
    try {
      // 1. Create WebGL Host Container
      this.host = document.createElement('div');
      this.host.className = 'companion-webgl-host';
      this.host.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden;z-index:1;';
      this.container.appendChild(this.host);

      // 2. WebGL Renderer with High-Fidelity Settings
      this.renderer = new T.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderSupported = true;
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.outputColorSpace = T.SRGBColorSpace;
      this.renderer.toneMapping = T.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.25;
      this.host.appendChild(this.renderer.domElement);

      // 3. Scene & Camera
      this.world = new T.Scene();
      this.camera = new T.PerspectiveCamera(32, 1, 0.1, 100);
      this.camera.position.set(0, 1.22, 4.4);
      this.camera.lookAt(0, 1.05, 0);

      // 4. Lighting Matrix (Hemisphere + Key + Rim + Cyber Fill)
      this.lights.hemi = new T.HemisphereLight('#d0defc', '#271629', 1.9);
      this.world.add(this.lights.hemi);

      this.lights.key = new T.DirectionalLight('#faf0df', 2.8);
      this.lights.key.position.set(-2.5, 4.5, 4.5);
      this.world.add(this.lights.key);

      this.lights.rim = new T.DirectionalLight('#a855f7', 3.2); // Neon purple rim
      this.lights.rim.position.set(2.4, 3.0, -2.6);
      this.world.add(this.lights.rim);

      this.lights.fill = new T.DirectionalLight('#06b6d4', 1.4); // Cyber cyan fill
      this.lights.fill.position.set(3.2, 1.2, 2.2);
      this.world.add(this.lights.fill);

      // 5. Initial Procedural Rig
      this.setRig(this.createProceduralRig(this.agent));

      // 6. Resize Observer
      this.resizer = new ResizeObserver(() => this.resize());
      this.resizer.observe(this.container);

      // 7. Refresh View
      this.refresh();
    } catch (err) {
      console.warn('[COMPANION_3D] WebGL unavailable, activating fallback:', err);
      this.renderSupported = false;
      if (this.host) this.host.style.display = 'none';
    }
  }

  createProceduralRig(agent) {
    const data = createAvatarRig(agent);
    return { root: data.root, data, type: 'procedural', agent };
  }

  sculptGlbRig(gltf, agent) {
    const root = new T.Group();
    root.name = 'cinematic-' + agent;
    root.userData = { id: agent, kind: 'rigged-glb' };
    root.add(gltf.scene);

    const bones = {};
    gltf.scene.traverse(node => {
      if (node.isBone) {
        const name = ['Head', 'Spine2', 'LeftArm', 'RightArm', 'Jaw'].find(key => String(node.name).endsWith(key));
        if (name) {
          bones[name] = { node, x: node.rotation.x, y: node.rotation.y, z: node.rotation.z };
        }
      }
    });

    return { root, agent, type: 'gltf', bones, gltf };
  }

  setRig(nextRig) {
    this.detachRig();
    this.rig = nextRig;
    this.world.add(this.rig.root);
    this.rig.root.userData = { ...this.rig.root.userData, id: this.rig.agent };
  }

  detachRig() {
    if (!this.rig) return;
    this.world?.remove(this.rig.root);
    if (this.rig.type === 'procedural') {
      disposeAvatarRig(this.rig.data);
    }
    this.rig = null;
  }

  async obtainGlbRig(agent) {
    if (this.cache.has(agent)) return this.cache.get(agent);
    if (this.loading.has(agent)) return this.loading.get(agent);

    const uri = CHARACTER_ASSETS[agent]?.mesh;
    if (!uri) throw new Error('GLB source not defined for agent: ' + agent);

    const task = (async () => {
      const { GLTFLoader } = await (this.loaderPromise ||= import('./vendor/GLTFLoader.js'));
      const loader = new GLTFLoader();
      const loaded = await loader.loadAsync(uri);
      if (!loaded.scene) throw new Error('GLB is missing a scene');

      let skinned = 0, head = 0;
      loaded.scene.traverse(o => {
        if (o.isSkinnedMesh) skinned++;
        if (String(o.name).endsWith('Head')) head++;
      });

      const data = this.sculptGlbRig(loaded, agent);
      this.cache.set(agent, data);
      return data;
    })();

    this.loading.set(agent, task);
    try {
      return await task;
    } finally {
      this.loading.delete(agent);
    }
  }

  async ensureMesh(agent) {
    if (!this.renderer || !CHARACTER_ASSETS[agent]?.mesh) return;
    if (this.rig?.agent === agent && this.rig.type === 'gltf') return;
    if (this.loading.has(agent)) return;

    if (this.rig?.agent !== agent) {
      this.setRig(this.createProceduralRig(agent));
    }

    this.assetStatus = 'loading';
    try {
      const loaded = await this.obtainGlbRig(agent);
      if (this.disposed || this.agent !== agent || this.currentMode !== 'mesh') return;
      this.setRig(loaded);
      this.assetStatus = 'loaded';
      this.schedule();
      this.redraw();
    } catch (err) {
      this.failed.add(agent);
      if (this.agent === agent) {
        this.assetStatus = 'error';
        this.currentMode = 'procedural';
        this.setRig(this.createProceduralRig(agent));
        this.schedule();
      }
      console.warn('[COMPANION_3D] GLB unavailable, using procedural rig:', err.message);
    }
  }

  setAgent(agentId) {
    if (!RIG_IDS.includes(agentId)) return false;
    if (this.agent === agentId) return true;
    this.agent = agentId;
    this.refresh();
    return true;
  }

  setState(state) {
    if (!RIG_STATES.includes(state)) return false;
    this.state = state;
    this.schedule();
    return true;
  }

  setParallaxTilt(tiltX, tiltY) {
    this.targetTiltX = Math.max(-0.4, Math.min(0.4, tiltX));
    this.targetTiltY = Math.max(-0.4, Math.min(0.4, tiltY));
  }

  poseMesh(mesh, state, time) {
    const idle = Math.sin(time * 1.3);
    const isSpeaking = state === 'speaking';
    const isThinking = state === 'thinking';
    const amplitude = isSpeaking ? 0.14 : isThinking ? 0.05 : state === 'success' ? 0.09 : 0;

    // Levitation with smooth damping
    mesh.root.position.y = (state === 'error' ? -0.06 : 0) + idle * 0.024;
    mesh.root.rotation.y = Math.sin(time * 0.4) * 0.12 + this.tiltY * 0.6;
    mesh.root.rotation.x = this.tiltX * 0.5;

    const head = mesh.bones.Head;
    if (head) {
      head.node.rotation.y = head.y + Math.sin(time * 0.8) * 0.06 + this.tiltY * 0.4;
      head.node.rotation.x = head.x + (isThinking ? 0.14 : state === 'listening' ? -0.08 : isSpeaking ? Math.sin(time * 12) * 0.05 : 0) + this.tiltX * 0.3;
    }

    const jaw = mesh.bones.Jaw;
    if (jaw) {
      jaw.node.rotation.x = jaw.x + (isSpeaking ? Math.max(0, Math.sin(time * 14)) * 0.28 : 0);
    }

    const chest = mesh.bones.Spine2;
    if (chest) {
      chest.node.rotation.y = chest.y + Math.sin(time * 0.95) * 0.03;
    }

    for (const name of ['LeftArm', 'RightArm']) {
      const arm = mesh.bones[name];
      if (!arm) continue;
      const sign = name === 'LeftArm' ? -1 : 1;
      arm.node.rotation.z = arm.z + sign * amplitude * (0.6 + 0.4 * Math.sin(time * 2.3));
    }
  }

  redraw() {
    if (this.disposed || !this.renderer || !this.rig) return;

    // Smooth LERP parallax tilt
    this.tiltX += (this.targetTiltX - this.tiltX) * 0.08;
    this.tiltY += (this.targetTiltY - this.tiltY) * 0.08;

    if (this.rig.type === 'gltf') {
      this.poseMesh(this.rig, this.state, this.clock);
    } else {
      poseAvatarRig(this.rig.data, this.state, this.clock);
      // Inject parallax into procedural rig
      this.rig.root.rotation.y += this.tiltY * 0.5;
      this.rig.root.rotation.x = this.tiltX * 0.4;
    }

    this.renderer.render(this.world, this.camera);
  }

  resize() {
    if (this.disposed || !this.renderer || !this.host) return;
    const b = this.host.getBoundingClientRect();
    const w = Math.max(1, Math.floor(b.width));
    const h = Math.max(1, Math.floor(b.height));

    const budget = cinematicBudget({ width: window.innerWidth });
    const cap = Math.min(budget.dpr, Math.sqrt(budget.maxPixels / (w * h)));
    this.renderer.setPixelRatio(Math.max(0.85, cap));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.redraw();
  }

  frame(now) {
    this.raf = 0;
    if (!this.renderer || this.disposed || document.hidden || this.stopped) return;

    if (!this.lastTime) this.lastTime = now;
    const elapsed = now - this.lastTime;

    if (elapsed >= 1000 / 30) {
      const dt = Math.min(0.06, Math.max(0, elapsed / 1000));
      this.lastTime = now;
      this.clock += dt;
      this.redraw();
    }
    this.raf = requestAnimationFrame(t => this.frame(t));
  }

  schedule() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.lastTime = 0;
    if (this.disposed) return;
    if (this.renderer && !this.stopped && !document.hidden) {
      this.raf = requestAnimationFrame(t => this.frame(t));
    } else {
      this.redraw();
    }
  }

  refresh() {
    if (this.disposed) return;

    const agent = this.agent;
    const asset = CHARACTER_ASSETS[agent];

    if (this.requestedMode === 'portrait' || (!asset?.mesh && asset?.portrait)) {
      this.currentMode = 'portrait';
      if (this.host) this.host.style.display = 'none';
      this.portraitContainer.style.display = 'flex';
      this.portraitImg.src = asset.portrait;
    } else {
      this.portraitContainer.style.display = 'none';
      if (this.host) this.host.style.display = 'block';

      if (asset?.mesh && this.renderSupported && !this.failed.has(agent)) {
        this.currentMode = 'mesh';
        void this.ensureMesh(agent);
      } else {
        this.currentMode = 'procedural';
        this.setRig(this.createProceduralRig(agent));
      }
    }

    this.resize();
    this.schedule();
  }

  getStatus() {
    return {
      agent: this.agent,
      state: this.state,
      mode: this.currentMode,
      active: Boolean(this.renderer),
      meshReady: this.rig?.type === 'gltf' && this.rig?.agent === this.agent,
      assetStatus: this.assetStatus
    };
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.resizer?.disconnect();
    this.detachRig();

    for (const item of this.cache.values()) {
      item.gltf?.scene?.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
          else o.material.dispose();
        }
      });
    }
    this.cache.clear();

    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.host?.remove();
    this.portraitContainer?.remove();
    this.renderer = null;
  }
}

window.Companion3DStage = Companion3DStage;
