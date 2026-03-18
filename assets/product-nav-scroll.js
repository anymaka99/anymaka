(() => {
  function getHeaderHeight() {
    const header = document.getElementById('header');
    return header ? Math.ceil(header.getBoundingClientRect().height) : 0;
  }

  function getOffset(wrapper) {
    const headerH = getHeaderHeight();
    const wrapperH = Math.ceil(wrapper.getBoundingClientRect().height);
    return headerH + wrapperH;
  }

  function setStickyTop() {
    const headerH = getHeaderHeight();
    document.documentElement.style.setProperty('--product-nav-sticky-top', `${headerH}px`);
  }

  function initOne(wrapper) {
    if (!wrapper || wrapper.dataset.navScrollInit) return;
    wrapper.dataset.navScrollInit = '1';

    setStickyTop();

    const links = Array.from(
      wrapper.querySelectorAll('.product-nav-scroll__link[data-target-id]')
    );

    links.forEach((link) => {
      const id = link.getAttribute('data-target-id');
      if (!id) return;

      link.addEventListener(
        'click',
        (e) => {
          const target = document.getElementById(id);
          if (!target) return;
          e.preventDefault();

          const offset = getOffset(wrapper);

          const y = Math.max(
            0,
            Math.round(target.getBoundingClientRect().top + window.pageYOffset - offset)
          );

          window.scrollTo({ top: y, behavior: 'smooth' });

          links.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        },
        { passive: false }
      );
    });

    const onScroll = () => {
      const offset = getOffset(wrapper);
      const probeY = offset + 8;

      let activeLink = null;
      let bestTop = -Infinity;

      links.forEach((link) => {
        const id = link.getAttribute('data-target-id');
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;

        const top = target.getBoundingClientRect().top;
        if (top <= probeY && top > bestTop) {
          bestTop = top;
          activeLink = link;
        }
      });

      if (activeLink) {
        links.forEach((l) => l.classList.toggle('is-active', l === activeLink));
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    window.addEventListener(
      'resize',
      () => {
        setStickyTop();
      },
      { passive: true }
    );
    
  }

  function initAll() {
    document.querySelectorAll('[data-product-nav-scroll]').forEach(initOne);
  }

  document.addEventListener('DOMContentLoaded', initAll);
  document.addEventListener('shopify:section:load', initAll);
})();
