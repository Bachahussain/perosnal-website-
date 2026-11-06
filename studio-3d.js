/**
 * Bacha Hussain - 3D Virtual Studio Walkthrough
 * Inspired by arshkhachatrian.com
 * Handles:
 * - Ambient Three.js particle lighting
 * - Smooth camera parallax & waypoint tweening
 * - Web Audio API Lo-Fi Ambient Synth for relaxing music
 * - Interactive 3D Hotspot triggers & Case Study Modals
 */

(function init3DStudio() {
  // 1. Projects Data for Case Study Modals
  const PROJECTS_CASE_STUDIES = {
    'punj-afg': {
      category: 'Full Stack Web Platform',
      title: 'PUNJ-AFG Connect',
      desc: 'An international academic and community network connecting university students across Punjab and Afghanistan with verified admission mentorship, study resources, and peer networking.',
      liveUrl: 'https://afg-student-community.vercel.app',
      repoUrl: 'https://github.com/Bachahussain',
      challenge: 'Cross-border students lacked a centralized digital space to find verified university syllabus notes, entrance examination guides, and admission guidance without relying on scattered messaging groups.',
      solution: 'Constructed a modern Next.js web application paired with Firebase Realtime listeners for instant community threads, secure Google OAuth authentication, and performant client-side caching.',
      tech: ['Next.js', 'React.js', 'Firebase Auth', 'Firestore', 'Tailwind CSS']
    },
    'digital-agency': {
      category: 'Creative Design & Engineering',
      title: 'Digital Agency Platform',
      desc: 'A bespoke corporate agency platform designed with fluid kinetic typography, custom 3D web interactive graphics, and an automated inquiry quotation calculator.',
      liveUrl: 'https://digital-agency-alpha.vercel.app',
      repoUrl: 'https://github.com/Bachahussain',
      challenge: 'Traditional agency websites felt generic, static, and failed to communicate modern engineering innovation to prospective design-focused clients.',
      solution: 'Engineered a reactive frontend with GPU-accelerated motion animations, lazy-loaded Three.js canvas components, and an optimized bundle scoring 98+ on Google Lighthouse.',
      tech: ['React.js', 'Tailwind CSS', 'Framer Motion', 'Three.js']
    },
    'stats-dashboard': {
      category: 'Data Visualization & Analytics',
      title: 'Statistics & Analytics Dashboard',
      desc: 'An executive telemetry engine providing real-time data streaming, interactive KPI curves, customizable data filters, and responsive metric tables.',
      liveUrl: 'https://statistic-dishboard-kv315wp6v-bachahussains-projects.vercel.app/',
      repoUrl: 'https://github.com/Bachahussain',
      challenge: 'Rendering dense telemetry metrics without dropping 60fps frame rates across both mobile and desktop viewports.',
      solution: 'Utilized React component memoization, dynamic Chart.js canvas rendering, and debounced data pipelines for instantaneous table sorting and range filtration.',
      tech: ['React.js', 'Chart.js', 'TypeScript', 'Tailwind CSS']
    },
    'gem-store': {
      category: 'Luxury E-Commerce Catalog',
      title: 'Gemstone & Luxury Store',
      desc: 'A luxury mineral and precious gemstone digital catalog featuring macro image zoom inspection, laboratory certification badges, and direct WhatsApp concierge integration.',
      liveUrl: 'https://bachahussain.github.io/gem_store/',
      repoUrl: 'https://github.com/Bachahussain',
      challenge: 'High-value jewelry buyers demand pristine macro photography and immediate direct communication with gemologists before placing orders.',
      solution: 'Constructed an ultra-fast static web showcase featuring responsive high-res lightbox modals and one-click encrypted WhatsApp inquiries.',
      tech: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap 5']
    },
    'ecommerce': {
      category: 'Full Stack MERN Store',
      title: 'Full Stack E-Commerce Store',
      desc: 'A full-featured digital shop with persistent shopping cart, category indexing, product search with instant debounce, and secure tokenized authentication.',
      liveUrl: 'https://github.com/Bachahussain/ecommerce-store-',
      repoUrl: 'https://github.com/Bachahussain/ecommerce-store-',
      challenge: 'Building a scalable full-stack store architecture with custom inventory states, tokenized authentication, and responsive mobile checkouts.',
      solution: 'Architected a modular Node.js/Express backend paired with a reactive frontend and MongoDB document aggregations.',
      tech: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS']
    }
  };

  // 2. Camera Waypoint Views (Smooth Camera Zoom & Pan)
  const WAYPOINT_TRANSFORMS = {
    overview: 'scale(1) translate(0%, 0%) rotateX(0deg) rotateY(0deg)',
    projects: 'scale(1.72) translate(28%, 8%) rotateX(2deg) rotateY(-8deg)',
    portrait: 'scale(1.75) translate(-25%, -6%) rotateX(4deg) rotateY(6deg)',
    pucit: 'scale(1.75) translate(-36%, -6%) rotateX(4deg) rotateY(6deg)',
    desk: 'scale(1.8) translate(0%, -10%) rotateX(6deg) rotateY(0deg)',
    lounge: 'scale(1.85) translate(18%, -24%) rotateX(8deg) rotateY(8deg)'
  };

  // 3. Ambient Lo-Fi Synth Audio Engine (Web Audio API)
  class AmbientLoFiPlayer {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.timer = null;
      this.masterGain = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    play() {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      this.isPlaying = true;

      const chords = [
        [146.83, 220.0, 261.63, 329.63], // Dm9
        [196.0, 246.94, 329.63, 392.0],  // G13
        [130.81, 196.0, 246.94, 329.63], // Cmaj9
        [110.0, 164.81, 220.0, 261.63]   // Am7
      ];

      let idx = 0;

      const playChord = () => {
        if (!this.isPlaying || !this.ctx || !this.masterGain) return;
        const currentChord = chords[idx % chords.length];
        const now = this.ctx.currentTime;

        currentChord.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = i === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(460 + (i * 120), now);

          noteGain.gain.setValueAtTime(0.001, now);
          noteGain.gain.exponentialRampToValueAtTime(0.038, now + 0.4);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

          osc.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + 4.0);
        });

        idx++;
        this.timer = window.setTimeout(playChord, 3800);
      };

      playChord();
    }

    stop() {
      this.isPlaying = false;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }
  }

  const loFi = new AmbientLoFiPlayer();

  // 4. Initialize DOM Events when document ready
  function init() {
    const canvasContainer = document.getElementById('studioCanvasContainer');
    const waypointBtns = document.querySelectorAll('.studio-waypoint-btn');
    const statusLabel = document.getElementById('studioCurrentViewName');
    const audioBtn = document.getElementById('studioAudioBtn');
    const modalOverlay = document.getElementById('studioModalOverlay');
    const modalContent = document.getElementById('studioModalContent');
    const modalClose = document.getElementById('studioModalClose');

    if (!canvasContainer) return;

    // A. Camera Waypoint Transitions
    function setWaypoint(targetKey) {
      const transform = WAYPOINT_TRANSFORMS[targetKey] || WAYPOINT_TRANSFORMS.overview;
      canvasContainer.style.transform = transform;

      waypointBtns.forEach(btn => {
        if (btn.getAttribute('data-waypoint') === targetKey) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      if (statusLabel) {
        statusLabel.textContent = targetKey.replace('-', ' ');
      }
    }

    waypointBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-waypoint');
        setWaypoint(target);
      });
    });

    // B. Interactive Hotspots
    const hotspots = document.querySelectorAll('.studio-hotspot, .studio-framed-portrait-layer');
    hotspots.forEach(spot => {
      spot.addEventListener('click', () => {
        const action = spot.getAttribute('data-action');
        if (action === 'projects') {
          setWaypoint('projects');
          openCaseStudy('punj-afg');
        } else if (action === 'portrait') {
          setWaypoint('portrait');
          openBioModal();
        } else if (action === 'pucit') {
          setWaypoint('pucit');
          openPucitModal();
        } else if (action === 'desk') {
          setWaypoint('desk');
          openTechModal();
        } else if (action === 'turntable') {
          setWaypoint('lounge');
          toggleMusic();
        } else if (action === 'vespa') { driveMotorcycle(); return; } else if (false) {
          const contactSec = document.getElementById('contact');
          if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // C. Ambient Sound Toggle Button & Header Controls
    // C. Rebuilt Ambient Sound & Scene Controls (Speaker, Popover, Settings)
    const navSoundBtn = document.getElementById("navSoundBtn");
    const navSoundIcon = document.getElementById("navSoundIcon");
    const popoverSoundToggle = document.getElementById("popoverSoundToggle");
    const mobileSoundToggle = document.getElementById("mobileSoundToggle");
    const headerMusicBtn = document.getElementById("headerMusicToggle");

    function updateAudioUI(isPlaying) {
      if (audioBtn) {
        audioBtn.classList.toggle("playing", isPlaying);
        audioBtn.innerHTML = isPlaying ? "<i class=\"fas fa-volume-up\"></i>" : "<i class=\"fas fa-volume-mute\"></i>";
      }
      if (headerMusicBtn) {
        headerMusicBtn.classList.toggle("playing", isPlaying);
        headerMusicBtn.innerHTML = isPlaying ? "<i class=\"fas fa-volume-up\"></i>" : "<i class=\"fas fa-volume-mute\"></i>";
      }
      if (navSoundBtn) {
        navSoundBtn.setAttribute("aria-pressed", isPlaying ? "true" : "false");
        navSoundBtn.setAttribute("aria-label", isPlaying ? "Sound: On" : "Sound: Off");
      }
      if (navSoundIcon) {
        navSoundIcon.className = isPlaying ? "fas fa-volume-up" : "fas fa-volume-mute";
      }
      if (popoverSoundToggle) {
        popoverSoundToggle.classList.toggle("checked", isPlaying);
        popoverSoundToggle.setAttribute("aria-checked", isPlaying ? "true" : "false");
      }
      if (mobileSoundToggle) {
        mobileSoundToggle.classList.toggle("checked", isPlaying);
        mobileSoundToggle.setAttribute("aria-checked", isPlaying ? "true" : "false");
      }
    }

    function toggleMusic() {
      if (loFi.isPlaying) {
        loFi.stop();
        updateAudioUI(false);
      } else {
        loFi.play();
        updateAudioUI(true);
      }
    }

    if (audioBtn) audioBtn.addEventListener("click", toggleMusic);
    if (headerMusicBtn) headerMusicBtn.addEventListener("click", toggleMusic);
    if (navSoundBtn) navSoundBtn.addEventListener("click", toggleMusic);
    if (popoverSoundToggle) popoverSoundToggle.addEventListener("click", toggleMusic);
    if (mobileSoundToggle) mobileSoundToggle.addEventListener("click", toggleMusic);

    // Scene Settings Popover Wiring
    const navSettingsBtn = document.getElementById("navSettingsBtn");
    const sceneSettingsPopover = document.getElementById("sceneSettingsPopover");
    const popoverCloseBtn = document.getElementById("popoverCloseBtn");
    const popoverVespaBtn = document.getElementById("popoverVespaBtn");
    const mobileVespaBtn = document.getElementById("mobileVespaBtn");
    const popoverMotionToggle = document.getElementById("popoverMotionToggle");
    const mobileMotionToggle = document.getElementById("mobileMotionToggle");

    function toggleScenePopover(forceState) {
      if (!sceneSettingsPopover) return;
      const willOpen = typeof forceState === "boolean" ? forceState : !sceneSettingsPopover.classList.contains("active");
      sceneSettingsPopover.classList.toggle("active", willOpen);
      sceneSettingsPopover.setAttribute("aria-hidden", willOpen ? "false" : "true");
      if (navSettingsBtn) {
        navSettingsBtn.setAttribute("aria-expanded", willOpen ? "true" : "false");
      }
    }

    if (navSettingsBtn) {
      navSettingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleScenePopover();
      });
    }

    if (popoverCloseBtn) {
      popoverCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleScenePopover(false);
      });
    }

    // 3D Motion Toggle
    let motionEnabled = true;
    function toggleMotion() {
      motionEnabled = !motionEnabled;
      const isChecked = motionEnabled;
      if (popoverMotionToggle) {
        popoverMotionToggle.classList.toggle("checked", isChecked);
        popoverMotionToggle.setAttribute("aria-checked", isChecked ? "true" : "false");
      }
      if (mobileMotionToggle) {
        mobileMotionToggle.classList.toggle("checked", isChecked);
        mobileMotionToggle.setAttribute("aria-checked", isChecked ? "true" : "false");
      }
      if (canvasContainer) {
        canvasContainer.style.transition = motionEnabled ? "transform 0.4s ease-out" : "none";
        if (!motionEnabled) {
          canvasContainer.style.transform = "scale(1) translate(0, 0)";
        }
      }
    }

    if (popoverMotionToggle) popoverMotionToggle.addEventListener("click", toggleMotion);
    if (mobileMotionToggle) mobileMotionToggle.addEventListener("click", toggleMotion);

    // Mobile Hamburger & Drawer (<820px)
    const navHamburger = document.getElementById("navHamburger");
    const navMobileMenu = document.getElementById("navMobileMenu") || document.getElementById("navDropdownPanel");

    function toggleMobileMenu(forceState) {
      if (!navMobileMenu) return;
      const willOpen = typeof forceState === "boolean" ? forceState : !navMobileMenu.classList.contains("active");
      navMobileMenu.classList.toggle("active", willOpen);
      navMobileMenu.setAttribute("aria-hidden", willOpen ? "false" : "true");
      if (navHamburger) {
        navHamburger.classList.toggle("active", willOpen);
        navHamburger.setAttribute("aria-expanded", willOpen ? "true" : "false");
      }
    }

    if (navHamburger && navMobileMenu) {
      navHamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleScenePopover(false);
        toggleMobileMenu();
      });

      // Close menu when any link is clicked inside drawer
      navMobileMenu.querySelectorAll("a, button").forEach(item => {
        if (item.id !== "mobileSoundToggle" && item.id !== "mobileMotionToggle") {
          item.addEventListener("click", () => {
            toggleMobileMenu(false);
          });
        }
      });
    }

    // Outside Click & Escape Key Handler for Popover and Mobile Menu
    document.addEventListener("click", (e) => {
      if (sceneSettingsPopover && sceneSettingsPopover.classList.contains("active")) {
        if (!sceneSettingsPopover.contains(e.target) && !navSettingsBtn?.contains(e.target)) {
          toggleScenePopover(false);
        }
      }
      if (navMobileMenu && navMobileMenu.classList.contains("active")) {
        if (!navMobileMenu.contains(e.target) && !navHamburger?.contains(e.target)) {
          toggleMobileMenu(false);
        }
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        toggleScenePopover(false);
        toggleMobileMenu(false);
      }
    });

    // D. Modal Opening Functions
    function showModal(html) {
      if (!modalOverlay || !modalContent) return;
      modalContent.innerHTML = html;
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      if (!modalOverlay) return;
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    // Modal Content Builders
    function openCaseStudy(projectId) {
      const p = PROJECTS_CASE_STUDIES[projectId] || PROJECTS_CASE_STUDIES['punj-afg'];
      const html = `
        <div class="case-study-category">${p.category}</div>
        <h2 class="case-study-title">${p.title}</h2>
        <p class="case-study-desc">${p.desc}</p>
        <div class="case-study-actions">
          <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn-case-live">
            <span>Launch Live Project</span> <i class="fas fa-external-link-alt"></i>
          </a>
          <a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="btn-case-repo">
            <i class="fab fa-github"></i> <span>GitHub Source</span>
          </a>
        </div>
        <div class="case-study-grid">
          <div class="case-study-block">
            <div class="case-block-label">The Challenge</div>
            <p class="case-block-text">${p.challenge}</p>
          </div>
          <div class="case-study-block">
            <div class="case-block-label">Engineering Solution</div>
            <p class="case-block-text">${p.solution}</p>
          </div>
        </div>
        <div class="case-study-block">
          <div class="case-block-label">Production Stack</div>
          <div class="case-tech-chips">
            ${p.tech.map(t => `<span class="case-tech-chip">${t}</span>`).join('')}
          </div>
        </div>
      `;
      showModal(html);
    }

    function openBioModal() {
      const html = `
        <div class="bio-modal-header">
          <img src="background-image.png" alt="Bacha Hussain" class="bio-modal-avatar">
          <div>
            <div class="case-study-category">Official Verified Profile</div>
            <h2 class="case-study-title" style="margin: 4px 0 0 0; font-size: 1.65rem;">Bacha Hussain</h2>
            <div style="font-size: 0.85rem; color: #f7d070; font-family: monospace; margin-top: 4px;">
              Full Stack Web Developer • PUCIT Lahore
            </div>
          </div>
        </div>
        <p class="case-study-desc">
          I am a passionate software engineer based in Lahore, Pakistan, currently pursuing my Bachelor of Computer Science at 
          <strong>Punjab University College of Information Technology (PUCIT)</strong>. I specialize in building scalable, 
          high-performance web applications using modern full-stack architectures.
        </p>
        <div class="case-study-grid">
          <div class="case-study-block">
            <div class="case-block-label">Specialization</div>
            <p class="case-block-text">Full Stack Architecture, React & Next.js, Node.js REST APIs, MongoDB, Realtime Systems.</p>
          </div>
          <div class="case-study-block">
            <div class="case-block-label">Education</div>
            <p class="case-block-text">Bachelor of Computer Science (BSCS) • Punjab University (PUCIT), Lahore.</p>
          </div>
        </div>
        <div class="case-study-actions" style="margin-top: 20px;">
          <a href="#about" onclick="document.getElementById('studioModalOverlay').classList.remove('active'); document.body.style.overflow=''; const ab = document.getElementById('about'); if(ab) ab.scrollIntoView({behavior:'smooth'});" class="btn-case-live" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; font-weight: 700;">
            <i class="fas fa-door-open"></i> <span>Enter Room 02: Lab</span>
          </a>
          <a href="cv.pdf" download="Bacha_Hussain_CV.pdf" target="_blank" class="btn-case-repo">
            <i class="fas fa-file-pdf"></i> <span>Download CV</span>
          </a>
          <a href="#contact" onclick="document.getElementById('studioModalOverlay').classList.remove('active'); document.body.style.overflow='';" class="btn-case-repo">
            <span>Hire Me</span>
          </a>
        </div>
      `;
      showModal(html);
    }

    function openPucitModal() {
      const html = `
        <div class="case-study-category">Academic Credentials</div>
        <h2 class="case-study-title">Punjab University (PUCIT)</h2>
        <p class="case-study-desc">
          <strong>Bachelor of Computer Science (BSCS)</strong> from Punjab University College of Information Technology, Lahore, Pakistan.
        </p>
        <div class="case-study-block">
          <div class="case-block-label">Core Curriculum & Honors</div>
          <p class="case-block-text">
            Advanced Data Structures & Algorithms, Object-Oriented Software Design, Distributed Database Architectures, Operating Systems, Web Technologies, and Software Quality Assurance.
          </p>
        </div>
      `;
      showModal(html);
    }

    function openTechModal() {
      const html = `
        <div class="case-study-category">Engineering Arsenal</div>
        <h2 class="case-study-title">Technologies & Tools</h2>
        <div class="case-tech-chips" style="gap: 12px; margin-top: 20px;">
          <span class="case-tech-chip" style="font-size: 0.95rem; padding: 8px 16px;">React.js</span>
          <span class="case-tech-chip" style="font-size: 0.95rem; padding: 8px 16px;">Next.js</span>
          <span class="case-tech-chip" style="font-size: 0.95rem; padding: 8px 16px;">TypeScript</span>
          <span class="case-tech-chip" style="font-size: 0.95rem; padding: 8px 16px;">Node.js</span>
          <span class="case-tech-chip" style="font-size: 0.95rem; padding: 8px 16px;">Tailwind CSS</span>
          <span class="case-tech-chip" style="font-size: 0.95rem; padding: 8px 16px;">MongoDB</span>
          <span class="case-tech-chip" style="font-size: 0.95rem; padding: 8px 16px;">Firebase</span>
          <span class="case-tech-chip" style="font-size: 0.95rem; padding: 8px 16px;">MySQL</span>
          <span class="case-tech-chip" style="font-size: 0.95rem; padding: 8px 16px;">Git & GitHub</span>
        </div>
      `;
      showModal(html);
    }

    // E. Ambient Floating Dust Particles (Three.js)
    if (typeof THREE !== 'undefined') {
      const pCanvas = document.getElementById('studioParticlesCanvas');
      if (pCanvas) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: pCanvas, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const particleCount = 200;
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 16;
          positions[i + 1] = (Math.random() - 0.5) * 10;
          positions[i + 2] = (Math.random() - 0.5) * 10;
        }

        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
          color: 0xfde68a,
          size: 0.045,
          transparent: true,
          opacity: 0.5
        });

        const particles = new THREE.Points(geom, mat);
        scene.add(particles);
        camera.position.z = 5;

        function animate() {
          requestAnimationFrame(animate);
          particles.rotation.y += 0.0004;
          particles.rotation.x += 0.0002;
          renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        });
      }
    }
        
    // ========================================================
    // MOTORCYCLE DRIVING INTERACTION (VESPA SCOOTER)
    // ========================================================
    const vespaActor = document.getElementById('studioVespaMotorcycle');
    const vespaHotspot = document.getElementById('vespaHotspot');
    const navMotorcycleBtn = document.getElementById('navMotorcycleDriveBtn');
    const mobileMotorcycleBtn = document.getElementById('mobileMotorcycleBtn');

    function driveMotorcycle() {
      if (vespaActor) {
        vespaActor.classList.remove('driving');
        void vespaActor.offsetWidth; // trigger reflow
        vespaActor.classList.add('driving');
      }

      // Synthesize gentle vintage scooter engine throttle rev using Web Audio
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const vCtx = new AudioCtx();
        const now = vCtx.currentTime;
        const osc = vCtx.createOscillator();
        const gain = vCtx.createGain();
        const filter = vCtx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.6);
        osc.frequency.exponentialRampToValueAtTime(120, now + 1.8);
        osc.frequency.exponentialRampToValueAtTime(40, now + 2.4);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, now);
        filter.frequency.exponentialRampToValueAtTime(750, now + 0.8);
        filter.frequency.exponentialRampToValueAtTime(250, now + 2.4);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(vCtx.destination);

        osc.start(now);
        osc.stop(now + 2.5);
      } catch (e) {
        // audio optional
      }

      // Smooth scroll to Contact after driving across the room
      setTimeout(() => {
        const contactSec = document.getElementById('contact');
        if (contactSec) {
          contactSec.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1600);
    }

    if (vespaActor) vespaActor.addEventListener('click', driveMotorcycle);
    if (vespaHotspot) vespaHotspot.addEventListener('click', driveMotorcycle);
    if (navMotorcycleBtn) navMotorcycleBtn.addEventListener('click', driveMotorcycle);
    if (mobileMotorcycleBtn) mobileMotorcycleBtn.addEventListener('click', driveMotorcycle);
    const popoverVespa = document.getElementById('popoverVespaBtn');
    if (popoverVespa) popoverVespa.addEventListener('click', driveMotorcycle);

    // ========================================================
    // ROOM 02: 3D HOLOGRAPHIC PARALLAX TILT & SPATIAL LAB
    // ========================================================
    const holoChassis = document.getElementById('roomHoloChassis');
    const holoCard = document.getElementById('roomHoloCard');

    if (holoChassis && holoCard) {
      holoChassis.addEventListener('mousemove', (e) => {
        const rect = holoChassis.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 12;
        const rotateX = -((y - centerY) / centerY) * 12;
        holoCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(18px)`;
      });

      holoChassis.addEventListener('mouseleave', () => {
        holoCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      });
    }

    // Interactive 3D micro-tilt for capabilities cards
    const capCards = document.querySelectorAll('.room-cap-card');
    capCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 8;
        const rotateX = -((y - centerY) / centerY) * 8;
        card.style.transform = `perspective(800px) translateY(-5px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0px) rotateX(0deg) rotateY(0deg)';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
