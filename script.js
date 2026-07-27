// =============================================================================
// UTILITIES
// =============================================================================

function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

// =============================================================================
// CUSTOM CURSOR
// =============================================================================

const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

if (cursorDot && cursorRing && window.matchMedia('(hover: hover)').matches) {
    let cursorX = 0, cursorY = 0;
    let ringX   = 0, ringY   = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    });

    (function animateRing() {
        ringX += (cursorX - ringX) * 0.1;
        ringY += (cursorY - ringY) * 0.1;
        cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
        requestAnimationFrame(animateRing);
    })();

    document.querySelectorAll('a, button, .project-card, .skill-tag, .contact-method, input, textarea')
        .forEach(el => {
            el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-hover'));
        });

    document.addEventListener('mousedown', () => cursorDot.classList.add('cursor-click'));
    document.addEventListener('mouseup',   () => cursorDot.classList.remove('cursor-click'));
}

// =============================================================================
// MAGNETIC BUTTONS
// =============================================================================

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'background 0.2s, box-shadow 0.2s, border-color 0.2s';
    });

    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width  / 2);
        const dy = e.clientY - (rect.top  + rect.height / 2);
        btn.style.transform = `translate(${dx * 0.28}px, ${dy * 0.28}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.2s, box-shadow 0.2s, border-color 0.2s';
        btn.style.transform  = '';
    });
});

// =============================================================================
// TYPEWRITER (HERO)
// =============================================================================

const typedEl = document.getElementById('typed-role');

if (typedEl) {
    const ROLES = ['Software Engineer', 'Full-Stack Developer', 'ML Practitioner', 'Systems Engineer'];
    const TYPE_SPEED   = 95;
    const DELETE_SPEED = 45;
    const PAUSE_MS     = 2000;

    let roleIndex  = 0;
    let charIndex  = 0;
    let isDeleting = false;

    function typeWriter() {
        const currentRole = ROLES[roleIndex];

        typedEl.textContent = isDeleting
            ? currentRole.substring(0, charIndex - 1)
            : currentRole.substring(0, charIndex + 1);

        charIndex += isDeleting ? -1 : 1;

        if (!isDeleting && charIndex === currentRole.length) {
            setTimeout(() => { isDeleting = true; typeWriter(); }, PAUSE_MS);
            return;
        }

        if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex  = (roleIndex + 1) % ROLES.length;
        }

        setTimeout(typeWriter, isDeleting ? DELETE_SPEED : TYPE_SPEED);
    }

    typeWriter();
}

// =============================================================================
// PARTICLE CANVAS (HERO)
// =============================================================================

const heroCanvas = document.getElementById('hero-canvas');

if (heroCanvas) {
    const ctx         = heroCanvas.getContext('2d');
    const heroSection = document.querySelector('.hero');

    const PARTICLE_COUNT        = 55;
    const PARTICLE_CONNECT_DIST = 130;
    const PARTICLE_REPEL_DIST   = 130;
    const PARTICLE_MAX_SPEED    = 2.5;
    const PARTICLE_BASE_SPEED   = 0.45;

    function resizeCanvas() {
        heroCanvas.width  = heroSection.offsetWidth;
        heroCanvas.height = heroSection.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', debounce(resizeCanvas, 200));

    class Particle {
        constructor() { this.init(); }

        init() {
            this.x      = Math.random() * heroCanvas.width;
            this.y      = Math.random() * heroCanvas.height;
            this.baseVx = (Math.random() - 0.5) * PARTICLE_BASE_SPEED;
            this.baseVy = (Math.random() - 0.5) * PARTICLE_BASE_SPEED;
            this.vx     = this.baseVx;
            this.vy     = this.baseVy;
            this.radius = Math.random() * 1.5 + 0.5;
            this.alpha  = Math.random() * 0.45 + 0.15;
        }

        update(mouseX, mouseY) {
            if (mouseX !== null) {
                const dx   = this.x - mouseX;
                const dy   = this.y - mouseY;
                const dist = Math.hypot(dx, dy);

                if (dist < PARTICLE_REPEL_DIST) {
                    const force = (PARTICLE_REPEL_DIST - dist) / PARTICLE_REPEL_DIST;
                    this.vx += (dx / dist) * force * 0.9;
                    this.vy += (dy / dist) * force * 0.9;
                }
            }

            this.vx = this.vx * 0.94 + this.baseVx * 0.06;
            this.vy = this.vy * 0.94 + this.baseVy * 0.06;

            const speed = Math.hypot(this.vx, this.vy);
            if (speed > PARTICLE_MAX_SPEED) {
                this.vx = (this.vx / speed) * PARTICLE_MAX_SPEED;
                this.vy = (this.vy / speed) * PARTICLE_MAX_SPEED;
            }

            this.x = (this.x + this.vx + heroCanvas.width)  % heroCanvas.width;
            this.y = (this.y + this.vy + heroCanvas.height) % heroCanvas.height;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${this.alpha})`;
            ctx.fill();
        }
    }

    const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    let particleMouseX = null;
    let particleMouseY = null;

    heroSection.addEventListener('mousemove', (e) => {
        const rect     = heroCanvas.getBoundingClientRect();
        particleMouseX = e.clientX - rect.left;
        particleMouseY = e.clientY - rect.top;
    });
    heroSection.addEventListener('mouseleave', () => {
        particleMouseX = null;
        particleMouseY = null;
    });

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dist = Math.hypot(
                    particles[i].x - particles[j].x,
                    particles[i].y - particles[j].y
                );

                if (dist < PARTICLE_CONNECT_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - dist / PARTICLE_CONNECT_DIST) * 0.18})`;
                    ctx.lineWidth   = 1;
                    ctx.stroke();
                }
            }
        }
    }

    let isHeroVisible = true;
    const heroVisibilityObserver = new IntersectionObserver(([entry]) => {
        isHeroVisible = entry.isIntersecting;
    });
    heroVisibilityObserver.observe(heroSection);

    (function animateCanvas() {
        if (isHeroVisible) {
            ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
            particles.forEach(p => { p.update(particleMouseX, particleMouseY); p.draw(); });
            drawConnections();
        }
        requestAnimationFrame(animateCanvas);
    })();
}

// =============================================================================
// PARALLAX (HERO)
// =============================================================================

const parallaxItems = [
    { el: document.querySelector('.hero-eyebrow'), rate: 0.12 },
    { el: document.querySelector('.hero h1'),      rate: 0.22 },
    { el: document.querySelector('.hero-title'),   rate: 0.30 },
    { el: document.querySelector('.hero-sub'),     rate: 0.36 },
    { el: document.querySelector('.hero-bio'),     rate: 0.42 },
    { el: document.querySelector('.hero-ctas'),    rate: 0.48 },
    { el: document.querySelector('.hero-links'),   rate: 0.54 },
].filter(item => item.el !== null);

let parallaxTicking = false;

window.addEventListener('scroll', () => {
    if (!parallaxTicking) {
        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            parallaxItems.forEach(({ el, rate }) => {
                el.style.transform = `translateY(${scrollY * rate}px)`;
            });
            parallaxTicking = false;
        });
        parallaxTicking = true;
    }
}, { passive: true });

// =============================================================================
// NAV HIGHLIGHTING
// =============================================================================

const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const navSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => link.classList.remove('nav-active'));
            const activeLink = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
            if (activeLink) activeLink.classList.add('nav-active');
        }
    });
}, { rootMargin: '-15% 0px -75% 0px' });

document.querySelectorAll('section[id]').forEach(section => navSectionObserver.observe(section));

// =============================================================================
// SCROLL ANIMATIONS
// =============================================================================

const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        entry.target.classList.toggle('visible', entry.isIntersecting);
    });
}, { threshold: 0.1 });

document.querySelectorAll('[data-animate]').forEach(el => animateObserver.observe(el));

const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const children = entry.target.querySelectorAll('[data-stagger]');

        if (entry.isIntersecting) {
            children.forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), i * 110);
            });
        } else {
            children.forEach(el => el.classList.remove('visible'));
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('[data-stagger-container]').forEach(el => staggerObserver.observe(el));

// =============================================================================
// SKILL TAG ANIMATION
// =============================================================================

const skillsGrid = document.querySelector('.skills-grid');

if (skillsGrid) {
    const skillTagObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const tags = entry.target.querySelectorAll('.skill-tag');

            if (entry.isIntersecting) {
                tags.forEach((tag, i) => {
                    setTimeout(() => tag.classList.add('visible'), i * 55);
                });
            } else {
                tags.forEach(tag => tag.classList.remove('visible'));
            }
        });
    }, { threshold: 0.2 });

    skillTagObserver.observe(skillsGrid);
}

// =============================================================================
// 3D CARD TILT
// =============================================================================

document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect    = card.getBoundingClientRect();
        const rotateX = ((e.clientY - rect.top  - rect.height / 2) / rect.height) * -8;
        const rotateY = ((e.clientX - rect.left - rect.width  / 2) / rect.width)  *  8;

        card.style.transition = 'box-shadow 0.25s, border-color 0.25s';
        card.style.transform  = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.45s ease, box-shadow 0.25s, border-color 0.25s';
        card.style.transform  = '';
    });
});

// =============================================================================
// TIMELINE LINE DRAW
// =============================================================================

const timelineEl = document.querySelector('.timeline');

if (timelineEl) {
    const timelineObserver = new IntersectionObserver(([entry]) => {
        entry.target.classList.toggle('tl-visible', entry.isIntersecting);
    }, { threshold: 0.1 });

    timelineObserver.observe(timelineEl);
}
