/**
 * Realistic 3D Butterfly flying across the hero section
 * Loaded conditionally with Three.js (no-bundler ESM)
 */

(function () {
    // 22. FALLBACKS
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    if (navigator.connection && navigator.connection.saveData) {
        return;
    }

    function isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    if (!isWebGLAvailable()) {
        return;
    }

    // Schedule initialization when window is loaded & idle
    function onReady(fn) {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(fn, 100);
        } else {
            window.addEventListener('DOMContentLoaded', () => setTimeout(fn, 100), { once: true });
            window.addEventListener('load', () => setTimeout(fn, 100), { once: true });
        }
    }

    onReady(initButterflySystem);

    async function initButterflySystem() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        // Dynamic import of Three.js modules
        let THREE, RoomEnvironment;
        try {
            THREE = await import('three');
            const roomModule = await import('three/addons/environments/RoomEnvironment.js');
            RoomEnvironment = roomModule.RoomEnvironment;
        } catch (err) {
            // Silently fallback if import fails
            return;
        }

        // 3. CANVAS PLACEMENT
        let canvas = hero.querySelector('.butterfly-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.className = 'butterfly-canvas';
            canvas.setAttribute('aria-hidden', 'true');
            canvas.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:3; display:none;';
            hero.appendChild(canvas);
        }

        // 4. RENDERER & CAMERA
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        const maxPR = isTouch ? 1.5 : 2.0;

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                alpha: true,
                antialias: true,
                powerPreference: 'high-performance'
            });
        } catch (e) {
            return;
        }

        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPR));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;

        const scene = new THREE.Scene();

        // Camera: fov 30, placed at z = 12 looking at origin
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
        camera.position.set(0, 0, 12);
        camera.lookAt(0, 0, 0);

        // 9. LIGHTING & ENVIRONMENT
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.2);
        keyLight.position.set(-8, 10, 8);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
        rimLight.position.set(4, -2, -6);
        scene.add(rimLight);

        // RoomEnvironment via PMREMGenerator
        try {
            const pmremGenerator = new THREE.PMREMGenerator(renderer);
            pmremGenerator.compileEquirectangularShader();
            const roomScene = new RoomEnvironment();
            const envMap = pmremGenerator.fromScene(roomScene, 0.04).texture;
            scene.environment = envMap;
            roomScene.dispose();
            pmremGenerator.dispose();
        } catch (e) {
            // Environment fallback
        }

        // Visible world dimensions at depth z
        function getVisibleDimensionsAtZ(targetZ) {
            const dist = camera.position.z - targetZ;
            const vFov = (camera.fov * Math.PI) / 180;
            const height = 2 * Math.tan(vFov / 2) * dist;
            const width = height * camera.aspect;
            return { width, height };
        }

        // 7. WING TEXTURE GENERATION OR LOAD
        async function getWingTexture() {
            return new Promise((resolve) => {
                const loader = new THREE.TextureLoader();
                loader.load(
                    'butterfly-wing.png',
                    (loadedTex) => {
                        loadedTex.colorSpace = THREE.SRGBColorSpace;
                        loadedTex.anisotropy = 8;
                        window._butterflyTextureMode = 'file';
                        resolve({ texture: loadedTex, isFile: true });
                    },
                    undefined,
                    () => {
                        // Fallback: procedural 2D Blue Morpho canvas
                        const generated = createProceduralWingTexture();
                        window._butterflyTextureMode = 'generated';
                        resolve({ texture: generated, isFile: false });
                    }
                );
            });
        }

        function createProceduralWingTexture() {
            const sz = 1024;
            const c = document.createElement('canvas');
            c.width = sz;
            c.height = sz;
            const ctx = c.getContext('2d');

            ctx.clearRect(0, 0, sz, sz);

            // Draw single right wing shape on transparent background
            ctx.save();
            ctx.translate(sz * 0.1, sz * 0.5);

            ctx.beginPath();
            ctx.moveTo(0, 0); // hinge base
            // Forewing upper arc
            ctx.bezierCurveTo(sz * 0.2, -sz * 0.42, sz * 0.55, -sz * 0.48, sz * 0.85, -sz * 0.35);
            // Outer apex and outer margin
            ctx.bezierCurveTo(sz * 0.88, -sz * 0.15, sz * 0.82, sz * 0.05, sz * 0.72, sz * 0.12);
            // Hindwing outer curve
            ctx.bezierCurveTo(sz * 0.78, sz * 0.32, sz * 0.58, sz * 0.46, sz * 0.38, sz * 0.42);
            // Inner hindwing back to hinge
            ctx.bezierCurveTo(sz * 0.20, sz * 0.38, sz * 0.08, sz * 0.22, 0, 0);
            ctx.closePath();

            // Gradient: bright blue (#2aa8ff) -> #0a5bff -> navy (#0b1a4a)
            const radGrad = ctx.createRadialGradient(sz * 0.1, 0, sz * 0.05, sz * 0.5, 0, sz * 0.85);
            radGrad.addColorStop(0.0, '#38c5ff');
            radGrad.addColorStop(0.25, '#2aa8ff');
            radGrad.addColorStop(0.65, '#0a5bff');
            radGrad.addColorStop(1.0, '#0b1a4a');

            ctx.fillStyle = radGrad;
            ctx.fill();

            // 8-10 Radiating vein lines at 35% opacity
            ctx.strokeStyle = 'rgba(10, 20, 50, 0.38)';
            ctx.lineWidth = 3.5;
            const veinTargets = [
                [-0.42, 0.55], [-0.35, 0.78], [-0.22, 0.86], [-0.08, 0.84],
                [0.05, 0.80], [0.18, 0.74], [0.28, 0.65], [0.36, 0.50], [0.40, 0.35]
            ];
            for (const [vy, vx] of veinTargets) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(sz * vx * 0.45, sz * vy * 0.45 + (Math.random() - 0.5) * 15, sz * vx, sz * vy);
                ctx.stroke();
            }

            // Striations / fine scales
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 60; i++) {
                const angle = -0.7 + (i / 60) * 1.5;
                const r1 = sz * (0.2 + Math.random() * 0.2);
                const r2 = r1 + sz * (0.15 + Math.random() * 0.25);
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
                ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
                ctx.stroke();
            }

            // Dark brown border band (~6% wide)
            ctx.lineWidth = sz * 0.06;
            ctx.strokeStyle = '#1b120c';
            ctx.stroke();

            // Margin white dots
            ctx.fillStyle = '#ffffff';
            const dotAngles = [-0.38, -0.28, -0.18, -0.08, 0.02, 0.12, 0.22, 0.32, 0.40];
            for (const a of dotAngles) {
                const r = sz * 0.78;
                const dx = Math.cos(a) * r;
                const dy = Math.sin(a) * r;
                ctx.beginPath();
                ctx.arc(dx, dy, 4.5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();

            const tex = new THREE.CanvasTexture(c);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = 8;
            return tex;
        }

        const wingData = await getWingTexture();
        const wingTexture = wingData.texture;

        // 5. BUTTERFLY BODY GEOMETRY & MATERIALS
        const butterflyGroup = new THREE.Group();
        scene.add(butterflyGroup);

        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x2a1a12,
            roughness: 0.9,
            metalness: 0.1
        });

        // Thorax
        const thoraxGeo = new THREE.CapsuleGeometry(0.11, 0.28, 8, 12);
        thoraxGeo.rotateX(Math.PI / 2);
        const thorax = new THREE.Mesh(thoraxGeo, bodyMat);
        thorax.position.set(0, 0, 0.05);
        butterflyGroup.add(thorax);

        // Abdomen (tapered capsule)
        const abdomenGeo = new THREE.CapsuleGeometry(0.08, 0.58, 8, 14);
        abdomenGeo.rotateX(Math.PI / 2);
        const abdomen = new THREE.Mesh(abdomenGeo, bodyMat);
        abdomen.position.set(0, -0.04, 0.48);
        abdomen.scale.set(0.9, 0.9, 1.05);
        butterflyGroup.add(abdomen);

        // Head
        const headGeo = new THREE.SphereGeometry(0.095, 12, 10);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0, 0.03, -0.25);
        butterflyGroup.add(head);

        // Antennae (curved tubes + club tips)
        function createAntenna(isRight) {
            const sign = isRight ? 1 : -1;
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(sign * 0.02, 0.05, -0.28),
                new THREE.Vector3(sign * 0.12, 0.16, -0.42),
                new THREE.Vector3(sign * 0.22, 0.25, -0.52),
                new THREE.Vector3(sign * 0.28, 0.28, -0.58)
            ]);
            const tubeGeo = new THREE.TubeGeometry(curve, 10, 0.012, 6, false);
            const tube = new THREE.Mesh(tubeGeo, bodyMat);

            const tipGeo = new THREE.SphereGeometry(0.026, 6, 6);
            const tip = new THREE.Mesh(tipGeo, bodyMat);
            tip.position.set(sign * 0.28, 0.28, -0.58);
            tube.add(tip);
            return tube;
        }
        butterflyGroup.add(createAntenna(true));
        butterflyGroup.add(createAntenna(false));

        // 6. WINGS GEOMETRY & MATERIALS
        // 22 x 16 segments for smooth deformation
        const segX = 22, segY = 16;
        const wingSpanHalf = 1.0;
        const wingChord = 0.85;

        // Wing UVs:
        // Right wing: uses right portion [0.08, 1.0] to crop out center strip
        // Left wing: mirrored UVs
        function createWingGeometry(isRight) {
            const geo = new THREE.PlaneGeometry(wingSpanHalf, wingChord, segX, segY);
            // Translate so hinge (inner edge) sits on body axis X = 0
            geo.translate(wingSpanHalf / 2, 0, 0);
            // Rotate so it lies in XZ plane facing +Y, leading edge toward -Z (head)
            geo.rotateX(-Math.PI / 2);

            const uvAttr = geo.attributes.uv;
            const uMin = 0.08;
            const uMax = 0.98;

            for (let i = 0; i < uvAttr.count; i++) {
                const uOriginal = uvAttr.getX(i);
                const vOriginal = uvAttr.getY(i);
                if (isRight) {
                    uvAttr.setXY(i, uMin + uOriginal * (uMax - uMin), vOriginal);
                } else {
                    uvAttr.setXY(i, (1 - (uMin + uOriginal * (uMax - uMin))), vOriginal);
                }
            }
            uvAttr.needsUpdate = true;
            return geo;
        }

        const rightWingGeo = createWingGeometry(true);
        const leftWingGeo = createWingGeometry(false);

        // Store base vertex positions for bending calculations
        const rightBasePositions = Float32Array.from(rightWingGeo.attributes.position.array);
        const leftBasePositions = Float32Array.from(leftWingGeo.attributes.position.array);

        const wingMaterial = new THREE.MeshPhysicalMaterial({
            map: wingTexture,
            emissiveMap: wingTexture,
            emissive: new THREE.Color(0x184880),
            emissiveIntensity: 0.25,
            side: THREE.DoubleSide,
            alphaTest: 0.4,
            transparent: true,
            roughness: 0.55,
            metalness: 0.05,
            iridescence: 0.6,
            iridescenceIOR: 1.5,
            sheen: 0.5,
            sheenColor: new THREE.Color(0x38bdf8)
        });

        // Wing roots (hinges) placed along body axis
        const rightWingRoot = new THREE.Group();
        const leftWingRoot = new THREE.Group();
        rightWingRoot.position.set(0.06, 0.04, 0.0);
        leftWingRoot.position.set(-0.06, 0.04, 0.0);

        const rightWingMesh = new THREE.Mesh(rightWingGeo, wingMaterial);
        const leftWingMesh = new THREE.Mesh(leftWingGeo, wingMaterial);

        // Left wing mesh mirrored in X so it extends along -X
        leftWingMesh.scale.set(-1, 1, 1);

        rightWingRoot.add(rightWingMesh);
        leftWingRoot.add(leftWingMesh);
        butterflyGroup.add(rightWingRoot);
        butterflyGroup.add(leftWingRoot);

        // 8. WING VERTEX BEND (CPU)
        let frameCount = 0;
        function updateWingBending(rightGeo, leftGeo, rightBase, leftBase, phase, flapAngle) {
            frameCount++;
            const computeNormals = (frameCount % 2 === 0);
            const posR = rightGeo.attributes.position;
            const posL = leftGeo.attributes.position;
            const bendAmp = 0.12 * (wingSpanHalf * 2);

            const vertexCount = posR.count;
            for (let i = 0; i < vertexCount; i++) {
                const ix = i * 3;
                const bx = rightBase[ix];
                const by = rightBase[ix + 1];
                const bz = rightBase[ix + 2];

                // s = 0 at hinge to 1 at tip
                const s = Math.min(Math.max(bx / wingSpanHalf, 0), 1);
                // Middle chord camber
                const chordMid = 1.0 - Math.abs(bz / (wingChord * 0.5));
                const camber = 0.025 * Math.max(0, chordMid);

                // Lag displacement
                const dy = bendAmp * (s * s) * Math.sin(phase - 1.2 * s) + camber;

                posR.setY(i, by + dy);
                posL.setY(i, by + dy);
            }

            posR.needsUpdate = true;
            posL.needsUpdate = true;

            if (computeNormals) {
                rightGeo.computeVertexNormals();
                leftGeo.computeVertexNormals();
            }
        }

        // FLIGHT CONTROL & STATE
        let isFlightActive = false;
        let flightStartTime = 0;
        let flightDuration = 15;
        let flightCurve = null;
        let flightDirectionLeftToRight = true;
        let nextFlightTimeoutId = null;

        // Rhythm: Flap & Glide
        let cycleTime = 0;
        let currentFlapDuration = 1.8;
        let currentGlideDuration = 0.7;
        let isGliding = false;
        let flapFreq = 5.0; // 4.5 to 5.5 Hz
        let flapPhase = 0;

        // Cursor avoidance state
        let mouseScreen = { x: -9999, y: -9999, active: false };
        let mouseOffset = new THREE.Vector2(0, 0);

        // Debug mode
        const isDebug = window.location.hash === '#butterfly-debug';
        let debugLine = null;

        // Performance safety valve
        let frameTimeHistory = [];
        let performanceSafeLevel = 0; // 0 = normal, 1 = reduced PR, 2 = disabled

        // Dimensions
        let heroRect = hero.getBoundingClientRect();
        let heroW = heroRect.width;
        let heroH = heroRect.height;
        let currentWingspanPx = 110;

        function updateDimensions() {
            heroRect = hero.getBoundingClientRect();
            heroW = heroRect.width || window.innerWidth;
            heroH = heroRect.height || window.innerHeight;

            if (heroW <= 0 || heroH <= 0) return;

            renderer.setSize(heroW, heroH, false);
            camera.aspect = heroW / heroH;
            camera.updateProjectionMatrix();

            // Wingspan: increased size for prominent visibility (~16% of hero width, clamped to 220 - 380px)
            currentWingspanPx = Math.max(220, Math.min(380, heroW * 0.16));
            window._butterflyWingspanPx = currentWingspanPx;
        }

        updateDimensions();

        // Screen pixels to world coordinates converter at a given z depth
        function screenToWorld(px, py, worldZ) {
            const dims = getVisibleDimensionsAtZ(worldZ);
            const wx = ((px / heroW) - 0.5) * dims.width;
            const wy = -((py / heroH) - 0.5) * dims.height;
            return new THREE.Vector3(wx, wy, worldZ);
        }

        function worldToScreen(worldPos) {
            const v = worldPos.clone().project(camera);
            const sx = (v.x * 0.5 + 0.5) * heroW;
            const sy = (-v.y * 0.5 + 0.5) * heroH;
            return { x: sx, y: sy };
        }

        // 13. GENERATE FLIGHT PATH
        function generateFlightPath(leftToRight) {
            const points = [];
            const numPoints = 8;
            const startX = leftToRight ? -heroW * 0.15 : heroW * 1.15;
            const endX = leftToRight ? heroW * 1.15 : -heroW * 0.15;

            // Respect navbar height (navbar is ~72px, keep at least 40px below it)
            const navbarElem = document.querySelector('.navbar');
            const navH = navbarElem ? navbarElem.offsetHeight : 72;
            const minYPx = Math.max(navH + 40, heroH * 0.18);
            const maxYPx = heroH * 0.72;

            for (let i = 0; i < numPoints; i++) {
                const t = i / (numPoints - 1);
                const px = startX + t * (endX - startX);
                // Smooth varying height
                const py = minYPx + Math.random() * (maxYPx - minYPx);
                const pz = -1.5 + Math.random() * 3.0; // [-1.5, 1.5]
                points.push(screenToWorld(px, py, pz));
            }

            const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);

            // Optional debug line
            if (isDebug) {
                if (debugLine) scene.remove(debugLine);
                const pts = curve.getPoints(100);
                const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
                const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
                debugLine = new THREE.Line(lineGeo, lineMat);
                scene.add(debugLine);
            }

            return curve;
        }

        // 16. FLIGHT START & END
        function startFlight() {
            if (performanceSafeLevel >= 2) return;

            updateDimensions();
            flightDirectionLeftToRight = !flightDirectionLeftToRight;
            flightCurve = generateFlightPath(flightDirectionLeftToRight);

            // Travel speed: 90 - 140 px/s
            const approxPathPx = heroW * 1.3;
            const speed = 95 + Math.random() * 40;
            flightDuration = Math.max(12, Math.min(20, approxPathPx / speed));

            flightStartTime = performance.now();
            cycleTime = 0;
            currentFlapDuration = 1.2 + Math.random() * 1.2; // 1.2 - 2.4s
            currentGlideDuration = 0.5 + Math.random() * 0.5; // 0.5 - 1.0s
            isGliding = false;
            flapFreq = 4.5 + Math.random() * 1.0; // 4.5 - 5.5 Hz

            canvas.style.display = 'block';
            butterflyGroup.visible = true;
            isFlightActive = true;
            lastFrameTime = performance.now();
            requestAnimationFrame(renderLoop);
        }

        function endFlight() {
            isFlightActive = false;
            butterflyGroup.visible = false;
            canvas.style.display = 'none';

            if (debugLine) {
                scene.remove(debugLine);
                debugLine = null;
            }

            const waitSeconds = isDebug ? 2.0 : (9 + Math.random() * 9); // 9 to 18 seconds
            nextFlightTimeoutId = setTimeout(startFlight, waitSeconds * 1000);
        }

        // 17. CURSOR REACTION (Desktop mouse)
        if (!isTouch) {
            window.addEventListener('mousemove', (e) => {
                const rect = hero.getBoundingClientRect();
                if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
                    mouseScreen.x = e.clientX - rect.left;
                    mouseScreen.y = e.clientY - rect.top;
                    mouseScreen.active = true;
                } else {
                    mouseScreen.active = false;
                }
            }, { passive: true });

            window.addEventListener('mouseleave', () => {
                mouseScreen.active = false;
            });
        }

        // INTERSECTION OBSERVER & VISIBILITY
        let isHeroVisible = true;
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                isHeroVisible = entry.isIntersecting;
            }
        }, { threshold: 0.05 });
        observer.observe(hero);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                isHeroVisible = false;
            } else {
                isHeroVisible = true;
            }
        });

        // 21. DEBOUNCED RESIZE
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateDimensions, 150);
        }, { passive: true });

        // ANIMATION LOOP
        let lastFrameTime = performance.now();
        let bankAngle = 0;

        function renderLoop(now) {
            if (!isFlightActive) return;

            const delta = Math.min((now - lastFrameTime) / 1000, 0.1);
            lastFrameTime = now;

            // Frame time monitor for safety valve
            if (delta > 0) {
                frameTimeHistory.push(delta * 1000);
                if (frameTimeHistory.length > 90) {
                    frameTimeHistory.shift();
                    const avgMs = frameTimeHistory.reduce((a, b) => a + b, 0) / frameTimeHistory.length;
                    if (avgMs > 28) {
                        if (performanceSafeLevel === 0) {
                            performanceSafeLevel = 1;
                            renderer.setPixelRatio(1.0);
                            frameTimeHistory = [];
                        } else if (performanceSafeLevel === 1) {
                            performanceSafeLevel = 2;
                            endFlight();
                            if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
                            return;
                        }
                    }
                }
            }

            if (!isHeroVisible) {
                requestAnimationFrame(renderLoop);
                return;
            }

            const elapsed = (now - flightStartTime) / 1000;
            const progress = elapsed / flightDuration;

            if (progress >= 1.0) {
                endFlight();
                return;
            }

            // Rhythm: Flap and Glide
            cycleTime += delta;
            if (!isGliding && cycleTime >= currentFlapDuration) {
                isGliding = true;
                cycleTime = 0;
                currentGlideDuration = 0.5 + Math.random() * 0.5;
            } else if (isGliding && cycleTime >= currentGlideDuration) {
                isGliding = false;
                cycleTime = 0;
                currentFlapDuration = 1.2 + Math.random() * 1.2;
                flapFreq = 4.5 + Math.random() * 1.0;
            }

            // Wing Angle Theta
            let thetaRight = 0;
            if (isGliding) {
                // Held in a V at about 50 deg (theta ~0.9) with small shimmer
                const shimmer = Math.sin(now * 0.015) * 0.04;
                thetaRight = 0.9 + shimmer;
            } else {
                // Flapping: 4.5 - 5.5 Hz, downstroke slightly slower
                flapPhase += delta * flapFreq * Math.PI * 2;
                // Skew phase for asymmetric downstroke/upstroke
                const sinVal = Math.sin(flapPhase);
                const shapedSin = sinVal >= 0 ? Math.pow(sinVal, 0.85) : -Math.pow(-sinVal, 1.15);
                thetaRight = 0.6 + 0.8 * shapedSin;
            }

            // 10. Wing angle rotation about body axis Z
            rightWingRoot.rotation.z = -thetaRight;
            leftWingRoot.rotation.z = thetaRight;

            // 8. Bend vertices
            updateWingBending(rightWingGeo, leftWingGeo, rightBasePositions, leftBasePositions, flapPhase, thetaRight);

            // 12. Body bounce & pitch with flapping
            if (!isGliding) {
                const bodyBounce = 0.05 * (wingSpanHalf * 2) * Math.sin(flapPhase - 0.5);
                thorax.position.y = bodyBounce;
                abdomen.position.y = -0.04 + bodyBounce;
                head.position.y = 0.03 + bodyBounce;
                // Pitch up and down by ~6 deg (0.1 rad)
                thorax.rotation.x = Math.PI / 2 + Math.sin(flapPhase) * 0.1;
            } else {
                thorax.position.y = 0;
                abdomen.position.y = -0.04;
                head.position.y = 0.03;
                thorax.rotation.x = Math.PI / 2;
            }

            // 13 & 14. POSITION ALONG CURVE
            const t = Math.min(Math.max(progress, 0), 1);
            const pos = flightCurve.getPointAt(t);
            const tangent = flightCurve.getTangentAt(t).normalize();

            // Add gentle wandering wobble (two sine waves)
            const wobbleX = Math.sin(elapsed * 1.8) * 0.15;
            const wobbleY = Math.sin(elapsed * 2.7 + 1.2) * 0.12;

            // 17. Cursor avoidance reaction
            if (mouseScreen.active) {
                const bScreen = worldToScreen(pos);
                const dx = bScreen.x - mouseScreen.x;
                const dy = bScreen.y - mouseScreen.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 170 && dist > 0.01) {
                    const pushFactor = (1 - dist / 170) * 80; // up to 80px
                    const pushX = (dx / dist) * pushFactor;
                    const pushY = (dy / dist) * pushFactor;
                    // World unit conversion approx
                    const wDims = getVisibleDimensionsAtZ(pos.z);
                    const targetOffsetX = (pushX / heroW) * wDims.width;
                    const targetOffsetY = -(pushY / heroH) * wDims.height;
                    mouseOffset.x += (targetOffsetX - mouseOffset.x) * 0.1;
                    mouseOffset.y += (targetOffsetY - mouseOffset.y) * 0.1;
                } else {
                    mouseOffset.x += (0 - mouseOffset.x) * 0.05;
                    mouseOffset.y += (0 - mouseOffset.y) * 0.05;
                }
            } else {
                mouseOffset.x += (0 - mouseOffset.x) * 0.05;
                mouseOffset.y += (0 - mouseOffset.y) * 0.05;
            }

            butterflyGroup.position.set(
                pos.x + wobbleX + mouseOffset.x,
                pos.y + wobbleY + mouseOffset.y,
                pos.z
            );

            // Scale with wingspan and depth variation (0.8x to 1.2x)
            const wDims = getVisibleDimensionsAtZ(pos.z);
            const pixelToWorld = wDims.width / heroW;
            const targetSpanWorld = (currentWingspanPx * pixelToWorld) / 2;
            const depthFactor = 0.8 + ((pos.z + 1.5) / 3.0) * 0.4;
            const finalScale = targetSpanWorld * depthFactor;
            butterflyGroup.scale.set(finalScale, finalScale, finalScale);

            // 15. ORIENTATION (Tangent, pitch, and banking roll)
            // Target forward direction points along -Z of butterfly body
            const forward = tangent.clone();
            const lookTarget = butterflyGroup.position.clone().add(forward);
            butterflyGroup.lookAt(lookTarget);

            // Bank roll into turns based on horizontal curvature
            const nextT = Math.min(t + 0.02, 1);
            const nextTangent = flightCurve.getTangentAt(nextT);
            const turnRate = (nextTangent.x - tangent.x) * (flightDirectionLeftToRight ? 1 : -1);
            const targetBank = Math.max(-0.43, Math.min(0.43, -turnRate * 4.5)); // up to 25 deg (~0.43 rad)
            bankAngle += (targetBank - bankAngle) * 0.1;
            butterflyGroup.rotateZ(bankAngle);

            renderer.render(scene, camera);
            requestAnimationFrame(renderLoop);
        }

        // 16. SCHEDULE FIRST FLIGHT
        function scheduleInitialFlight() {
            const preloader = document.getElementById('preloader');
            let attempts = 0;
            const checkPreloader = () => {
                attempts++;
                if (!preloader || preloader.classList.contains('preloader--hidden') || preloader.style.display === 'none' || attempts > 15) {
                    setTimeout(startFlight, isDebug ? 200 : 800);
                } else {
                    setTimeout(checkPreloader, 150);
                }
            };
            checkPreloader();
        }

        scheduleInitialFlight();
    }
})();
