(() => {
  const root = document.documentElement;
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".main-nav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileMenu = window.matchMedia("(max-width: 47.99rem)");

  requestAnimationFrame(() => document.body.classList.add("is-ready"));

  const language = new URLSearchParams(window.location.search).get("lang");
  const languageLinks = [...document.querySelectorAll(".language-switcher a[lang]")];
  const activeLanguage = languageLinks.find((link) => link.lang === language);

  if (activeLanguage) {
    languageLinks.forEach((link) => {
      const isCurrent = link === activeLanguage;
      if (isCurrent) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
      link.setAttribute("aria-label", `${link.textContent.trim()}${isCurrent ? ", current language" : ""}`);
    });
  }

  const reveals = [...document.querySelectorAll(".scroll-reveal")];

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10%", threshold: .08 });

    reveals.forEach((element) => revealObserver.observe(element));
  }

  if (toggle && menu) {
    const stage = document.querySelector(".stage");
    const obscuredContent = [
      ...(stage ? [...stage.children].filter((element) => !element.classList.contains("topbar")) : []),
      ...document.querySelectorAll("main > :not(.stage), .site-footer"),
    ];

    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

    const setMenu = (open, { restoreFocus = false } = {}) => {
      const nextOpen = Boolean(open && mobileMenu.matches);
      toggle.setAttribute("aria-expanded", String(nextOpen));
      toggle.setAttribute("aria-label", nextOpen ? "Close menu" : "Open menu");
      menu.dataset.open = String(nextOpen);
      menu.setAttribute("aria-hidden", String(mobileMenu.matches && !nextOpen));
      document.body.classList.toggle("menu-open", nextOpen);
      obscuredContent.forEach((element) => element.toggleAttribute("inert", nextOpen));

      if (!nextOpen && restoreFocus) {
        requestAnimationFrame(() => toggle.focus({ preventScroll: true }));
      }
    };

    toggle.addEventListener("click", () => {
      setMenu(!isOpen());
    });

    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false, { restoreFocus: true });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) {
        setMenu(false, { restoreFocus: true });
        return;
      }

      if (event.key === "Tab" && isOpen()) {
        const focusable = [...document.querySelectorAll(".topbar a[href], .topbar button:not([disabled])")]
          .filter((element) => getComputedStyle(element).visibility !== "hidden");
        const first = focusable[0];
        const last = focusable.at(-1);

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    mobileMenu.addEventListener("change", () => setMenu(false));
    setMenu(false);
  }

  const newsletterForm = document.querySelector("[data-newsletter-form]");

  if (newsletterForm) {
    const email = newsletterForm.querySelector("input[type='email']");
    const button = newsletterForm.querySelector("button[type='submit']");
    const buttonLabel = button?.querySelector("span");
    const buttonMark = button?.querySelector("i");
    const status = newsletterForm.querySelector(".newsletter-status");

    newsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!newsletterForm.reportValidity()) return;

      newsletterForm.dataset.state = "success";
      if (email) email.readOnly = true;
      if (button) button.disabled = true;
      if (buttonLabel) buttonLabel.textContent = "Subscribed";
      if (buttonMark) buttonMark.textContent = "✓";
      if (status) status.textContent = "Thank you. The next letter will find its way to you.";
    });
  }

  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    let frame = 0;
    window.addEventListener("pointermove", (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--px", ((event.clientX / innerWidth) - .5).toFixed(3));
        root.style.setProperty("--py", ((event.clientY / innerHeight) - .5).toFixed(3));
        frame = 0;
      });
    }, { passive: true });
  }
})();
