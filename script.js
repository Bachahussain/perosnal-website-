/**
 * Portfolio Website Logic - Enhanced Professional Version
 */
document.addEventListener('DOMContentLoaded', () => {

    // 1. Typing Animation
    const typingElement = document.getElementById('typing-element');
    const roles = ['Front-End Developer', 'Amazon Expert', 'Database Enthusiast', 'Freelancer'];
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
        document.querySelectorAll('a, button, .portfolio-item, .vlog-gallery-item').forEach(link => {
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

    // 14. Vlog Gallery Lightbox
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const galleryItems = document.querySelectorAll('.vlog-gallery-item');
    let currentLightboxIndex = 0;

    function openLightbox(index) {
        currentLightboxIndex = index;
        const item = galleryItems[index];
        const img = item.querySelector('img');
        const caption = item.getAttribute('data-caption') || '';
        lightboxImg.src = img.src;
        lightboxCaption.textContent = caption;
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function navigateLightbox(direction) {
        currentLightboxIndex = (currentLightboxIndex + direction + galleryItems.length) % galleryItems.length;
        const item = galleryItems[currentLightboxIndex];
        const img = item.querySelector('img');
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = img.src;
            lightboxCaption.textContent = item.getAttribute('data-caption') || '';
            lightboxImg.style.opacity = '1';
        }, 200);
    }

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => navigateLightbox(1));

    // Close lightbox on background click
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });
    }

    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });

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
            profile: { name: "Bacha Hussin", location: "Lahore, Pakistan", education: "BSC Student at PUCIT" },
            domains: {
                computer_science: {
                    keywords: ["programming", "coding", "software", "development", "data", "database", "algorithm", "python", "javascript", "html", "css", "mongodb"],
                    response: "Bacha's CS background at PUCIT has equipped him with deep knowledge in Software Engineering and Database Management. He specializes in Full-Stack development (JS, MongoDB)."
                },
                amazon_hunting: {
                    keywords: ["hunting", "product hunting", "niche", "research", "opportunity", "market analysis", "helium 10", "jungle scout"],
                    response: "Product Hunting is Bacha's forte. He uses Helium 10 and Jungle Scout to identify high-demand, low-competition niches with focus on ROI and data-driven scoring."
                },
                amazon_sourcing: {
                    keywords: ["sourcing", "supplier", "alibaba", "1688", "factory", "logistics", "shipping"],
                    response: "For Product Sourcing, Bacha specializes in identifying suppliers on Alibaba. He handles negotiation, quality control, and logistics planning."
                },
                amazon_listing: {
                    keywords: ["listing", "optimization", "keywords", "seo", "a+ content", "ebc", "titles", "bullet points"],
                    response: "Listing Optimization is where Bacha blends SEO with psychology. He crafts high-converting titles and descriptions using high-volume keywords."
                },
                amazon_design: {
                    keywords: ["designing", "product design", "ui", "ux", "visual", "brand", "packaging", "images"],
                    response: "Product Designing & Brand Visuals: Bacha coordinates high-quality product photography, A+ content design, and premium brand stores."
                },
                ecommerce_general: {
                    keywords: ["ecommerce", "e-commerce", "selling", "online business", "fba", "fbm", "wholesale", "private label"],
                    response: "Bacha handles Amazon Private Label and FBA Wholesale with end-to-end support from brand registry to PPC management."
                }
            },
            references: {
                amazon_university: "Check out [Amazon Seller University](https://sell.amazon.com/learn) or the [Amazon Ads Learning Console](https://learningconsole.amazonadsystem.com/) for professional seller education."
            },
            fallbacks: [
                "Great question! I'm gathering more details. Would you like to hear about his Amazon expertise or development skills?",
                "I'm not sure about that, but Bacha would love to discuss it! Want his contact details?",
                "I focus on Bacha's professional domain (CS & Amazon Expert). What else would you like to know?"
            ],
            questions: ["Tell me about Product Hunting", "What is your CS background?", "Help with Amazon Listing SEO", "How do you handle Sourcing?", "Show Amazon University links", "How can I hire you?"]
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
                if (low.includes("university") || low.includes("learn") || low.includes("reference"))
                    resp = bachaKnowledge.references.amazon_university;
                else if (low.includes("contact") || low.includes("hire") || low.includes("whatsapp"))
                    resp = `Contact Bacha via WhatsApp at [+92 3126838112](https://wa.me/3126838112) or email hussainllc11@gmail.com.`;
                else if (low.includes("who") || low.includes("name") || low.includes("yourself"))
                    resp = `I am Bacha's AI assistant. He's a Developer and Amazon Expert based in Lahore, studying at PUCIT.`;
            }
            if (!resp) resp = bachaKnowledge.fallbacks[Math.floor(Math.random() * bachaKnowledge.fallbacks.length)];
            const closures = [" Does this help?", " Anything else you'd like to explore?", " Need more details?"];
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
});
