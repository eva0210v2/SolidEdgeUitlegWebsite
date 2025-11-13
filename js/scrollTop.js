(() => {
  let observer = null;

  function isUitlegPage() {
    if (window.currentPage) return window.currentPage === 'uitleg';
    const hash = (window.location.hash || '').replace('#', '');
    return hash === 'uitleg' || hash.startsWith('uitleg');
  }

  function createButtonIfMissing() {
    let btn = document.getElementById('scroll-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'scroll-top';
      btn.setAttribute('aria-label', 'Scroll naar top');
      btn.textContent = 'Scroll naar top';
      btn.classList.add('hidden');
      document.body.appendChild(btn);
    }
    return btn;
  }

  function removeButton() {
    const b = document.getElementById('scroll-top');
    if (b) b.remove();
  }

  function installBehaviour(btn) {
    if (!btn || btn.dataset.scrollInstalled === '1') return;
    const SHOW_AT = 50;

    function updateVisibility() {
      if (window.scrollY > SHOW_AT) {
        btn.classList.add('visible');
        btn.classList.remove('hidden');
      } else {
        btn.classList.remove('visible');
        btn.classList.add('hidden');
      }
    }

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { updateVisibility(); ticking = false; });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateVisibility();

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    btn.dataset.scrollInstalled = '1';
  }

  function ensureForCurrentRoute() {
    const hasLessons = !!document.getElementById('lesson-container');
    if (isUitlegPage() || hasLessons) {
      const btn = createButtonIfMissing();
      installBehaviour(btn);
      return;
    }
    removeButton();
  }

  function watchForLessonContainer() {
    if (observer) return;
    observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.addedNodes) {
          for (const node of m.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;
            if (node.id === 'lesson-container' || node.querySelector?.('#lesson-container')) {
              ensureForCurrentRoute();
              return;
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureForCurrentRoute();
    watchForLessonContainer();
    window.addEventListener('hashchange', ensureForCurrentRoute);
    window.addEventListener('pagechange', ensureForCurrentRoute);
    document.addEventListener('lessonsReady', ensureForCurrentRoute);
  });
})();