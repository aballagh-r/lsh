import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Renders the "dune + beacons" network map used in the hero. Encapsulated as
// a plain class (not a React component) so it can be mounted/unmounted
// cleanly from a useEffect without fighting React's render cycle.
export default class NetworkScene {
  constructor(mountEl) {
    this.mount = mountEl;
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.markers = [
      { label: 'WEBLSH HQ', x: 0, z: 0, hub: true },
      { label: 'WEB', x: -11, z: -5 },
      { label: 'SOCIAL', x: -6, z: 9 },
      { label: 'NETWORK', x: 9, z: -9 },
      { label: 'INSTALL', x: 11, z: 6 },
      { label: 'ADMIN', x: 2, z: -12 },
    ];
    this.arcs = [];
    this.rafId = null;
    this._onResize = this.resize.bind(this);
  }

  heightAt(x, z) {
    return 1.1 * Math.sin(x * 0.22) + 0.9 * Math.cos(z * 0.19) +
      0.6 * Math.sin((x + z) * 0.13) + 0.35 * Math.cos((x - z) * 0.27);
  }

  start() {
    try {
      this._build();
      this._animate();
      window.addEventListener('resize', this._onResize);
    } catch (err) {
      // Fails gracefully: the CSS gradient background behind the canvas
      // still looks intentional if WebGL is unavailable.
      console.warn('WebGL scene unavailable, falling back to static background.', err);
    }
  }

  _build() {
    const mount = this.mount;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03100b, 0.035);
    this.scene = scene;

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(2, 9, 17);
    this.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    this.renderer = renderer;

    scene.add(new THREE.HemisphereLight(0x2d5a41, 0x03100b, 1.1));
    const sun = new THREE.DirectionalLight(0xbfe8cf, 0.9);
    sun.position.set(-8, 12, 6);
    scene.add(sun);

    const size = 46, seg = 90;
    const terrainGeo = new THREE.PlaneGeometry(size, size, seg, seg);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i), y = posAttr.getY(i);
      posAttr.setZ(i, this.heightAt(x, y));
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({ color: 0x0b3d2e, flatShading: true, roughness: 0.95, metalness: 0.05 });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    const gridMat = new THREE.MeshBasicMaterial({ color: 0x34d178, wireframe: true, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending });
    const grid = new THREE.Mesh(terrainGeo, gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = 0.02;
    scene.add(grid);

    const starCount = 500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 30 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * 0.5 * Math.PI;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 5;
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x9fd6b6, size: 0.09, transparent: true, opacity: 0.6 }));
    scene.add(stars);

    const beaconGroup = new THREE.Group();
    scene.add(beaconGroup);

    this.markers.forEach((m) => {
      const h = this.heightAt(m.x, m.z);
      m.basePos = new THREE.Vector3(m.x, h, m.z);
      const color = m.hub ? 0x9df2c0 : 0x34d178;
      const beamH = m.hub ? 3.4 : 2.3;

      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(m.hub ? 0.06 : 0.035, m.hub ? 0.06 : 0.035, beamH, 8),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending })
      );
      beam.position.set(m.x, h + beamH / 2, m.z);
      beaconGroup.add(beam);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(m.hub ? 0.22 : 0.14, 12, 12),
        new THREE.MeshBasicMaterial({ color, blending: THREE.AdditiveBlending })
      );
      glow.position.set(m.x, h + beamH, m.z);
      beaconGroup.add(glow);
      m.topPos = glow.position;

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(m.hub ? 0.5 : 0.32, m.hub ? 0.62 : 0.4, 24),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(m.x, h + 0.03, m.z);
      beaconGroup.add(ring);

      const label = document.createElement('div');
      label.className = 'marker-label' + (m.hub ? ' hub' : '');
      label.textContent = m.label;
      mount.appendChild(label);
      m.labelEl = label;
    });
    this.beaconGroup = beaconGroup;

    const hub = this.markers.find((m) => m.hub);
    this.markers.filter((m) => !m.hub).forEach((m) => {
      const mid = m.topPos.clone().add(hub.topPos).multiplyScalar(0.5);
      mid.y += 2.6;
      const curve = new THREE.QuadraticBezierCurve3(hub.topPos, mid, m.topPos);
      const pts = curve.getPoints(40);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x34d178, transparent: true, opacity: 0.25 }));
      scene.add(line);

      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xe9fff2, blending: THREE.AdditiveBlending })
      );
      scene.add(pulse);
      this.arcs.push({ curve, pulse, offset: Math.random() });
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = 0.55;
    controls.maxPolarAngle = 1.35;
    controls.autoRotate = !this.reduceMotion;
    controls.autoRotateSpeed = 0.5;
    this.controls = controls;

    this.clock = new THREE.Clock();
    this._vec = new THREE.Vector3();
  }

  resize() {
    if (!this.renderer || !this.camera) return;
    const w = this.mount.clientWidth, h = this.mount.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  _updateLabels() {
    const w = this.mount.clientWidth, h = this.mount.clientHeight;
    this.markers.forEach((m) => {
      this._vec.copy(m.topPos).project(this.camera);
      const x = (this._vec.x * 0.5 + 0.5) * w;
      const y = (-this._vec.y * 0.5 + 0.5) * h;
      m.labelEl.style.left = x + 'px';
      m.labelEl.style.top = y + 'px';
      m.labelEl.style.opacity = this._vec.z < 1 ? '1' : '0';
    });
  }

  _animate() {
    const t = this.clock.getElapsedTime();
    this.arcs.forEach((a) => {
      const p = (t * 0.18 + a.offset) % 1;
      a.pulse.position.copy(a.curve.getPointAt(p));
    });
    this.beaconGroup.children.forEach((c, i) => {
      if (c.geometry && c.geometry.type === 'SphereGeometry') {
        const s = 1 + Math.sin(t * 2 + i) * 0.15;
        c.scale.setScalar(s);
      }
    });
    this.controls.update();
    this._updateLabels();
    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(() => this._animate());
  }

  dispose() {
    window.removeEventListener('resize', this._onResize);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.controls?.dispose();
    this.markers.forEach((m) => m.labelEl?.remove());
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement?.remove();
    }
    this.scene?.traverse((obj) => {
      obj.geometry?.dispose?.();
      if (Array.isArray(obj.material)) obj.material.forEach((mat) => mat.dispose?.());
      else obj.material?.dispose?.();
    });
  }
}
