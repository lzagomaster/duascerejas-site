(function () {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");

  // tema salvo
  const saved = localStorage.getItem("dc_theme");
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  const setIcon = () => {
    const t = root.getAttribute("data-theme") || "dark";
    if (btn) btn.textContent = (t === "dark") ? "☾" : "☀";
  };
  setIcon();

  if (btn) {
    btn.addEventListener("click", () => {
      const cur = root.getAttribute("data-theme") || "dark";
      const next = (cur === "dark") ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("dc_theme", next);
      setIcon();
    });
  }

  // rails (setas estilo netflix)
  document.querySelectorAll("[data-rail]").forEach((wrap) => {
    const rail = wrap.querySelector(".rail");
    const inner = wrap.querySelector(".railInner");
    const left = wrap.querySelector(".railBtn.left");
    const right = wrap.querySelector(".railBtn.right");
    if (!rail || !inner) return;

    const step = () => Math.max(260, Math.floor(rail.clientWidth * 0.85));

    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth - 2;
      const x = rail.scrollLeft;
      if (left) left.style.visibility = (x <= 2) ? "hidden" : "visible";
      if (right) right.style.visibility = (x >= max) ? "hidden" : "visible";
    };

    const scrollByDir = (dir) => {
      rail.scrollBy({ left: dir * step(), behavior: "smooth" });
    };

    if (left) left.addEventListener("click", () => scrollByDir(-1));
    if (right) right.addEventListener("click", () => scrollByDir(1));

    // “surf”: roda a rodinha do mouse e ele vai pro lado
    wrap.addEventListener("wheel", (e) => {
      // só intercepta se for vertical e sem shift
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey) {
        rail.scrollBy({ left: e.deltaY, behavior: "auto" });
        e.preventDefault();
      }
    }, { passive: false });

    rail.addEventListener("scroll", () => requestAnimationFrame(update));
    window.addEventListener("resize", () => requestAnimationFrame(update));

    // inicial
    update();
  });

})();
