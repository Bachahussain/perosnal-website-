/**
 * Portfolio Website Logic - Enhanced Professional Version
 */

document.addEventListener('DOMContentLoaded', () => {


    // 1. Typing Animation
    const typingElement = document.getElementById('typing-element');
    const roles = ['Full Stack Web Developer', 'React & Node.js Expert', 'Next.js Developer', 'Freelancer'];
    let roleIndex = 0, charIndex = 0, isDeleting = false, typeSpeed = 150;

    function type() {
        const currentRole = roles[roleIndex];
        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--; typeSpeed = 100;
        } else {
            typingElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++; typeSpeed = 200;
        }
        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true; typeSpeed = 1500;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false; roleIndex = (roleIndex + 1) % roles.length; typeSpeed = 500;
        }
        setTimeout(type, typeSpeed);
    }
    type();

    // 2. Navbar Scroll State & Scroll Spy
    const topNavbar = document.getElementById('topNavbar');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    // 3. Scroll Progress Bar
    const scrollProgress = document.getElementById('scroll-progress');

    // 4. Back to Top Button
    const backToTop = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY || window.pageYOffset;

        // Navbar shrink & glass density on scroll > 40px
        if (topNavbar) {
            if (scrollY > 40) {
                topNavbar.classList.add('scrolled');
            } else {
                topNavbar.classList.remove('scrolled');
            }
        }

        // Scroll spy with active indicator and aria-current
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 140) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            const href = link.getAttribute('href');
            if (href && (href === `#${current}` || href.endsWith(`#${current}`))) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });

        // Scroll progress bar
        if (scrollProgress) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
            scrollProgress.style.width = scrollPercent + '%';
        }

        // Back to top visibility
        if (backToTop) {
            if (scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    });

    // Back to top click
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 5. Fade-in on Scroll (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // 6. Custom Cursor
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    if (cursor && follower) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
            follower.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
        });
        document.querySelectorAll('a, button, .portfolio-item').forEach(link => {
            link.addEventListener('mouseenter', () => {
                cursor.style.transform += ' scale(2)';
                follower.style.transform += ' scale(1.5)';
                cursor.style.background = 'rgba(20, 184, 166, 0.5)';
            });
            link.addEventListener('mouseleave', () => {
                cursor.style.transform = cursor.style.transform.replace(' scale(2)', '');
                follower.style.transform = follower.style.transform.replace(' scale(1.5)', '');
                cursor.style.background = 'var(--accent-teal)';
            });
        });
    }

    // 7. Lottie Animation
    if (typeof lottie !== 'undefined' && document.getElementById('lottie-cartoon')) {
        lottie.loadAnimation({
            container: document.getElementById('lottie-cartoon'),
            renderer: 'svg', loop: true, autoplay: true,
            path: 'https://assets5.lottiefiles.com/packages/lf20_iv4dsx3q.json'
        });
    }

    // 8. Mobile Menu Toggle (Top Navbar Dropdown Panel)
    const navHamburger = document.getElementById('navHamburger');
    const navDropdownPanel = document.getElementById('navDropdownPanel');

    function closeNavDropdown() {
        if (!navDropdownPanel) return;
        navDropdownPanel.classList.remove('active');
        navDropdownPanel.setAttribute('aria-hidden', 'true');
        if (navHamburger) {
            navHamburger.classList.remove('active');
            navHamburger.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
    }

    function openNavDropdown() {
        if (!navDropdownPanel) return;
        navDropdownPanel.classList.add('active');
        navDropdownPanel.setAttribute('aria-hidden', 'false');
        if (navHamburger) {
            navHamburger.classList.add('active');
            navHamburger.setAttribute('aria-expanded', 'true');
        }
        document.body.style.overflow = 'hidden';
    }

    if (navHamburger && navDropdownPanel) {
        navHamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navDropdownPanel.classList.contains('active');
            if (isOpen) {
                closeNavDropdown();
            } else {
                openNavDropdown();
            }
        });

        // Close on link click inside dropdown
        navDropdownPanel.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeNavDropdown();
            });
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (navDropdownPanel.classList.contains('active')) {
                if (!navDropdownPanel.contains(e.target) && !navHamburger.contains(e.target)) {
                    closeNavDropdown();
                }
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navDropdownPanel.classList.contains('active')) {
                closeNavDropdown();
            }
        });
    }

    // 9. Contact Form with EmailJS
    const contactForm = document.getElementById('portfolio-contact-form');
    const formStatus = document.getElementById('form-status');
    if (contactForm) {
        const PUBLIC_KEY = "SfkXwzBeZdSWrjK8_";
        const SERVICE_ID = "service_uxve4km";
        const TEMPLATE_ID = "template_xav24fb";
        emailjs.init(PUBLIC_KEY);
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const timeInput = document.getElementById('contact-time');
            if (timeInput) timeInput.value = new Date().toLocaleString();
            const submitBtn = document.getElementById('submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            formStatus.style.display = 'none';
            formStatus.style.opacity = '1';
            emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, this)
                .then(function () {
                    submitBtn.textContent = 'Message Sent! ✅';
                    submitBtn.style.background = '#10b981';
                    formStatus.textContent = 'Thank you! Your message has been sent to Bacha.';
                    formStatus.style.display = 'block';
                    formStatus.className = 'status-message success visible';
                    contactForm.reset();
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                        formStatus.style.display = 'none';
                    }, 6000);
                }, function (error) {
                    console.error('EmailJS Error:', error);
                    submitBtn.textContent = 'Failed to Send ❌';
                    submitBtn.style.background = '#ef4444';
                    formStatus.textContent = 'Connection Error. Please try WhatsApp.';
                    formStatus.style.display = 'block';
                    formStatus.className = 'status-message error visible';
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                    }, 4000);
                });
        });
    }

    // 10. Portfolio Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.textContent.toLowerCase().trim();
            portfolioItems.forEach(item => {
                // Reset any active parallax transform variables on filter change
                const stage = item.querySelector('.device-stage');
                if (stage) {
                    stage.style.setProperty('--rx', '0deg');
                    stage.style.setProperty('--ry', '0deg');
                }

                const category = (item.dataset.category || 
                                  (item.querySelector('.project-card-category') ? item.querySelector('.project-card-category').textContent : '') ||
                                  (item.querySelector('p') ? item.querySelector('p').textContent : '')).toLowerCase();

                if (filterValue === 'all' || category.includes(filterValue)) {
                    item.style.display = 'flex';
                    item.classList.add('fade-up');
                    setTimeout(() => item.classList.add('visible'), 10);
                } else {
                    item.style.display = 'none';
                    item.classList.remove('visible');
                }
            });
        });
    });

    // 11. Magnetic Button Effect
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', function (e) {
            const pos = this.getBoundingClientRect();
            const x = e.pageX - pos.left - pos.width / 2;
            const y = e.pageY - pos.top - pos.height / 2;
            this.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseout', function () {
            this.style.transform = 'translate(0, 0)';
        });
    });

    // 12. Floating Device Stage Pointer Parallax (Desktop only, fine pointer & hover)
    const supportsParallax = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (supportsParallax && !prefersReducedMotion) {
        const stages = document.querySelectorAll('.device-stage');
        const MAX_PARALLAX_DEG = 6; // Maximum 6 degrees per axis

        stages.forEach(stage => {
            let cachedRect = null;
            let rafId = null;
            let targetRx = 0;
            let targetRy = 0;

            function updateParallax() {
                stage.style.setProperty('--rx', `${targetRx.toFixed(2)}deg`);
                stage.style.setProperty('--ry', `${targetRy.toFixed(2)}deg`);
                rafId = null;
            }

            stage.addEventListener('pointerenter', () => {
                cachedRect = stage.getBoundingClientRect();
            });

            stage.addEventListener('pointermove', (e) => {
                if (!cachedRect) {
                    cachedRect = stage.getBoundingClientRect();
                }
                const mouseX = e.clientX - cachedRect.left;
                const mouseY = e.clientY - cachedRect.top;
                const centerX = cachedRect.width / 2;
                const centerY = cachedRect.height / 2;

                // Normalized cursor offset: -1.0 to 1.0
                const normX = Math.max(-1, Math.min(1, (mouseX - centerX) / centerX));
                const normY = Math.max(-1, Math.min(1, (mouseY - centerY) / centerY));

                targetRx = -normY * MAX_PARALLAX_DEG;
                targetRy = normX * MAX_PARALLAX_DEG;

                if (!rafId) {
                    rafId = requestAnimationFrame(updateParallax);
                }
            });

            stage.addEventListener('pointerleave', () => {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
                cachedRect = null;
                stage.style.setProperty('--rx', '0deg');
                stage.style.setProperty('--ry', '0deg');
            });
        });
    }

    // 13. Theme Toggle (Top Navbar)
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    if (themeToggle) {
        const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
        body.setAttribute('data-theme', savedTheme);
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('portfolio-theme', newTheme);
            themeToggle.style.transform = 'scale(0.9)';
            setTimeout(() => { themeToggle.style.transform = ''; }, 300);
        });
    }


    // 15. AI Chatbot Logic
    const chatbot = document.getElementById('chatbot');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotBody = document.getElementById('chatbot-body');
    const suggestedQuestionsDiv = document.getElementById('suggested-questions');

    if (chatbotToggle) {
        const bachaKnowledge = {
            profile: {
                name: "Bacha Hussain",
                location: "Lahore, Pakistan",
                education: "Computer Science Student at Punjab University",
                role: "Full Stack Web Developer"
            },
            domains: {
                fullstack: {
                    keywords: ["full stack", "fullstack", "mern", "web app", "application", "complete website"],
                    response: "Bacha is a Full Stack Web Developer specializing in building complete web applications. He creates pixel-perfect frontends and robust backends using React, Node.js, MongoDB and Next.js."
                },
                frontend: {
                    keywords: ["frontend", "front end", "react", "nextjs", "next.js", "tailwind", "html", "css", "javascript", "ui", "ux", "design", "responsive"],
                    response: "For frontend development, Bacha specializes in React.js, Next.js 14, TypeScript, Tailwind CSS, and Framer Motion animations. He builds beautiful, responsive, and high-performance user interfaces."
                },
                backend: {
                    keywords: ["backend", "back end", "node", "nodejs", "express", "api", "rest", "server", "authentication", "auth"],
                    response: "On the backend, Bacha builds with Node.js, Express.js, and REST APIs. He also works with NextAuth.js for authentication and Firebase for backend services."
                },
                database: {
                    keywords: ["database", "mongodb", "mysql", "firebase", "firestore", "data", "sql"],
                    response: "Bacha works with MongoDB, MySQL, and Firebase Firestore for database solutions. He designs scalable data architectures for web applications of all sizes."
                },
                ai: {
                    keywords: ["ai", "artificial intelligence", "chatbot", "gemini", "integration", "machine learning"],
                    response: "Bacha integrates AI features into web applications including Google Gemini Pro chatbots, AI-powered community support systems, and smart automation features."
                },
                projects: {
                    keywords: ["project", "portfolio", "work", "built", "example", "demo", "live"],
                    response: "Bacha's best project is PUNJ-AFG Connect — a full stack community portal built with Next.js 14, TypeScript, Firebase, and Google Gemini AI chatbot. You can see it live at afg-student-community.vercel.app. He also built a Digital Agency website, Gemstone Store, and Gym Management System."
                },
                ecommerce: {
                    keywords: ["ecommerce", "e-commerce", "shop", "store", "shopify", "woocommerce", "online store"],
                    response: "Bacha builds custom ecommerce websites using React, Node.js, MongoDB and integrates payment systems like Stripe and PayPal. He can build complete online stores with admin dashboards."
                },
                hire: {
                    keywords: ["hire", "contact", "work together", "project", "freelance", "upwork", "available"],
                    response: "Bacha is available for freelance projects on Upwork! He specializes in Full Stack web development starting at $15/hr. You can contact him via WhatsApp or email to discuss your project requirements."
                }
            },
            fallbacks: [
                "Great question! Bacha specializes in Full Stack Web Development. Would you like to know more about his React skills or backend expertise?",
                "I'm not sure about that specific topic, but Bacha would love to discuss your project! Want his contact details?",
                "I focus on Bacha's professional expertise in Full Stack Web Development. What would you like to know about his skills or projects?"
            ],
            questions: [
                "What is your tech stack?",
                "Show me your best project",
                "Can you build an ecommerce site?",
                "Do you work with React & Node.js?",
                "What is your hourly rate?",
                "How can I hire you?"
            ]
        };

        let chatHistory = [];

        function renderSuggestions() {
            suggestedQuestionsDiv.innerHTML = '';
            [...bachaKnowledge.questions].sort(() => 0.5 - Math.random()).slice(0, 3).forEach(q => {
                const btn = document.createElement('button');
                btn.className = 'suggestion-btn';
                btn.textContent = q;
                btn.onclick = () => { chatbotInput.value = q; handleChat(); };
                suggestedQuestionsDiv.appendChild(btn);
            });
        }

        chatbotToggle.addEventListener('click', () => {
            chatbot.classList.add('active');
            chatbotToggle.style.transform = 'scale(0)';
            setTimeout(() => chatbotToggle.style.display = 'none', 300);
            renderSuggestions();
        });

        chatbotClose.addEventListener('click', () => {
            chatbot.classList.remove('active');
            chatbotToggle.style.display = 'flex';
            setTimeout(() => chatbotToggle.style.transform = 'scale(1)', 10);
        });

        function addMessage(text, sender) {
            const div = document.createElement('div');
            div.className = `chat-message ${sender}`;
            div.innerHTML = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: var(--accent-teal); text-decoration: underline;">$1</a>');
            chatbotBody.appendChild(div);
            chatbotBody.scrollTop = chatbotBody.scrollHeight;
            chatHistory.push({ sender, text });
        }

        function getAIResponse(input) {
            const low = input.toLowerCase();
            let resp = "";
            for (const d in bachaKnowledge.domains) {
                if (bachaKnowledge.domains[d].keywords.some(k => low.includes(k))) {
                    resp = bachaKnowledge.domains[d].response; break;
                }
            }
            if (!resp) {
                if (low.includes("rate") || low.includes("price") || low.includes("cost") || low.includes("charge"))
                    resp = "Bacha's hourly rate starts at $15/hr on Upwork. For fixed-price projects, rates vary depending on complexity. Basic websites start from $50 and full stack apps from $150.";
                else if (low.includes("contact") || low.includes("hire") || low.includes("whatsapp"))
                    resp = `You can hire Bacha on Upwork or contact him via WhatsApp at [+92 3126838112](https://wa.me/923126838112) or email hussainllc11@gmail.com.`;
                else if (low.includes("who") || low.includes("name") || low.includes("yourself") || low.includes("about"))
                    resp = `I am Bacha's AI assistant. Bacha Hussain is a Full Stack Web Developer based in Lahore, Pakistan. He specializes in React, Node.js, MongoDB, Next.js and AI integration.`;
                else if (low.includes("education") || low.includes("university") || low.includes("degree") || low.includes("study"))
                    resp = `Bacha is studying Bachelor of Computer Science at Punjab University, Lahore. He also has an Associate Degree in Computer Science and a Government-certified Amazon course certificate from NAVTTC.`;
            }
            if (!resp) resp = bachaKnowledge.fallbacks[Math.floor(Math.random() * bachaKnowledge.fallbacks.length)];
            const closures = [" Does this help?", " Anything else you'd like to know?", " Want more details?"];
            return resp + closures[Math.floor(Math.random() * closures.length)];
        }

        function handleChat() {
            const text = chatbotInput.value.trim();
            if (!text) return;
            addMessage(text, 'user');
            chatbotInput.value = '';
            const loading = document.createElement('div');
            loading.className = 'chat-message bot loading';
            loading.textContent = 'Thinking...';
            chatbotBody.appendChild(loading);
            chatbotBody.scrollTop = chatbotBody.scrollHeight;
            setTimeout(() => {
                loading.remove();
                addMessage(getAIResponse(text), 'bot');
                renderSuggestions();
            }, 800);
        }

        chatbotSend.addEventListener('click', handleChat);
        chatbotInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });
    }

    // 15a. Stats Counter Animation
    const statsSection = document.querySelector('.stats-bar-container');
    const stats = document.querySelectorAll('.stat-value');
    let animated = false;

    function countUp() {
        stats.forEach(stat => {
            const target = Number(stat.getAttribute('data-target')) || 0;
            const duration = 700; // milliseconds
            const stepTime = 15;
            const steps = Math.max(Math.round(duration / stepTime), 1);
            const increment = target / steps;
            let count = 0;

            const updateCount = () => {
                count += increment;
                stat.innerText = Math.min(Math.ceil(count), target);
                if (count < target) {
                    setTimeout(updateCount, stepTime);
                }
            };
            updateCount();
        });
    }

    const statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !animated) {
            countUp();
            animated = true;
        }
    }, { threshold: 0.25 });

    if (statsSection) {
        statsObserver.observe(statsSection);
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            countUp();
            animated = true;
        }
    }

    // 15b. FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(faq => faq.classList.remove('active'));

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // 16. Career Journey Timeline Reveal Animation
    const scrollRevealItems = document.querySelectorAll('.timeline-block, .fade-up');
    const scrollRevealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, scrollRevealOptions);

    scrollRevealItems.forEach(item => {
        scrollRevealObserver.observe(item);
    });

    // 17. Project Galaxy (3D Sphere)
    initProjectGalaxy();
});

