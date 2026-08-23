import { bootAnimations } from './animation.js';
import { bootInteractions } from './interaction.js';
import { renderAll } from './content.js';

export async function loadPortfolioData() {
  const [config, site] = await Promise.all([
    fetch('json/config.json').then((response) => response.json()),
    fetch('json/site.json').then((response) => response.json())
  ]);

  const storedLanguage = localStorage.getItem('portfolio-language');
  const initialLanguage = config.language.some((item) => item.dil === storedLanguage)
    ? storedLanguage
    : config.defaultLanguage;
  const languagePath = config.language.find((item) => item.dil === initialLanguage)?.path || config.language[0].path;
  const language = await fetch(languagePath).then((response) => response.json());

  window.PORTFOLIO = { config, site, language };
  document.documentElement.lang = language.lang;
  document.documentElement.dataset.theme = localStorage.getItem('portfolio-theme') || 'dark';
  // Do not force site.json colors as inline styles — they break light mode.
  // Only apply optional radii from site.json.
  applyRadii(site.theme);

  renderAll();
  bootAnimations();
  bootInteractions();
}

export async function changeLanguage(languageCode) {
  const { config, site } = window.PORTFOLIO;
  const target = config.language.find((item) => item.dil === languageCode);
  if (!target) return;
  const language = await fetch(target.path).then((response) => response.json());
  window.PORTFOLIO.language = language;
  localStorage.setItem('portfolio-language', languageCode);
  document.documentElement.lang = language.lang;
  renderAll();
  bootAnimations(true);
  bootInteractions(true);
  applyRadii(site.theme);
}

export function applyRadii(theme) {
  if (!theme?.radii) return;
  const root = document.documentElement;
  Object.entries(theme.radii).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });
}

export function setTheme(themeName) {
  const next = themeName === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('portfolio-theme', next);
  // Clear any leftover inline color overrides from older builds
  const root = document.documentElement;
  [
    'background', 'surface', 'surface-alt', 'text', 'muted', 'line',
    'accent', 'accent-soft', 'hot', 'glow', 'glow-strong'
  ].forEach((name) => {
    root.style.removeProperty(`--color-${name}`);
  });
}
