export function renderAll() {
  const { site, language: t, config } = window.PORTFOLIO;
  document.title = t.meta.siteTitle;
  document.querySelector('meta[name="description"]').setAttribute('content', t.meta.description);
  setText('[data-site-name]', site.person.name.split(' ').map((word) => word[0]).join(''));
  renderHeader(t);
  renderSectionIndexes();
  renderHero(site, t);
  renderAbout(t);
  renderSkills(site, t);
  renderJourney(site, t);
  renderProjects(site, t);
  renderContact(site, t);
  renderFooter(t);
  renderMobileMenu(t);
  renderLanguageControl(config);
  renderThemeControl(t);
  startClock(t);
}

function renderSectionIndexes() {
  document.querySelectorAll('[data-section-index]').forEach((node, index) => {
    node.textContent = String(index + 1).padStart(2, '0');
  });
}

function renderHeader(t) {
  const nav = document.querySelector('[data-nav]');
  nav.innerHTML = Object.entries(t.nav)
    .map(([key, label]) => `<a href="#${key}" data-scroll-link>${label}</a>`)
    .join('');
    
}

function renderHero(site, t) {
  setText('[data-location]', t.hero.location);
  setText('[data-local-time]', `${t.hero.time} / ${formatTime()}`);
  document.querySelector('[data-status]').innerHTML =
    `<span class="statusDot"></span>${t.hero.status}`;
  setText('[data-hero-hello]', t.hero.hello);
  setText('[data-hero-title]', t.hero.title);
  setText('[data-hero-sub]', t.hero.sub);
  document.querySelector('[data-hero-actions]').innerHTML = `
    <div class="buttonRow">
      <a class="roundButton magnetic" href="#about" data-scroll-link>${t.hero.primary}</a>
      <a class="ghostButton magnetic" href="#contact" data-scroll-link>${t.hero.secondary}</a>
    </div>`;
  setText('[data-scroll-hint]', t.hero.scroll);
  const items = [...t.ticker, ...t.ticker];
  document.querySelector('[data-hero-ticker]').innerHTML =
    `<div class="ticker__track">${items.map((item) =>
      `<span class="ticker__item">${item}<i class="ticker__dot"></i></span>`
    ).join('')}</div>`;
}

function renderAbout(t) {
  setText('[data-section-label="about"]', t.nav.about);
  setText('[data-about-lead]', t.about.lead);
  setText('[data-about-copy]', t.about.copy);
  document.querySelector('[data-about-facts]').innerHTML = t.about.facts.map((fact) => `
    <div class="manifesto__fact" data-reveal>
      <span class="manifesto__fact-label">${fact.label}</span>
      <strong class="manifesto__fact-value">${fact.value}</strong>
    </div>`).join('');
}

function renderSkills(site, t) {
  setText('[data-section-label="skills"]', t.nav.skills);
  setText('[data-skills-title]', t.skills.title);
  setText('[data-skills-copy]', t.skills.copy);
  document.querySelector('[data-skill-list]').innerHTML = site.skills.map((skill, index) => `
    <article class="skillCard glowCard" data-reveal data-skill-card data-index="${index}" style="--skill:${skill.level}%">
      <span class="glowCard__halo" aria-hidden="true"></span>
      <div class="skillCard__top"><span>${String(index + 1).padStart(2, '0')}</span><span>${skill.type}</span></div>
      <div class="skillCard__badge" aria-hidden="true"><img src="${skill.icon || ''}" alt="" loading="lazy" /></div>
      <div class="skillCard__name">${skill.name}</div>
      <div class="skillCard__bar"><div class="skillCard__fill"></div></div>
      <span class="skillCard__level">${skill.level}%</span>
    </article>`).join('');
}

function renderJourney(site, t) {
  setText('[data-section-label="journey"]', t.nav.journey);
  setText('[data-journey-title]', t.journey.education || t.nav.journey);
  const rail = document.querySelector('[data-experience-rail]');
  const items = t.journey?.items || site.education || [];
  rail.innerHTML = items.map((item) => `
    <article class="experience__item glowCard" data-reveal>
      <span class="experience__dot" aria-hidden="true"></span>
      <span class="glowCard__halo" aria-hidden="true"></span>
      <div class="experience__body">
        <h3 class="experience__institution">${item.institution}</h3>
        <p class="experience__role">${item.role}</p>
        <p class="experience__desc">${item.description}</p>
        <span class="experience__year">${item.year}</span>
      </div>
    </article>`).join('');
}

