/**
 * main.js — Portfolio site JS
 * Jatin Sikka | jatinsikka.me
 *
 * Features:
 *  - Theme toggle (dark default, persisted in localStorage)
 *  - Mobile menu (slide-in from right)
 *  - Scroll fade-in (IntersectionObserver)
 *  - Project modal (safe DOM methods, no innerHTML)
 *
 * All modules are IIFEs — no global variables exposed.
 */

/* =========================================================
   1. THEME TOGGLE
   ========================================================= */
(function ThemeModule() {
  const STORAGE_KEY = 'jatinsikka-theme';
  const DARK  = 'dark';
  const LIGHT = 'light';

  function getPreferred() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === DARK || stored === LIGHT) return stored;
    // Default to dark regardless of OS preference
    return DARK;
  }

  function applyTheme(theme) {
    const html = document.documentElement;
    if (theme === LIGHT) {
      html.classList.add('light');
    } else {
      html.classList.remove('light');
    }
    updateIcons(theme);
  }

  function updateIcons(theme) {
    const sunIcon  = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    if (!sunIcon || !moonIcon) return;

    if (theme === DARK) {
      // Dark mode active → show sun so user can switch to light
      sunIcon.style.display  = 'block';
      moonIcon.style.display = 'none';
    } else {
      // Light mode active → show moon so user can switch to dark
      sunIcon.style.display  = 'none';
      moonIcon.style.display = 'block';
    }
  }

  function toggleTheme() {
    const current = document.documentElement.classList.contains('light') ? LIGHT : DARK;
    const next    = current === DARK ? LIGHT : DARK;
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  function init() {
    // Apply theme before paint to avoid flash
    applyTheme(getPreferred());

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
      btn.setAttribute('aria-label', 'Toggle color theme');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


/* =========================================================
   2. MOBILE MENU
   ========================================================= */
(function MobileMenuModule() {
  function init() {
    const openBtn  = document.getElementById('mobile-menu-btn');
    const menu     = document.getElementById('mobile-menu');
    const closeBtn = document.getElementById('mobile-menu-close');

    if (!openBtn || !menu) return;

    // Create scrim element dynamically
    const scrim = document.createElement('div');
    scrim.className = 'mobile-menu-scrim';
    scrim.setAttribute('aria-hidden', 'true');
    document.body.appendChild(scrim);

    function openMenu() {
      menu.classList.add('open');
      scrim.classList.add('visible');
      document.body.style.overflow = 'hidden';
      menu.setAttribute('aria-hidden', 'false');
      openBtn.setAttribute('aria-expanded', 'true');
      // Focus first focusable item inside menu
      const firstFocusable = menu.querySelector('a, button, [tabindex]');
      if (firstFocusable) firstFocusable.focus();
    }

    function closeMenu() {
      menu.classList.remove('open');
      scrim.classList.remove('visible');
      document.body.style.overflow = '';
      menu.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('aria-expanded', 'false');
      openBtn.focus();
    }

    openBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    scrim.addEventListener('click', closeMenu);

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        closeMenu();
      }
    });

    // Close menu when a nav link inside is clicked
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Initial aria state
    menu.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.setAttribute('aria-controls', 'mobile-menu');
  }

  document.addEventListener('DOMContentLoaded', init);
})();


/* =========================================================
   3. SCROLL FADE-IN
   ========================================================= */
(function ScrollFadeModule() {
  function init() {
    // Respect reduced motion preference
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const targets = document.querySelectorAll('.fade-in');
    if (!targets.length) return;

    if (prefersReduced) {
      // Skip animation — mark all visible immediately
      targets.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      // Fallback for old browsers
      targets.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();


/* =========================================================
   4. PROJECT MODAL
   ========================================================= */
(function ProjectModalModule() {
  var activeModal = null;

  // Build the modal DOM structure using safe methods only
  function buildModal(title, desc, imgSrc) {
    var overlay = document.createElement('div');
    overlay.id        = 'project-modal-overlay';
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-title');

    var panel = document.createElement('div');
    panel.id        = 'project-modal-content';
    panel.className = 'modal-panel';

    // Image (optional)
    if (imgSrc) {
      var img = document.createElement('img');
      img.src       = imgSrc;
      img.alt       = title;
      img.className = 'w-full h-48 object-cover rounded-t-2xl';
      panel.appendChild(img);
    }

    // Body wrapper
    var body = document.createElement('div');
    body.className = 'p-6';

    // Header row
    var header = document.createElement('div');
    header.className = 'flex items-start justify-between gap-4 mb-4';

    var titleEl = document.createElement('h2');
    titleEl.id        = 'modal-title';
    titleEl.className = 'text-xl font-semibold leading-snug';
    titleEl.textContent = title;

    var closeBtn = document.createElement('button');
    closeBtn.type      = 'button';
    closeBtn.className = 'flex-shrink-0 text-[var(--muted-fg)] hover:text-[var(--text)] transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent)]';
    closeBtn.setAttribute('aria-label', 'Close modal');

    // Close icon (×)
    var closeIcon = document.createTextNode('\u00D7');
    var closeSpan = document.createElement('span');
    closeSpan.style.fontSize   = '1.5rem';
    closeSpan.style.lineHeight = '1';
    closeSpan.appendChild(closeIcon);
    closeBtn.appendChild(closeSpan);

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    // Description
    var descEl = document.createElement('p');
    descEl.className  = 'text-[var(--muted-fg)] leading-relaxed text-sm';
    descEl.textContent = desc || 'No description available.';

    body.appendChild(header);
    body.appendChild(descEl);
    panel.appendChild(body);
    overlay.appendChild(panel);

    return { overlay: overlay, closeBtn: closeBtn };
  }

  function openModal(title, desc, imgSrc, triggerEl) {
    if (activeModal) closeModal();

    var built   = buildModal(title, desc, imgSrc);
    var overlay = built.overlay;
    var closeBtn = built.closeBtn;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Trigger open animation on next tick
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('open');
      });
    });

    activeModal = { overlay: overlay, trigger: triggerEl };

    // Event: close button
    closeBtn.addEventListener('click', closeModal);

    // Event: click overlay background (not panel)
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    // Event: Escape key
    document.addEventListener('keydown', handleEscape);

    // Focus close button for accessibility
    closeBtn.focus();
  }

  function closeModal() {
    if (!activeModal) return;
    var overlay = activeModal.overlay;
    var trigger = activeModal.trigger;

    overlay.classList.remove('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleEscape);

    // Wait for fade-out transition before removing
    overlay.addEventListener('transitionend', function onEnd(e) {
      if (e.propertyName !== 'opacity') return;
      overlay.removeEventListener('transitionend', onEnd);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    });

    activeModal = null;

    // Return focus to the trigger element
    if (trigger) trigger.focus();
  }

  function handleEscape(e) {
    if (e.key === 'Escape') closeModal();
  }

  function init() {
    // Delegate click events to any [data-project] element
    document.body.addEventListener('click', function (e) {
      var target = e.target.closest('[data-project]');
      if (!target) return;

      var title  = target.getAttribute('data-project-title') || 'Project';
      var desc   = target.getAttribute('data-project-desc')  || '';
      var imgSrc = target.getAttribute('data-project-img')   || '';

      openModal(title, desc, imgSrc, target);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
