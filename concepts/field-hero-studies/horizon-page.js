(() => {
  const orbit = document.querySelector("[data-project-orbit]");
  if (!orbit) return;

  const projects = [
    {
      title: "VETRA",
      titleLines: ["VETRA"],
      shortTitle: "VETRA",
      category: "Ragnhild Hemsing · Folk-jazz band",
      world: "vetra",
      proposition: "Folk melody, jazz improvisation and the elemental sound of a Norwegian winter.",
      href: "/projects/vetra/",
      alt: "Ragnhild Hemsing in white against snow-covered mountains, her dress caught by the wind.",
      credit: "Cathrine Dokken",
    },
    {
      title: "The Norwegian Seasons",
      titleLines: ["The Norwegian", "Seasons"],
      shortTitle: "Seasons",
      category: "Vivaldi · Baroque / folk",
      world: "seasons",
      proposition: "Vivaldi meets Norwegian folk tradition through the Hardanger fiddle and Barokkanerne.",
      href: "/projects/vivaldi-the-norwegian-seasons/",
      alt: "Ragnhild Hemsing standing in a golden field in a vivid yellow gown, holding the Hardanger fiddle.",
      credit: "Cathrine Dokken",
    },
    {
      title: "Peer Gynt",
      titleLines: ["Peer", "Gynt"],
      shortTitle: "Peer Gynt",
      category: "Grieg reimagined",
      world: "peer",
      proposition: "Grieg’s story-world retold through violin, Hardanger fiddle and strings.",
      href: "/projects/peer-gynt/",
      alt: "Ragnhild Hemsing in a red gown on a high rocky ledge above a fjord, with violin and Hardanger fiddle.",
      credit: "Nikolaj Lund",
    },
  ];

  const stage = orbit.querySelector(".project-orbit__stage");
  const panel = orbit.querySelector("[role='tabpanel']");
  const tabs = [...orbit.querySelectorAll("[data-project-tab]")];
  const images = [...orbit.querySelectorAll("[data-project-image]")];
  const atmosphereImages = [...orbit.querySelectorAll("[data-project-atmosphere]")];
  const title = orbit.querySelector("[data-project-title]");
  const titleEcho = orbit.querySelector("[data-project-echo]");
  const category = orbit.querySelector("[data-project-category]");
  const proposition = orbit.querySelector("[data-project-proposition]");
  const link = orbit.querySelector("[data-project-link]");
  const credit = orbit.querySelector("[data-project-credit]");
  const previous = orbit.querySelector("[data-project-previous]");
  const next = orbit.querySelector("[data-project-next]");
  let activeIndex = 0;
  let orbitStep = 0;
  let touchStart = null;

  if (!stage || !panel || !title || !titleEcho || tabs.length !== projects.length || images.length !== projects.length || atmosphereImages.length !== projects.length) return;

  const render = (index, animate = true) => {
    const project = projects[index];
    images.forEach((image, imageIndex) => {
      const isActive = imageIndex === index;
      image.dataset.active = String(isActive);
      image.alt = isActive ? projects[imageIndex].alt : "";
      image.toggleAttribute("aria-hidden", !isActive);
    });

    atmosphereImages.forEach((image, imageIndex) => {
      image.dataset.active = String(imageIndex === index);
    });

    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === index;
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      tab.dataset.state = isActive ? "active" : "inactive";
    });

    const titleFragments = project.titleLines.map((line, lineIndex) => {
      const fragment = document.createElement("span");
      fragment.textContent = lineIndex < project.titleLines.length - 1 ? `${line} ` : line;
      return fragment;
    });
    title.replaceChildren(...titleFragments);
    titleEcho.replaceChildren(...titleFragments.map((fragment) => fragment.cloneNode(true)));
    category.textContent = project.category;
    proposition.textContent = project.proposition;
    link.href = project.href;
    link.firstChild.textContent = `Enter ${project.shortTitle} `;
    credit.textContent = `Photo · ${project.credit}`;
    panel.setAttribute("aria-labelledby", `project-tab-${index}`);
    orbit.dataset.world = project.world;
    stage.style.setProperty("--arc-turn", `${orbitStep * 3}deg`);
    stage.style.setProperty("--thread-shift", `${orbitStep * .28}rem`);

    if (animate) {
      panel.removeAttribute("data-changing");
      requestAnimationFrame(() => panel.setAttribute("data-changing", "true"));
    }
  };

  const selectProject = (index, { focus = false } = {}) => {
    const tabHadFocus = tabs.includes(document.activeElement);
    if (index !== activeIndex) {
      let delta = index - activeIndex;
      if (Math.abs(delta) > projects.length / 2) delta -= Math.sign(delta) * projects.length;
      orbitStep += delta;
      activeIndex = index;
      render(index);
    }
    if (focus || tabHadFocus) tabs[index].focus();
  };

  const selectRelative = (direction) => {
    selectProject((activeIndex + direction + projects.length) % projects.length);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectProject(index));
    tab.addEventListener("keydown", (event) => {
      let destination = null;
      if (event.key === "ArrowLeft") destination = (index - 1 + projects.length) % projects.length;
      if (event.key === "ArrowRight") destination = (index + 1) % projects.length;
      if (event.key === "Home") destination = 0;
      if (event.key === "End") destination = projects.length - 1;
      if (destination === null) return;
      event.preventDefault();
      selectProject(destination, { focus: true });
    });
  });

  previous.addEventListener("click", () => selectRelative(-1));
  next.addEventListener("click", () => selectRelative(1));

  stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" || event.target.closest("a, button")) return;
    stage.setPointerCapture(event.pointerId);
    touchStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });

  stage.addEventListener("pointerup", (event) => {
    if (!touchStart || touchStart.id !== event.pointerId) return;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    const deltaX = event.clientX - touchStart.x;
    const deltaY = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    selectRelative(deltaX < 0 ? 1 : -1);
  });

  stage.addEventListener("pointercancel", (event) => {
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    touchStart = null;
  });

  const reveal = () => {
    orbit.dataset.entered = "true";
  };

  orbit.classList.add("is-orbit-ready");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    reveal();
  } else {
    const entranceObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      reveal();
      observer.disconnect();
    }, { threshold: 0.18 });
    entranceObserver.observe(orbit);
  }

  render(0, false);
})();
