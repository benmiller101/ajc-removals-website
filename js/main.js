// ── Nav ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

document.querySelectorAll('.nav-close').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-label', 'Open menu');
  });
});

// ── Hero video cycling (crossfade every 7 seconds) ──
// Videos 2 and 3 start with preload="none"; we trigger loading ~2 s before each plays.
const heroVideos = Array.from(document.querySelectorAll('.hero-video'));
let currentVideoIndex = 0;
const CYCLE_MS = 7000;
const PRELOAD_AHEAD_MS = 2000;

// Diagnostic: log which video fails so broken URLs can be identified
heroVideos.forEach((v, i) => {
  v.addEventListener('error', () => {
    console.error(`Hero video ${i + 1} failed to load:`, v.currentSrc || v.src);
  });
});

if (heroVideos.length > 1) {
  // Kick off loading of video 2 just before its first play
  setTimeout(() => {
    const v = heroVideos[1];
    if (v && v.getAttribute('preload') === 'none') {
      v.setAttribute('preload', 'auto');
      v.load();
    }
  }, CYCLE_MS - PRELOAD_AHEAD_MS);

  setInterval(() => {
    // Transition to next video
    heroVideos[currentVideoIndex].classList.remove('active');
    currentVideoIndex = (currentVideoIndex + 1) % heroVideos.length;
    heroVideos[currentVideoIndex].classList.add('active');

    // Preload the video after that so it's ready by the time it's needed
    const upcoming = heroVideos[(currentVideoIndex + 1) % heroVideos.length];
    if (upcoming && upcoming.getAttribute('preload') === 'none') {
      upcoming.setAttribute('preload', 'auto');
      upcoming.load();
    }
  }, CYCLE_MS);
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
  const isMobile = window.innerWidth <= 768;
  const items = Array.from(stepsTrack.children);
  let delay = 0;

  items.forEach(item => {
    const isStep = item.classList.contains('step');
    const isConnector = item.classList.contains('step-connector');

    if (isStep) {
      const d = delay;
      setTimeout(() => item.classList.add('step-visible'), d);
      delay += 500;
    } else if (isConnector) {
      const d = delay;
      setTimeout(() => item.classList.add('connector-visible'), d - 150);
      delay += 300;
    }
  });
}

// ── Star rating animation on scroll ──
const starObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.classList.contains('stars-animated')) {
      entry.target.classList.add('stars-animated');
      const stars = entry.target.querySelectorAll('.star');
      stars.forEach((star, i) => {
        setTimeout(() => {
          star.style.animation = 'starIn 0.4s ease forwards';
        }, i * 90);
      });
      starObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.review-card').forEach(card => starObserver.observe(card));
