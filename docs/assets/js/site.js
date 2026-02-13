(function () {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");

  // tema salvo
  const saved = localStorage.getItem("dc_theme");
  if (saved === "light" || saved === "dark") {
    root.setAttribute("data-theme", saved);
  }

  // ícone
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

  // nav ativo (simples)
  const path = location.pathname.replace(/\/+$/, "");
  document.querySelectorAll(".nav a").forEach(a => {
    const href = a.getAttribute("href") || "";
    // marca por contenção do caminho final
    if (href !== "./" && path.includes(href.replace("./", "").replace("/", ""))) {
      a.style.background = "var(--card)";
      a.style.borderColor = "var(--border)";
      a.style.color = "var(--text)";
    }
  });
})();
