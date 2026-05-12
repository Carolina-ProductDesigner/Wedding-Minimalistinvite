/* =====================================================
   CAMILA & ROMINA — WEDDING INVITATION v2
   JS: Typewriter · Sections · Swipe · Parallax
       Scroll-Reveal · Hover Float · RSVP
   ===================================================== */

const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec';
const TOTAL_SECTIONS   = 5;

let currentSection  = 0;
let isAnimating     = false;
let mobileMenuOpen  = false;
let touchStartX     = 0;
let touchStartY     = 0;
let touchStartTime  = 0;

/* ─────────────────────────────────────────
   TYPEWRITER
───────────────────────────────────────── */
const NAMES = 'Camila & Romina';

function runTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  el.parentNode.insertBefore(cursor, el.nextSibling);

  let i = 0;
  function type() {
    if (i <= NAMES.length) {
      el.textContent = NAMES.slice(0, i++);
      setTimeout(type, i < 8 ? 120 : 95);
    }
  }
  setTimeout(type, 900);
}

/* ─────────────────────────────────────────
   INTRO
───────────────────────────────────────── */
function enterSite() {
  const intro = document.getElementById('intro');
  const main  = document.getElementById('mainSite');

  intro.classList.add('exiting');
  setTimeout(() => {
    intro.style.display = 'none';
    main.classList.remove('hidden');
    main.classList.add('visible');
    initSections();
    initHoverFloat();
    initScrollReveal();
    initGlobalScrollReveal();
    updateNav();
  }, 1100);
}

/* ─────────────────────────────────────────
   SECTION SYSTEM
───────────────────────────────────────── */
function initSections() {
  const secs = document.querySelectorAll('.section');
  secs.forEach((s, i) => {
    if      (i === 0) s.className = 'section active';
    else if (i === 1) s.className = 'section next';
    else              s.className = 'section far-next';
  });

  // historia needs special bg
  updateSectionBg(0);
  updateIndicators();
  updateArrows();
  initSwipe();
  initKeyboard();
  initWheel();
  initNavLinks();
}

function goToSection(target) {
  if (isAnimating) return;
  if (target < 0 || target >= TOTAL_SECTIONS) return;
  if (target === currentSection) return;

  isAnimating = true;
  const secs = document.querySelectorAll('.section');
  const dir  = target > currentSection ? 1 : -1;

  secs.forEach((s, i) => {
    if      (i === currentSection) s.className = dir > 0 ? 'section prev' : 'section next';
    else if (i === target)         s.className = dir > 0 ? 'section next' : 'section prev';
    else                           s.className = i < target ? 'section far-prev' : 'section far-next';
  });

  // tiny delay so browser paints the "start" position first
  requestAnimationFrame(() => requestAnimationFrame(() => {
    secs[target].className = 'section active';
    currentSection = target;
    updateIndicators();
    updateArrows();
    updateNav();
    updateSectionBg(target);
    setTimeout(() => { isAnimating = false; }, 950);
  }));
}

function updateSectionBg(idx) {
  // show swipe hint only on first section, hide after
  const hint = document.getElementById('desktopSwipeHint');
  if (hint) hint.classList.toggle('hide', idx !== 0);
}

/* ─────────────────────────────────────────
   NAV STATE
───────────────────────────────────────── */
function updateNav() {
  const nav        = document.getElementById('nav');
  const darkSecs   = [4]; // only RSVP has dark overlay
  nav.classList.toggle('nav--dark', darkSecs.includes(currentSection));
  document.querySelectorAll('.nav__link').forEach((el, i) => {
    el.classList.toggle('active', i === currentSection);
  });
}

function updateIndicators() {
  document.querySelectorAll('.indicator').forEach((el, i) => {
    el.classList.toggle('active', i === currentSection);
  });
}

function updateArrows() {
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  if (prev) prev.classList.toggle('hidden-arrow', currentSection === 0);
  if (next) next.classList.toggle('hidden-arrow', currentSection === TOTAL_SECTIONS - 1);
}

/* ─────────────────────────────────────────
   NAV LINKS
───────────────────────────────────────── */
function initNavLinks() {
  document.querySelectorAll('[data-section]').forEach(el => {
    el.addEventListener('click', () => {
      const sec = parseInt(el.dataset.section);
      if (!isNaN(sec)) { goToSection(sec); closeMobileMenu(); }
    });
  });
}

/* ─────────────────────────────────────────
   MOBILE MENU
───────────────────────────────────────── */
document.getElementById('hamburger').addEventListener('click', () => {
  mobileMenuOpen ? closeMobileMenu() : openMobileMenu();
});

function openMobileMenu() {
  mobileMenuOpen = true;
  document.getElementById('mobileMenu').classList.add('open');
  const spans = document.querySelectorAll('.nav__hamburger span');
  spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
  spans[1].style.opacity   = '0';
  spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
}

function closeMobileMenu() {
  if (!mobileMenuOpen) return;
  mobileMenuOpen = false;
  document.getElementById('mobileMenu').classList.remove('open');
  const spans = document.querySelectorAll('.nav__hamburger span');
  spans[0].style.transform = '';
  spans[1].style.opacity   = '';
  spans[2].style.transform = '';
}

