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
    document.body.classList.remove('menu-open');
  };
  const openMenu = () => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
    document.body.classList.add('menu-open');
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

  // Close menu on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Set active nav link based on current page
  const setActiveNavLink = () => {
    const currentPath = window.location.pathname;
    const fileName = currentPath.split('/').pop() || 'index.html';
    
    qsa('.nav__menu a').forEach(link => {
      const linkHref = link.getAttribute('href');
      if (linkHref === fileName || (fileName === '' && linkHref === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };
  
  setActiveNavLink();

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

  // Animate stock chart value counter
  const animateChartValue = () => {
    const valueElement = qs('[data-chart-value]');
    if (!valueElement) return;

    const targetValue = 24.7; // Target percentage
    const duration = 2500; // Animation duration in ms
    const startTime = Date.now();
    const startValue = 0;

    const updateValue = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
      
      valueElement.textContent = `+${currentValue.toFixed(1)}%`;
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    // Start animation when chart becomes visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(updateValue, 800); // Delay to sync with line animation
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    const stockChart = qs('.stock-chart');
    if (stockChart) {
      observer.observe(stockChart);
    }
  };

  // Handle reduced motion for SVG animations
  const handleReducedMotion = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Remove all SVG animate and animateMotion elements
      const svgAnimations = qsa('.stock-chart__canvas animate, .stock-chart__canvas animateMotion');
      svgAnimations.forEach(anim => anim.remove());
      
      // Set counter to final value immediately
      const valueElement = qs('[data-chart-value]');
      if (valueElement) {
        valueElement.textContent = '+24.7%';
      }
    }
  };

  // Initialize animations
  const initAnimations = () => {
    handleReducedMotion();
    addStaggerAnimation();
    animateChartValue();
    initKPIPanel();
  };

  // Initialize KPI Panel
  const initKPIPanel = () => {
    const kpiPanel = qs('#kpiPanel');
    if (!kpiPanel || typeof kpiConfig === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    kpiConfig.kpis.forEach((kpi, index) => {
      const tile = document.createElement('div');
      tile.className = 'kpi-tile';
      if (!prefersReducedMotion) {
        tile.style.setProperty('--d', `${index * 100}ms`);
      }

      // Generate sparkline path
      const sparklineData = kpi.sparklineData || [];
      const min = Math.min(...sparklineData);
      const max = Math.max(...sparklineData);
      const range = max - min || 1;
      const width = 100;
      const height = 30;

      const pathPoints = sparklineData.map((value, i) => {
        const x = (i / (sparklineData.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      }).join(' L ');

      const areaPoints = `0,${height} L ${pathPoints} L ${width},${height} Z`;

      // Trend icon
      const trendIcon = kpi.trend === 'up' ? '↗' : kpi.trend === 'down' ? '↘' : '→';

      tile.innerHTML = `
        <div class="kpi-tile__header">
          <span class="kpi-tile__label">${kpi.label}</span>
          <span class="kpi-tile__trend" aria-hidden="true">${trendIcon}</span>
        </div>
        <div class="kpi-tile__value" data-kpi-value="${kpi.value}">
          ${kpi.value.toFixed(1).replace('.', ',')}${kpi.unit}
        </div>
        <div class="kpi-tile__description">${kpi.description}</div>
        <div class="kpi-tile__sparkline">
          <svg class="kpi-sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
            <path class="kpi-sparkline__area" d="M ${areaPoints}" fill="currentColor" style="color: ${kpi.color}"/>
            <path class="kpi-sparkline__path" d="M ${pathPoints}" style="color: ${kpi.color}"/>
          </svg>
        </div>
      `;

      kpiPanel.appendChild(tile);

      // Animate counter
      if (!prefersReducedMotion) {
        const valueEl = tile.querySelector('[data-kpi-value]');
        if (valueEl) {
          const targetValue = kpi.value;
          const duration = 1500;
          const startTime = Date.now();
          const startValue = 0;

          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const updateValue = () => {
                  const currentTime = Date.now();
                  const elapsed = currentTime - startTime;
                  const progress = Math.min(elapsed / duration, 1);
                  const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                  const currentValue = startValue + (targetValue - startValue) * easeOutQuart;

                  valueEl.textContent = `${currentValue.toFixed(1).replace('.', ',')}${kpi.unit}`;

                  if (progress < 1) {
                    requestAnimationFrame(updateValue);
                  }
                };

                setTimeout(updateValue, (index * 100) + 300);
                observer.unobserve(entry.target);
              }
            });
          }, { threshold: 0.3 });

          observer.observe(tile);
        }
      }
    });

    // Add tooltip handler
    const tooltipBtn = qs('.kpi-disclaimer__tooltip');
    if (tooltipBtn) {
      tooltipBtn.addEventListener('click', () => {
        alert(kpiConfig.disclaimer.methodology);
      });
    }
  };

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
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
