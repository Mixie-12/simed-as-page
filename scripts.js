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

  // Contact form (Formspree)
  const form = qs('#contactForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = qs('button[type="submit"]', form);
    const statusDiv = qs('#formStatus');
    
    if (!submitButton || !statusDiv) return;

    // Disable submit button and show loading state
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sender...';
    statusDiv.style.display = 'none';

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Success
        statusDiv.textContent = 'Takk! Din melding er sendt.';
        statusDiv.style.display = 'block';
        statusDiv.style.color = '#10b981'; // green
        form.reset();
      } else {
        // Error from server
        statusDiv.textContent = 'Det oppstod en feil. Vennligst prøv igjen.';
        statusDiv.style.display = 'block';
        statusDiv.style.color = '#ef4444'; // red
      }
    } catch (error) {
      // Network error or other error
      statusDiv.textContent = 'Det oppstod en feil. Vennligst prøv igjen.';
      statusDiv.style.display = 'block';
      statusDiv.style.color = '#ef4444'; // red
    } finally {
      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });

  // Cursor follower dot
  const cursorDot = qs('.cursor-dot');
  if (cursorDot) {
    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let isMoving = false;
    let animationId = null;

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (!isMoving) {
        cursorDot.classList.add('active');
        isMoving = true;
        if (!animationId) {
          animateCursor();
        }
      }
    });

    // Hide cursor dot when mouse leaves window
    document.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('active');
      isMoving = false;
    });

    // Animate cursor dot with smooth following
    function animateCursor() {
      if (isMoving) {
        const speed = 0.15;
        dotX += (mouseX - dotX) * speed;
        dotY += (mouseY - dotY) * speed;
        
        cursorDot.style.left = `${dotX}px`;
        cursorDot.style.top = `${dotY}px`;
        
        animationId = requestAnimationFrame(animateCursor);
      } else {
        animationId = null;
      }
    }

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

  // Development Notice Modal
  const devNoticeOverlay = qs('#devNoticeOverlay');
  const devNoticeBtn = qs('#devNoticeBtn');
  const DEV_NOTICE_KEY = 'simedDevNoticeAccepted';
  
  // Function to close the modal
  const closeDevNotice = () => {
    if (devNoticeOverlay) {
      devNoticeOverlay.classList.remove('active');
      document.body.style.overflow = '';
      sessionStorage.setItem(DEV_NOTICE_KEY, 'true');
    }
  };
  
  // Show modal on page load if user hasn't accepted it yet
  if (devNoticeOverlay) {
    const hasAccepted = sessionStorage.getItem(DEV_NOTICE_KEY);
    
    if (!hasAccepted) {
      // Small delay for better UX
      setTimeout(() => {
        devNoticeOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }, 500);
    }
    
    // Add click listener to button
    if (devNoticeBtn) {
      devNoticeBtn.addEventListener('click', closeDevNotice);
    }

    // Close on overlay click (not modal content)
    devNoticeOverlay.addEventListener('click', (e) => {
      if (e.target === devNoticeOverlay) {
        closeDevNotice();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && devNoticeOverlay.classList.contains('active')) {
        closeDevNotice();
      }
    });
  }
})();
