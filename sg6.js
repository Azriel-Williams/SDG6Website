/* =====================================================================================
   SDG 6 — Site JavaScript (sg6.js)
   =====================================================================================

   TABLE OF CONTENTS
   -------------------------------------------------------------------------------------
   01) Hero Background Slideshow (index page)
   02) Legacy Mobile Nav Toggle (simple)
   03) Legacy Current Page Highlight
   04) Simple “Pledge” Form Demo
   05) NAV Sliding Indicator & Active State (enhanced)
   06) Dark Mode Toggle (with system preference + persistence)
   07) Skip-Link Smooth Scroll (+ Reduced Motion fallback)
   08) Stats: Count-up on View (global)
   09) Stats: Horizontal Scroller + Arrows (scoped)
   10) Stats: Read-more Toggle (collapse/expand)
   11) Stats: Fallback Toggle for data-has-more (button .toggle)
   12) About Page — Image Banner Slideshow (with dots & controls)
   13) Targets v2 — Flip-cards Behavior (exclusive-open, esc/blur close)
   14) Auto-highlight current NAV link (redundant modern helper)
   15) Mobile Menu Drawer + Backdrop Overlay (accessible)
   16) Video Banner Dots Controller (numbered)
   17) Scroll to Top Feature
   ===================================================================================== */


/* =============================================================================
   01) Hero Background Slideshow (index page)
   -----------------------------------------------------------------------------
   Applies slideshow images to the element with id="hero" (outer hero wrapper).
   NOTE: If your text sits in .hero with its own background, you’ll only see
         this slideshow around the card edges. Point it to `.hero` instead if
         you want the image directly behind text.
   ========================================================================== */
   document.addEventListener("DOMContentLoaded", () => {
    const hero = document.getElementById("hero");
  
    // List of slideshow images
    const slides = [
      "pictures/DisP.png",
      "pictures/challenge1.jpeg",
      "pictures/challenge2.jpeg",
      "pictures/challenge3.jpeg",
      "pictures/challenge4.jpeg",
      "pictures/challenge5.png"
    ];
  
    let index = 0;
  
    // Set first image
    hero.style.backgroundImage = `url(${slides[index]})`;
  
    // Rotate every 6 seconds
    setInterval(() => {
      index = (index + 1) % slides.length;
      hero.style.backgroundImage = `url(${slides[index]})`;
    }, 4000);
  });
  
  
  /* =============================================================================
     02) Legacy Mobile Nav Toggle (simple)
     ========================================================================== */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#site-nav');
  if (toggle && nav){
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  
  
  /* =============================================================================
     03) Legacy Current Page Highlight
     ========================================================================== */
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#site-nav a').forEach(a=>{
    if(a.getAttribute('href')===here){ a.setAttribute('aria-current','page'); }
  });
  
  
  /* =============================================================================
     04) Simple “Pledge” Form Demo
     ========================================================================== */
  document.addEventListener('submit', (e)=>{
    const form = e.target;
    if(form.matches('.pledge-form')){
      const name = form.querySelector('input[name="name"]');
      if(!name.value.trim()){ e.preventDefault(); alert('Please enter your name to pledge.'); }
    }
  });
  
  
  /* =============================================================================
     05) NAV Sliding Indicator & Active State (enhanced)
     ========================================================================== */
  /* Navigation Styling */
  const navLinks = document.getElementById('navLinks');
  const navIndicator = document.getElementById('navIndicator');
  
  let activeLink = null;
  
  function moveIndicatorTo(link, show = true) {
    if (!link) return;
    const linkRect = link.getBoundingClientRect();
    const navRect  = navLinks.getBoundingClientRect();
  
    const left   = linkRect.left - navRect.left;
    const top    = linkRect.top  - navRect.top;
    const width  = linkRect.width;
    const height = linkRect.height;
  
    navIndicator.style.left = `${left}px`;
    navIndicator.style.top = `${top}px`;
    navIndicator.style.width = `${width}px`;
    navIndicator.style.height = `${height}px`;
    navIndicator.style.opacity = show ? '1' : '0';
  }
  
  function setActive(link) {
    if (!link) return;
    if (activeLink && activeLink !== link) {
      activeLink.removeAttribute('aria-current');
    }
    link.setAttribute('aria-current', 'page');
    activeLink = link;
    moveIndicatorTo(activeLink, true);
  }
  
  function detectActiveFromURL() {
    const links = navLinks.querySelectorAll('a[href]');
    let best = null;
  
    links.forEach(a => {
      const href = a.getAttribute('href');
      // Resolve relative URLs against current origin
      const url = new URL(href, window.location.origin);
      if (url.pathname === window.location.pathname) best = a;
    });
  
    // Fallback: keep any pre-marked aria-current, else first link
    if (!best) best = navLinks.querySelector('a[aria-current="page"]') || navLinks.querySelector('a');
    setActive(best);
  }
  
  // ----- Init after layout -----
  window.addEventListener('load', () => {
    detectActiveFromURL();
  });
  
  // ----- Hover follows cursor -----
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('mouseenter', () => moveIndicatorTo(link, true));
    link.addEventListener('focus',     () => moveIndicatorTo(link, true));
  });
  
  // ----- Leave returns to active -----
  navLinks.addEventListener('mouseleave', () => moveIndicatorTo(activeLink, true));
  
  // ----- Click updates active (nice for SPAs; harmless on MPAs) -----
  navLinks.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    setActive(a);
  });
  
  // ----- Keep aligned on resize -----
  window.addEventListener('resize', () => moveIndicatorTo(activeLink, true));
  
  // === NAV DESKTOP/MOBILE SYNC (non-destructive) ===
