// ── Nav ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const nav = document.querySelector('nav');

function setMenu(isOpen) {
  mobileMenu.classList.toggle('open', isOpen);
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  hamburger.setAttribute('aria-expanded', String(isOpen));
}

hamburger.addEventListener('click', () => {
  setMenu(!mobileMenu.classList.contains('open'));
});

document.querySelectorAll('.nav-close').forEach(link => {
  link.addEventListener('click', () => setMenu(false));
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)) {
    setMenu(false);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) setMenu(false);
});


// ── Hero video ──
// The video is a desktop-only enhancement. Phones, slow connections and
// data-saver users keep the van photo, which is already painted by CSS —
// nothing extra is downloaded for them. The <video> carries no <source> in
// the markup, so nothing loads until we decide it should.
const heroVideo = document.getElementById('heroVideo');

function heroVideoWanted() {
  if (!heroVideo) return false;
  if (!window.matchMedia('(min-width: 769px)').matches) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

  const conn = navigator.connection;
  if (conn) {
    if (conn.saveData) return false;
    if (/(^|-)(2g|slow-2g)$/.test(conn.effectiveType || '')) return false;
  }
  return true;
}

// A <source> that fails to load fires 'error' on itself, not on the <video>,
// and leaves video.error null — so the listener has to go on the source.
function attachHeroSource(url, onError) {
  const source = document.createElement('source');
  source.src = url;
  source.type = 'video/mp4';
  if (onError) source.addEventListener('error', onError, { once: true });
  heroVideo.appendChild(source);
  heroVideo.load();
}

if (heroVideoWanted()) {
  const local = heroVideo.dataset.src;
  const fallback = heroVideo.dataset.fallback;

  heroVideo.addEventListener('canplay', () => {
    heroVideo.classList.add('active');
    heroVideo.play().catch(() => {});
  }, { once: true });

  // Until videos/hero.mp4 exists, fall back to the remote clip once.
  attachHeroSource(local, fallback ? () => {
    heroVideo.replaceChildren();
    attachHeroSource(fallback);
  } : null);
}

// ── Sticky call bar ──
// Appears once the hero (with its own call button) has scrolled out of view,
// and stays put from there to the bottom of the page.
const stickyCall = document.getElementById('stickyCall');
const hero = document.getElementById('hero');

if (stickyCall && hero) {
  new IntersectionObserver(([entry]) => {
    stickyCall.classList.toggle('visible', !entry.isIntersecting);
  }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' }).observe(hero);
}

// ── Scroll animations ──
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = parseFloat(el.dataset.delay || 0) * 1000;
      setTimeout(() => el.classList.add('in-view'), delay);
      fadeObserver.unobserve(el);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

// ── How It Works sequential animation ──
const stepsTrack = document.getElementById('stepsTrack');

if (stepsTrack) {
  const stepsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateSteps();
        stepsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  stepsObserver.observe(stepsTrack);
}

function animateSteps() {
  const items = Array.from(stepsTrack.children);
  let delay = 0;

  items.forEach(item => {
    if (item.classList.contains('step')) {
      const d = delay;
      setTimeout(() => item.classList.add('step-visible'), d);
      delay += 500;
    } else if (item.classList.contains('step-connector')) {
      const d = delay;
      setTimeout(() => item.classList.add('connector-visible'), d - 150);
      delay += 300;
    }
  });
}



// ── Star rating animation on scroll ──
// Hide stars by default so they can animate in when visible
document.querySelectorAll('.stars').forEach(s => s.classList.add('stars-waiting'));

const starObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.classList.contains('stars-animated')) {
      entry.target.classList.add('stars-animated');
      const stars = entry.target.querySelectorAll('.star');
      stars.forEach((star, i) => {
        setTimeout(() => {
          star.style.animation = 'starIn 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
        }, i * 200);
      });
      starObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.review-card').forEach(card => starObserver.observe(card));
