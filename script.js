document.addEventListener("DOMContentLoaded", function () {
  /* ── Year ── */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
  /* ── Nav scroll ── */
  var nav = document.getElementById("main-nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 50); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  /* ── Active nav link ── */
  var sections = Array.from(document.querySelectorAll("section[id], header[id]"));
  var navLinks = Array.from(document.querySelectorAll(".nav-link, .drawer-nav a"));
  window.addEventListener("scroll", function () {
    var mid = window.scrollY + window.innerHeight / 3;
    var current = "";
    sections.forEach(function (s) { if (s.offsetTop <= mid) current = s.id; });
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }, { passive: true });
  /* ── Hamburger / Drawer ── */
  var hamburger = document.getElementById("hamburger");
  var drawer    = document.getElementById("mobileDrawer");
  var overlay   = document.getElementById("mobileOverlay");
  function openDrawer() {
    drawer.classList.add("open");
    overlay.classList.add("active");
    hamburger.classList.add("open");
    hamburger.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    overlay.classList.remove("active");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  if (hamburger) hamburger.addEventListener("click", function () {
    hamburger.classList.contains("open") ? closeDrawer() : openDrawer();
  });
  var drawerClose = document.getElementById("drawerClose");
  if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
  if (overlay)    overlay.addEventListener("click", closeDrawer);
  /* close drawer when any drawer nav link is clicked */
  if (drawer) {
    Array.from(drawer.querySelectorAll("a")).forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });
  }
  /* close on Escape */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });
  /* ── Reveal on scroll ── */
  var revealNodes = Array.from(document.querySelectorAll("[data-reveal]"));
  revealNodes.forEach(function (n) {
    var d = Number(n.getAttribute("data-delay")) || 0;
    n.style.setProperty("--reveal-delay", d + "ms");
  });
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var allowMicroMotion = !prefersReduced && finePointer;

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealNodes.forEach(function (n) { n.classList.add("in-view"); });
  } else {
    var revObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in-view");
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealNodes.forEach(function (n) { revObs.observe(n); });
  }
  /* ── Slideshow ── */
  function initSlideshow(rootId, interval) {
    var root = document.getElementById(rootId);
    if (!root) return;
    var slides = Array.from(root.querySelectorAll(".slide"));
    if (slides.length < 2) return;
    var dots   = Array.from(root.querySelectorAll(".dot"));
    var prev   = root.querySelector(".slide-prev");
    var next   = root.querySelector(".slide-next");
    var idx    = 0;
    var timer  = null;
    function goTo(n) {
      slides[idx].classList.remove("active");
      if (dots[idx]) dots[idx].classList.remove("active");
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add("active");
      if (dots[idx]) dots[idx].classList.add("active");
    }
    function stop()  { clearInterval(timer); }
    function start() {
      if (prefersReduced) return;
      stop();
      timer = setInterval(function () { goTo(idx + 1); }, interval || 5000);
    }
    if (prev) prev.addEventListener("click", function () { goTo(idx - 1); start(); });
    if (next) next.addEventListener("click", function () { goTo(idx + 1); start(); });
    dots.forEach(function (d) {
      d.addEventListener("click", function () {
        goTo(Number(d.getAttribute("data-idx")) || 0); start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    /* touch swipe */
    var touchStartX = 0;
    root.addEventListener("touchstart", function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { goTo(diff > 0 ? idx + 1 : idx - 1); start(); }
    });
    start();
  }
  initSlideshow("heroSlideshow",  5000);
  initSlideshow("aboutSlideshow", 6000);
  /* Preload lazy images before they enter viewport for smoother scrolling */
  function initImagePrefetch() {
    var lazyImgs = Array.from(document.querySelectorAll('img[loading="lazy"]'));
    if (!lazyImgs.length) return;

    var preloadCache = new Set();
    function warmImage(img) {
      if (!img || img.dataset.prefetchReady === "1") return;
      img.dataset.prefetchReady = "1";
      img.decoding = "async";
      img.loading = "eager";
      if ("fetchPriority" in img) img.fetchPriority = "high";

      var src = img.currentSrc || img.src;
      if (!src || preloadCache.has(src)) return;
      preloadCache.add(src);
      var link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      document.head.appendChild(link);
    }

    // Promote slideshow and gallery images first.
    Array.from(document.querySelectorAll(".hero-slideshow img, .about-slideshow img, .photo-card img")).forEach(warmImage);

    if (!("IntersectionObserver" in window)) {
      lazyImgs.forEach(warmImage);
      return;
    }

    var imgObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        warmImage(entry.target);
        obs.unobserve(entry.target);
      });
    }, {
      // Fetch roughly 1 viewport before image appears.
      rootMargin: "900px 0px",
      threshold: 0.01
    });

    lazyImgs.forEach(function (img) { imgObserver.observe(img); });
  }
  initImagePrefetch();

  /* ── Counter animation ── */
  var counters = Array.from(document.querySelectorAll(".stat-num[data-count]"));
  if (!counters.length) return;
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function animateCounter(el) {
    var target   = parseInt(el.getAttribute("data-count"), 10);
    var duration = 1600;
    var start    = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOut(p) * target).toLocaleString("en-IN");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var cObs = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      animateCounter(e.target);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  counters.forEach(function (c) { cObs.observe(c); });

  /* ── Button ripple wave effect ── */
  if (allowMicroMotion) {
    document.querySelectorAll(".btn:not(.btn-ghost)").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var wave = document.createElement("span");
        wave.classList.add("btn-wave");
        btn.appendChild(wave);
        wave.addEventListener("animationend", function () { wave.remove(); });
      });
    });
  }

  /* ── Floating particle dots in hero header ── */
  (function spawnParticles() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    if (window.innerWidth <= 900 || !allowMicroMotion) return;

    function createParticle() {
      var p = document.createElement("span");
      p.style.cssText = [
        "position:absolute",
        "border-radius:50%",
        "pointer-events:none",
        "z-index:0",
        "opacity:0",
        "width:" + (4 + Math.random() * 6) + "px",
        "height:" + (4 + Math.random() * 6) + "px",
        "left:" + (5 + Math.random() * 90) + "%",
        "top:" + (20 + Math.random() * 70) + "%",
        "background:" + (Math.random() > .5 ? "rgba(14,107,179,.18)" : "rgba(13,148,136,.16)"),
        "animation:particleDrift " + (4 + Math.random() * 6) + "s " + (Math.random() * 4) + "s ease-in forwards"
      ].join(";");
      header.appendChild(p);
      p.addEventListener("animationend", function () { p.remove(); });
    }

    setInterval(createParticle, 900);
  })();
});
