/*
 * Copyright © 2025 Abdellah Boubker
 * All rights reserved.
 */

class LetterAnimation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.container.style.height = '300px';
    this.container.style.display = 'block';
    this.container.style.overflow = 'hidden';
    this.container.style.margin = '0';
    this.container.style.padding = '0';
    this.container.style.backgroundColor = 'transparent';
    this.container.style.borderRadius = '16px';
    this.container.style.border = 'none';

    this.config = {
      colors: { letterColor: 0x60a5fa, letterGlow: 0x93c5fd },
      letterSize: 0.9,
      scrollSpeed: 0.2
    };

    this.objects = {};
    this.clock = new THREE.Clock();
    this.mouse = { x: 0, y: 0 };
    this.scrollY = 0;

    this.init();
  }

  init() {
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initLights();
    this.createLetter();
    this.setupEventListeners();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = null;
  }

  initCamera() {
    const { width, height } = this.container.getBoundingClientRect();
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.z = 5;
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const canvas = this.renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.backgroundColor = 'transparent';
    this.container.appendChild(this.renderer.domElement);
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    this.scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(0, 1, 5);
    this.scene.add(mainLight);

    const frontLight = new THREE.PointLight(this.config.colors.letterGlow, 3, 10);
    frontLight.position.set(2, 1, 3);
    this.scene.add(frontLight);
    this.objects.frontLight = frontLight;

    const backLight = new THREE.PointLight(this.config.colors.letterGlow, 2, 10);
    backLight.position.set(-2, -1, 2);
    this.scene.add(backLight);
    this.objects.backLight = backLight;
  }

  createLetter() {
    const loader = new THREE.FontLoader();
    loader.load('https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_bold.typeface.json', (font) => {
      const textGeometry = new THREE.TextGeometry('AB', {
        font,
        size: this.config.letterSize,
        height: this.config.letterSize * 0.28,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.03,
        bevelSegments: 5
      });

      textGeometry.computeBoundingBox();
      const center = new THREE.Vector3();
      textGeometry.boundingBox.getCenter(center).multiplyScalar(-1);
      textGeometry.translate(center.x, center.y, center.z);

      const material = new THREE.MeshPhongMaterial({
        color: this.config.colors.letterColor,
        emissive: this.config.colors.letterGlow,
        emissiveIntensity: 0.28,
        specular: 0xffffff,
        shininess: 110
      });

      const mesh = new THREE.Mesh(textGeometry, material);
      this.scene.add(mesh);
      this.objects.letter = mesh;

      const edges = new THREE.EdgesGeometry(textGeometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: this.config.colors.letterGlow, transparent: true, opacity: 0.55 });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      this.scene.add(wireframe);
      this.objects.wireframe = wireframe;
    });
  }

  setupEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this));
    this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.container.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  onResize() {
    const { width, height } = this.container.getBoundingClientRect();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }
  onTouchMove(e) {
    if (!e.touches.length) return;
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.touches[0].clientY - rect.top) / rect.height) * 2 + 1;
  }
  onScroll() {}

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    const delta = this.clock.getDelta();
    const t = this.clock.getElapsedTime();

    if (this.objects.letter) {
      const rx = this.mouse.y * 0.5;
      const ry = this.mouse.x * 0.5;
      this.objects.letter.rotation.x += (rx - this.objects.letter.rotation.x) * 2 * delta;
      this.objects.letter.rotation.y += (ry - this.objects.letter.rotation.y) * 2 * delta;

      this.objects.letter.position.y = Math.sin(t * 0.5) * 0.05;
      if (this.objects.wireframe) {
        this.objects.wireframe.rotation.copy(this.objects.letter.rotation);
        this.objects.wireframe.position.copy(this.objects.letter.position);
      }
    }

    if (this.objects.frontLight) {
      this.objects.frontLight.position.x = Math.sin(t * 0.3) * 1.5;
      this.objects.frontLight.position.y = Math.cos(t * 0.5) * 0.6 + 0.3;
    }
    if (this.objects.backLight) {
      this.objects.backLight.position.x = -Math.cos(t * 0.4) * 1.5;
      this.objects.backLight.position.y = -Math.sin(t * 0.6) * 0.6 - 0.3;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('avatar-3d-container');
  if (container) new LetterAnimation('avatar-3d-container');
});