(() => {
  const btn = document.getElementById('menuToggle');
  const links = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');
  const shell = document.getElementById('navShell');

  if (!links || !shell) return;

  const mq = window.matchMedia('(min-width: 821px)');

  const apply = () => {
    if (mq.matches) {
      // Desktop: show links row, close drawer
      links.hidden = false;
      links.classList.remove('is-open');
      shell.classList.remove('open');
      document.body.classList.remove('menu-open');
      btn?.setAttribute('aria-expanded', 'false');
      if (overlay) {
        overlay.classList.remove('is-open');
        overlay.hidden = true;
      }
    } else {
      // Mobile: start closed (drawer pattern)
      // hidden only if not already explicitly opened by user
      if (!links.classList.contains('is-open')) {
        links.hidden = true;
      }
    }
  };

  // Initial + on resize
  apply();
  mq.addEventListener?.('change', apply);
  window.addEventListener('resize', apply);
})();
  
  /* =============================================================================
     06) Dark Mode Toggle (with system preference + persistence)
     ========================================================================== */
  (function () {
    const STORAGE_KEY = 'theme'; // 'light' | 'dark' | null (follow system)
    const root = document.documentElement; // <html>
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
  
    // Apply a theme mode to the DOM
    function applyTheme(mode) {
      const isDark = mode === 'dark';
      root.classList.toggle('dark', isDark);
      btn.setAttribute('aria-pressed', String(isDark));
    }
  
    // Read saved theme, else follow system
    function getSavedTheme() {
      try { return localStorage.getItem(STORAGE_KEY); }
      catch { return null; }
    }
  
    function saveTheme(modeOrNull) {
      try {
        if (modeOrNull) localStorage.setItem(STORAGE_KEY, modeOrNull);
        else localStorage.removeItem(STORAGE_KEY); // follow system
      } catch {}
    }
  
    function systemPrefersDark() {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  
    // Initialize
    const saved = getSavedTheme(); // 'dark' | 'light' | null
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved);
    } else {
      applyTheme(systemPrefersDark() ? 'dark' : 'light');
    }
  
    // If following system, update on system change
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', e => {
      if (!getSavedTheme()) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  
    // Click toggles between light/dark and persists
    btn.addEventListener('click', () => {
      const isDark = root.classList.contains('dark');
      const next = isDark ? 'light' : 'dark';
      applyTheme(next);
      saveTheme(next);
    });
  
    // Optional: Shift+Click resets to follow system
    btn.addEventListener('click', (e) => {
      if (e.shiftKey) {
        saveTheme(null);
        applyTheme(systemPrefersDark() ? 'dark' : 'light');
        btn.title = 'Following system theme';
        setTimeout(() => (btn.title = 'Toggle dark mode'), 1200);
      }
    });
  })();
  
  
  /* =============================================================================
     07) Skip-Link Smooth Scroll (+ Reduced Motion fallback)
     ========================================================================== */
  // Main sliding scroll
  const skip = document.querySelector('.skip-link');
    const main = document.getElementById('main');
  
    skip.addEventListener('click', (e) => {
      e.preventDefault(); // prevent the instant jump
      main.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
      // After the scroll, move focus for screen readers/keyboard users
      // (use a small timeout so focus happens after scrolling)
      setTimeout(() => main.focus(), 300);
    });
  
    // Respect “Reduce Motion” preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) {
      skip.addEventListener('click', (e) => {
        e.preventDefault();
        main.focus();
        window.location.hash = 'main';
      }, { once: true });
    }
  
  
  /* =============================================================================
     08) Stats: Count-up on View (global)
     ========================================================================== */
  // Visual Countup numbers
  (function () {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  
    function countUp(el) {
      const target   = parseFloat(el.dataset.target || '0');
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const duration = parseInt(el.dataset.duration || '1200', 10);
      const suffix   = el.dataset.suffix ?? '';
      if (prefersReduced || duration <= 0) { el.textContent = target.toFixed(decimals) + suffix; return; }
  
      const start = performance.now();
      function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        const value = target * (1 - Math.pow(1 - t, 3)); // ease-out
        el.textContent = value.toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
  
    // Trigger when each list item becomes visible
    const items = document.querySelectorAll('.stat-list li');
    if (!('IntersectionObserver' in window) || prefersReduced) {
      items.forEach(li => { li.classList.add('counting'); countUp(li.querySelector('.stat-value')); });
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const li = entry.target;
          li.classList.add('counting');
          countUp(li.querySelector('.stat-value'));
          obs.unobserve(li);
        }
      });
    }, { threshold: 0.35 });
    items.forEach(li => obs.observe(li));
  })();
  
  
  /* =============================================================================
     09) Stats: Horizontal Scroller + Arrows (scoped)
     ========================================================================== */
  (() => {
    // ---- Count-up (unchanged; uses your .stat-value in each <li>) ----
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    function countUp(el){
      const target   = parseFloat(el.dataset.target || '0');
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const duration = parseInt(el.dataset.duration || '1200', 10);
      const suffix   = el.dataset.suffix ?? '';
      if (reduce || duration <= 0){ el.textContent = target.toFixed(decimals)+suffix; return; }
      const start = performance.now();
      const step = now => {
        const t = Math.min(1, (now - start)/duration);
        el.textContent = (target*easeOut(t)).toFixed(decimals)+suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  
    // ---- Horizontal scroller + arrows (scoped) ----
    document.querySelectorAll('.stat-scroller').forEach(scrollerWrap => {
      const list = scrollerWrap.querySelector('.stat-list');
      const prev = scrollerWrap.querySelector('.stat-nav.prev');
      const next = scrollerWrap.querySelector('.stat-nav.next');
      if (!list) return;
  
      // Observe visibility INSIDE the horizontal scroller
      const io = ('IntersectionObserver' in window && !reduce)
        ? new IntersectionObserver(entries => {
            entries.forEach(e => {
              if (e.isIntersecting){
                const li = e.target;
                li.classList.add('counting');
                const v = li.querySelector('.stat-value');
                if (v && !v.dataset._done){ countUp(v); v.dataset._done = '1'; }
              }
            });
          }, { root: list, threshold: 0.6 })
        : null;
  
      list.querySelectorAll('li').forEach(li => io ? io.observe(li) : (li.classList.add('counting'), countUp(li.querySelector('.stat-value'))));
  
      function cardStep(){
        const li = list.querySelector('li');
        if (!li) return 320;
        const gap = parseFloat(getComputedStyle(list).gap || getComputedStyle(list).columnGap || '0') || 0;
        return li.getBoundingClientRect().width + gap;
      }
      function updateDisabled(){
        if (!prev || !next) return;
        prev.disabled = list.scrollLeft <= 4;
        const max = list.scrollWidth - list.clientWidth - 4;
        next.disabled = list.scrollLeft >= max;
      }
      prev?.addEventListener('click', () => list.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
      next?.addEventListener('click', () => list.scrollBy({ left:  cardStep(), behavior: 'smooth' }));
      list.addEventListener('scroll', updateDisabled, { passive: true });
      updateDisabled();
  
      // ensure the strip is keyboard scrollable
      list.setAttribute('tabindex','0');
    });
  })();
  
  
  /* =============================================================================
     10) Stats: Read-more Toggle (collapse/expand)
     ========================================================================== */
  (() => {
    const cards = document.querySelectorAll('#stats .stat-list li');
  
    cards.forEach(li => {
      const text = li.querySelector('span');
      if (!text) return;
  
      // ensure parent won't clip vertical growth
      li.style.overflow = 'visible';
  
      // create or reuse the button
      let btn = li.querySelector('.stat-more');
      if (!btn){
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'stat-more';
        btn.textContent = 'Read more';
        btn.setAttribute('aria-expanded', 'false');
        li.appendChild(btn);
      }
  
      // helper: animate max-height to current scrollHeight
      function expand() {
        // temporarily set to full height to measure and animate from current height
        const start = text.offsetHeight;
        text.classList.add('is-open');
        const full = text.scrollHeight;
        // reset to start, then animate to full
        text.style.maxHeight = start + 'px';
        requestAnimationFrame(() => {
          text.style.maxHeight = full + 'px';
        });
        btn.textContent = 'Read less';
        btn.setAttribute('aria-expanded', 'true');
      }
  
      function collapse() {
        const start = text.offsetHeight;
        text.style.maxHeight = start + 'px';
        // next frame set to the collapsed value (3 lines)
        requestAnimationFrame(() => {
          text.classList.remove('is-open');
          // the CSS will cap it using calc(1.4em * var(--collapsed-lines))
          // by clearing inline maxHeight we let CSS collapse it
          text.style.maxHeight = '';
        });
        btn.textContent = 'Read more';
        btn.setAttribute('aria-expanded', 'false');
      }
  
      // initial state (collapsed)
      text.classList.remove('is-open');
      text.style.maxHeight = ''; // let CSS set collapsed height
  
      let open = false;
      btn.addEventListener('click', () => {
        open ? collapse() : expand();
        open = !open;
      });
  
      // Optional: hide button if not truncated initially
      requestAnimationFrame(() => {
         if (text.scrollHeight <= text.clientHeight + 1) btn.hidden = true;
      });
    });
  
    // This entire series of text compensates for if "data-has-more="true"
      // is forgot to be inputted.
    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll(".stat-list li").forEach(li => {
        const desc = li.querySelector(".desc");
        const btn  = li.querySelector(".toggle");
    
        // If there is no button or no desc, skip
        if (!desc || !btn) return;
    
        // Temporarily clamp to measure overflow like the real state
        const needsClamp = li.dataset.hasMore === "true";
        if (!needsClamp) { btn.remove(); return; }
    
        // Apply clamp styles to test overflow
        desc.style.maxHeight = "4.8em";
        desc.style.overflow = "hidden";
    
        const isOverflowing = desc.scrollHeight > desc.clientHeight;
    
        // Reset inline test styles (CSS will control it)
        desc.style.maxHeight = "";
        desc.style.overflow  = "";
    
        if (!isOverflowing) {
          // No overflow → no toggle, no fade
          btn.remove();
          li.removeAttribute("data-has-more");
        } else {
          // Has overflow → hook up toggle
          btn.addEventListener("click", () => {
            li.classList.toggle("expanded");
            btn.textContent = li.classList.contains("expanded") ? "Read less" : "Read more";
          });
        }
      });
    });
  //------------------------------------------------------------------------
  
  /* =============================================================================
     12) About Page — Image Banner Slideshow (with dots & controls)
     ========================================================================== */
  
  // About page layout slideshow
  
  /* ==== HERO BANNER (About page) ==== */
  (function bannerInit() {
    const root = document.getElementById('banner');
    if (!root) return; // only runs on About page
  
    const slides = Array.from(root.querySelectorAll('.banner-slide'));
    const dots = Array.from(root.querySelectorAll('.banner-dots [role="tab"]'));
    const prevBtn = root.querySelector('.banner-ctrl.prev');
    const nextBtn = root.querySelector('.banner-ctrl.next');
  
    let index = 0;
    let autoplay = root.dataset.autoplay === 'true';
    let interval = parseInt(root.dataset.interval || '6000', 10);
    let timer = null;
  
    const setActive = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, si) => s.classList.toggle('is-active', si === index));
      dots.forEach((d, di) => d.setAttribute('aria-selected', di === index ? 'true' : 'false'));
    };
  
    const next = () => setActive(index + 1);
    const prev = () => setActive(index - 1);
  
    const start = () => { stop(); if (autoplay) timer = setInterval(next, interval); };
    const stop  = () => { if (timer) clearInterval(timer); timer = null; };
  
    // Controls
    nextBtn?.addEventListener('click', () => { stop(); next(); start(); });
    prevBtn?.addEventListener('click', () => { stop(); prev(); start(); });
    dots.forEach((dot, di) => dot.addEventListener('click', () => { stop(); setActive(di); start(); }));
  
    // Keyboard + hover/focus pause
    root.tabIndex = 0;
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); stop(); next(); start(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); stop(); prev(); start(); }
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
  
    // Basic swipe
    let x0 = null;
    root.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, {passive:true});
    root.addEventListener('touchend', (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { stop(); (dx < 0 ? next() : prev()); start(); }
      x0 = null;
    });
  
    // Init
    setActive(0);
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) autoplay = false;
    start();
  })();
  })();
  
  
  /* =============================================================================
     13) Targets v2 — Flip-cards Behavior
     ========================================================================== */
  (function(){
    const scope = document.querySelector('#targets2');
    if (!scope) return;
  
    const allChecks = () => scope.querySelectorAll('.flip');
    const closeAll = () => allChecks().forEach(cb => cb.checked = false);
  
    // Close on outside click
    document.addEventListener('click', (e) => {
      const inside = e.target.closest('#targets2 .card');
      if (!inside) { closeAll(); }
    });
  
    // Keep only one open at a time (optional; comment this block to allow many)
    scope.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      // defer until the label toggles the checkbox
      setTimeout(() => {
        const current = card.querySelector('.flip');
        if (current && current.checked) {
          allChecks().forEach(cb => { if (cb !== current) cb.checked = false; });
        }
      }, 0);
    });
  
    // Close on Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeAll(); }
    });
  })();
  
  
  /* =============================================================================
     14) Auto-highlight current NAV link (redundant modern helper)
     ========================================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-links a");
    const currentPath = window.location.pathname.split("/").pop(); // e.g. "about.html"
  
    navLinks.forEach(link => {
      const linkPath = link.getAttribute("href");
      if (linkPath === currentPath || (linkPath === "index.html" && currentPath === "")) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  });
  
  
  /* =============================================================================
     15) Mobile Menu Drawer + Backdrop Overlay (accessible)
     ========================================================================== */
  (function(){
    const btn = document.getElementById('menuToggle');
    const panel = document.getElementById('navLinks');
    if (!btn || !panel) return;
  
    const openMenu = () => {
      panel.hidden = false;
      panel.classList.add('is-open');
      document.body.classList.add('menu-open');
      btn.setAttribute('aria-expanded', 'true');
    };
  
    const closeMenu = () => {
      panel.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      btn.setAttribute('aria-expanded', 'false');
      // hide after transition so it’s not focusable
      panel.addEventListener('transitionend', () => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, { once:true });
    };
  
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    }, { passive:true });
  
    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') closeMenu();
    });
  
    // Close when a link is tapped
    panel.addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('a')) closeMenu();
    });
  
    // Ensure correct state on rotate/resize
    const mq = window.matchMedia('(min-width: 769px)');
    const sync = () => {
      if (mq.matches) {
        // desktop
        panel.hidden = false;
        panel.classList.remove('is-open');
        document.body.classList.remove('menu-open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        // mobile starts closed
        panel.hidden = true;
      }
    };
    mq.addEventListener('change', sync);
    sync();
  })();
  
  (function(){
    const btn     = document.getElementById('menuToggle');
    const drawer  = document.getElementById('navLinks');
    const overlay = document.getElementById('navOverlay');
    if (!btn || !drawer || !overlay) return;
  
    const open = () => {
      drawer.hidden = false;
      overlay.hidden = false;
  
      drawer.classList.add('is-open');
      overlay.classList.add('is-open');
      document.body.classList.add('menu-open');
  
      btn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
  
      // iOS: ensure the drawer owns scroll
      drawer.focus?.();
    };
  
    const close = () => {
      drawer.classList.remove('is-open');
      overlay.classList.remove('is-open');
      document.body.classList.remove('menu-open');
  
      btn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
  
      // Hide elements after transition completes so they’re not focusable
      const onEnd = () => {
        if (!drawer.classList.contains('is-open')) {
          drawer.hidden = true;
          overlay.hidden = true;
        }
        drawer.removeEventListener('transitionend', onEnd);
      };
      drawer.addEventListener('transitionend', onEnd);
    };
  
    const toggle = () => (btn.getAttribute('aria-expanded') === 'true') ? close() : open();
  
    // Tap/click triggers (cover iOS)
    ['click','pointerup','touchend'].forEach(evt => {
      btn.addEventListener(evt, (e)=>{ e.preventDefault(); toggle(); }, { passive:false });
    });
  
    // Tap backdrop to close
    ['click','pointerup','touchend'].forEach(evt => {
      overlay.addEventListener(evt, (e)=>{ e.preventDefault(); close(); }, { passive:false });
    });
  
    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') close();
    });
  
    // Close when a link is tapped
    drawer.addEventListener('click', (e) => {
      if (e.target.closest('a')) close();
    });
  
    // Start closed on mobile
    drawer.hidden = true;
    overlay.hidden = true;
  })();
  
  
  /* =============================================================================
     16) Video Banner Dots Controller (numbered)
     ========================================================================== */
  const slides = [...document.querySelectorAll('.video-banner__slide')];
  const dots = [...document.querySelectorAll('.video-banner__dots > button')];
  
  function goTo(i){
    slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    dots.forEach((d, idx) => d.setAttribute('aria-selected', idx === i ? 'true' : 'false'));
  }
  
  dots.forEach(d => d.addEventListener('click', e => {
    goTo(parseInt(d.dataset.index, 10));
  }));

  const scrollBtn = document.getElementById("scrollTopBtn");

  // Show button after scrolling down 200px
  window.addEventListener("scroll", () => {
    if (document.documentElement.scrollTop > 200) {
      scrollBtn.classList.add("show");
      scrollBtn.classList.remove("hide");
    } else {
      scrollBtn.classList.remove("show");
      scrollBtn.classList.add("hide");
    }
  });

  /* =============================================================================
    16) Video Banner Dots Controller (numbered)
  ========================================================================== */

  // Smooth scroll to top
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });