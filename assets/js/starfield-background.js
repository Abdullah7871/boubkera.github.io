/*
 * Copyright © 2025 Abdellah Boubker
 * All rights reserved.
 * Starfield — thème Deep Space (navy + reflets indigo/cyan)
 */

class SiteStarfield {
  constructor() {
    this.config = {
      colors: {
        background: 0x080b14,   // navy profond — aligné avec --color-bg
        stars: 0xffffff
      },
      starCount: 220,
      scrollSpeed: 0.2
    };

    this.objects = {};
    this.clock = new THREE.Clock();
    this.scrollY = 0;
    this.lastScrollY = 0;

    this.init();
  }

  init() {
    this.createScene();
    this.createStarfield();
    this.setupEventListeners();
    this.animate();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.colors.background);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 20;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(this.config.colors.background, 1);

    const canvas = this.renderer.domElement;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';

    document.body.appendChild(this.renderer.domElement);
  }

  createStarfield() {
    const starCount = this.config.starCount;
    // 3 couches : proches (blanches), moyennes (bleutées), lointaines (indigo pâle)
    this.createStarLayer(starCount * 0.6, 100, 0.08, 0.03, 0xffffff, 0.85); // Étoiles proches
    this.createStarLayer(starCount * 0.3, 200, 0.05, 0.01, 0xc7d6ff, 0.6);  // Mi-distance — bleuté
    this.createStarLayer(starCount * 0.1, 300, 0.03, 0.005, 0xa5b4fc, 0.45); // Lointaines — indigo pâle
  }

  createStarLayer(count, distance, maxSize, minSize, color, opacity) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const spread = {
      x: window.innerWidth / window.innerHeight * distance * 0.6,
      y: distance * 0.6,
      z: distance * 0.3
    };

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3]     = (Math.random() - 0.5) * spread.x;
      positions[i3 + 1] = (Math.random() - 0.5) * spread.y;
      positions[i3 + 2] = (Math.random() - 0.5) * spread.z - distance * 0.5;
      sizes[i] = Math.random() * (maxSize - minSize) + minSize;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starTexture = new THREE.TextureLoader().load('https://cdn.jsdelivr.net/gh/mrdoob/three.js/examples/textures/sprites/spark1.png');

    const material = new THREE.PointsMaterial({
      size: 1,
      map: starTexture,
      transparent: true,
      opacity: opacity,
      color: color,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const stars = new THREE.Points(geometry, material);
    this.scene.add(stars);

    if (!this.objects.starLayers) this.objects.starLayers = [];
    this.objects.starLayers.push(stars);
  }

  setupEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('scroll', this.onScroll.bind(this));
    this.setupScrollTracking();
  }

  setupScrollTracking() {
    let lastScrollPosition = window.scrollY;
    const checkScroll = () => {
      if (window.scrollY !== lastScrollPosition) {
        lastScrollPosition = window.scrollY;
        window.dispatchEvent(new CustomEvent('scroll'));
      }
      requestAnimationFrame(checkScroll);
    };
    checkScroll();
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onScroll() {
    this.lastScrollY = this.scrollY;
    this.scrollY = window.scrollY * this.config.scrollSpeed * -0.1;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();

    const currentScrollY = window.scrollY * this.config.scrollSpeed * -0.1;
    const scrollDelta = currentScrollY - this.scrollY;
    this.scrollY = currentScrollY;

    if (this.objects.starLayers) {
      this.objects.starLayers.forEach((layer, index) => {
        const speedFactor = 1 - (index * 0.3);

        layer.rotation.y += delta * 0.02 * speedFactor;

        const positions = layer.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += scrollDelta * 5 * speedFactor;
          positions[i] += scrollDelta * speedFactor * 0.2 * (Math.random() - 0.5);

          const wrapDistance = index === 0 ? 60 : (index === 1 ? 120 : 180);
          if (positions[i + 1] > wrapDistance) positions[i + 1] = -wrapDistance;
          if (positions[i + 1] < -wrapDistance) positions[i + 1] = wrapDistance;
        }
        layer.geometry.attributes.position.needsUpdate = true;
      });
    }

    this.renderer.render(this.scene, this.camera);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  new SiteStarfield();
});
