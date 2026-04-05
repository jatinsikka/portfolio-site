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


/* =========================================================
   5. NEURAL NETWORK CANVAS
   ========================================================= */
(function NeuralCanvasModule() {
  var canvas, ctx;
  var nodes = [];
  var signals = [];
  var mouse = { x: -9999, y: -9999 };
  var w = 0, h = 0;
  var isVisible = true;

  var NODE_COUNT = 80;
  var CONNECT_DIST = 160;
  var MOUSE_RADIUS = 200;
  var SIGNAL_CHANCE = 0.003;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createNode() {
    return {
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.3, 0.3),
      vy: rand(-0.3, 0.3),
      r: rand(1.5, 3),
      pulsePhase: rand(0, Math.PI * 2),
      isAccent: Math.random() < 0.12
    };
  }

  function resize() {
    var section = document.getElementById('hero-section');
    if (!section) return;
    var rect = section.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initNodes() {
    nodes = [];
    var count = w <= 768 ? 40 : NODE_COUNT;
    for (var i = 0; i < count; i++) nodes.push(createNode());
  }

  function update() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      n.pulsePhase += 0.02;

      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      if (n.y > h + 20) n.y = -20;

      var dx = n.x - mouse.x;
      var dy = n.y - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        var force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.8;
        n.vx += (dx / dist) * force * 0.15;
        n.vy += (dy / dist) * force * 0.15;
      }
      n.vx *= 0.99;
      n.vy *= 0.99;
    }

    if (Math.random() < SIGNAL_CHANCE * nodes.length) {
      var a = nodes[Math.floor(rand(0, nodes.length))];
      var b = nodes[Math.floor(rand(0, nodes.length))];
      if (a !== b) {
        var sd = Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
        if (sd < CONNECT_DIST) {
          signals.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, t: 0, speed: rand(0.015, 0.035) });
        }
      }
    }

    for (var s = signals.length - 1; s >= 0; s--) {
      signals[s].t += signals[s].speed;
      if (signals[s].t > 1) signals.splice(s, 1);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    var isLight = document.documentElement.classList.contains('light');

    // Connections
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > CONNECT_DIST) continue;

        var alpha = (1 - dist / CONNECT_DIST) * 0.2;
        var midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
        var mDist = Math.sqrt((midX - mouse.x) * (midX - mouse.x) + (midY - mouse.y) * (midY - mouse.y));
        if (mDist < MOUSE_RADIUS) alpha += (1 - mDist / MOUSE_RADIUS) * 0.15;

        ctx.strokeStyle = isLight
          ? 'rgba(59, 130, 246, ' + alpha + ')'
          : 'rgba(100, 160, 255, ' + alpha + ')';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // Signal pulses (orange dots traveling along connections)
    for (var s = 0; s < signals.length; s++) {
      var sig = signals[s];
      var sx = sig.ax + (sig.bx - sig.ax) * sig.t;
      var sy = sig.ay + (sig.by - sig.ay) * sig.t;
      var sAlpha = sig.t < 0.5 ? sig.t * 2 : (1 - sig.t) * 2;
      ctx.save();
      ctx.globalAlpha = sAlpha * 0.9;
      var grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, 6);
      grd.addColorStop(0, 'rgba(249, 115, 22, 0.9)');
      grd.addColorStop(0.5, 'rgba(249, 115, 22, 0.3)');
      grd.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Nodes
    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      var pulse = (Math.sin(n.pulsePhase) + 1) * 0.5;
      var nodeAlpha = 0.3 + pulse * 0.4;
      var nDist = Math.sqrt((n.x - mouse.x) * (n.x - mouse.x) + (n.y - mouse.y) * (n.y - mouse.y));
      if (nDist < MOUSE_RADIUS) nodeAlpha += (1 - nDist / MOUSE_RADIUS) * 0.3;

      ctx.save();
      ctx.globalAlpha = nodeAlpha;

      if (n.isAccent) {
        var g2 = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        g2.addColorStop(0, 'rgba(249, 115, 22, 0.8)');
        g2.addColorStop(0.5, 'rgba(249, 115, 22, 0.2)');
        g2.addColorStop(1, 'rgba(249, 115, 22, 0)');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        var g1 = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3);
        g1.addColorStop(0, isLight ? 'rgba(59, 130, 246, 0.7)' : 'rgba(140, 190, 255, 0.8)');
        g1.addColorStop(0.5, isLight ? 'rgba(59, 130, 246, 0.15)' : 'rgba(100, 160, 255, 0.15)');
        g1.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = n.isAccent
        ? 'rgba(249, 115, 22, 0.9)'
        : (isLight ? 'rgba(59, 130, 246, 0.6)' : 'rgba(180, 210, 255, 0.7)');
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function loop() {
    if (!isVisible) { requestAnimationFrame(loop); return; }
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function init() {
    canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    resize();
    initNodes();
    window.addEventListener('resize', function () { resize(); initNodes(); });

    var hero = document.getElementById('hero-section');
    if (hero) {
      hero.addEventListener('mousemove', function (e) {
        var rect = hero.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
      hero.addEventListener('mouseleave', function () {
        mouse.x = -9999;
        mouse.y = -9999;
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    if (hero) observer.observe(hero);

    loop();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