// Project Galaxy Implementation
function initProjectGalaxy() {
    const container = document.getElementById('project-galaxy');
    if (!container) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // GALAXY GROUP
    const galaxy = new THREE.Group();
    scene.add(galaxy);

    // DUMMY PROJECT TEXTURES (Using Placeholder colors/symbols for high-end look)
    const projectColors = [0x14b8a6, 0x0d9488, 0x1e293b, 0x0f172a, 0x334155];
    const cardCount = 35;
    const radius = 4.5;

    for (let i = 0; i < cardCount; i++) {
        // Fibonacci Sphere algorithm for even distribution
        const lat = Math.acos(1 - 2 * (i / cardCount));
        const lon = Math.PI * (1 + Math.sqrt(5)) * i;

        const x = radius * Math.sin(lat) * Math.cos(lon);
        const y = radius * Math.sin(lat) * Math.sin(lon);
        const z = radius * Math.cos(lat);

        const geometry = new THREE.PlaneGeometry(0.8, 0.5);
        const material = new THREE.MeshBasicMaterial({
            color: projectColors[i % projectColors.length],
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const card = new THREE.Mesh(geometry, material);
        card.position.set(x, y, z);
        card.lookAt(0, 0, 0); // All cards face the center initially

        // Add a simple border/glow effect per card
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x14b8a6, transparent: true, opacity: 0.5 });
        const border = new THREE.LineSegments(edges, lineMaterial);
        card.add(border);

        galaxy.add(card);
    }

    // STARDUST BACKGROUND
    const starGeometry = new THREE.BufferGeometry();
    const starCoords = [];
    for (let i = 0; i < 1500; i++) {
        starCoords.push((Math.random() - 0.5) * 20);
        starCoords.push((Math.random() - 0.5) * 20);
        starCoords.push((Math.random() - 0.5) * 20);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0x14b8a6, size: 0.02, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    camera.position.z = 8;

    // INTERACTION & ANIMATION
    let mouseX = 0;
    let targetRotationY = 0;

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
        targetRotationY = mouseX * 0.5;
    });

    function animate() {
        requestAnimationFrame(animate);

        galaxy.rotation.y += 0.003; // Base rotation
        galaxy.rotation.x += 0.001;

        stars.rotation.y += 0.0005;

        renderer.render(scene, camera);
    }

    animate();

    // RESPONSIVE RESIZE
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

