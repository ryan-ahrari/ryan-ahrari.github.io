// === 1. Scroll animations (fade + slide-up) ===
const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            animateObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('[data-animate]').forEach(el => animateObserver.observe(el));

// Stagger children inside containers marked data-stagger-container
const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-stagger]').forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), i * 110);
            });
            staggerObserver.unobserve(entry.target);
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
}, {
    rootMargin: '-15% 0px -75% 0px'
});

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// === 3. Typewriter hero effect ===
const roles = ['Software Engineer', 'Full-Stack Developer', 'ML Practitioner', 'Systems Engineer'];
const typedEl = document.getElementById('typed-role');

if (typedEl) {
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

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
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    skillObserver.observe(skillsGrid);
}

// === 5. 3D card tilt ===
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = ((y - rect.height / 2) / rect.height) * -8;
        const rotateY = ((x - rect.width / 2) / rect.width) * 8;
        card.style.transition = 'box-shadow 0.25s, border-color 0.25s';
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.45s ease, box-shadow 0.25s, border-color 0.25s';
        card.style.transform = '';
    });
});