function renderProjects(site, t) {
  setText('[data-section-label="projects"]', t.nav.projects);
  setText('[data-projects-title]', t.projects.title);

  const emptyNode = document.querySelector('[data-projects-empty]');
  const ideasNode = document.querySelector('[data-project-ideas]');
  const hasProjects = Array.isArray(site.projects) && site.projects.length > 0;

  if (!hasProjects) {
    emptyNode.innerHTML = `
      <div class="projectsEmptyCard glowCard" data-reveal>
        <span class="glowCard__halo" aria-hidden="true"></span>
        <h3 class="projectsEmptyCard__title">${t.projects.emptyTitle}</h3>
        <p class="projectsEmptyCard__copy">${t.projects.emptyCopy}</p>
      </div>`;
    emptyNode.hidden = false;
    ideasNode.innerHTML = '';
    ideasNode.hidden = true;
  } else {
    emptyNode.innerHTML = '';
    emptyNode.hidden = true;
    ideasNode.hidden = false;
    ideasNode.innerHTML = site.projects.map((item, index) => `
      <article class="projectIdea glowCard" data-reveal>
        <span class="glowCard__halo" aria-hidden="true"></span>
        <span class="projectIdea__number">${String(index + 1).padStart(2, '0')}</span>
        <div class="projectIdea__title">${item.title}</div>
        <div class="projectIdea__meta">${item.meta || ''}</div>
      </article>`).join('');
  }
}

function renderContact(site, t) {
  setText('[data-section-label="contact"]', t.nav.contact);
  setText('[data-contact-eyebrow]', t.contact.eyebrow);
  setText('[data-contact-title]', t.contact.title);
  const mailButton = document.querySelector('[data-copy-email]');
  mailButton.textContent = site.person.email;
  mailButton.dataset.defaultLabel = t.contact.copy;
  mailButton.dataset.copiedLabel = t.contact.copied;
  setText('[data-contact-signal]', t.contact.signal);
  document.querySelector('[data-contact-links]').innerHTML =
    Object.entries(site.person.socials)
      .map(([name, url]) =>
        `<a class="contact__link" href="${url}" target="_blank" rel="noreferrer">${name}</a>`
      ).join('');
}

function renderFooter(t) {
  setText('[data-footer-left]', t.footer.left);
  setText('[data-footer-center]', t.footer.center);
  setText('[data-footer-right]', t.footer.right);
}

function renderMobileMenu(t) {
  setText('[data-mobile-name]', 'ABDULXALIQ / MENU');
  setText('[data-mobile-close]', t.ui.close);
  document.querySelector('[data-mobile-links]').innerHTML =
    Object.entries(t.nav)
      .map(([key, label], index) =>
        `<a href="#${key}" data-scroll-link>${label}</a>`
      ).join('');
}

function renderLanguageControl(config) {
  const picker = document.querySelector('[data-language-picker]');
  if (!picker) return;
  const current = window.PORTFOLIO.language.lang;
  picker.innerHTML = config.language.map((item) => {
    const code = item.dil;
    const active = code === current ? ' is-active' : '';
    return `<button type="button" class="langPicker__btn${active}" data-lang="${code}">${code.toUpperCase()}</button>`;
  }).join('');
}

function renderThemeControl(t) {
  const isLight = document.documentElement.dataset.theme === 'light';
  document.querySelector('[data-theme-toggle]').textContent = isLight ? t.ui.dark : t.ui.light;
  document.querySelector('[data-menu-toggle]').textContent = t.ui.menu;
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value ?? '';
}

function formatTime() {
  return new Intl.DateTimeFormat('az-AZ', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Baku'
  }).format(new Date());
}

let clockTimer = null;

function startClock(t) {
  if (clockTimer) clearInterval(clockTimer);
  const update = () => {
    const node = document.querySelector('[data-local-time]');
    if (node) node.textContent = `${t.hero.time} / ${formatTime()}`;
  };
  update();
  clockTimer = setInterval(update, 1000);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char])
  );
}
