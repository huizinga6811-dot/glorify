/* GLORIFY — interactions
   Preloader, cursor, reveals, parallax, menu, signatures pane,
   lookbook drag, newsletter. Vanilla JS, no dependencies. */

(() => {
  'use strict';

  const doc = document.documentElement;
  doc.classList.remove('no-js');
  doc.classList.add('js');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (finePointer) doc.classList.add('has-fine-pointer');

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------- preloader → staged hero entrance ---------- */

  const preloader = document.getElementById('preloader');
  const PRELOAD_MIN = 1500;
  const PRELOAD_MAX = 2600;
  const t0 = performance.now();

  function finishPreload() {
    if (doc.classList.contains('is-ready')) return;
    if (preloader) {
      preloader.classList.add('is-done');
      preloader.addEventListener('transitionend', () => preloader.remove(), { once: true });
      setTimeout(() => preloader.parentNode && preloader.remove(), 1400);
    }
    document.body.classList.remove('is-locked');
    doc.classList.add('is-ready');
  }

  if (reducedMotion || !preloader) {
    finishPreload();
  } else {
    document.body.classList.add('is-locked');
    window.addEventListener('load', () => {
      const wait = Math.max(0, PRELOAD_MIN - (performance.now() - t0));
      setTimeout(finishPreload, wait);
    });
    setTimeout(finishPreload, PRELOAD_MAX); // never hold the page hostage
  }

  /* ---------- split headline into animatable characters ---------- */

  document.querySelectorAll('[data-split]').forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--i', i);
      span.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(span);
    });
  });

  /* ---------- image fade-in once decoded ---------- */

  document.querySelectorAll('img').forEach((img) => {
    if (img.complete) return;
    img.classList.add('fades');
    img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
    img.addEventListener('error', () => img.classList.remove('fades'), { once: true });
  });

  /* ---------- scroll reveals ---------- */

  document.querySelectorAll('[data-stagger]').forEach((parent) => {
    [...parent.children].forEach((child, i) => child.style.setProperty('--i', i));
  });

  const revealables = document.querySelectorAll('.reveal, .reveal-img');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- header: solid after hero, hide on scroll down ---------- */

  const header = document.getElementById('header');
  let lastY = window.scrollY;

  function updateHeader(y) {
    if (document.body.classList.contains('menu-open')) {
      header.classList.remove('header--hidden');
      return;
    }
    header.classList.toggle('header--solid', y > 60);
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (goingDown && y > 420) header.classList.add('header--hidden');
    else if (goingUp || y <= 420) header.classList.remove('header--hidden');
    if (goingDown || goingUp) lastY = y;
  }

  /* ---------- fullscreen menu ---------- */

  const menu = document.getElementById('menu');
  const menuToggle = document.getElementById('menuToggle');

  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    document.body.classList.toggle('is-locked', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (!open) updateHeader(window.scrollY);
  }

  menuToggle.addEventListener('click', () =>
    setMenu(!document.body.classList.contains('menu-open')));

  menu.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => setMenu(false)));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
  });

  /* ---------- signatures: hovered row drives the sticky pane ---------- */

  const sigPane = document.getElementById('sigPane');
  const sigItems = document.querySelectorAll('#sigList .sig');

  sigItems.forEach((item) => {
    const activate = () => {
      sigItems.forEach((s) => s.classList.toggle('is-active', s === item));
      if (sigPane) sigPane.dataset.view = item.dataset.view;
    };
    item.addEventListener('mouseenter', activate);
    item.querySelector('a').addEventListener('focus', activate);
  });
  if (sigItems.length) sigItems[0].classList.add('is-active');

  /* ---------- lookbook: drag to scroll + progress ---------- */

  const viewport = document.getElementById('lookViewport');
  const lookProgress = document.getElementById('lookProgress');

  if (viewport) {
    let dragging = false;
    let moved = 0;
    let startX = 0;
    let startScroll = 0;

    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return; // touch scrolls natively
      dragging = true;
      moved = 0;
      startX = e.clientX;
      startScroll = viewport.scrollLeft;
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(e.pointerId);
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      viewport.scrollLeft = startScroll - dx;
    });

    const endDrag = () => {
      dragging = false;
      viewport.classList.remove('is-dragging');
    };
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    // swallow the click that follows a real drag
    viewport.addEventListener('click', (e) => {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; }
    }, true);

    // translate vertical wheel into horizontal travel while inside the strip
    viewport.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = viewport.scrollWidth - viewport.clientWidth;
      const next = viewport.scrollLeft + e.deltaY;
      if ((e.deltaY > 0 && viewport.scrollLeft < max) || (e.deltaY < 0 && viewport.scrollLeft > 0)) {
        e.preventDefault();
        viewport.scrollLeft = clamp(next, 0, max);
      }
    }, { passive: false });

    const paintProgress = () => {
      const max = viewport.scrollWidth - viewport.clientWidth;
      const r = max > 0 ? viewport.scrollLeft / max : 0;
      if (lookProgress) lookProgress.style.setProperty('--lp', (0.08 + 0.92 * r).toFixed(4));
    };
    viewport.addEventListener('scroll', paintProgress, { passive: true });
    paintProgress();

    // keyboard support
    viewport.addEventListener('keydown', (e) => {
      const step = viewport.clientWidth * 0.6;
      if (e.key === 'ArrowRight') { viewport.scrollBy({ left: step, behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { viewport.scrollBy({ left: -step, behavior: 'smooth' }); e.preventDefault(); }
    });
  }

  /* ---------- magnetic buttons ---------- */

  if (finePointer && !reducedMotion) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${clamp(dx * 0.22, -8, 8)}px, ${clamp(dy * 0.3, -6, 6)}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- custom cursor ---------- */

  const cursor = document.getElementById('cursor');
  const cursorLabel = cursor ? cursor.querySelector('.cursor__label') : null;
  let mx = -100, my = -100, cx = -100, cy = -100;

  if (cursor && finePointer && !reducedMotion) {
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.classList.remove('cursor--hidden');
    }, { passive: true });

    document.addEventListener('mouseleave', () => cursor.classList.add('cursor--hidden'));

    const HOVER = 'a, button, input, [data-cursor]';
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(HOVER);
      cursor.classList.toggle('cursor--hover', !!target && !target.dataset.cursor);
      const labelled = target && target.dataset.cursor;
      cursor.classList.toggle('cursor--label', !!labelled);
      if (labelled && cursorLabel) {
        cursorLabel.textContent = labelled === 'drag' ? 'Drag' : 'View';
      }
    }, { passive: true });
  }

  /* ---------- parallax frames ---------- */

  const parallaxEls = (!reducedMotion)
    ? [...document.querySelectorAll('[data-parallax]')]
    : [];

  function paintParallax() {
    const vh = window.innerHeight;
    parallaxEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      const maxShift = r.height * 0.1;
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      const py = clamp(-p * speed * r.height * 1.6, -maxShift, maxShift);
      el.style.setProperty('--py', `${py.toFixed(1)}px`);
    });
  }

  /* ---------- single rAF loop: cursor lerp, header, page progress ---------- */

  const progressBar = document.getElementById('progress');
  let scrollDirty = true;
  window.addEventListener('scroll', () => { scrollDirty = true; }, { passive: true });
  window.addEventListener('resize', () => { scrollDirty = true; }, { passive: true });

  function tick() {
    if (cursor && finePointer && !reducedMotion) {
      cx += (mx - cx) * 0.16;
      cy += (my - cy) * 0.16;
      cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    }

    if (scrollDirty) {
      scrollDirty = false;
      const y = window.scrollY;
      updateHeader(y);
      paintParallax();
      if (progressBar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.setProperty('--sp', max > 0 ? (y / max).toFixed(4) : 0);
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ---------- newsletter ---------- */

  const form = document.getElementById('newsForm');
  const note = document.getElementById('newsNote');

  if (form && note) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        note.textContent = 'A complete address, if you would be so kind.';
        note.classList.add('is-error');
        note.classList.remove('is-success');
        return;
      }
      form.email.disabled = true;
      form.classList.add('is-done');
      note.textContent = 'Welcome to the circle. The next letter finds you first.';
      note.classList.remove('is-error');
      note.classList.add('is-success');
    });
  }

  /* ---------- roman numeral year ---------- */

  const yearEl = document.getElementById('year');
  if (yearEl) {
    const roman = (n) => {
      const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'],
        [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
      let out = '';
      map.forEach(([v, s]) => { while (n >= v) { out += s; n -= v; } });
      return out;
    };
    yearEl.textContent = roman(new Date().getFullYear());
  }
})();
