/**
 * 3D Model View — Interactive 3D Laptop Showcase
 * Pure Three.js built from geometric primitives (zero external .gltf/.obj files)
 * Lazy loaded on first "3D View" click via dynamic import() and native importmap.
 *
 * NOTE: Textures only load when the site is served over http(s) (GitHub Pages
 * or a local server such as Live Server). Opening index.html directly from the
 * file system (file://) will block them due to browser CORS security restrictions.
 */

// Global state for lazy initialization and reuse
let threeLoaded = false;
let threeModules = null;
let threeApp = null;
let currentTexture = null;
let lastFocusedTrigger = null;
let resumeAutoRotateTimeout = null;
let isModalOpen = false;

// Check if WebGL is supported
function isWebGLSupported() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

// Generate circular radial-gradient contact shadow texture using 2D canvas
function createContactShadowTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0.0, 'rgba(0, 0, 0, 0.75)');
    gradient.addColorStop(0.35, 'rgba(0, 0, 0, 0.45)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return canvas;
}

// Initialize Three.js scene, camera, renderer, laptop model, and controls
async function initThreeApp(container) {
    const { THREE, OrbitControls, RoomEnvironment } = threeModules;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.3, 5.2);

    // 2. Renderer
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const maxPr = isTouch ? 1.5 : 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPr));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Environment & Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv).texture;

    // Soft teal directional light from back left
    const dirLightTeal = new THREE.DirectionalLight(0x14b8a6, 1.4);
    dirLightTeal.position.set(-5, 6, -4);
    scene.add(dirLightTeal);

    // Neutral front-right fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.85);
    fillLight.position.set(5, 5, 5);
    scene.add(fillLight);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 4. Laptop Model
    const laptopGroup = new THREE.Group();

    // Dark aluminium material
    const aluminiumMaterial = new THREE.MeshStandardMaterial({
        color: 0x2b2f36,
        metalness: 0.85,
        roughness: 0.35
    });

    // Laptop Base: 3.2 x 0.12 x 2.2
    const baseGeo = new THREE.BoxGeometry(3.2, 0.12, 2.2);
    const baseMesh = new THREE.Mesh(baseGeo, aluminiumMaterial);
    baseMesh.position.set(0, 0.06, 0);
    laptopGroup.add(baseMesh);

    // Keyboard well / plane
    const kbGeo = new THREE.PlaneGeometry(2.7, 1.25);
    const kbMat = new THREE.MeshStandardMaterial({
        color: 0x16181c,
        metalness: 0.2,
        roughness: 0.8
    });
    const kbMesh = new THREE.Mesh(kbGeo, kbMat);
    kbMesh.rotation.x = -Math.PI / 2;
    kbMesh.position.set(0, 0.122, -0.3);
    laptopGroup.add(kbMesh);

    // Trackpad
    const trackpadGeo = new THREE.PlaneGeometry(1.0, 0.68);
    const trackpadMat = new THREE.MeshStandardMaterial({
        color: 0x22252a,
        metalness: 0.6,
        roughness: 0.45
    });
    const trackpadMesh = new THREE.Mesh(trackpadGeo, trackpadMat);
    trackpadMesh.rotation.x = -Math.PI / 2;
    trackpadMesh.position.set(0, 0.122, 0.62);
    laptopGroup.add(trackpadMesh);

    // Lid Hinge / Pivot Group at back edge of base
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.12, -1.1);

    // Rotate open at approx 105 degrees (~1.8326 rad)
    lidGroup.rotation.x = -1.8326;

    // Lid Shell: 3.2 x 0.08 x 2.1
    const lidGeo = new THREE.BoxGeometry(3.2, 0.08, 2.1);
    const lidMesh = new THREE.Mesh(lidGeo, aluminiumMaterial);
    lidMesh.position.set(0, 0.04, 1.05);
    lidGroup.add(lidMesh);

    // Screen Plane: 2.9 x 1.8 on inner face of lid
    const screenGeo = new THREE.PlaneGeometry(2.9, 1.8);
    const screenMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const screenMesh = new THREE.Mesh(screenGeo, screenMaterial);
    screenMesh.position.set(0, -0.002, 1.05);
    screenMesh.rotation.x = Math.PI / 2;
    screenMesh.rotation.z = Math.PI; // Correct right-side up orientation
    lidGroup.add(screenMesh);

    laptopGroup.add(lidGroup);

    // 5. Contact Shadow
    const shadowCanvas = createContactShadowTexture();
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.8
    });
    const shadowGeo = new THREE.PlaneGeometry(4.8, 3.8);
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, 0.002, 0.1);
    scene.add(shadowMesh);

    scene.add(laptopGroup);

    // 6. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 9;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Just above horizon
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.target.set(0, 0.65, 0);

    // Pause auto-rotation when user drags, resume 3s after they stop
    controls.addEventListener('start', () => {
        controls.autoRotate = false;
        if (resumeAutoRotateTimeout) {
            clearTimeout(resumeAutoRotateTimeout);
            resumeAutoRotateTimeout = null;
        }
    });

    controls.addEventListener('end', () => {
        resumeAutoRotateTimeout = setTimeout(() => {
            if (isModalOpen) {
                controls.autoRotate = true;
            }
        }, 3000);
    });

    // 7. Render Loop
    let rafId = null;

    function animate() {
        if (!isModalOpen) return;
        rafId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    function start() {
        if (!rafId) {
            controls.autoRotate = true;
            animate();
        }
    }

    function stop() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        if (resumeAutoRotateTimeout) {
            clearTimeout(resumeAutoRotateTimeout);
            resumeAutoRotateTimeout = null;
        }
    }

    // Resize handler (debounced)
    let resizeTimer = null;
    function handleResize() {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w === 0 || h === 0) return;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }, 100);
    }

    window.addEventListener('resize', handleResize);

    return {
        scene,
        camera,
        renderer,
        controls,
        screenMesh,
        start,
        stop,
        handleResize
    };
}

