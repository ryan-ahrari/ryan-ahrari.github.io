function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// === 1. Scroll animations (retriggerable) ===
const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        entry.target.classList.toggle('visible', entry.isIntersecting);
    });
}, { threshold: 0.1 });

document.querySelectorAll('[data-animate]').forEach(el => animateObserver.observe(el));

const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-stagger]').forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), i * 110);
            });
        } else {
            entry.target.querySelectorAll('[data-stagger]').forEach(el => {
                el.classList.remove('visible');
            });
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('[data-stagger-container]').forEach(el => staggerObserver.observe(el));

// === 2. Active nav highlighting ===
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => link.classList.remove('nav-active'));
            const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
            if (active) active.classList.add('nav-active');
        }
    });
}, { rootMargin: '-15% 0px -75% 0px' });

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// === 3. Typewriter hero effect ===
const typedEl = document.getElementById('typed-role');

if (typedEl) {
    const roles = ['Software Engineer', 'Full-Stack Developer', 'ML Practitioner', 'Systems Engineer'];
    let roleIndex = 0, charIndex = 0, isDeleting = false;

    function typeWriter() {
        const current = roles[roleIndex];
        typedEl.textContent = isDeleting
            ? current.substring(0, charIndex - 1)
            : current.substring(0, charIndex + 1);
        charIndex += isDeleting ? -1 : 1;

        if (!isDeleting && charIndex === current.length) {
            setTimeout(() => { isDeleting = true; typeWriter(); }, 2000);
            return;
        }
        if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
        }
        setTimeout(typeWriter, isDeleting ? 45 : 95);
    }
    typeWriter();
}

// === 4. Staggered skill tag animation ===
const skillsGrid = document.querySelector('.skills-grid');

if (skillsGrid) {
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.skill-tag').forEach((tag, i) => {
                    setTimeout(() => tag.classList.add('visible'), i * 55);
                });
            } else {
                entry.target.querySelectorAll('.skill-tag').forEach(tag => tag.classList.remove('visible'));
            }
        });
    }, { threshold: 0.2 });
    skillObserver.observe(skillsGrid);
}

// === 5. 3D card tilt ===
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const rotateX = ((e.clientY - rect.top - rect.height / 2) / rect.height) * -8;
        const rotateY = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 8;
        card.style.transition = 'box-shadow 0.25s, border-color 0.25s';
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.45s ease, box-shadow 0.25s, border-color 0.25s';
        card.style.transform = '';
    });
});

// === 6. Particle canvas ===
const canvas = document.getElementById('hero-canvas');

if (canvas) {
    const ctx = canvas.getContext('2d');
    const heroSection = document.querySelector('.hero');

    function resizeCanvas() {
        canvas.width = heroSection.offsetWidth;
        canvas.height = heroSection.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', debounce(resizeCanvas, 200));

    class Particle {
        constructor() { this.init(); }
        init() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.baseVx = (Math.random() - 0.5) * 0.45;
            this.baseVy = (Math.random() - 0.5) * 0.45;
            this.vx = this.baseVx;
            this.vy = this.baseVy;
            this.r = Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.45 + 0.15;
        }
        update(mx, my) {
            if (mx !== null) {
                const dx = this.x - mx, dy = this.y - my;
                const dist = Math.hypot(dx, dy);
                if (dist < 130) {
                    const force = (130 - dist) / 130;
                    this.vx += (dx / dist) * force * 0.9;
                    this.vy += (dy / dist) * force * 0.9;
                }
            }
            this.vx = this.vx * 0.94 + this.baseVx * 0.06;
            this.vy = this.vy * 0.94 + this.baseVy * 0.06;
            const spd = Math.hypot(this.vx, this.vy);
            if (spd > 2.5) { this.vx = (this.vx / spd) * 2.5; this.vy = (this.vy / spd) * 2.5; }
            this.x = (this.x + this.vx + canvas.width) % canvas.width;
            this.y = (this.y + this.vy + canvas.height) % canvas.height;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99,102,241,${this.alpha})`;
            ctx.fill();
        }
    }

    const particles = Array.from({ length: 55 }, () => new Particle());
    let mx = null, my = null;

    heroSection.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mx = e.clientX - rect.left;
        my = e.clientY - rect.top;
    });
    heroSection.addEventListener('mouseleave', () => { mx = null; my = null; });

    function drawLines() {
        const MAX = 130;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                if (dist < MAX) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99,102,241,${(1 - dist / MAX) * 0.18})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }

    let heroVisible = true;
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(heroSection);

    (function animate() {
        if (heroVisible) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(mx, my); p.draw(); });
            drawLines();
        }
        requestAnimationFrame(animate);
    })();
}

// === 7. Custom cursor ===
const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

if (cursorDot && cursorRing && window.matchMedia('(hover: hover)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        cursorDot.style.transform = `translate(${mx}px,${my}px)`;
    });

    (function animateRing() {
        rx += (mx - rx) * 0.1;
        ry += (my - ry) * 0.1;
        cursorRing.style.transform = `translate(${rx}px,${ry}px)`;
        requestAnimationFrame(animateRing);
    })();

    document.querySelectorAll('a, button, .project-card, .skill-tag, .contact-method, input, textarea').forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-hover'));
    });

    document.addEventListener('mousedown', () => cursorDot.classList.add('cursor-click'));
    document.addEventListener('mouseup',   () => cursorDot.classList.remove('cursor-click'));
}

// === 8. Magnetic buttons ===
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'background 0.2s, box-shadow 0.2s, border-color 0.2s';
    });
    btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.28}px,${dy * 0.28}px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), background 0.2s, box-shadow 0.2s, border-color 0.2s';
        btn.style.transform = '';
    });
});

// === 9. Parallax hero ===
const parallaxItems = [
    { el: document.querySelector('.hero-eyebrow'), rate: 0.12 },
    { el: document.querySelector('.hero h1'),      rate: 0.22 },
    { el: document.querySelector('.hero-title'),   rate: 0.3  },
    { el: document.querySelector('.hero-sub'),     rate: 0.36 },
    { el: document.querySelector('.hero-bio'),     rate: 0.42 },
    { el: document.querySelector('.hero-ctas'),    rate: 0.48 },
    { el: document.querySelector('.hero-links'),   rate: 0.54 },
].filter(item => item.el);

let pxTicking = false;
window.addEventListener('scroll', () => {
    if (!pxTicking) {
        requestAnimationFrame(() => {
            const y = window.scrollY;
            parallaxItems.forEach(({ el, rate }) => {
                el.style.transform = `translateY(${y * rate}px)`;
            });
            pxTicking = false;
        });
        pxTicking = true;
    }
}, { passive: true });

// === 10. Timeline line draw ===
const timelineEl = document.querySelector('.timeline');
if (timelineEl) {
    new IntersectionObserver(([e]) => {
        e.target.classList.toggle('tl-visible', e.isIntersecting);
    }, { threshold: 0.1 }).observe(timelineEl);
}
