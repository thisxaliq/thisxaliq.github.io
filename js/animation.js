let observer;

export function bootAnimations(force = false) {
  if (force && observer) observer.disconnect();

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );

  document
    .querySelectorAll('[data-reveal], [data-skill-card]')
    .forEach((element) => observer.observe(element));

  document.querySelectorAll('section').forEach((section) => {
    section.querySelectorAll(':scope > *').forEach((child, index) => {
      if (!child.classList.contains('sectionTop') && child.getAttribute('data-reveal') === null) {
        child.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
      }
    });
  });

  runLoader();
}

function runLoader() {
  const loader = document.querySelector('[data-page-loader]');
  const number = document.querySelector('[data-loader-number]');
  const line = document.querySelector('[data-loader-line]');
  if (!loader || !number || !line) return;

  let progress = 0;
  const start = performance.now();
  const duration = window.PORTFOLIO?.site?.animation?.loader || 900;

  const tick = (now) => {
    progress = Math.min(100, Math.round(((now - start) / duration) * 100));
    number.textContent = `${String(progress).padStart(3, '0')}%`;
    line.style.width = `${progress}%`;
    if (progress < 100) requestAnimationFrame(tick);
    else {
      setTimeout(() => loader.classList.add('is-done'), 120);
      const p = document.querySelector('[onload-js]')
      p.innerHTML = "";
      console.log(p)
    }
  
  };

  requestAnimationFrame(tick);
}
