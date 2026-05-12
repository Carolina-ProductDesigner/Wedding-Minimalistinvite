/* =====================================================
   CAMILA & ROMINA — v5
   Smart touch: decides horizontal vs vertical on first 10px of movement.
   Horizontal → section navigation (translateX, JS-driven).
   Vertical   → native browser scroll within section.
   ===================================================== */

const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec';
const TOTAL_SECTIONS   = 5;

let currentSection = 0;
let isAnimating    = false;
let mobileMenuOpen = false;

const isMobile = () => window.innerWidth <= 860;

/* ─── TYPEWRITER ─── */
function runTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  el.parentNode.insertBefore(cursor, el.nextSibling);
  const NAMES = 'Camila & Romina';
  let i = 0;
  const type = () => { if (i <= NAMES.length) { el.textContent = NAMES.slice(0, i++); setTimeout(type, i < 8 ? 120 : 92); } };
  setTimeout(type, 900);
}

/* ─── INTRO ─── */
function enterSite() {
  const intro = document.getElementById('intro');
  const main  = document.getElementById('mainSite');
  intro.classList.add('exiting');
  setTimeout(() => {
    intro.style.display = 'none';
    main.classList.remove('hidden');
    main.classList.add('visible');
    initSections();
    if (!isMobile()) initHoverFloat();
    if (isMobile())  initScrollRevealMobile();
    updateNav();
    updateIndicators();
    updateArrows();
    updateSwipeHint(0);
  }, 1100);
}

/* ═══════════════════════════════════════════════
   SECTION SYSTEM — shared
   ═══════════════════════════════════════════════ */
function initSections() {
  const secs = document.querySelectorAll('.section');
  secs.forEach((s, i) => {
    if      (i === 0) s.className = 'section active';
    else if (i === 1) s.className = 'section next';
    else              s.className = 'section far-next';
  });
  initNavLinks();
  initKeyboard();
  initWheel();
  if (isMobile()) initSmartTouch();
}

function goToSection(target) {
  if (isAnimating) return;
  if (target < 0 || target >= TOTAL_SECTIONS) return;
  if (target === currentSection) return;

  isAnimating = true;
  const secs = document.querySelectorAll('.section');
  const dir  = target > currentSection ? 1 : -1;

  // reset scroll of leaving section
  const leaving = secs[currentSection];
  if (leaving) {
    const c = leaving.querySelector('.section__content');
    const h = leaving.querySelector('.hm');
    if (c) c.scrollTop = 0;
    if (h) h.parentElement.scrollTop = 0; // scroll the section itself
  }

  secs.forEach((s, i) => {
    if      (i === currentSection) s.className = dir > 0 ? 'section prev'     : 'section next';
    else if (i === target)         s.className = dir > 0 ? 'section next'     : 'section prev';
    else                           s.className = i < target ? 'section far-prev' : 'section far-next';
  });

  requestAnimationFrame(() => requestAnimationFrame(() => {
    secs[target].className = 'section active';
    currentSection = target;
    updateIndicators();
    updateArrows();
    updateNav();
    updateSwipeHint(target);
    setTimeout(() => { isAnimating = false; }, 950);
  }));
}

/* ═══════════════════════════════════════════════
   SMART TOUCH — mobile
   Listens on each section. On touchmove, once we know
   direction (dx > dy or dy > dx), we either let the
   browser scroll vertically OR take over for horizontal nav.
   ═══════════════════════════════════════════════ */
