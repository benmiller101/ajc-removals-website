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

// ── Reviews carousel ──
// The track scrolls natively (swipe, trackpad, keyboard), with snap points
// set in CSS. The arrows and dots just move it a page at a time.
const reviewsTrack = document.getElementById('reviewsTrack');

if (reviewsTrack) {
  const carousel = reviewsTrack.closest('.reviews-carousel');
  const cards = Array.from(reviewsTrack.querySelectorAll('.review-card'));
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  const dotsWrap = document.getElementById('reviewsDots');
  let perView = 1;
  let pageCount = 1;

  // Long reviews get cut to a few lines with a Read more toggle, so one
  // essay-length review doesn't stretch every card in the row.
  cards.forEach(card => {
    const text = card.querySelector('p');
    text.classList.add('clamped');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'read-more';
    btn.textContent = 'Read more';
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const open = text.classList.toggle('clamped') === false;
      btn.textContent = open ? 'Show less' : 'Read more';
      btn.setAttribute('aria-expanded', String(open));
    });
    text.after(btn);
  });

  function updateReadMore() {
    cards.forEach(card => {
      const text = card.querySelector('p');
      const btn = card.querySelector('.read-more');
      if (!text.classList.contains('clamped')) return;
      btn.hidden = text.scrollHeight <= text.clientHeight + 1;
    });
  }

  function cardStep() {
    return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : reviewsTrack.clientWidth;
  }

  function scrollToPage(page) {
    const index = Math.min(page * perView, cards.length - perView);
    reviewsTrack.scrollLeft = cards[Math.max(0, index)].offsetLeft - cards[0].offsetLeft;
  }

  function currentPage() {
    const maxScroll = reviewsTrack.scrollWidth - reviewsTrack.clientWidth;
    if (reviewsTrack.scrollLeft >= maxScroll - 2) return pageCount - 1;
    return Math.round(reviewsTrack.scrollLeft / cardStep() / perView);
  }

  function updateControls() {
    const page = currentPage();
    const maxScroll = reviewsTrack.scrollWidth - reviewsTrack.clientWidth;
    prevBtn.disabled = reviewsTrack.scrollLeft <= 2;
    nextBtn.disabled = reviewsTrack.scrollLeft >= maxScroll - 2;
    dotsWrap.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.setAttribute('aria-current', String(i === page));
    });
    const count = dotsWrap.querySelector('.carousel-count');
    if (count) count.textContent = `${page + 1} / ${pageCount}`;
  }

  function buildDots() {
    // Content width excludes the track's padding (there for hover shadows);
    // add one gap since the last visible card has none after it.
    const style = getComputedStyle(reviewsTrack);
    const inner = reviewsTrack.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const gap = parseFloat(style.columnGap) || 0;
    perView = Math.max(1, Math.floor((inner + gap + 2) / cardStep()));
    pageCount = Math.ceil(cards.length / perView);
    dotsWrap.replaceChildren();
    // On phones that's one page per review — too many dots, so show a count
    if (pageCount > 8) {
      const count = document.createElement('span');
      count.className = 'carousel-count';
      dotsWrap.appendChild(count);
      updateControls();
      return;
    }
    for (let i = 0; i < pageCount; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Show reviews page ${i + 1} of ${pageCount}`);
      dot.addEventListener('click', () => scrollToPage(i));
      dotsWrap.appendChild(dot);
    }
    updateControls();
  }

  prevBtn.addEventListener('click', () => scrollToPage(Math.max(0, currentPage() - 1)));
  nextBtn.addEventListener('click', () => scrollToPage(Math.min(pageCount - 1, currentPage() + 1)));

  let scrollFrame;
  reviewsTrack.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(updateControls);
  }, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildDots(); updateReadMore(); }, 150);
  });

  buildDots();
  updateReadMore();
  // Webfont swap can change line counts
  if (document.fonts) document.fonts.ready.then(updateReadMore);
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
