(function () {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");

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

  document.querySelectorAll("[data-rail]").forEach((wrap) => {
    const rail = wrap.querySelector(".rail");
    const left = wrap.querySelector(".railBtn.left");
    const right = wrap.querySelector(".railBtn.right");
    if (!rail) return;

    const step = () => Math.max(260, Math.floor(rail.clientWidth * 0.85));

    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth - 2;
      const x = rail.scrollLeft;
      if (left) left.style.visibility = (x <= 2) ? "hidden" : "visible";
      if (right) right.style.visibility = (x >= max) ? "hidden" : "visible";
    };

    const scrollByDir = (dir) => rail.scrollBy({ left: dir * step(), behavior: "smooth" });

    if (left) left.addEventListener("click", () => scrollByDir(-1));
    if (right) right.addEventListener("click", () => scrollByDir(1));

    wrap.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey) {
        rail.scrollBy({ left: e.deltaY, behavior: "auto" });
        e.preventDefault();
      }
    }, { passive: false });

    rail.addEventListener("scroll", () => requestAnimationFrame(update));
    window.addEventListener("resize", () => requestAnimationFrame(update));
    update();
  });
})();
// ===== HERO SLIDER =====
(function () {
  const slider = document.querySelector("[data-hero-slider]");
  if (!slider) return;

  const intervalMs = parseInt(slider.getAttribute("data-interval") || "3500", 10);
  const slides = Array.from(slider.querySelectorAll(".heroSlide"));
  const dotsWrap = slider.querySelector(".heroDots");
  if (slides.length <= 1 || !dotsWrap) return;

  let idx = slides.findIndex(s => s.classList.contains("is-active"));
  if (idx < 0) idx = 0;

  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "heroDot" + (i === idx ? " is-active" : "");
    b.setAttribute("aria-label", `Ir para destaque ${i + 1}`);
    b.addEventListener("click", () => {
      setActive(i);
      restart();
    });
    dotsWrap.appendChild(b);
    return b;
  });

  function setActive(i) {
    slides[idx].classList.remove("is-active");
    dots[idx].classList.remove("is-active");
    idx = i;
    slides[idx].classList.add("is-active");
    dots[idx].classList.add("is-active");
  }

  function next() {
    setActive((idx + 1) % slides.length);
  }

  let timer = null;
  let paused = false;

  function start() {
    if (timer) return;
    timer = setInterval(() => {
      if (!paused) next();
    }, intervalMs);
  }
  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }
  function restart() {
    stop();
    start();
  }

  // pausa quando o usuário está interagindo
  slider.addEventListener("mouseenter", () => paused = true);
  slider.addEventListener("mouseleave", () => paused = false);
  slider.addEventListener("focusin", () => paused = true);
  slider.addEventListener("focusout", () => paused = false);

  // swipe no celular
  let x0 = null;
  slider.addEventListener("touchstart", (e) => {
    x0 = e.touches && e.touches[0] ? e.touches[0].clientX : null;
  }, { passive: true });

  slider.addEventListener("touchend", (e) => {
    if (x0 == null) return;
    const x1 = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : null;
    if (x1 == null) return;

    const dx = x1 - x0;
    if (Math.abs(dx) > 35) {
      if (dx < 0) setActive((idx + 1) % slides.length);
      else setActive((idx - 1 + slides.length) % slides.length);
      restart();
    }
    x0 = null;
  }, { passive: true });

  start();
})();
// ===== Apple-like reveal on scroll =====
(function () {
  // liga o modo "js" no CSS
  document.documentElement.classList.add("js");

  // mede a altura do topo sticky e joga numa CSS var (pra Hero ocupar a tela certinho)
  const top = document.querySelector(".top");
  if (top) {
    document.documentElement.style.setProperty("--topH", top.offsetHeight + "px");
  }

  const sections = Array.from(document.querySelectorAll(".rowSection"));
  if (!sections.length) return;

  const show = (el) => el.classList.add("is-in");

  // fallback (se browser velho)
  if (!("IntersectionObserver" in window)) {
    sections.forEach(show);
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        show(e.target);
        io.unobserve(e.target); // anima uma vez e pronto
      }
    }
  }, { threshold: 0.18, rootMargin: "0px 0px -10% 0px" });

  sections.forEach((s) => io.observe(s));
})();
document.addEventListener("DOMContentLoaded", () => {
  // pega o "prefixo" certo a partir do link de "Início" no menu (funciona em subpastas)
  const home = document.querySelector(".nav a[href]");
  const prefix = home ? home.getAttribute("href") : "./";

  // se algum card estiver linkando para a imagem do Aerado, troca para a página do produto
  document.querySelectorAll('a[href*="assets/img/bolos/aerado"]').forEach((a) => {
    a.setAttribute("href", `${prefix}p/aerado/`);
  });
});
document.addEventListener("DOMContentLoaded", () => {
  // Root (../ ou ./) já existe no seu layout no link da marca
  const root = document.querySelector("a.brand")?.getAttribute("href") || "./";

  // Se algum card estiver apontando para a imagem do bolo, transforma em /p/<slug>/
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    // só mexe se o link atual estiver indo para um arquivo de imagem
    if (!href.match(/\.(png|jpg|jpeg|webp)(\?.*)?$/i)) return;

    const img = a.querySelector("img");
    if (!img) return;

    const src = img.getAttribute("src") || "";
    // só para imagens de bolos do catálogo
    if (!src.includes("/assets/img/bolos/") && !src.includes("\\assets\\img\\bolos\\")) return;

    // slug = nome do arquivo (aerado.png => aerado)
    const file = src.split("/").pop() || "";
    const slug = file.replace(/\.(png|jpg|jpeg|webp)$/i, "").toLowerCase();

    a.setAttribute("href", `${root}p/${slug}/`);
  });
});
