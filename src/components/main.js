/* =====================================================
   CAMILA & ROMINA — v4
   Desktop: class-based slide transitions
   Mobile: native CSS scroll-snap (NO JS touch hijacking)
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
  const type = () => {
    if (i <= NAMES.length) { el.textContent = NAMES.slice(0, i++); setTimeout(type, i < 8 ? 120 : 92); }
  };
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

    if (isMobile()) {
      initMobile();
    } else {
      initDesktop();
    }
    updateNav();
    updateIndicators();
    updateArrows();
    updateSwipeHint(0);
  }, 1100);
}

/* ═══════════════════════════════════════════════
   DESKTOP — class-based section transitions
   ═══════════════════════════════════════════════ */
function initDesktop() {
  const secs = document.querySelectorAll('.section');
  secs.forEach((s, i) => {
    if      (i === 0) s.className = 'section active';
    else if (i === 1) s.className = 'section next';
    else              s.className = 'section far-next';
  });
  initHoverFloat();
  initKeyboard();
  initWheelDesktop();
  initNavLinksDesktop();
}

function goToSection(target) {
  if (isMobile()) { goToSectionMobile(target); return; }
  if (isAnimating) return;
  if (target < 0 || target >= TOTAL_SECTIONS) return;
  if (target === currentSection) return;

  isAnimating = true;
  const secs = document.querySelectorAll('.section');
  const dir  = target > currentSection ? 1 : -1;

  // Reset scroll of leaving section
  const leaving = secs[currentSection];
  const lContent = leaving?.querySelector('.section__content');
  if (lContent) lContent.scrollTop = 0;

  secs.forEach((s, i) => {
    if      (i === currentSection) s.className = dir > 0 ? 'section prev' : 'section next';
    else if (i === target)         s.className = dir > 0 ? 'section next' : 'section prev';
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

function initKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToSection(currentSection + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goToSection(currentSection - 1);
    if (e.key === 'Escape') closeMobileMenu();
  });
}

function initWheelDesktop() {
  let accum = 0, timer = null;
  document.addEventListener('wheel', e => {
    const content = document.querySelector('.section.active .section__content');
    if (content) {
      const atTop    = content.scrollTop <= 2;
      const atBottom = content.scrollTop >= content.scrollHeight - content.clientHeight - 4;
      const canScroll = content.scrollHeight > content.clientHeight + 10;
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

function initNavLinksDesktop() {
  document.querySelectorAll('[data-section]').forEach(el => {
    el.addEventListener('click', () => {
      const sec = parseInt(el.dataset.section);
      if (!isNaN(sec)) { goToSection(sec); closeMobileMenu(); }
    });
  });
}

/* ═══════════════════════════════════════════════
   MOBILE — CSS scroll-snap navigation
   JS only reads scrollLeft to update indicators.
   No touch hijacking whatsoever.
   ═══════════════════════════════════════════════ */
function initMobile() {
  const wrapper = document.getElementById('sectionsWrapper');
  if (!wrapper) return;

  // Remove the desktop section classes so CSS snap takes over
  document.querySelectorAll('.section').forEach(s => {
    s.className = 'section'; // clear all active/prev/next classes
  });

  // Listen to scroll to update active indicator
  let scrollTimer = null;
  wrapper.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const idx = Math.round(wrapper.scrollLeft / window.innerWidth);
      if (idx !== currentSection) {
        currentSection = idx;
        updateIndicators();
        updateNav();
        updateArrows();
        updateSwipeHint(idx);
      }
    }, 80);
  }, { passive: true });

  // Indicators / nav links: scroll wrapper to section
  document.querySelectorAll('[data-section]').forEach(el => {
    el.addEventListener('click', () => {
      const sec = parseInt(el.dataset.section);
      if (!isNaN(sec)) {
        goToSectionMobile(sec);
        closeMobileMenu();
      }
    });
  });

  // Init scroll reveal for mobile
  initScrollRevealMobile();
}

function goToSectionMobile(target) {
  const wrapper = document.getElementById('sectionsWrapper');
  if (!wrapper) return;
  wrapper.scrollTo({ left: target * window.innerWidth, behavior: 'smooth' });
  currentSection = target;
  updateIndicators();
  updateNav();
  updateArrows();
  updateSwipeHint(target);
}

/* ═══════════════════════════════════════════════
   FLOATING IMAGES (desktop only)
   CSS keyframe animations do the heavy lifting.
   On hover, JS can add extra tilt — subtle.
   ═══════════════════════════════════════════════ */
function initHoverFloat() {
  const section = document.getElementById('section-0');
  if (!section) return;

  // The CSS animations already float the images.
  // On mousemove, we add a gentle extra tilt on top.
  let raf = null;
  let tx = 0, ty = 0, cx = 0, cy = 0;

  section.addEventListener('mousemove', e => {
    const rect = section.getBoundingClientRect();
    tx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    ty = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(tick);
  });

  section.addEventListener('mouseleave', () => {
    tx = 0; ty = 0;
    if (!raf) raf = requestAnimationFrame(tick);
  });

  function tick() {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;

    document.querySelectorAll('.hd__fig').forEach(fig => {
      const depth = parseFloat(fig.dataset.depth) || 10;
      // We add this on top of the CSS animation via a CSS variable
      fig.style.setProperty('--mx', `${cx * depth}px`);
      fig.style.setProperty('--my', `${cy * depth * 0.5}px`);
    });

    const settled = Math.abs(cx - tx) < 0.001 && Math.abs(cy - ty) < 0.001;
    raf = settled ? null : requestAnimationFrame(tick);
  }
}

/* ═══════════════════════════════════════════════
   MOBILE SCROLL REVEAL
   Uses IntersectionObserver on each section element
   (sections are now in normal flow on mobile).
   ═══════════════════════════════════════════════ */
function initScrollRevealMobile() {
  // Historia — observe within the section itself (which is the scroller)
  const historiaSec = document.getElementById('section-0');
  if (historiaSec) {
    observeIn(historiaSec, '.sr, .sr-img, .sr-line');
  }

  // Other sections — observe as they become visible, using a MutationObserver
  // on the wrapper's scroll position
  const wrapper = document.getElementById('sectionsWrapper');

  // Pre-tag elements in other sections
  document.querySelectorAll('.section:not(.section--historia)').forEach(sec => {
    sec.querySelectorAll(
      '.evento__card, .hotel__card, .regalo__card, .itinerario__list li, .otras-opciones, .contacto__block, .rsvp__form > *'
    ).forEach((el, i) => {
      if (!el.classList.contains('sr')) {
        el.classList.add('sr');
        el.style.transitionDelay = `${i * 0.06}s`;
      }
    });
    observeIn(sec, '.sr');
  });
}

function observeIn(root, selector) {
  const items = root.querySelectorAll(selector);
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: root,          // scroll root = the section element itself
    threshold: 0.06,
    rootMargin: '0px 0px -20px 0px'
  });

  items.forEach(el => obs.observe(el));
}

