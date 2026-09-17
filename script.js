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

    // 2. Scroll Spy & Active Nav Highlight
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    // 3. Scroll Progress Bar
    const scrollProgress = document.getElementById('scroll-progress');

    // 4. Back to Top Button
    const backToTop = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        // Scroll spy
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - sectionHeight / 3) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });

        // Scroll progress bar
        if (scrollProgress) {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            scrollProgress.style.width = scrollPercent + '%';
        }

        // Back to top visibility
        if (backToTop) {
            if (window.scrollY > 500) {
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

    // 8. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                    const icon = mobileToggle.querySelector('i');
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-xmark');
                }
            });
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
            const filterValue = btn.textContent.toLowerCase();
            portfolioItems.forEach(item => {
                const category = item.querySelector('p').textContent.toLowerCase();
                if (filterValue === 'all' || category.includes(filterValue)) {
                    item.style.display = 'block';
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

    // 12. Card Tilt Effect
    portfolioItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = item.getBoundingClientRect();
            const x = (e.clientX - left) / width;
            const y = (e.clientY - top) / height;
            item.style.transform = `perspective(1000px) rotateX(${(y - 0.5) * 10}deg) rotateY(${(x - 0.5) * -10}deg) scale3d(1.02,1.02,1.02)`;
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        });
    });

    // 13. Theme Toggle (now in sidebar)
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