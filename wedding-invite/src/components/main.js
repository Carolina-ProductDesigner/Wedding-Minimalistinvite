/* ================================================
   CAMILA & ROMINA — WEDDING INVITATION
   Main JS: Navigation, Parallax, Swipe, RSVP
   ================================================ */

/* ---- CONFIG ---- */
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec';
const TOTAL_SECTIONS = 5;

/* ---- STATE ---- */
let currentSection = 0;
let isAnimating = false;
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
let mobileMenuOpen = false;

/* ---- TYPEWRITER ---- */
const NAMES = 'Camila & Romina';
let twIndex = 0;
let twEl = null;

function runTypewriter() {
  twEl = document.getElementById('typewriter');
  if (!twEl) return;

  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  twEl.parentNode.insertBefore(cursor, twEl.nextSibling);

  function type() {
    if (twIndex <= NAMES.length) {
      twEl.textContent = NAMES.slice(0, twIndex);
      twIndex++;
      setTimeout(type, twIndex < 9 ? 110 : 90);
    }
  }

  setTimeout(type, 900);
}

/* ---- INTRO ---- */
function enterSite() {
  const intro = document.getElementById('intro');
  const main  = document.getElementById('mainSite');

  intro.classList.add('exiting');

  setTimeout(() => {
    intro.style.display = 'none';
    main.classList.remove('hidden');
    main.classList.add('visible');
    initSections();
    initParallax();
    updateNav();
  }, 1000);
}

/* ---- SECTIONS ---- */
function initSections() {
  const sections = document.querySelectorAll('.section');

  sections.forEach((sec, i) => {
    if (i === 0) sec.className = 'section active';
    else if (i === 1) sec.className = 'section next';
    else sec.className = 'section far-next';
  });

  updateIndicators();
  updateArrows();
  initSwipe();
  initKeyboard();
  initWheel();
  initNavLinks();
}

function getSectionClass(index) {
  const diff = index - currentSection;
  if (diff === 0)  return 'section active';
  if (diff === -1) return 'section prev';
  if (diff === 1)  return 'section next';
  if (diff < -1)   return 'section far-prev';
  return 'section far-next';
}

function goToSection(target, forceDir) {
  if (isAnimating) return;
  if (target < 0 || target >= TOTAL_SECTIONS) return;
  if (target === currentSection) return;

  isAnimating = true;
  const sections = document.querySelectorAll('.section');

  sections.forEach((sec, i) => {
    sec.className = getSectionClass(i).replace('section active', 'section active');
  });

  // set positions before animate
  sections.forEach((sec, i) => {
    const diff = i - target;
    if (i === currentSection) {
      sec.className = target > currentSection ? 'section prev' : 'section next';
    } else if (i === target) {
      sec.className = target > currentSection ? 'section next' : 'section prev';
    } else {
      sec.className = diff < 0 ? 'section far-prev' : 'section far-next';
    }
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sections[target].className = 'section active';
      if (sections[currentSection]) {
        sections[currentSection].className = target > currentSection ? 'section prev' : 'section next';
      }
      currentSection = target;
      updateIndicators();
      updateArrows();
      updateNav();

      setTimeout(() => { isAnimating = false; }, 900);
    });
  });
}

/* ---- INDICATORS ---- */
function updateIndicators() {
  document.querySelectorAll('.indicator').forEach((el, i) => {
    el.classList.toggle('active', i === currentSection);
  });
}

/* ---- ARROWS ---- */
function updateArrows() {
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  if (!prev || !next) return;
  prev.classList.toggle('hidden-arrow', currentSection === 0);
  next.classList.toggle('hidden-arrow', currentSection === TOTAL_SECTIONS - 1);
}

/* ---- NAV STATE ---- */
function updateNav() {
  const nav = document.getElementById('nav');
  const darkSections = [0, 2, 4]; // overlay dark
  if (darkSections.includes(currentSection)) {
    nav.classList.add('nav--dark');
  } else {
    nav.classList.remove('nav--dark');
  }

  document.querySelectorAll('.nav__link').forEach((el, i) => {
    el.classList.toggle('active', i === currentSection);
  });
}

/* ---- NAV LINKS ---- */
function initNavLinks() {
  document.querySelectorAll('.nav__link, .indicator, .mobile-menu__link').forEach(el => {
    el.addEventListener('click', () => {
      const sec = parseInt(el.dataset.section);
      if (!isNaN(sec)) {
        goToSection(sec);
        closeMobileMenu();
      }
    });
  });
}

