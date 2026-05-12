/* =====================================================
   CAMILA & ROMINA — v3
   Typewriter · Sections · Swipe · Scroll Reveal · Hover Float
   ===================================================== */

const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec';
const TOTAL_SECTIONS   = 5;

let currentSection = 0;
let isAnimating    = false;
let mobileMenuOpen = false;
let touchStartX = 0, touchStartY = 0, touchStartTime = 0;

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
    initSections();
    if (!isMobile()) initHoverFloat();
    initScrollReveal();
    updateNav();
  }, 1100);
}

/* ─── SECTION SYSTEM ─── */
function initSections() {
  const secs = document.querySelectorAll('.section');
  secs.forEach((s, i) => {
    if      (i === 0) s.className = 'section active';
    else if (i === 1) s.className = 'section next';
    else              s.className = 'section far-next';
  });
  updateIndicators();
  updateArrows();
  updateSwipeHint(0);
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

  // reset scroll position of leaving section
  const leaving = secs[currentSection];
  if (leaving) {
    const leavingContent = leaving.querySelector('.section__content');
    const leavingHm      = leaving.querySelector('.hm');
    if (leavingContent) leavingContent.scrollTop = 0;
    if (leavingHm)      leavingHm.scrollTop = 0;
  }

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

function updateSwipeHint(idx) {
  const hint = document.getElementById('desktopSwipeHint');
  if (hint) hint.classList.toggle('hide', idx !== 0);
}

/* ─── NAV ─── */
function updateNav() {
  const nav = document.getElementById('nav');
  nav.classList.toggle('nav--dark', currentSection === 4);
  document.querySelectorAll('.nav__link').forEach((el, i) => el.classList.toggle('active', i === currentSection));
}
function updateIndicators() {
  document.querySelectorAll('.indicator').forEach((el, i) => el.classList.toggle('active', i === currentSection));
}
function updateArrows() {
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  if (prev) prev.classList.toggle('hidden-arrow', currentSection === 0);
  if (next) next.classList.toggle('hidden-arrow', currentSection === TOTAL_SECTIONS - 1);
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

/* ─── TOUCH SWIPE ─── */
function initSwipe() {
  const wrapper = document.getElementById('sectionsWrapper');
  wrapper.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  wrapper.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dt = Date.now() - touchStartTime;
    // Only trigger if clearly horizontal and not a slow drag
    if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 50 && dt < 400) {
      if (dx < 0) goToSection(currentSection + 1);
      else        goToSection(currentSection - 1);
    }
  }, { passive: true });
}

/* ─── KEYBOARD ─── */
function initKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToSection(currentSection + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goToSection(currentSection - 1);
    if (e.key === 'Escape') closeMobileMenu();
  });
}

/* ─── WHEEL ─── */
function initWheel() {
  let accum = 0, timer = null;
  document.addEventListener('wheel', e => {
    // Find the active scrollable container
    const activeSec     = document.querySelector('.section.active');
    const scrollTarget  = activeSec?.querySelector('.hm') || activeSec?.querySelector('.section__content');

    if (scrollTarget) {
      const atTop    = scrollTarget.scrollTop <= 2;
      const atBottom = scrollTarget.scrollTop >= scrollTarget.scrollHeight - scrollTarget.clientHeight - 4;
      const canScroll = scrollTarget.scrollHeight > scrollTarget.clientHeight + 10;
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

/* ─────────────────────────────────────────────────────
   DESKTOP HOVER FLOAT
   The ENTIRE .hd__fig moves through space based on
   mouse position relative to the section.
   Each figure has data-depth (higher = more movement).
───────────────────────────────────────────────────── */
function initHoverFloat() {
  const section = document.getElementById('section-0');
  if (!section) return;

  let raf = null;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  section.addEventListener('mousemove', e => {
    const rect = section.getBoundingClientRect();
    // Normalize to -1 … +1
    targetX = ((e.clientX - rect.left)  / rect.width  - 0.5) * 2;
    targetY = ((e.clientY - rect.top)   / rect.height - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(animateFloat);
  });

  section.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0;
    if (!raf) raf = requestAnimationFrame(animateFloat);
  });

  function animateFloat() {
    // Smooth lerp toward target
    currentX += (targetX - currentX) * 0.07;
    currentY += (targetY - currentY) * 0.07;

    document.querySelectorAll('.hd__fig').forEach(fig => {
      const depth = parseFloat(fig.dataset.depth) || 12;
      const tx    = currentX * depth;
      const ty    = currentY * depth * 0.55;
      // Also add a very subtle rotation for extra life
      const rx    = currentY * depth * 0.15;
      const ry    = -currentX * depth * 0.1;
      fig.style.transform = `translate(${tx}px, ${ty}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });

    // Keep animating until settled
    const settled = Math.abs(currentX - targetX) < 0.001 && Math.abs(currentY - targetY) < 0.001;
    if (!settled) {
      raf = requestAnimationFrame(animateFloat);
    } else {
      raf = null;
    }
  }
}

/* ─────────────────────────────────────────────────────
   MOBILE SCROLL REVEAL
   Uses IntersectionObserver on the .hm scroll container.
   Handles: .sr (fade+rise), .sr-img (clip-path), .sr-line (mask)
───────────────────────────────────────────────────── */
function initScrollReveal() {
  if (!isMobile()) return;

  // Historia section — root is .hm
  const hm = document.getElementById('historiaMobile');
  if (hm) {
    observeReveal(hm, '.sr, .sr-img, .sr-line');
  }

  // Other sections — root is .section__content (when it becomes active)
  // We use a MutationObserver to init observers when sections become active
  const sectionObserver = new MutationObserver(() => {
    document.querySelectorAll('.section.active:not(.section--historia)').forEach(sec => {
      const content = sec.querySelector('.section__content');
      if (content && !content.dataset.revealInit) {
        content.dataset.revealInit = '1';
        // Tag cards and list items
        content.querySelectorAll(
          '.evento__card, .hotel__card, .regalo__card, .itinerario__list li, .otras-opciones, .contacto__block, .rsvp__form > *'
        ).forEach((el, i) => {
          if (!el.classList.contains('sr')) {
            el.classList.add('sr');
            el.style.transitionDelay = `${i * 0.06}s`;
          }
        });
        observeReveal(content, '.sr');
      }
    });
  });

  sectionObserver.observe(document.getElementById('sectionsWrapper'), {
    attributes: true, subtree: true, attributeFilter: ['class']
  });
}

function observeReveal(scrollRoot, selector) {
  const items = scrollRoot.querySelectorAll(selector);
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: scrollRoot,
    threshold: 0.05,
    rootMargin: '0px 0px -30px 0px'
  });

  items.forEach(el => obs.observe(el));
}

/* ─── RSVP ─── */
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
    inp.focus(); return;
  }

  btn.textContent = 'Enviando…';
  btn.disabled    = true;

  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: new Date().toLocaleString('es-MX'), nombre, telefono, email, eventos: eventos.join(', '), acompanantes: acomp, numAcompanantes: numAcomp }),
    });
    document.getElementById('rsvpForm').classList.add('hidden');
    document.getElementById('rsvpSuccess').classList.remove('hidden');
  } catch {
    btn.textContent = 'Error — intenta de nuevo';
    btn.disabled    = false;
  }
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', runTypewriter);
