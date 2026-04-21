// ── Nav ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const nav = document.querySelector('nav');

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

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-label', 'Open menu');
  }
});


// ── Hero video cycling ──
const heroVideos = Array.from(document.querySelectorAll('.hero-video'));
let currentIndex = 0;
const CYCLE_MS = 7000;
let cycleTimer = null;

function loadVideo(video) {
  if (video && video.getAttribute('preload') === 'none') {
    video.setAttribute('preload', 'auto');
    video.load();
    video.play().catch(() => {});
  }
}

function crossfadeTo(nextIndex) {
  heroVideos[currentIndex].classList.remove('active');
  currentIndex = nextIndex % heroVideos.length;
  heroVideos[currentIndex].classList.add('active');
  loadVideo(heroVideos[(currentIndex + 1) % heroVideos.length]);
}

function startCycling() {
  if (heroVideos.length < 2) return;
  loadVideo(heroVideos[1]);
  cycleTimer = setInterval(() => {
    crossfadeTo(currentIndex + 1);
  }, CYCLE_MS);
}

heroVideos.forEach((video, i) => {
  video.addEventListener('error', () => {
    console.warn(`Hero video ${i + 1} failed to load. Skipping.`);
    video.classList.add('video-failed');
  });
});

const firstVideo = heroVideos[0];
if (firstVideo) {
  firstVideo.addEventListener('canplay', () => {
    firstVideo.play().catch(() => {});
    startCycling();
  }, { once: true });

  setTimeout(() => {
    if (cycleTimer === null && heroVideos.length > 1) {
      startCycling();
    }
  }, 4000);
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