// Load screenshot texture onto screen material
function setScreenTexture(imageSrc, loadingSpinner) {
    if (!threeApp || !threeModules) return;
    const { THREE } = threeModules;
    const textureLoader = new THREE.TextureLoader();

    if (loadingSpinner) loadingSpinner.style.display = 'flex';

    textureLoader.load(
        imageSrc,
        (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = threeApp.renderer.capabilities.getMaxAnisotropy();
            texture.generateMipmaps = true;

            // Dispose old texture to free GPU memory
            if (currentTexture) {
                currentTexture.dispose();
            }
            currentTexture = texture;

            threeApp.screenMesh.material.map = texture;
            threeApp.screenMesh.material.color.set(0xffffff);
            threeApp.screenMesh.material.needsUpdate = true;

            if (loadingSpinner) loadingSpinner.style.display = 'none';
        },
        undefined,
        (err) => {
            // If local file:// protocol or CORS blocks loading texture
            console.warn('[3D View] Texture load failed (likely file:// protocol):', err);
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            // Set fallback pleasant teal/dark screen color
            threeApp.screenMesh.material.map = null;
            threeApp.screenMesh.material.color.set(0x0f766e);
            threeApp.screenMesh.material.needsUpdate = true;
        }
    );
}

// Open Fallback Lightbox (for no-WebGL / reduced-motion / import failure)
function openFallbackLightbox(projectData) {
    const modal = document.getElementById('modelViewModal');
    const canvasContainer = document.getElementById('modelCanvasContainer');
    const fallbackContainer = document.getElementById('modelFallbackLightbox');
    const fallbackImg = document.getElementById('fallbackLightboxImg');

    if (!modal) return;

    populateModalDetails(projectData);

    if (canvasContainer) canvasContainer.style.display = 'none';
    if (fallbackContainer && fallbackImg) {
        fallbackContainer.style.display = 'flex';
        fallbackImg.src = projectData.image || '';
        fallbackImg.alt = projectData.title || 'Project Screenshot';
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    isModalOpen = true;
}

// Populate modal header and links
function populateModalDetails(projectData) {
    const titleEl = document.getElementById('modalProjectTitle');
    const catEl = document.getElementById('modalProjectCategory');
    const techEl = document.getElementById('modalProjectTech');
    const liveBtn = document.getElementById('modalLiveBtn');

    if (titleEl) titleEl.textContent = projectData.title || 'Project Preview';
    if (catEl) catEl.textContent = projectData.category || 'Web Application';

    if (techEl) {
        techEl.innerHTML = '';
        if (projectData.tech) {
            const techs = projectData.tech.split(',').map(t => t.trim()).filter(Boolean);
            techs.forEach(t => {
                const span = document.createElement('span');
                span.className = 'modal-chip';
                span.textContent = t;
                techEl.appendChild(span);
            });
        }
    }

    if (liveBtn) {
        if (projectData.live && projectData.live.trim() !== '') {
            liveBtn.href = projectData.live;
            liveBtn.style.display = 'inline-flex';
        } else {
            liveBtn.style.display = 'none';
        }
    }
}

// Open 3D View Modal
async function open3DModal(card) {
    const projectData = {
        title: card.dataset.title || '',
        category: card.dataset.category || '',
        tech: card.dataset.tech || '',
        image: card.dataset.image || '',
        live: card.dataset.live || '',
        repo: card.dataset.repo || '',
        desc: card.dataset.desc || ''
    };

    const modal = document.getElementById('modelViewModal');
    const canvasContainer = document.getElementById('modelCanvasContainer');
    const fallbackContainer = document.getElementById('modelFallbackLightbox');
    const loadingSpinner = document.getElementById('modelLoadingSpinner');

    if (!modal) return;

    // Check gating conditions: WebGL support & reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isWebGLSupported() || prefersReducedMotion) {
        openFallbackLightbox(projectData);
        return;
    }

    // Lazy load Three.js on first open
    if (!threeLoaded) {
        if (loadingSpinner) loadingSpinner.style.display = 'flex';
        try {
            const [THREE, { OrbitControls }, { RoomEnvironment }] = await Promise.all([
                import('three'),
                import('three/addons/controls/OrbitControls.js'),
                import('three/addons/environments/RoomEnvironment.js')
            ]);
            threeModules = { THREE, OrbitControls, RoomEnvironment };
            threeLoaded = true;
        } catch (importErr) {
            console.warn('[3D View] Three.js dynamic import failed. Falling back to lightbox:', importErr);
            openFallbackLightbox(projectData);
            return;
        }
    }

    // Populate header info
    populateModalDetails(projectData);

    if (fallbackContainer) fallbackContainer.style.display = 'none';
    if (canvasContainer) canvasContainer.style.display = 'block';

    // Show modal dialog
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    isModalOpen = true;

    // Initialize Three.js app on first open or reuse existing
    if (!threeApp) {
        threeApp = await initThreeApp(canvasContainer);
    } else {
        threeApp.handleResize();
    }

    // Swap screenshot texture for this project
    if (projectData.image) {
        setScreenTexture(projectData.image, loadingSpinner);
    }

    // Start rendering loop
    threeApp.start();
}

// Close Modal
function close3DModal() {
    const modal = document.getElementById('modelViewModal');
    if (!modal || !isModalOpen) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    isModalOpen = false;

    if (threeApp) {
        threeApp.stop();
    }

    // Return focus to trigger button
    if (lastFocusedTrigger) {
        lastFocusedTrigger.focus();
        lastFocusedTrigger = null;
    }
}

// DOM Setup on document ready
document.addEventListener('DOMContentLoaded', () => {
    // 1. Delegate "3D View" click events
    document.addEventListener('click', (e) => {
        const btn3d = e.target.closest('.btn-3d-view');
        if (btn3d) {
            e.preventDefault();
            e.stopPropagation();
            lastFocusedTrigger = btn3d;
            const card = btn3d.closest('.portfolio-item');
            if (card) {
                open3DModal(card);
            }
        }
    });

    // 2. Delegate Close buttons & backdrop clicks
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-close-modal]') || e.target.closest('[data-close-modal]')) {
            e.preventDefault();
            close3DModal();
        }
    });

    // 3. Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalOpen) {
            close3DModal();
        }
    });
});
