(() => {
  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const themeToggle = document.querySelector('.theme-toggle');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
  const progress = document.querySelector('.scroll-progress span');

  const preferredTheme = () => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* Storage may be unavailable in a restricted browser. */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch { /* Theme still works without persistence. */ }
    if (themeToggle) {
      const next = theme === 'dark' ? 'light' : 'dark';
      themeToggle.setAttribute('aria-label', `Switch to ${next} theme`);
    }
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#081512' : '#f4f7f5');
  };

  applyTheme(preferredTheme());

  themeToggle?.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  const updateNavAccessibility = (open) => {
    if (!nav) return;
    if (window.innerWidth > 1040) {
      nav.inert = false;
      nav.removeAttribute('aria-hidden');
      return;
    }
    nav.inert = !open;
    nav.setAttribute('aria-hidden', String(!open));
  };

  const closeMenu = (returnFocus = false) => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('is-open');
    body.classList.remove('menu-open');
    updateNavAccessibility(false);
    if (returnFocus === true) menuToggle?.focus();
  };

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('is-open', !open);
    body.classList.toggle('menu-open', !open);
    updateNavAccessibility(!open);
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1040) closeMenu();
    else updateNavAccessibility(menuToggle?.getAttribute('aria-expanded') === 'true');
  });

  updateNavAccessibility(false);

  const updateScrollState = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;
    if (progress) progress.style.width = `${ratio * 100}%`;
    header?.classList.toggle('is-scrolled', scrollTop > 18);
  };

  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });

  const sections = Array.from(document.querySelectorAll('main section[id], #publication'));
  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const active = entry.target.id;
        navLinks.forEach((link) => {
          const selected = link.getAttribute('href') === `#${active}`;
          link.classList.toggle('is-active', selected);
          if (selected) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-30% 0px -62% 0px', threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
