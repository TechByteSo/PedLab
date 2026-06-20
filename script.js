(function () {
  "use strict";

  var MOBILE_NAV_MQ = "(max-width: 767px)";

  /* ===== Mobile menu ===== */
  var header = document.getElementById("header");
  var nav = document.getElementById("nav-menu");
  var burger = header && header.querySelector(".header__burger");
  var overlay = header && header.querySelector(".header__overlay");
  var navLinks = header ? header.querySelectorAll(".header__link, .header__cabinet") : [];
  var navFocusables = nav ? nav.querySelectorAll("a, button") : [];

  function isMobileNav() {
    return window.matchMedia(MOBILE_NAV_MQ).matches;
  }

  function syncNavAccessibility() {
    if (!header || !nav) return;

    var isOpen = header.classList.contains("header--open");
    var mobile = isMobileNav();

    if (mobile && !isOpen) {
      nav.setAttribute("aria-hidden", "true");
      if ("inert" in nav) {
        nav.inert = true;
      } else {
        navFocusables.forEach(function (el) {
          el.setAttribute("tabindex", "-1");
        });
      }
    } else {
      nav.removeAttribute("aria-hidden");
      if ("inert" in nav) {
        nav.inert = false;
      } else {
        navFocusables.forEach(function (el) {
          el.removeAttribute("tabindex");
        });
      }
    }

    if (overlay) {
      overlay.setAttribute("aria-hidden", mobile && isOpen ? "false" : "true");
    }
  }

  function updateBurgerState(isOpen) {
    if (!burger) return;
    burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    burger.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  }

  function closeMenu() {
    if (!header) return;
    header.classList.remove("header--open");
    updateBurgerState(false);
    document.body.style.overflow = "";
    syncNavAccessibility();
  }

  function openMenu() {
    if (!header || !isMobileNav()) return;
    header.classList.add("header--open");
    updateBurgerState(true);
    document.body.style.overflow = "hidden";
    syncNavAccessibility();
  }

  function toggleMenu() {
    if (!isMobileNav()) return;
    if (header.classList.contains("header--open")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (burger) {
    burger.addEventListener("click", toggleMenu);
  }

  if (overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (isMobileNav()) closeMenu();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener(
    "resize",
    function () {
      if (!isMobileNav()) {
        closeMenu();
      }
      syncNavAccessibility();
    },
    { passive: true }
  );

  syncNavAccessibility();
  updateBurgerState(false);

  /* ===== Scroll reveal ===== */
  var animatedElements = document.querySelectorAll(".animate-on-scroll");

  if ("IntersectionObserver" in window && animatedElements.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-on-scroll--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    animatedElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    animatedElements.forEach(function (el) {
      el.classList.add("animate-on-scroll--visible");
    });
  }

  /* ===== Reviews slider ===== */
  var slider = document.querySelector("[data-reviews-slider]");

  if (slider) {
    var track = slider.querySelector(".reviews-slider__track");
    var slides = slider.querySelectorAll(".reviews-slider__slide");
    var prevBtn = slider.querySelector(".reviews-slider__btn--prev");
    var nextBtn = slider.querySelector(".reviews-slider__btn--next");
    var dotsContainer = slider.querySelector(".reviews-slider__dots");
    var currentIndex = 0;
    var totalSlides = slides.length;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "reviews-slider__dot" + (i === 0 ? " reviews-slider__dot--active" : "");
      dot.setAttribute("aria-label", "Отзыв " + (i + 1));
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
      dot.addEventListener("click", function () {
        goToSlide(i);
      });
      dotsContainer.appendChild(dot);
    });

    var dots = dotsContainer.querySelectorAll(".reviews-slider__dot");

    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
      track.style.transform = "translateX(-" + currentIndex * 100 + "%)";

      dots.forEach(function (dot, i) {
        var isActive = i === currentIndex;
        dot.classList.toggle("reviews-slider__dot--active", isActive);
        dot.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === totalSlides - 1;
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goToSlide(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goToSlide(currentIndex + 1);
      });
    }

    var touchStartX = 0;

    slider.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchend",
      function (e) {
        var touchEndX = e.changedTouches[0].screenX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          goToSlide(currentIndex + (diff > 0 ? 1 : -1));
        }
      },
      { passive: true }
    );

    goToSlide(0);

    window.addEventListener(
      "resize",
      function () {
        goToSlide(currentIndex);
      },
      { passive: true }
    );
  }

  /* ===== Booking form ===== */
  var bookingForm = document.getElementById("booking-form");
  var bookingMessage = document.getElementById("booking-message");
  var tutorSelect = document.getElementById("booking-tutor");

  document.querySelectorAll("[data-tutor]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tutor = btn.getAttribute("data-tutor");
      if (tutorSelect) {
        tutorSelect.value = tutor;
      }
    });
  });

  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!bookingForm.checkValidity()) {
        bookingForm.reportValidity();
        return;
      }

      var formData = new FormData(bookingForm);
      var tutor = formData.get("tutor");
      var date = formData.get("date");
      var time = formData.get("time");

      if (bookingMessage) {
        bookingMessage.textContent =
          "Заявка принята! " +
          tutor +
          ", " +
          date +
          " в " +
          time +
          ". Мы свяжемся с вами — интеграция с расписанием скоро.";
      }

      bookingForm.reset();
    });
  }

  /* ===== Header shadow on scroll ===== */
  if (header) {
    window.addEventListener(
      "scroll",
      function () {
        header.classList.toggle("header--scrolled", window.scrollY > 20);
      },
      { passive: true }
    );
  }
})();