/* ---- MOBILE MENU ---- */
document.getElementById('hamburger').addEventListener('click', toggleMobileMenu);

function toggleMobileMenu() {
  mobileMenuOpen = !mobileMenuOpen;
  document.getElementById('mobileMenu').classList.toggle('open', mobileMenuOpen);
  const spans = document.querySelectorAll('.nav__hamburger span');
  if (mobileMenuOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
}

function closeMobileMenu() {
  if (!mobileMenuOpen) return;
  mobileMenuOpen = false;
  document.getElementById('mobileMenu').classList.remove('open');
  const spans = document.querySelectorAll('.nav__hamburger span');
  spans[0].style.transform = '';
  spans[1].style.opacity = '';
  spans[2].style.transform = '';
}

/* ---- SWIPE ---- */
function initSwipe() {
  const wrapper = document.getElementById('sectionsWrapper');

  wrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  wrapper.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dt = Date.now() - touchStartTime;

    // Only horizontal swipes (not scrolling)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40 && dt < 500) {
      if (dx < 0) goToSection(currentSection + 1);
      else         goToSection(currentSection - 1);
    }
  }, { passive: true });
}

/* ---- KEYBOARD ---- */
function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToSection(currentSection + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goToSection(currentSection - 1);
    if (e.key === 'Escape') closeMobileMenu();
  });
}

/* ---- WHEEL ---- */
function initWheel() {
  let wheelTimeout = null;
  let wheelAccum = 0;

  document.addEventListener('wheel', (e) => {
    // Don't hijack if the active section is scrollable on mobile
    const activeSection = document.querySelector('.section.active .section__content');
    if (activeSection && activeSection.scrollHeight > activeSection.clientHeight) {
      const atTop    = activeSection.scrollTop <= 0;
      const atBottom = activeSection.scrollTop >= activeSection.scrollHeight - activeSection.clientHeight - 5;
      if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) return;
    }

    e.preventDefault();
    wheelAccum += e.deltaY;

    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      if (Math.abs(wheelAccum) > 60) {
        if (wheelAccum > 0) goToSection(currentSection + 1);
        else                 goToSection(currentSection - 1);
      }
      wheelAccum = 0;
    }, 50);
  }, { passive: false });
}

/* ---- PARALLAX ---- */
function initParallax() {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) return; // skip heavy parallax on mobile

  window.addEventListener('mousemove', (e) => {
    const mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;

    document.querySelectorAll('.parallax-element').forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.1;
      el.style.transform = `translate(${mx * speed * 30}px, ${my * speed * 30}px)`;
    });
  });

  // Parallax on BG images when sections transition
  function updateParallax() {
    const sections = document.querySelectorAll('.section');
    sections.forEach((sec) => {
      const bg = sec.querySelector('.parallax-bg');
      if (!bg) return;
    });
    requestAnimationFrame(updateParallax);
  }
  requestAnimationFrame(updateParallax);
}

/* ---- RSVP ---- */
// Toggle companions input
document.querySelectorAll('[name="acompanantes"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const wrap = document.getElementById('numCompanionsWrap');
    wrap.style.display = radio.value === 'si' ? 'block' : 'none';
  });
});

async function submitRSVP() {
  const btn = document.getElementById('rsvpSubmit');
  const nombre = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const email = document.getElementById('email').value.trim();

  const eventos = [...document.querySelectorAll('[name="evento"]:checked')].map(cb => cb.value);
  const acompanantes = document.querySelector('[name="acompanantes"]:checked')?.value || 'no';
  const numAcompanantes = document.getElementById('numAcompanantes')?.value || '';

  if (!nombre) {
    document.getElementById('nombre').focus();
    document.getElementById('nombre').style.borderColor = '#c0392b';
    return;
  }

  btn.textContent = 'Enviando...';
  btn.disabled = true;

  const payload = {
    nombre,
    telefono,
    email,
    eventos: eventos.join(', '),
    acompanantes,
    numAcompanantes,
    timestamp: new Date().toLocaleString('es-MX'),
  };

  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    document.getElementById('rsvpForm').classList.add('hidden');
    document.getElementById('rsvpSuccess').classList.remove('hidden');
  } catch (err) {
    console.error('RSVP error:', err);
    btn.textContent = 'Error. Intenta de nuevo';
    btn.disabled = false;
  }
}

/* ---- INIT ---- */
window.addEventListener('DOMContentLoaded', () => {
  runTypewriter();
});
