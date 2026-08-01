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
