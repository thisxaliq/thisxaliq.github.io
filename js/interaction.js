import { changeLanguage, setTheme } from './main.js';

let cleanups = [];

export function bootInteractions(rebind = false) {
  if (rebind) {
    cleanups.forEach((cleanup) => {
      if (typeof cleanup === 'function') cleanup();
      else if (Array.isArray(cleanup)) cleanup.forEach((fn) => typeof fn === 'function' && fn());
    });
  }
  cleanups = [];
  cleanups.push(bindScrollLinks());
  cleanups.push(bindCursor());
  cleanups.push(bindTheme());
  cleanups.push(bindLanguage());
  cleanups.push(bindMenu());
  cleanups.push(bindCopyMail());
  cleanups.push(bindScrollProgress());
  cleanups.push(bindCardGlow());
  cleanups.push(bindMagnetic());
}

function listen(element, event, handler, options) {
  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options);
}

function bindScrollLinks() {
  const links = document.querySelectorAll('[data-scroll-link]');
  const localCleanups = [...links].map((link) =>
    listen(link, 'click', (event) => {
      const id = link.getAttribute('href');
      if (!id?.startsWith('#')) return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      const headerOffset = 78;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
      document.querySelector('[data-mobile-menu]')?.classList.remove('is-open');
    })
  );
  return () => localCleanups.forEach((fn) => fn());
}

function bindCursor() {
  const move = (event) => {
    document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
  };
  const over = () => document.body.classList.add('is-hovering');
  const out = () => document.body.classList.remove('is-hovering');
  const targets = document.querySelectorAll('a, button, .glowCard, .skillCard, .projectIdea, .experience__item');
  const cursorListeners = [
    listen(window, 'pointermove', move),
    ...[...targets].flatMap((target) => [
      listen(target, 'pointerenter', over),
      listen(target, 'pointerleave', out)
    ])
  ];
  return () => cursorListeners.forEach((fn) => fn());
}

function bindTheme() {
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return () => {};
  return listen(button, 'click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    const label =
      next === 'light'
        ? window.PORTFOLIO.language.ui.dark
        : window.PORTFOLIO.language.ui.light;
    button.textContent = label;
  });
}

function bindLanguage() {
  const picker = document.querySelector('[data-language-picker]');
  if (!picker) return () => {};
  const handler = async (event) => {
    const btn = event.target.closest('[data-lang]');
    if (!btn) return;
    const code = btn.getAttribute('data-lang');
    if (!code || code === window.PORTFOLIO.language.lang) return;
    await changeLanguage(code);
  };
  return listen(picker, 'click', handler);
}

function bindMenu() {
  const menu = document.querySelector('[data-mobile-menu]');
  if (!menu) return () => {};

  const openMenu = () => {
    menu.classList.add('is-open');
    document.body.classList.add('is-menu-open');
  };

  const closeMenu = () => {
    menu.classList.remove('is-open');
    document.body.classList.remove('is-menu-open');
  };

  const onDocumentClick = (event) => {
    const toggle = event.target.closest('[data-menu-toggle]');
    const closeBtn = event.target.closest('[data-mobile-close]');
    const link = event.target.closest('[data-mobile-menu] [data-scroll-link]');

    if (toggle) {
      event.preventDefault();
      event.stopPropagation();
      if (menu.classList.contains('is-open')) closeMenu();
      else openMenu();
      return;
    }

    if (closeBtn || link) {
      closeMenu();
    }
  };

  const onKey = (event) => {
    if (event.key === 'Escape') closeMenu();
  };

  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKey);

  return () => {
    document.removeEventListener('click', onDocumentClick);
    document.removeEventListener('keydown', onKey);
    closeMenu();
  };
}

function bindCopyMail() {
  const button = document.querySelector('[data-copy-email]');
  if (!button) return () => {};
  const handler = async () => {
    try {
      await navigator.clipboard.writeText(window.PORTFOLIO.site.person.email);
      const original = button.textContent;
      button.textContent = button.dataset.copiedLabel;
      showToast(button.dataset.copiedLabel);
      setTimeout(() => {
        button.textContent = original;
      }, 1300);
    } catch {
      window.location.href = `mailto:${window.PORTFOLIO.site.person.email}`;
    }
  };
  return listen(button, 'click', handler);
}

function bindScrollProgress() {
  const handler = () => {
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const value = documentHeight > 0 ? window.scrollY / documentHeight : 0;
    document.documentElement.style.setProperty('--scroll-progress', value.toFixed(3));
  };
  handler();
  return listen(window, 'scroll', handler, { passive: true });
}

/**
 * Mouse-follow glow on every .glowCard.
 * Light tracks pointer coordinates while inside a card; otherwise stays off.
 */
function bindCardGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return () => {};

  const cards = () => [...document.querySelectorAll('.glowCard')];
  let raf = 0;
  let lastEvent = null;

  const update = () => {
    raf = 0;
    if (!lastEvent) return;
    const event = lastEvent;
    const list = cards();

    list.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (inside) {
        const mx = ((event.clientX - rect.left) / rect.width) * 100;
        const my = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', `${mx}%`);
        card.style.setProperty('--my', `${my}%`);
        card.classList.add('is-near');
      } else {
        card.classList.remove('is-near');
      }
    });
  };

  const move = (event) => {
    lastEvent = event;
    if (!raf) raf = requestAnimationFrame(update);
  };

  const leave = () => {
    cards().forEach((card) => card.classList.remove('is-near'));
    lastEvent = null;
  };

  const onScroll = () => {
    if (lastEvent && !raf) raf = requestAnimationFrame(update);
  };

  return [
    listen(window, 'pointermove', move),
    listen(document, 'pointerleave', leave),
    listen(window, 'scroll', onScroll, { passive: true })
  ];
}

function bindMagnetic() {
  const elements = document.querySelectorAll('.magnetic');
  const handlers = [...elements]
    .map((element) => {
      const move = (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${x * 0.16}px, ${y * 0.16}px)`;
      };
      const leave = () => {
        element.style.transform = '';
      };
      return [listen(element, 'pointermove', move), listen(element, 'pointerleave', leave)];
    })
    .flat();
  return () => handlers.forEach((fn) => fn());
}

function showToast(message) {
  const toast = document.querySelector('[data-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1500);
}
