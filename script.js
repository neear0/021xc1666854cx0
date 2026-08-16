/* ============================================================
   AGV Servis – interakcie
   ============================================================ */
(function () {
  "use strict";

  // --- Mobilné menu ---
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  // --- Prepínač svetlého/tmavého režimu ---
  var themeToggle = document.getElementById("themeToggle");
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }
  function syncMeta(t) {
    if (themeMeta) themeMeta.setAttribute("content", t === "light" ? "#f4f6f8" : "#0e0f12");
  }
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
    syncMeta(t);
  }
  // zosúladí <meta theme-color> s režimom, ktorý nastavil inline skript v <head>
  syncMeta(currentTheme());
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      setTheme(currentTheme() === "light" ? "dark" : "light");
    });
  }

  // --- Tieň/stmavenie hlavičky pri scrollovaní ---
  var header = document.getElementById("header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // --- Animácia odhalenia pri scrollovaní ---
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // --- Aktuálny rok v pätičke ---
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // --- Lightbox galéria (samostatná pre každú .gallery sekciu) ---
  (function () {
    var galleries = document.querySelectorAll(".gallery");
    if (!galleries.length) return;

    var en = (document.documentElement.lang || "sk").toLowerCase().indexOf("en") === 0;
    var L = en
      ? { gal: "Image gallery", close: "Close", prev: "Previous", next: "Next" }
      : { gal: "Galéria obrázkov", close: "Zavrieť", prev: "Predchádzajúci", next: "Ďalší" };

    // Postav overlay raz a používaj ho pre všetky galérie
    var lb = document.createElement("div");
    lb.className = "lb";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", L.gal);
    var icoClose = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    var icoPrev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
    var icoNext = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
    lb.innerHTML =
      '<div class="lb-stage">' +
      '<span class="lb-counter" aria-live="polite"></span>' +
      '<button class="lb-btn lb-close" type="button" aria-label="' + L.close + '">' + icoClose + "</button>" +
      '<button class="lb-btn lb-prev" type="button" aria-label="' + L.prev + '">' + icoPrev + "</button>" +
      '<img class="lb-img" alt="">' +
      '<button class="lb-btn lb-next" type="button" aria-label="' + L.next + '">' + icoNext + "</button>" +
      '<p class="lb-caption"></p>' +
      "</div>";
    document.body.appendChild(lb);

    var imgEl = lb.querySelector(".lb-img");
    var capEl = lb.querySelector(".lb-caption");
    var cntEl = lb.querySelector(".lb-counter");
    var btnPrev = lb.querySelector(".lb-prev");
    var btnNext = lb.querySelector(".lb-next");
    var btnClose = lb.querySelector(".lb-close");

    var group = [];   // aktuálna skupina obrázkov {src, alt}
    var index = 0;

    function show(i, animate) {
      index = (i + group.length) % group.length;
      var item = group[index];
      function set() {
        imgEl.src = item.src;
        imgEl.alt = item.alt;
        capEl.textContent = item.alt;
        cntEl.textContent = (index + 1) + " / " + group.length;
        imgEl.classList.remove("swap");
      }
      if (animate) {
        imgEl.classList.add("swap");
        setTimeout(set, 130);
      } else {
        set();
      }
    }

    function open(items, i) {
      group = items;
      lb.classList.toggle("single", group.length < 2);
      show(i, false);
      lb.classList.add("open");
      document.body.classList.add("lb-lock");
      btnClose.focus();
    }
    function close() {
      lb.classList.remove("open");
      document.body.classList.remove("lb-lock");
      imgEl.src = "";
    }

    // Naviaž každú galériu na vlastnú skupinu
    galleries.forEach(function (gallery) {
      var links = Array.prototype.slice.call(gallery.querySelectorAll("a"));
      var items = links.map(function (a) {
        var im = a.querySelector("img");
        return { src: a.getAttribute("href"), alt: im ? im.alt : "" };
      });
      links.forEach(function (a, i) {
        a.addEventListener("click", function (ev) {
          ev.preventDefault();
          open(items, i);
        });
      });
    });

    btnPrev.addEventListener("click", function () { show(index - 1, true); });
    btnNext.addEventListener("click", function () { show(index + 1, true); });
    btnClose.addEventListener("click", close);
    lb.addEventListener("click", function (ev) {
      if (ev.target === lb) close();
    });
    document.addEventListener("keydown", function (ev) {
      if (!lb.classList.contains("open")) return;
      if (ev.key === "Escape") close();
      else if (ev.key === "ArrowLeft" && group.length > 1) show(index - 1, true);
      else if (ev.key === "ArrowRight" && group.length > 1) show(index + 1, true);
    });

    // Dotykové swipovanie na mobile
    var touchX = null;
    lb.addEventListener("touchstart", function (ev) {
      touchX = ev.changedTouches[0].clientX;
    }, { passive: true });
    lb.addEventListener("touchend", function (ev) {
      if (touchX === null || group.length < 2) return;
      var dx = ev.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 45) show(index + (dx < 0 ? 1 : -1), true);
      touchX = null;
    }, { passive: true });
  })();

  // --- Kontakt: otvorí e-mailový program cez mailto (bez servera/formulárovej služby) ---
  // formulárové dopyty chodia na dotaz@ – kvôli identifikácii v prijatých mailoch
  var MAIL_TO = "dotaz@agvservis.sk";
  var isEN = (document.documentElement.lang || "sk").toLowerCase().indexOf("en") === 0;
  var T = isEN ? {
    fill: "Please fill in the subject and message.",
    ok: "Opening your e-mail app…"
  } : {
    fill: "Prosím vyplňte predmet a správu.",
    ok: "Otvárame váš e-mailový program…"
  };

  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  function setStatus(msg, ok) {
    if (!status) return;
    status.textContent = msg;
    status.hidden = false;
    status.classList.toggle("ok", !!ok);
    status.classList.toggle("err", !ok);
  }
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var subject = form.querySelector("#f-subject");
      var msg = form.querySelector("#f-msg");
      if (!subject.value.trim() || !msg.value.trim()) {
        setStatus(T.fill, false);
        return;
      }
      var href = "mailto:" + MAIL_TO +
        "?subject=" + encodeURIComponent(subject.value.trim()) +
        "&body=" + encodeURIComponent(msg.value.trim());
      window.location.href = href;
      setStatus(T.ok, true);
    });
  }
})();