/* ================================================================
   3D TECH SPHERE — pure CSS transforms + vanilla JS
   ================================================================
   - 16 items, Fibonacci sphere distribution
   - Radius: 170 px
   - Rotation period: ~40 s (auto), mouse nudges direction/speed
   - Depth-based scale (0.6–1.2) and opacity (0.35–1.0)
   - IntersectionObserver + visibilitychange pause for performance
   - Desktop (≥1024 px) only; mobile keeps the marquee
   ================================================================ */
(function initTechSphere() {

    /* --- guard: skip if mobile or reduced-motion --- */
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchPrimary = window.matchMedia('(hover: none)').matches;
    const isDesktop      = window.matchMedia('(min-width: 1024px)').matches;

    if (prefersReduced || isTouchPrimary || !isDesktop) return;

    /* --- constants --- */
    const TECHS = [
        'React','Next.js','Node.js','Express',
        'MongoDB','MySQL','REST APIs','JavaScript',
        'HTML5','CSS3','Tailwind','Git',
        'GitHub','Gemini AI','Firebase','TypeScript'
    ];
    const N          = TECHS.length;      // 16
    const R          = 170;               // sphere radius px
    const ROT_PERIOD = 40000;             // ms for one full auto revolution
    const BASE_SPEED = (2 * Math.PI) / ROT_PERIOD; // rad/ms

    /* depth → visual mapping */
    const SCALE_MIN   = 0.6,   SCALE_MAX   = 1.2;
    const OPACITY_MIN = 0.35,  OPACITY_MAX = 1.0;

    /* --- DOM refs --- */
    const scene   = document.getElementById('techSphere');
    const wrapper = document.getElementById('techSphereWrapper');
    if (!scene || !wrapper) return;

    /* --- build Fibonacci sphere positions --- */
    // phi_i = acos(1 - 2*(i+0.5)/N)
    // theta_i = PI*(1+sqrt(5))*(i+0.5)
    const GOLDEN = Math.PI * (1 + Math.sqrt(5));

    // items[i] = { el, x0, y0, z0, cx, cy, cz }
    // x0/y0/z0 = current world coords (updated per frame)
    const items = TECHS.map((label, i) => {
        const phi   = Math.acos(1 - 2 * (i + 0.5) / N);
        const theta = GOLDEN * (i + 0.5);
        const x0 = R * Math.sin(phi) * Math.cos(theta);
        const y0 = R * Math.sin(phi) * Math.sin(theta);
        const z0 = R * Math.cos(phi);

        const el = document.createElement('span');
        el.className   = 'sphere-tag';
        el.textContent = label;
        scene.appendChild(el);

        return { el, x: x0, y: y0, z: z0, x0, y0, z0 };
    });

    /* --- rotation state --- */
    // We rotate around Y (horizontal) and X (vertical) axes.
    // angY / angX are the current accumulated rotation angles.
    let angY = 0, angX = 0.25; // slight initial tilt so items aren't stacked

    // Auto-rotation velocities (rad/ms)
    let velY = BASE_SPEED;
    let velX = BASE_SPEED * 0.1;

    // Target velocities (mouse nudge eases toward these)
    let tgtVelY = velY;
    let tgtVelX = velX;

    /* --- state flags --- */
    let paused        = false;  // IntersectionObserver / tab hidden
    let hoveredItem   = false;  // true while mouse is over a chip
    let rafId         = null;
    let lastTime      = null;

    /* --- helper: rotate a 3-vector by angY (Y-axis) then angX (X-axis) --- */
    function rotateYX(x, y, z, ry, rx) {
        // Y-axis rotation
        const cosY = Math.cos(ry), sinY = Math.sin(ry);
        let x1 =  cosY * x + sinY * z;
        let z1 = -sinY * x + cosY * z;
        let y1 =  y;
        // X-axis rotation
        const cosX = Math.cos(rx), sinX = Math.sin(rx);
        let y2 =  cosX * y1 - sinX * z1;
        let z2 =  sinX * y1 + cosX * z1;
        return { x: x1, y: y2, z: z2 };
    }

    /* --- render one frame --- */
    function render(dt) {
        if (!hoveredItem) {
            // Ease velocities toward targets
            velY += (tgtVelY - velY) * 0.05;
            velX += (tgtVelX - velX) * 0.05;

            angY += velY * dt;
            angX += velX * dt;
        }

        // Rotate all points and apply CSS transforms
        for (let i = 0; i < N; i++) {
            const item = items[i];
            const { x, y, z } = rotateYX(item.x0, item.y0, item.z0, angY, angX);

            // Cache rotated coords for next frame (not strictly needed since
            // we always rotate from x0/y0/z0, but store for debuggability)
            item.x = x; item.y = y; item.z = z;

            // Depth: z ranges -R..+R; normalize to 0..1 (1 = closest to viewer)
            const depth = (z + R) / (2 * R);               // 0 = back, 1 = front
            const scale   = SCALE_MIN + depth * (SCALE_MAX - SCALE_MIN);
            const opacity = OPACITY_MIN + depth * (OPACITY_MAX - OPACITY_MIN);

            // translate3d moves chip from center (top:50%,left:50%) to its sphere pos
            // We negate y because CSS y-axis is inverted
            item.el.style.transform = `translate3d(${x}px,${-y}px,${z}px) translate(-50%,-50%) scale(${scale.toFixed(3)})`;
            item.el.style.opacity   = opacity.toFixed(3);
            item.el.style.zIndex    = Math.round(depth * 100);
        }
    }

    /* --- rAF loop --- */
    function loop(ts) {
        if (paused || hoveredItem) {
            lastTime = null;
            rafId = requestAnimationFrame(loop);
            return;
        }
        if (lastTime === null) lastTime = ts;
        const dt = Math.min(ts - lastTime, 50); // cap at 50 ms to avoid huge jumps
        lastTime = ts;
        render(dt);
        rafId = requestAnimationFrame(loop);
    }

    function startLoop() {
        if (!rafId) rafId = requestAnimationFrame(loop);
    }
    function stopLoop() {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; lastTime = null; }
    }

    /* --- IntersectionObserver: pause when sphere is off-screen --- */
    const observer = new IntersectionObserver(entries => {
        paused = !entries[0].isIntersecting;
        if (!paused) startLoop(); // resume when back in view
    }, { threshold: 0.05 });
    observer.observe(wrapper);

    /* --- Tab visibility: pause when tab is hidden --- */
    document.addEventListener('visibilitychange', () => {
        paused = document.hidden;
        if (!paused) startLoop();
    });

    /* --- Mouse interaction on the wrapper --- */
    let mouseX = 0, mouseY = 0;
    const MOUSE_INFLUENCE = 0.0004; // max extra rad/ms per pixel-fraction

    wrapper.addEventListener('mousemove', e => {
        const rect = wrapper.getBoundingClientRect();
        // Normalised -0.5 .. 0.5 from center
        mouseX = (e.clientX - rect.left - rect.width  / 2) / rect.width;
        mouseY = (e.clientY - rect.top  - rect.height / 2) / rect.height;

        // Nudge: mouse X shifts Y-rotation speed, mouse Y shifts X-rotation speed
        tgtVelY = BASE_SPEED + mouseX * MOUSE_INFLUENCE * 1000;
        tgtVelX = BASE_SPEED * 0.1 - mouseY * MOUSE_INFLUENCE * 500;
    });

    wrapper.addEventListener('mouseleave', () => {
        // Ease back to auto rotation
        tgtVelY = BASE_SPEED;
        tgtVelX = BASE_SPEED * 0.1;
    });

    /* --- Hover on individual chip: pause rotation, add glow via CSS --- */
    scene.addEventListener('mouseover', e => {
        if (e.target.classList.contains('sphere-tag')) {
            hoveredItem = true;
        }
    });
    scene.addEventListener('mouseout', e => {
        if (e.target.classList.contains('sphere-tag')) {
            hoveredItem = false;
            lastTime = null; // avoid dt spike on resume
        }
    });

    /* --- kick off --- */
    startLoop();

})();