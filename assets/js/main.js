// The Farm Media — shared site behavior
(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Nav dropdown (click-toggle; works for touch + desktop, CSS handles hover)
  document.querySelectorAll(".nav-item-dropdown").forEach(function (item) {
    var toggle = item.querySelector(".nav-drop-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".nav-item-dropdown.open").forEach(function (o) { o.classList.remove("open"); });
      if (!isOpen) item.classList.add("open");
    });
  });
  document.addEventListener("click", function () {
    document.querySelectorAll(".nav-item-dropdown.open").forEach(function (o) { o.classList.remove("open"); });
  });

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Grids reveal children one by one (capped so long galleries don't lag)
  document.querySelectorAll("[data-reveal].grid, [data-reveal].steps, [data-reveal].gallery-grid, [data-reveal].pricing-grid").forEach(function (el) {
    el.setAttribute("data-stagger", "");
    Array.prototype.forEach.call(el.children, function (child, i) {
      child.style.setProperty("--i", Math.min(i, 8));
    });
  });

  // Header state + scroll progress bar
  var header = document.querySelector(".site-header");
  if (header) {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    header.appendChild(bar);
    var ticking = false;
    var onScroll = function () {
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      header.classList.toggle("scrolled", y > 24);
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  }

  // Count-up for stat numbers like "10,000+", "$2,767", "1,000s"
  function countUp(el) {
    var m = el.textContent.match(/^(\D*)([\d,]+)(.*)$/);
    if (!m) return;
    var target = parseInt(m[2].replace(/,/g, ""), 10);
    if (!target) return;
    var start = null, dur = 1600;
    var frame = function (t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = m[1] + Math.round(target * eased).toLocaleString("en-US") + m[3];
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll(".stat-tile b, .hero-proof .stat b");
  if (!reduceMotion && "IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Gallery filters
  var filterBtns = document.querySelectorAll("[data-filter]");
  var galleryItems = document.querySelectorAll("[data-category]");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var val = btn.getAttribute("data-filter");
      galleryItems.forEach(function (item) {
        var show = val === "all" || item.getAttribute("data-category") === val;
        item.style.display = show ? "" : "none";
      });
    });
  });

  // Lightbox
  var lightbox = document.querySelector("[data-lightbox]");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
    var lbIndex = 0;

    function openLightbox(i) {
      lbIndex = i;
      var full = lbItems[i].getAttribute("href");
      lbImg.src = full;
      lbImg.alt = lbItems[i].querySelector("img").alt;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function closeLightbox() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    }
    function step(dir) {
      var visible = lbItems.filter(function (el) { return el.style.display !== "none"; });
      var pos = visible.indexOf(lbItems[lbIndex]);
      var nextEl = visible[(pos + dir + visible.length) % visible.length];
      lbIndex = lbItems.indexOf(nextEl);
      openLightbox(lbIndex);
    }

    lbItems.forEach(function (item, i) {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        openLightbox(i);
      });
    });
    lightbox.querySelector("[data-lb-close]").addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
    lightbox.querySelector("[data-lb-prev]").addEventListener("click", function () { step(-1); });
    lightbox.querySelector("[data-lb-next]").addEventListener("click", function () { step(1); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  // Generic "demo" form handler (no backend wired up yet)
  document.querySelectorAll("form[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      if (status) {
        status.textContent = "Thanks — this is a demo form. Wire it up to your CRM/email to start capturing real leads.";
        status.classList.remove("err");
        status.classList.add("show", "ok");
      }
      form.reset();
    });
  });
})();
