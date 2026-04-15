/**
 * command-palette.js — ⌘K palette for jatinsikka.me
 * Vanilla JS, no deps, no innerHTML. Uses createElement + textContent only.
 *
 * Shortcuts:
 *   ⌘K / Ctrl+K / "/"  → open
 *   Esc                 → close
 *   ↑ ↓                 → move selection
 *   Enter               → execute
 *   t                   → toggle theme (when closed)
 *   g then h/v/p/r      → jump to home/ventures/projects/research
 */
(function CommandPaletteModule() {
  'use strict';

  var ITEMS = [
    { kind: 'Page',    label: 'Home',                    hint: 'g h',  href: '/' },
    { kind: 'Page',    label: 'Ventures',                hint: 'g v',  href: '/ventures/' },
    { kind: 'Page',    label: 'Projects',                hint: 'g p',  href: '/projects/' },
    { kind: 'Page',    label: 'Research',                hint: 'g r',  href: '/research/' },

    { kind: 'Action',  label: 'Toggle theme',            hint: 't',    action: 'toggle-theme' },
    { kind: 'Action',  label: 'Copy email address',      hint: '',     action: 'copy-email' },
    { kind: 'Action',  label: 'Email Jatin',             hint: '',     href: 'mailto:jatinsikka30@gmail.com' },
    { kind: 'Action',  label: 'LinkedIn — jatinsikka',   hint: '↗',    href: 'https://www.linkedin.com/in/jatinsikka', external: true },
    { kind: 'Action',  label: 'GitHub — jatinsikka',     hint: '↗',    href: 'https://github.com/jatinsikka',          external: true },

    { kind: 'Venture', label: 'LawAI — Harvey for India', hint: '',    href: '/ventures/lawai.html' },
    { kind: 'Venture', label: 'Undoom.It',                hint: '',    href: '/ventures/' },
    { kind: 'Venture', label: 'HakkHealth',               hint: '',    href: '/ventures/' },
    { kind: 'Venture', label: 'FocusOS',                  hint: '',    href: '/ventures/' },
    { kind: 'Venture', label: 'FocusPact',                hint: '',    href: '/ventures/' },
    { kind: 'Venture', label: 'InspectAI',                hint: '',    href: '/ventures/' },
    { kind: 'Venture', label: 'KhetBot',                  hint: '',    href: '/ventures/' },
    { kind: 'Venture', label: 'SubletSync',               hint: '',    href: '/ventures/' },
    { kind: 'Venture', label: 'Suman Tools',              hint: '',    href: '/ventures/' },
    { kind: 'Venture', label: 'Humanoid Skills',          hint: '',    href: '/ventures/' },
    { kind: 'Venture', label: 'VoicePair',                hint: '',    href: '/ventures/' },
    { kind: 'Venture', label: 'Bolna',                    hint: '',    href: '/ventures/' },
    { kind: 'Venture', label: 'Trading',                  hint: '',    href: '/ventures/' }
  ];

  var overlay = null;
  var panel = null;
  var input = null;
  var list = null;
  var activeIndex = 0;
  var filtered = ITEMS.slice();
  var isOpen = false;

  // ----- Fuzzy scoring -----
  function score(query, item) {
    if (!query) return 1;
    var q = query.toLowerCase();
    var label = item.label.toLowerCase();
    var kind = item.kind.toLowerCase();

    if (label.indexOf(q) === 0) return 100;
    if (label.indexOf(q) !== -1) return 80;
    if (kind.indexOf(q) === 0) return 60;

    // Subsequence fallback
    var qi = 0;
    for (var i = 0; i < label.length && qi < q.length; i++) {
      if (label[i] === q[qi]) qi++;
    }
    return qi === q.length ? 30 : 0;
  }

  function filterItems(query) {
    var scored = [];
    for (var i = 0; i < ITEMS.length; i++) {
      var s = score(query, ITEMS[i]);
      if (s > 0) scored.push({ item: ITEMS[i], s: s, idx: i });
    }
    scored.sort(function (a, b) {
      if (b.s !== a.s) return b.s - a.s;
      return a.idx - b.idx;
    });
    return scored.map(function (x) { return x.item; });
  }

  // ----- DOM builders (createElement only, no innerHTML) -----
  function el(tag, className) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    return e;
  }

  function buildDOM() {
    overlay = el('div', 'cmdk-overlay');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Command palette');

    panel = el('div', 'cmdk-panel');

    var inputRow = el('div', 'cmdk-input-row');

    var iconWrap = el('span', 'cmdk-icon');
    iconWrap.setAttribute('aria-hidden', 'true');
    iconWrap.textContent = '⌘';
    inputRow.appendChild(iconWrap);

    input = el('input', 'cmdk-input');
    input.type = 'text';
    input.placeholder = 'Search pages, ventures, actions…';
    input.setAttribute('aria-label', 'Command palette search');
    input.autocomplete = 'off';
    input.spellcheck = false;
    inputRow.appendChild(input);

    var esc = el('kbd', 'cmdk-kbd');
    esc.textContent = 'esc';
    inputRow.appendChild(esc);

    panel.appendChild(inputRow);

    list = el('div', 'cmdk-list');
    list.setAttribute('role', 'listbox');
    panel.appendChild(list);

    var footer = el('div', 'cmdk-footer');
    footer.appendChild(makeFooterHint('↵', 'select'));
    footer.appendChild(makeFooterHint('↑↓', 'navigate'));
    footer.appendChild(makeFooterHint('esc', 'close'));
    var grow = el('span', 'cmdk-footer-grow');
    footer.appendChild(grow);
    var brand = el('span', 'cmdk-footer-brand');
    brand.textContent = 'jatinsikka.me';
    footer.appendChild(brand);
    panel.appendChild(footer);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }

  function makeFooterHint(key, label) {
    var wrap = el('span', 'cmdk-footer-hint');
    var k = el('kbd', 'cmdk-kbd');
    k.textContent = key;
    var t = el('span');
    t.textContent = label;
    wrap.appendChild(k);
    wrap.appendChild(t);
    return wrap;
  }

  // ----- Render filtered list -----
  function render() {
    // Clear
    while (list.firstChild) list.removeChild(list.firstChild);

    if (filtered.length === 0) {
      var empty = el('div', 'cmdk-empty');
      empty.textContent = 'No results.';
      list.appendChild(empty);
      return;
    }

    var lastKind = null;
    for (var i = 0; i < filtered.length; i++) {
      var item = filtered[i];

      if (item.kind !== lastKind) {
        var group = el('div', 'cmdk-group-label');
        group.textContent = item.kind;
        list.appendChild(group);
        lastKind = item.kind;
      }

      var row = el('div', 'cmdk-item' + (i === activeIndex ? ' active' : ''));
      row.setAttribute('role', 'option');
      row.setAttribute('data-index', String(i));
      row.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');

      var labelEl = el('span', 'cmdk-item-label');
      labelEl.textContent = item.label;
      row.appendChild(labelEl);

      if (item.hint) {
        var hintEl = el('span', 'cmdk-item-hint');
        var parts = item.hint.split(' ');
        for (var p = 0; p < parts.length; p++) {
          var kbd = el('kbd', 'cmdk-kbd');
          kbd.textContent = parts[p];
          hintEl.appendChild(kbd);
        }
        row.appendChild(hintEl);
      }

      row.addEventListener('mouseenter', (function (idx) {
        return function () { setActive(idx); };
      })(i));
      row.addEventListener('click', (function (it) {
        return function () { execute(it); };
      })(item));

      list.appendChild(row);
    }
  }

  function setActive(i) {
    if (i < 0) i = filtered.length - 1;
    if (i >= filtered.length) i = 0;
    activeIndex = i;
    var rows = list.querySelectorAll('.cmdk-item');
    for (var j = 0; j < rows.length; j++) {
      if (j === activeIndex) {
        rows[j].classList.add('active');
        rows[j].setAttribute('aria-selected', 'true');
        rows[j].scrollIntoView({ block: 'nearest' });
      } else {
        rows[j].classList.remove('active');
        rows[j].setAttribute('aria-selected', 'false');
      }
    }
  }

  function execute(item) {
    if (!item) return;

    if (item.action === 'toggle-theme') {
      close();
      var btn = document.getElementById('theme-toggle');
      if (btn) btn.click();
      return;
    }

    if (item.action === 'copy-email') {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('jatinsikka30@gmail.com').then(function () {
          flashToast('Email copied');
        });
      }
      close();
      return;
    }

    if (item.href) {
      close();
      if (item.external) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = item.href;
      }
    }
  }

  function flashToast(msg) {
    var toast = el('div', 'cmdk-toast');
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add('visible');
    });
    setTimeout(function () {
      toast.classList.remove('visible');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 200);
    }, 1400);
  }

  // ----- Open / close -----
  function open() {
    if (isOpen) return;
    if (!overlay) buildDOM();
    isOpen = true;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    input.value = '';
    filtered = ITEMS.slice();
    activeIndex = 0;
    render();
    setTimeout(function () { input.focus(); }, 30);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ----- Handlers -----
  function wireInputHandlers() {
    input.addEventListener('input', function () {
      filtered = filterItems(input.value.trim());
      activeIndex = 0;
      render();
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); execute(filtered[activeIndex]); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
  }

  // ----- Global shortcuts -----
  var gPrefixActive = false;
  var gPrefixTimeout = null;

  function isTypingContext(e) {
    var t = e.target;
    if (!t) return false;
    var tag = (t.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
  }

  function handleGlobalKey(e) {
    var key = e.key;
    var meta = e.metaKey || e.ctrlKey;

    // ⌘K / Ctrl+K — always toggles
    if (meta && key.toLowerCase() === 'k') {
      e.preventDefault();
      isOpen ? close() : open();
      return;
    }

    if (isOpen) return;
    if (isTypingContext(e)) return;
    if (e.altKey || meta) return;

    // "/" or "?" opens
    if (key === '/' || key === '?') {
      e.preventDefault();
      open();
      return;
    }

    // "t" toggles theme
    if (key === 't' && !gPrefixActive) {
      var btn = document.getElementById('theme-toggle');
      if (btn) { e.preventDefault(); btn.click(); }
      return;
    }

    // "g" prefix
    if (key === 'g' && !gPrefixActive) {
      e.preventDefault();
      gPrefixActive = true;
      clearTimeout(gPrefixTimeout);
      gPrefixTimeout = setTimeout(function () { gPrefixActive = false; }, 1500);
      return;
    }

    if (gPrefixActive) {
      gPrefixActive = false;
      clearTimeout(gPrefixTimeout);
      var dest = null;
      if (key === 'h') dest = '/';
      else if (key === 'v') dest = '/ventures/';
      else if (key === 'p') dest = '/projects/';
      else if (key === 'r') dest = '/research/';
      if (dest) { e.preventDefault(); window.location.href = dest; }
    }
  }

  // ----- Init -----
  function init() {
    buildDOM();
    wireInputHandlers();
    document.addEventListener('keydown', handleGlobalKey);

    // Expose minimal API
    window.CommandPalette = { open: open, close: close };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