function initSmartTouch() {
  let startX, startY, decided, isHorizontal;

  // We listen on the wrapper so we catch all sections
  const wrapper = document.getElementById('sectionsWrapper');

  wrapper.addEventListener('touchstart', e => {
    startX      = e.touches[0].clientX;
    startY      = e.touches[0].clientY;
    decided     = false;
    isHorizontal = false;
  }, { passive: true });

  wrapper.addEventListener('touchmove', e => {
    if (decided) {
      // Already decided — if horizontal, prevent default to stop jitter
      if (isHorizontal) e.preventDefault();
      return;
    }

    const dx = Math.abs(e.touches[0].clientX - startX);
    const dy = Math.abs(e.touches[0].clientY - startY);

    // Wait for at least 8px of movement before deciding
    if (dx < 8 && dy < 8) return;

    decided      = true;
    isHorizontal = dx > dy * 1.2; // favor vertical slightly to feel natural

    if (isHorizontal) {
      // We're going horizontal — prevent vertical scroll for this gesture
      e.preventDefault();
    }
    // If vertical: do nothing — browser handles native scroll
  }, { passive: false }); // non-passive so we can preventDefault

  wrapper.addEventListener('touchend', e => {
    if (!isHorizontal) return;

    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    const elapsed = Date.now();

    // Only navigate if clearly horizontal
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goToSection(currentSection + 1);
      else        goToSection(currentSection - 1);
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════════
   KEYBOARD
   ═══════════════════════════════════════════════ */
function initKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToSection(currentSection + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goToSection(currentSection - 1);
    if (e.key === 'Escape') closeMobileMenu();
  });
}

/* ═══════════════════════════════════════════════
   WHEEL (desktop)
   ═══════════════════════════════════════════════ */
function initWheel() {
  if (isMobile()) return;
  let accum = 0, timer = null;
  document.addEventListener('wheel', e => {
    // On section 0: let the shoot effect handle it, only navigate if large accumulation
    if (currentSection === 0) {
      // The shoot effect handles its own listener — here we just accumulate for navigation
      // Only navigate after a big scroll (user clearly wants to leave)
      accum += e.deltaY;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (Math.abs(accum) > 400) goToSection(accum > 0 ? 1 : 0);
        accum = 0;
      }, 250);
      return; // don't preventDefault here — let shoot handle it
    }

    const content = document.querySelector('.section.active .section__content');
    if (content) {
      const canScroll = content.scrollHeight > content.clientHeight + 10;
      const atTop     = content.scrollTop <= 2;
      const atBottom  = content.scrollTop >= content.scrollHeight - content.clientHeight - 4;
      if (canScroll && !((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom))) return;
    }
    e.preventDefault();
    accum += e.deltaY;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (Math.abs(accum) > 50) goToSection(accum > 0 ? currentSection + 1 : currentSection - 1);
      accum = 0;
    }, 60);
  }, { passive: false });
}

/* ─── NAV LINKS ─── */
function initNavLinks() {
  document.querySelectorAll('[data-section]').forEach(el => {
    el.addEventListener('click', () => {
      const sec = parseInt(el.dataset.section);
      if (!isNaN(sec)) { goToSection(sec); closeMobileMenu(); }
    });
  });
}

/* ─── NAV STATE ─── */
function updateNav() {
  const nav = document.getElementById('nav');
  nav.classList.toggle('nav--dark', currentSection === 4);
  document.querySelectorAll('.nav__link').forEach((el, i) => el.classList.toggle('active', i === currentSection));
}
function updateIndicators() {
  document.querySelectorAll('.indicator').forEach((el, i) => el.classList.toggle('active', i === currentSection));
}
function updateArrows() {
  document.getElementById('prevBtn')?.classList.toggle('hidden-arrow', currentSection === 0);
  document.getElementById('nextBtn')?.classList.toggle('hidden-arrow', currentSection === TOTAL_SECTIONS - 1);
}
function updateSwipeHint(idx) {
  document.getElementById('desktopSwipeHint')?.classList.toggle('hide', idx !== 0);
}

/* ─── MOBILE MENU ─── */
document.getElementById('hamburger').addEventListener('click', () => mobileMenuOpen ? closeMobileMenu() : openMobileMenu());
function openMobileMenu() {
  mobileMenuOpen = true;
  document.getElementById('mobileMenu').classList.add('open');
  const s = document.querySelectorAll('.nav__hamburger span');
  s[0].style.transform = 'rotate(45deg) translate(4px,4px)';
  s[1].style.opacity   = '0';
  s[2].style.transform = 'rotate(-45deg) translate(4px,-4px)';
}
function closeMobileMenu() {
  if (!mobileMenuOpen) return;
  mobileMenuOpen = false;
  document.getElementById('mobileMenu').classList.remove('open');
  const s = document.querySelectorAll('.nav__hamburger span');
  s[0].style.transform = s[1].style.opacity = s[2].style.transform = '';
}

/* ═══════════════════════════════════════════════
   DESKTOP HOVER FLOAT + SCROLL SHOOT
   CSS keyframes handle gentle float.
   Mouse adds subtle parallax tilt.
   Wheel on section 0 shoots photos dramatically
   across the screen, then they snap back.
   ═══════════════════════════════════════════════ */