/* ─── SHARED NAV STATE ─── */
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

/* ─── RSVP ─── */
document.querySelectorAll('[name="acompanantes"]').forEach(r => {
  r.addEventListener('change', () => {
    const w = document.getElementById('numCompanionsWrap');
    if (w) w.style.display = r.value === 'si' ? 'block' : 'none';
  });
});

async function submitRSVP() {
  const btn      = document.getElementById('rsvpSubmit');
  const nombre   = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const email    = document.getElementById('email').value.trim();
  const eventos  = [...document.querySelectorAll('[name="evento"]:checked')].map(c => c.value);
  const acomp    = document.querySelector('[name="acompanantes"]:checked')?.value || 'no';
  const numAcomp = document.getElementById('numAcompanantes')?.value || '';

  if (!nombre) {
    const inp = document.getElementById('nombre');
    inp.style.borderColor = 'rgba(200,100,80,0.8)'; inp.focus(); return;
  }
  btn.textContent = 'Enviando…'; btn.disabled = true;
  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: new Date().toLocaleString('es-MX'), nombre, telefono, email, eventos: eventos.join(', '), acompanantes: acomp, numAcompanantes: numAcomp }),
    });
    document.getElementById('rsvpForm').classList.add('hidden');
    document.getElementById('rsvpSuccess').classList.remove('hidden');
  } catch {
    btn.textContent = 'Error — intenta de nuevo'; btn.disabled = false;
  }
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', runTypewriter);
