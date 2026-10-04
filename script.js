(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  initTheme();
  initNav();
  initSkillRings();
  initReveal();
  initParticles();
  initContactForm();
  initJourney();

  function initTheme() {
    var root = document.documentElement;
    var button = document.getElementById("theme-toggle");
    var saved = localStorage.getItem("lm-theme");
    var theme = saved || "dark";

    setTheme(theme);

    if (!button) {
      return;
    }

    button.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(next);
      localStorage.setItem("lm-theme", next);
    });

    function setTheme(value) {
      root.setAttribute("data-theme", value);
      var icon = button.querySelector("i");
      var isLight = value === "light";
      button.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
      if (icon) {
        icon.className = isLight ? "fa-solid fa-sun" : "fa-solid fa-moon";
      }
    }
  }

  function initNav() {
    var links = document.querySelectorAll(".navbar-nav .nav-link");
    var sections = [];
    var collapseEl = document.getElementById("primaryNav");
    var collapse = null;

    if (window.bootstrap && collapseEl) {
      collapse = bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: false });
    }

    links.forEach(function (link) {
      var id = link.getAttribute("href");
      var section = id ? document.querySelector(id) : null;
      if (section) {
        sections.push({ link: link, section: section });
      }

      link.addEventListener("click", function () {
        if (collapse && window.innerWidth < 992) {
          collapse.hide();
        }
      });
    });

    function updateActive() {
      var current = sections[0] ? sections[0].link : null;
      sections.forEach(function (item) {
        var top = item.section.getBoundingClientRect().top;
        if (top - 140 <= 0) {
          current = item.link;
        }
      });

      links.forEach(function (link) {
        link.classList.toggle("active", link === current);
      });
    }

    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
  }

  function initSkillRings() {
    var cards = document.querySelectorAll(".skill-card");
    cards.forEach(function (card) {
      var level = card.getAttribute("data-level") || "0";
      var ring = card.querySelector(".skill-ring");
      if (ring) {
        ring.style.setProperty("--level", level);
        ring.setAttribute("data-text", level + "%");
      }
    });
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.style.opacity = "1";
        item.style.transform = "none";
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = "running";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    items.forEach(function (item, index) {
      item.style.animationPlayState = "paused";
      item.style.animationDelay = index % 6 * 0.06 + "s";
      observer.observe(item);
    });
  }

  function initParticles() {
    var canvas = document.getElementById("particle-canvas");
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    var ctx = canvas.getContext("2d");
    var dots = [];
    var width = 0;
    var height = 0;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      dots = [];
      var count = Math.min(70, Math.floor(width / 28));
      for (var i = 0; i < count; i += 1) {
        dots.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.6 + 0.4,
          s: Math.random() * 0.35 + 0.08
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(110, 180, 255, 0.35)";
      dots.forEach(function (dot) {
        dot.y -= dot.s;
        if (dot.y < -4) {
          dot.y = height + 4;
          dot.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    resize();
    draw();
  }

  function initContactForm() {
    var form = document.getElementById("contact-form");
    var status = document.getElementById("form-status");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();

      if (!name || !email || !message) {
        showStatus("Please fill in your name, email and message.", false);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus("Please enter a valid email address.", false);
        return;
      }

      var subject = encodeURIComponent("Portfolio message from " + name);
      var body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + message);
      window.location.href = "mailto:lalitpmahale@gmail.com?subject=" + subject + "&body=" + body;
      showStatus("Opening your email app to send the message.", true);
      form.reset();
    });

    function showStatus(text, ok) {
      if (!status) {
        return;
      }
      status.textContent = text;
      status.className = "form-status " + (ok ? "success" : "error");
    }
  }

  function initJourney() {
    var track = document.getElementById("journey-track");
    var svg = document.getElementById("journey-svg");
    var basePath = document.getElementById("journey-path-base");
    var drawPath = document.getElementById("journey-path-draw");
    var items = document.querySelectorAll(".journey-item");
    var nodes = document.querySelectorAll(".journey-node");

    if (!track || !svg || !basePath || !drawPath || items.length === 0) {
      return;
    }

    var pathLength = 0;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function buildPath() {
      var trackBox = track.getBoundingClientRect();
      var width = track.offsetWidth;
      var height = track.offsetHeight;
      svg.setAttribute("viewBox", "0 0 " + width + " " + height);
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));

      var points = [];
      nodes.forEach(function (node) {
        var box = node.getBoundingClientRect();
        points.push({
          x: box.left + box.width / 2 - trackBox.left,
          y: box.top + box.height / 2 - trackBox.top
        });
      });

      if (points.length === 0) {
        return;
      }

      var d = "M " + points[0].x + " " + points[0].y;
      for (var i = 1; i < points.length; i += 1) {
        var prev = points[i - 1];
        var curr = points[i];
        var midY = (prev.y + curr.y) / 2;
        var curve = window.innerWidth < 992 ? 36 : 110;
        var direction = i % 2 === 0 ? -curve : curve;
        d +=
          " C " +
          (prev.x + direction) +
          " " +
          midY +
          ", " +
          (curr.x - direction) +
          " " +
          midY +
          ", " +
          curr.x +
          " " +
          curr.y;
      }

      basePath.setAttribute("d", d);
      drawPath.setAttribute("d", d);
      pathLength = drawPath.getTotalLength();
      drawPath.style.strokeDasharray = String(pathLength);
      drawPath.style.strokeDashoffset = reduceMotion ? "0" : String(pathLength);
    }

    function updateOnScroll() {
      var trackBox = track.getBoundingClientRect();
      var start = window.innerHeight * 0.82;
      var end = -trackBox.height + window.innerHeight * 0.25;
      var progress = (start - trackBox.top) / (start - end);
      if (progress < 0) {
        progress = 0;
      }
      if (progress > 1) {
        progress = 1;
      }

      if (!reduceMotion && pathLength) {
        drawPath.style.strokeDashoffset = String(pathLength * (1 - progress));
      }

      items.forEach(function (item) {
        var box = item.getBoundingClientRect();
        var visible = box.top < window.innerHeight * 0.78 && box.bottom > 90;
        var active = box.top < window.innerHeight * 0.48 && box.bottom > window.innerHeight * 0.28;
        item.classList.toggle("is-visible", visible);
        item.classList.toggle("is-active", active);
      });
    }

    var ticking = false;
    function onScroll() {
      if (ticking) {
        return;
      }
      ticking = true;
      requestAnimationFrame(function () {
        updateOnScroll();
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      buildPath();
      updateOnScroll();
    });

    buildPath();
    updateOnScroll();
  }
})();
