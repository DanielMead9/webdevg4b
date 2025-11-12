const KEYS = { theme: "pref-theme", font: "pref-font-size" };

function setTheme(dark) {
  const root = document.documentElement;
  if (dark) {
    root.classList.add("dark");
    localStorage.setItem(KEYS.theme, "dark");
    const icon = document.getElementById("theme-icon");
    if (icon) icon.textContent = "☀️";
  } else {
    root.classList.remove("dark");
    localStorage.setItem(KEYS.theme, "light");
    const icon = document.getElementById("theme-icon");
    if (icon) icon.textContent = "🌙";
  }
}
function initTheme() {
  const saved = localStorage.getItem(KEYS.theme);
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(saved ? saved === "dark" : prefersDark);
}

function setFont(px) {
  px = Math.max(14, Math.min(20, px));
  document.documentElement.style.setProperty("--base-font-size", px + "px");
  localStorage.setItem(KEYS.font, String(px));
}
function initFont() {
  const saved = parseInt(localStorage.getItem(KEYS.font) || "16", 10);
  setFont(saved);
}

function luhnCheck(num) {
  if (!num) return false;
  const s = String(num).replace(/[\s-]/g, "");
  if (!/^\d{12,19}$/.test(s)) return false;
  let sum = 0,
    dbl = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let d = +s[i];
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

function initUI() {
  const themeBtn = document.getElementById("theme-toggle");
  const themeBtnM = document.getElementById("theme-toggle-m");
  const dec = document.getElementById("decrease-font");
  const inc = document.getElementById("increase-font");
  const decM = document.getElementById("decrease-font-m");
  const incM = document.getElementById("increase-font-m");
  const menu = document.getElementById("menu-toggle");
  const mobile = document.getElementById("mobile-menu");

  const toggleTheme = () =>
    setTheme(!document.documentElement.classList.contains("dark"));
  [themeBtn, themeBtnM].forEach(
    (b) => b && b.addEventListener("click", toggleTheme)
  );

  const change = (delta) => () => {
    const current = parseInt(
      getComputedStyle(document.documentElement).fontSize,
      10
    );
    setFont(current + delta);
  };
  [
    [dec, -2],
    [inc, 2],
    [decM, -2],
    [incM, 2],
  ].forEach(([el, d]) => el && el.addEventListener("click", change(d)));

  if (menu && mobile) {
    menu.addEventListener("click", () => {
      const open = !mobile.classList.contains("hidden");
      mobile.classList.toggle("hidden");
      menu.setAttribute("aria-expanded", String(!open));
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Contact page simulated validator
  const form = document.getElementById("checkout-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const cc = (document.getElementById("cc-number") || {}).value || "";
      const out = document.getElementById("cc-result");
      const valid = luhnCheck(cc);
      if (out)
        out.textContent = valid
          ? "✔ Looks like a valid number format."
          : "✖ Not a valid card number.";
    });
  }
}

initTheme();
initFont();
initUI();