/* ─────────────────────────────────────────
   SWIPE (touch)
───────────────────────────────────────── */
function initSwipe() {
  const wrapper = document.getElementById('sectionsWrapper');

  wrapper.addEventListener('touchstart', e => {
    touchStartX    = e.touches[0].clientX;
    touchStartY    = e.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  wrapper.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dt = Date.now() - touchStartTime;

    // horizontal swipe — ignore if current section is scrolling vertically
    if (Math.abs(dx) > Math.abs(dy) * 1.4 && Math.abs(dx) > 44 && dt < 480) {
      if (dx < 0) goToSection(currentSection + 1);
      else        goToSection(currentSection - 1);
    }
  }, { passive: true });
}

/* ─────────────────────────────────────────
   KEYBOARD
───────────────────────────────────────── */
function initKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToSection(currentSection + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goToSection(currentSection - 1);
    if (e.key === 'Escape') closeMobileMenu();
  });
}

/* ─────────────────────────────────────────
   WHEEL
───────────────────────────────────────── */
function initWheel() {
  let accum = 0, timer = null;

  document.addEventListener('wheel', e => {
    // let the section scroll if content overflows
    const content = document.querySelector('.section.active .section__content');
    if (content && content.scrollHeight > content.clientHeight + 10) {
      const atTop    = content.scrollTop <= 2;
      const atBottom = content.scrollTop >= content.scrollHeight - content.clientHeight - 4;
      if (!((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom))) return;
    }
    // also let mobile historia scroll
    const hm = document.querySelector('.section.active .hm');
    if (hm && hm.scrollHeight > hm.clientHeight + 10) {
      const atTop    = hm.scrollTop <= 2;
      const atBottom = hm.scrollTop >= hm.scrollHeight - hm.clientHeight - 4;
      if (!((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom))) return;
    }

    e.preventDefault();
    accum += e.deltaY;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (Math.abs(accum) > 55) {
        goToSection(accum > 0 ? currentSection + 1 : currentSection - 1);
      }
      accum = 0;
    }, 60);
  }, { passive: false });
}

/* ─────────────────────────────────────────
   HOVER FLOAT (desktop parallax on photos)
───────────────────────────────────────── */
function initHoverFloat() {
  if (window.innerWidth <= 860) return;

  const historiaSection = document.getElementById('section-0');

  historiaSection.addEventListener('mousemove', e => {
    const rect = historiaSection.getBoundingClientRect();
    const mx   = (e.clientX - rect.left)  / rect.width  - 0.5; // -0.5 → 0.5
    const my   = (e.clientY - rect.top)   / rect.height - 0.5;

    document.querySelectorAll('.hd__fig.hover-float').forEach(fig => {
      const depth = parseFloat(fig.dataset.depth) || 12;
      const tx    = mx * depth;
      const ty    = my * depth * 0.6;
      fig.style.transform = `translate(${tx}px, ${ty}px)`;
    });
  });

  historiaSection.addEventListener('mouseleave', () => {
    document.querySelectorAll('.hd__fig.hover-float').forEach(fig => {
      fig.style.transform = '';
    });
  });
}

/* ─────────────────────────────────────────
   SCROLL REVEAL — editorial (mobile)
   Handles: .sr (fade+slide), .sr-img (clip-path), .sr-line (mask slide)
───────────────────────────────────────── */
function initScrollReveal() {
  const hm = document.getElementById('historiaMobile');
  if (!hm) return;

  // Collect all reveal targets
  const fadeItems  = hm.querySelectorAll('.sr');
  const imgItems   = hm.querySelectorAll('.sr-img');
  const lineItems  = hm.querySelectorAll('.sr-line');

  const allTargets = [...fadeItems, ...imgItems, ...lineItems];
  if (!allTargets.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: hm,
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  allTargets.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────
   GLOBAL SCROLL REVEAL — all sections
   Runs on section content scroll (eventos, hospedaje, etc)
───────────────────────────────────────── */
function initGlobalScrollReveal() {
  if (window.innerWidth > 860) return; // mobile only

  // For each non-historia section, observe their scrollable content
  document.querySelectorAll('.section:not(.section--historia) .section__content').forEach(content => {
    // Tag direct children as sr if not already
    content.querySelectorAll('.evento__card, .hotel__card, .regalo__card, .itinerario__list li, .otras-opciones, .contacto__block, .rsvp__form > *').forEach((el, i) => {
      if (!el.classList.contains('sr')) {
        el.classList.add('sr');
        el.style.transitionDelay = `${i * 0.07}s`;
      }
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: content,
      threshold: 0.06,
      rootMargin: '0px 0px -20px 0px'
    });

    content.querySelectorAll('.sr').forEach(el => observer.observe(el));
  });
}

/* ─────────────────────────────────────────
   RSVP
───────────────────────────────────────── */
document.querySelectorAll('[name="acompanantes"]').forEach(r => {
  r.addEventListener('change', () => {
    const wrap = document.getElementById('numCompanionsWrap');
    if (wrap) wrap.style.display = r.value === 'si' ? 'block' : 'none';
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
    inp.style.borderColor = 'rgba(200,100,80,0.8)';
    inp.focus();
    return;
  }

  btn.textContent = 'Enviando...';
  btn.disabled    = true;

  const payload = {
    timestamp: new Date().toLocaleString('es-MX'),
    nombre, telefono, email,
    eventos:         eventos.join(', '),
    acompanantes:    acomp,
    numAcompanantes: numAcomp,
  };

  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      mode:   'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    document.getElementById('rsvpForm').classList.add('hidden');
    document.getElementById('rsvpSuccess').classList.remove('hidden');
  } catch {
    btn.textContent = 'Error — intenta de nuevo';
    btn.disabled    = false;
  }
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', runTypewriter);
