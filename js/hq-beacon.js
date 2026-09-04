// ── Picsel HQ beacon ──
// Reports two things, so AJC can see what the site is actually bringing in:
// a tap on a phone number, and a sent enquiry. Nothing else. No page views, no
// visitor identity, no cookies, no third-party script — each hit is a
// fire-and-forget POST with an empty body carrying the event kind and this
// site's key, and that is the whole of it.
//
// The key is public by necessity: it travels from a visitor's browser, so it
// cannot be a secret. It only says "this hit belongs to AJC"; it grants no
// access to anything. Both it and the host it is allowed to fire on live on
// the script tag in index.html.

(function () {
  const ENDPOINT = 'https://hq.picsel.co.uk/api/hit';

  const tag = document.querySelector('script[data-hq-key]');
  const key = tag?.dataset.hqKey || '';
  const host = tag?.dataset.hqHost || '';

  // Only the real site counts. Without this guard every Netlify deploy preview
  // and every local run would quietly inflate the numbers AJC gets shown.
  const isLiveSite = host !== '' && location.hostname === host;

  function report(kind) {
    if (!isLiveSite || !key || !navigator.sendBeacon) return;
    try {
      navigator.sendBeacon(`${ENDPOINT}?k=${encodeURIComponent(key)}&t=${kind}`);
    } catch {
      // A blocked or failed beacon is never worth breaking the page over.
    }
  }

  // Capture phase, so the hit is queued before the browser hands the number to
  // the dialler and the page stops being ours. Delegated from the document
  // because there are five tel: links — nav, hero, contact, footer, sticky
  // button — and a sixth added later should be counted without being wired up.
  document.addEventListener('click', (event) => {
    if (event.target?.closest?.('a[href^="tel:"]')) report('call');
  }, true);

  // Netlify posts the form and navigates away. sendBeacon is the one request
  // that survives that, which is why the count is taken on submit rather than
  // on a success page.
  document.addEventListener('submit', (event) => {
    if (event.target?.closest?.('form.contact-form')) report('form');
  }, true);
})();
