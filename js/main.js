const hideLoader = () => {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.style.opacity = "0";
  loader.style.visibility = "hidden";
  loader.style.display = "none";
};

window.addEventListener("load", () => {
  setTimeout(hideLoader, 150);
});

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(hideLoader, 250);
});

document.addEventListener("DOMContentLoaded", () => {

  // Preloader
  function progressBar() {
    if (window.jQuery) {
      $(".progress").each(function () {
        var ctrl = new ScrollMagic.Controller();
        new ScrollMagic.Scene({ triggerElement: ".progress", triggerHook: "onEnter", duration: 300, })
        .addTo(ctrl)
        .on("enter", function () {
          var progressBar = $(".progress-bar");
          progressBar.each(function () {
            $(this).css({ width: $(this).attr("aria-valuenow") + "%", "z-index": "2" });
          });
        });
      });
    }
  }

  // Preloader animation
  function preloader() {
    if (typeof anime === "undefined") {
      hideLoader();
      return;
    }

    var tl = anime.timeline({});
    tl.add({ targets: ".loader", duration: 300, opacity: 1, easing: "easeInOutQuart", })
    .add({ targets: ".preloader__progress span", duration: 500, width: "100%", easing: "easeInOutQuart", }, "-=200")
    .add({ targets: ".preloader", duration: 500, opacity: 0, zIndex: -1, easing: "easeInOutQuart",
      complete: function () {
        hideLoader();
        const homeSection = document.getElementById("home");
        if (homeSection) homeSection.style.display = "block";
        if (typeof initAnimations === "function") {
          initAnimations();
        }
      },
    });
  }

  preloader();

  if (typeof anime !== "undefined") {
    anime({ targets: "body", opacity: 1, delay: 400,
      complete: function () {
        progressBar();
      },
    });
  } else {
    document.body.style.opacity = "1";
    progressBar();
  }

  function initAnimations() {
    function countUp(element, duration = 2000) {
      const target = parseInt(element.textContent);
      if (isNaN(target)) return;
      let start = 0;
      const increment = target / (duration / 16);
      element.textContent = "0";
      const updateCounter = () => {
        start += increment;
        if (start < target) {
          element.textContent = Math.ceil(start);
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target;
        }
      };
      updateCounter();
    }

    function initCountUp(containerSelector, numberSelector = ".counter") {
      const container = document.querySelector(containerSelector);
      if (!container) return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.querySelectorAll(numberSelector).forEach((el) => {
              countUp(el, 2500);
            });
            observer.disconnect();
          }
        });
      }, { threshold: 0.5 });

      observer.observe(container);
    }
    initCountUp(".profile__info");

    const initSkills = () => {
      const skillsSection = document.getElementById("skills");
      if (!skillsSection) return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const progressBars = entry.target.querySelectorAll(".progress-bar");
            progressBars.forEach((progressBar) => {
              progressBar.style.animation = "progressAnimation 3s ease-in-out forwards";
            });
            observer.disconnect();
          }
        });
      }, { threshold: 0.5 });
      observer.observe(skillsSection);
    };
    initSkills();

    const isMobile = window.innerWidth <= 768;
    if (typeof ScrollReveal !== "undefined") {
      const sr = ScrollReveal({
        origin: 'top',
        distance: '60px',
        duration: 2000,
        delay: 200,
        opacity: 0,
        easing: 'cubic-bezier(0.5, 0, 0, 1)',
        reset: true,
      });
      sr.reveal(`.profile__border, .profile__name`);
      sr.reveal(`.profile__social, .profile_profession, .profile__info-group, .profile__buttons`, { origin: 'bottom' });
      sr.reveal(`.projects__card, .skills__area, .resume__area`, { origin: 'bottom', reset: !isMobile, interval: isMobile ? 0 : 100 });
      sr.reveal(`.note`, { origin: 'left' });
      sr.reveal(`.resume__step__time`, { origin: 'right', reset: !isMobile });
      sr.reveal(`.about__box .icon img`, { origin: 'bottom', scale: 0.9, rotate: { z: 45 }, reset: !isMobile });
    }
  }

  const bottomMenu = document.querySelector(".nav__menu");
  const menuHideBtn = document.querySelector(".menu-hide-btn");
  const menuShowBtn = document.querySelector(".menu-show-btn");

  if (bottomMenu && menuHideBtn && menuShowBtn) {
    let menuTimeout;
    let isHoveringMenu = false;
    checkScrollPosition();
    window.addEventListener("scroll", handleScroll);
    menuHideBtn.addEventListener("click", hideMenuManual);
    menuShowBtn.addEventListener("click", showMenuManual);

    bottomMenu.addEventListener("mouseenter", () => {
      isHoveringMenu = true;
      clearTimeout(menuTimeout);
      if (window.scrollY > 10) {
        menuHideBtn.classList.add("show");
      }
    });

    bottomMenu.addEventListener("mouseleave", () => {
      isHoveringMenu = false;
      if (window.scrollY > 10 && !menuHideBtn.matches(":hover")) {
        menuTimeout = setTimeout(hideMenuAuto, 2500);
      }
    });

    menuHideBtn.addEventListener("mouseenter", () => {
      isHoveringMenu = true;
      clearTimeout(menuTimeout);
    });

    menuHideBtn.addEventListener("mouseleave", () => {
      isHoveringMenu = false;
      if (window.scrollY > 10) {
        menuTimeout = setTimeout(hideMenuAuto, 2500);
      }
    });

    function checkScrollPosition() {
      if (window.scrollY < 10) {
        menuHideBtn.classList.remove("show");
      } else {
        menuHideBtn.classList.add("show");
      }
    }

    function handleScroll() {
      showMenu();
      if (!isHoveringMenu) {
        clearTimeout(menuTimeout);
        menuTimeout = setTimeout(hideMenuAuto, 2500);
      }
    }

    function showMenu() {
      bottomMenu.classList.remove("hide");
      if (window.scrollY > 10) {
        menuHideBtn.classList.add("show");
      }
      menuShowBtn.classList.remove("active");
      checkScrollPosition();
    }

    function hideMenuAuto() {
      if (window.scrollY > 10 && !isHoveringMenu) {
        bottomMenu.classList.add("hide");
        menuHideBtn.classList.remove("show");
        menuShowBtn.classList.add("active");
      }
    }

    function hideMenuManual() {
      bottomMenu.classList.add("hide");
      menuHideBtn.classList.remove("show");
      menuShowBtn.classList.add("active");
      isHoveringMenu = false;
    }

    function showMenuManual() {
      bottomMenu.classList.remove("hide");
      menuShowBtn.classList.remove("active");
      if (window.scrollY > 10) {
        menuHideBtn.classList.add("show");
      }
      if (!isHoveringMenu) {
        clearTimeout(menuTimeout);
        menuTimeout = setTimeout(hideMenuAuto, 2500);
      }
    }
  }

  const sections = document.querySelectorAll("section[id]");
  const menuLinks = document.querySelectorAll(".nav__menu a[href*='#']");
  if (menuLinks.length) {
    window.addEventListener("scroll", () => {
      let scrollY = window.pageYOffset;
      sections.forEach((current) => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 50;
        const sectionId = current.getAttribute("id");
        const link = document.querySelector(`.nav__menu a[href*="${sectionId}"]`);
        if (link) {
          link.classList.toggle("active-link", scrollY > sectionTop && scrollY <= sectionTop + sectionHeight);
        }
      });
    });
  }

  const body = document.querySelector("body");
  const modeToggle = document.querySelector(".dark-light");
  const themeToggle = document.getElementById("themeToggle");

  if (body && modeToggle && themeToggle) {
    const savedMode = localStorage.getItem("mode");
    const toggleMode = (isDark, skipSound = false) => {
      body.classList.toggle("dark", isDark);
      modeToggle.classList.toggle("active", isDark);
      themeToggle.checked = isDark;
      localStorage.setItem("mode", isDark ? "dark-mode" : "light-mode");
    };

    if (savedMode === "dark-mode") {
      toggleMode(true, true);
    } else {
      themeToggle.checked = false;
    }

    modeToggle.addEventListener("click", () => {
      toggleMode(!body.classList.contains("dark"));
    });

    themeToggle.addEventListener("change", function () {
      toggleMode(this.checked);
    });
  }

  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  if (typeof Typed !== "undefined") {
    new Typed(".typing-text", {
      strings: ['Developer', 'Designer', 'Coder', 'Creator'],
      typeSpeed: 100,
      backSpeed: 60,
      backDelay: 1500,
      loop: true
    });
  }

  const languageBtn = document.getElementById("languageBtn");
  const elementsToTranslate = document.querySelectorAll("[data-vi]");
  if (languageBtn && elementsToTranslate.length) {
    let currentLanguage = localStorage.getItem("language") || "en";

    elementsToTranslate.forEach((element) => {
      if (!element.dataset.original) {
        if ((element.tagName === "INPUT" || element.tagName === "TEXTAREA") && element.hasAttribute("placeholder")) {
          element.dataset.original = element.placeholder;
        } else {
          element.dataset.original = element.innerHTML;
        }
      }
    });

    function applyLanguage(lang, skipSound = false) {
      document.body.classList.remove("language-en", "language-vi");
      document.body.classList.add(`language-${lang}`);
      elementsToTranslate.forEach((element) => {
        if ((element.tagName === "INPUT" || element.tagName === "TEXTAREA") && element.hasAttribute("placeholder")) {
          if (lang === "vi") {
            element.placeholder = element.getAttribute("data-vi");
          } else {
            element.placeholder = element.dataset.original;
          }
          return;
        }

        if (lang === "vi") {
          element.innerHTML = element.getAttribute("data-vi");
        } else {
          element.innerHTML = element.dataset.original;
        }
      });

      languageBtn.classList.toggle("vi", lang === "vi");
      localStorage.setItem("language", lang);
      currentLanguage = lang;
    }

    languageBtn.addEventListener("click", () => {
      const newLanguage = currentLanguage === "en" ? "vi" : "en";
      applyLanguage(newLanguage);
    });

    applyLanguage(currentLanguage, true);
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const timeInput = document.getElementById("time");
      const pageUrlInput = document.getElementById("page-url");
      if (timeInput) timeInput.value = new Date().toLocaleString("vi-VN");
      if (pageUrlInput) pageUrlInput.value = window.location.href;
      this.submit();
    });
  }

  const chatbotToggler = document.getElementById("chatbot-toggler");
  const closeChatbot = document.getElementById("close-chatbot");
  if (chatbotToggler && closeChatbot) {
    chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
    closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
  }

  // Final fallback to ensure loader disappears even if other scripts are slow
  setTimeout(hideLoader, 1200);
});