function initHoverFloat() {
  const section = document.getElementById('section-0');
  if (!section) return;

  // ── Hover parallax tilt ──
  let raf = null, tx = 0, ty = 0, cx = 0, cy = 0;
  section.addEventListener('mousemove', e => {
    const r = section.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
    ty = ((e.clientY - r.top)  / r.height - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(tiltTick);
  });
  section.addEventListener('mouseleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tiltTick); });
  function tiltTick() {
    cx += (tx - cx) * 0.055; cy += (ty - cy) * 0.055;
    document.querySelectorAll('.hd__fig:not(.shooting)').forEach(fig => {
      const d = parseFloat(fig.dataset.depth) || 10;
      fig.style.marginLeft = `${cx * d * 0.4}px`;
      fig.style.marginTop  = `${cy * d * 0.25}px`;
    });
    raf = (Math.abs(cx - tx) < 0.001 && Math.abs(cy - ty) < 0.001) ? null : requestAnimationFrame(tiltTick);
  }

  // ── Scroll shoot ──
  // Each photo gets a unique shoot direction vector (large magnitudes)
  const shootDirs = [
    { x: -1.8, y: -0.6 },  // fig--main: flies upper-left
    { x:  0.5, y:  1.5 },  // fig--center: flies down
    { x:  1.6, y: -1.0 },  // fig--rtop: flies upper-right
    { x: -0.8, y:  1.8 },  // fig--rbottom: flies lower-left
  ];

  let shootAccum = 0;
  let shootTimer = null;
  let isShooting = false;

  section.addEventListener('wheel', e => {
    // Only when section 0 is active
    if (currentSection !== 0) return;

    shootAccum += e.deltaY;
    isShooting = true;

    const figs = section.querySelectorAll('.hd__fig');
    figs.forEach((fig, i) => {
      const dir = shootDirs[i] || { x: 1, y: 1 };
      const magnitude = Math.min(Math.abs(shootAccum) * 0.4, 280); // cap at 280px
      const signedX = shootAccum > 0 ? dir.x : -dir.x;
      const signedY = shootAccum > 0 ? dir.y : -dir.y;
      fig.classList.add('shooting');
      fig.classList.remove('returning');
      fig.style.transform = `translate(${signedX * magnitude}px, ${signedY * magnitude}px) scale(${1 + magnitude * 0.0008})`;
    });

    // After wheel stops, photos fly back
    clearTimeout(shootTimer);
    shootTimer = setTimeout(() => {
      isShooting = false;
      shootAccum = 0;
      const figs = section.querySelectorAll('.hd__fig');
      figs.forEach(fig => {
        fig.classList.remove('shooting');
        fig.classList.add('returning');
        fig.style.transform = '';
        // Remove returning class after animation ends
        setTimeout(() => fig.classList.remove('returning'), 1500);
      });
    }, 180);
  }, { passive: true });
}

/* ═══════════════════════════════════════════════
   MOBILE SCROLL REVEAL
   IntersectionObserver with root = the section element
   (which is the vertical scroll container on mobile).
   ═══════════════════════════════════════════════ */
function initScrollRevealMobile() {
  // Historia section (section-0) — root is the section itself
  const sec0 = document.getElementById('section-0');
  if (sec0) observeIn(sec0, '.sr, .sr-img, .sr-line');

  // Other sections — pre-tag and observe
  document.querySelectorAll('.section:not(.section--historia)').forEach(sec => {
    sec.querySelectorAll(
      '.evento__card, .hotel__card, .regalo__card, .itinerario__list li, ' +
      '.otras-opciones, .contacto__block, .rsvp__form > *'
    ).forEach((el, i) => {
      if (!el.classList.contains('sr')) {
        el.classList.add('sr');
        el.style.transitionDelay = `${i * 0.06}s`;
      }
    });
    observeIn(sec, '.sr');
  });
}

function observeIn(scrollRoot, selector) {
  const items = scrollRoot.querySelectorAll(selector);
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { root: scrollRoot, threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  items.forEach(el => obs.observe(el));
}

/* ─── RSVP ─── */
document.querySelectorAll('[name="acompanantes"]').forEach(r => {
  r.addEventListener('change', () => {
    const w = document.getElementById('numCompanionsWrap');
    if (w) w.style.display = r.value === 'si' ? 'block' : 'none';
  });
});

async function submitRSVP() {
  const btn = document.getElementById('rsvpSubmit');
  const nombre = document.getElementById('nombre').value.trim();
  if (!nombre) {
    const inp = document.getElementById('nombre');
    inp.style.borderColor = 'rgba(200,100,80,0.8)'; inp.focus(); return;
  }
  btn.textContent = 'Enviando…'; btn.disabled = true;
  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toLocaleString('es-MX'),
        nombre,
        telefono: document.getElementById('telefono').value.trim(),
        email:    document.getElementById('email').value.trim(),
        eventos:  [...document.querySelectorAll('[name="evento"]:checked')].map(c => c.value).join(', '),
        acompanantes:    document.querySelector('[name="acompanantes"]:checked')?.value || 'no',
        numAcompanantes: document.getElementById('numAcompanantes')?.value || '',
      }),
    });
    document.getElementById('rsvpForm').classList.add('hidden');
    document.getElementById('rsvpSuccess').classList.remove('hidden');
  } catch {
    btn.textContent = 'Error — intenta de nuevo'; btn.disabled = false;
  }
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', runTypewriter);
