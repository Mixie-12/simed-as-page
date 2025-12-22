// Simed AS – minimal JS for animations, mobile menu, header elevation, and mailto form.
(() => {
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => [...el.querySelectorAll(s)];

  // Footer year
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12 });

  qsa('.reveal').forEach(el => io.observe(el));

  // Header elevation
  const header = qs('[data-elevate]');
  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-elevated', y > 8);

    const toTop = qs('[data-to-top]');
    if (toTop) toTop.classList.toggle('is-visible', y > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll to top button
  const toTopBtn = qs('[data-to-top]');
  toTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Mobile nav toggle
  const toggle = qs('.nav__toggle');
  const menu = qs('.nav__menu');
  const closeMenu = () => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
  };
  const openMenu = () => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
  };

  toggle?.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    expanded ? closeMenu() : openMenu();
  });

  // Close menu on link click
  qsa('.nav__menu a').forEach(a => a.addEventListener('click', closeMenu));

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!menu || !toggle) return;
    if (!menu.classList.contains('is-open')) return;
    const target = e.target;
    if (target instanceof Element) {
      if (!menu.contains(target) && !toggle.contains(target)) closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Contact form (mailto)
  const form = qs('#contactForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();

    const to = 'kontakt@simed.no'; // TODO: set correct email
    const subject = encodeURIComponent(`Henvendelse via nettside – ${name || 'Ukjent'}`);
    const body = encodeURIComponent(
      `Navn: ${name}\nE-post: ${email}\n\nMelding:\n${message}\n`
    );

    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  });

  // Cursor follower dot
  const cursorDot = qs('.cursor-dot');
  if (cursorDot) {
    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let isMoving = false;

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (!isMoving) {
        cursorDot.classList.add('active');
        isMoving = true;
      }
    });

    // Hide cursor dot when mouse leaves window
    window.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget) {
        cursorDot.classList.remove('active');
        isMoving = false;
      }
    });

    // Animate cursor dot with smooth following
    function animateCursor() {
      if (isMoving) {
        const speed = 0.15;
        dotX += (mouseX - dotX) * speed;
        dotY += (mouseY - dotY) * speed;
        
        cursorDot.style.left = `${dotX}px`;
        cursorDot.style.top = `${dotY}px`;
      }
      
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Add hover effect for interactive elements
    const interactiveElements = qsa('a, button, input, textarea, .card, .feature, .team-member');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hovering');
      });
    });
  }

  // Add stagger animation to grid items on load
  const addStaggerAnimation = () => {
    const grids = qsa('.grid-3, .grid-2, .team-grid');
    grids.forEach(grid => {
      const items = qsa('.card, .feature, .team-member', grid);
      items.forEach((item, i) => {
        if (!item.style.getPropertyValue('--d')) {
          item.style.setProperty('--d', `${i * 80}ms`);
        }
      });
    });
  };

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addStaggerAnimation);
  } else {
    addStaggerAnimation();
  }
})();
