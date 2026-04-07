document.querySelectorAll('.thb-product-detail.product-custom').forEach((productDetail) => {
  const colorRadios = productDetail.querySelectorAll('fieldset.product-form__input--color input[type="radio"]');
  if (!colorRadios.length) return;

  productDetail.classList.remove('variant-interacted');

  const markInteracted = (e) => {
    if (!e.isTrusted) return;
    productDetail.classList.add('variant-interacted');
  };

  colorRadios.forEach((radio) => {
    radio.addEventListener('click', markInteracted);
    radio.addEventListener('change', markInteracted);
  });
});

const gallery = document.querySelector('.custom-product-gallery');
if (gallery) {
  const slides = gallery.querySelectorAll('.swiper-slide');
  const radios = document.querySelectorAll('.product-custom fieldset.product-form__input--color input[type="radio"]');
  const isMobileGallery = () => window.matchMedia && window.matchMedia('(max-width: 1067px)').matches;
  const carouselDesktop = gallery.classList.contains('custom-product-gallery--carousel');
  const paginationEl = gallery.querySelector('.swiper-pagination');
  let visibleIndexes = Array.from(slides, (_, index) => index);

  function normalizeText(value) {
    return (value || '')
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getSlideThumb(slide) {
    const attrThumb = (slide.getAttribute('data-thumb') || '').trim();
    if (attrThumb) return attrThumb;
    const image = slide.querySelector('img');
    if (image) {
      const src = image.currentSrc || image.getAttribute('src') || '';
      if (src) return src;
    }
    const video = slide.querySelector('video');
    if (video) {
      const poster = video.getAttribute('poster');
      if (poster) return poster;
    }
    const iframe = slide.querySelector('iframe');
    if (iframe) {
      const src = iframe.getAttribute('src') || iframe.getAttribute('data-src') || '';
      const yt = src.match(
        /(?:youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
      );
      if (yt && yt[1]) return `https://img.youtube.com/vi/${yt[1]}/mqdefault.jpg`;
    }
    return '';
  }

  function slideIsVideo(slide) {
    const t = (slide.dataset.mediaType || '').toLowerCase();
    return t === 'external_video' || t === 'video' || Boolean(slide.querySelector('video, iframe'));
  }

  function renderCarouselPagination(activeIndex) {
    if (!carouselDesktop || !paginationEl) return;

    paginationEl.innerHTML = '';
    visibleIndexes.forEach((slideIndex) => {
      const bullet = document.createElement('span');
      bullet.className = 'swiper-pagination-bullet';
      if (slideIndex === activeIndex) {
        bullet.classList.add('swiper-pagination-bullet-active');
        bullet.setAttribute('aria-current', 'true');
      }
      bullet.setAttribute('tabindex', '0');

      const slideEl = slides[slideIndex];
      const thumb = getSlideThumb(slideEl);
      if (thumb) {
        const img = document.createElement('img');
        img.src = thumb;
        img.alt = '';
        img.loading = 'lazy';
        bullet.appendChild(img);
      } else if (slideIsVideo(slideEl)) {
        bullet.classList.add('swiper-pagination-bullet--video');
        const icon = document.createElement('span');
        icon.className = 'swiper-pagination-bullet-video-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '▶';
        bullet.appendChild(icon);
      }

      const goToSlide = () => {
        const visiblePosition = visibleIndexes.indexOf(slideIndex);
        if (visiblePosition < 0) return;
        if (swiper && swiper.slideTo) swiper.slideTo(visiblePosition, 300);
      };
      bullet.addEventListener('click', goToSlide);
      bullet.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToSlide();
        }
      });

      paginationEl.appendChild(bullet);
    });
  }

  const swiper = new Swiper(gallery, {
    slidesPerView: 1,
    spaceBetween: 16,
    pagination: carouselDesktop
      ? false
      : {
          el: paginationEl,
          clickable: true
        },
    ...(carouselDesktop
      ? {}
      : {
          breakpoints: {
            1068: { enabled: false }
          }
        })
  });

  const variants = Array.from(radios).map((r) => normalizeText(r.value));

  function withAutoplayMuted(src) {
    if (!src) return null;
    try {
      const url = new URL(src, window.location.href);
      const host = (url.hostname || '').toLowerCase();

      if (host.includes('youtube.com') || host.includes('youtu.be')) {
        url.searchParams.set('autoplay', '1');
        url.searchParams.set('mute', '1');
        url.searchParams.set('playsinline', '1');
        if (!url.searchParams.has('enablejsapi')) url.searchParams.set('enablejsapi', '1');
        return url.toString();
      }

      if (host.includes('vimeo.com')) {
        url.searchParams.set('autoplay', '1');
        url.searchParams.set('muted', '1');
        return url.toString();
      }

      url.searchParams.set('autoplay', '1');
      url.searchParams.set('muted', '1');
      return url.toString();
    } catch (e) {
      const glue = src.includes('?') ? '&' : '?';
      return `${src}${glue}autoplay=1&muted=1`;
    }
  }

  function stopSlideMedia(slide) {
    const iframe = slide.querySelector('iframe');
    if (iframe && iframe.dataset && iframe.dataset.originalSrc) {
      const original = iframe.dataset.originalSrc;
      if (iframe.getAttribute('src') !== original) {
        iframe.setAttribute('src', original);
      }
    }

    const video = slide.querySelector('video');
    if (video) {
      try {
        video.pause();
        video.currentTime = 0;
      } catch (e) {}
    }
  }

  function startSlideMedia(slide) {
    const video = slide.querySelector('video');
    if (video) {
      try {
        video.muted = true;
        video.play().catch(() => {});
        return;
      } catch (e) {}
    }

    const iframe = slide.querySelector('iframe');
    if (!iframe) return;

    const currentSrc = iframe.getAttribute('src');
    const lazySrc = iframe.getAttribute('data-src');
    const baseSrc = currentSrc || lazySrc;
    if (!baseSrc) return;

    if (!iframe.dataset.originalSrc) {
      iframe.dataset.originalSrc = baseSrc;
    }

    const nextSrc = withAutoplayMuted(baseSrc);
    if (!nextSrc) return;

    if (!currentSrc && lazySrc) {
      iframe.setAttribute('src', nextSrc);
    } else if (currentSrc !== nextSrc) {
      iframe.setAttribute('src', nextSrc);
    }
  }

  function deactivateAllVideos() {
    slides.forEach(slide => {
      slide.classList.remove('is-video-active');
      stopSlideMedia(slide);
    });
    if (swiper) swiper.allowTouchMove = true;
  }

  function enhanceVideoSlides() {
    slides.forEach((slide) => {
      const iframe = slide.querySelector('iframe');
      if (!iframe) return;
      if (slide.querySelector('.video-slide-activator')) return;

      slide.classList.add('has-video-iframe');

      const activator = document.createElement('button');
      activator.type = 'button';
      activator.className = 'video-slide-activator';
      activator.setAttribute('aria-label', 'Play video');

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'video-slide-close';
      closeBtn.setAttribute('aria-label', 'Close video');

      activator.addEventListener('click', () => {
        deactivateAllVideos();
        slide.classList.add('is-video-active');
        startSlideMedia(slide);
      });

      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        slide.classList.remove('is-video-active');
        stopSlideMedia(slide);
      });

      slide.appendChild(activator);
      slide.appendChild(closeBtn);
    });
  }

  function updateImages(color) {
  const selected = normalizeText(color);
  visibleIndexes = [];

  let hasMatchingSlides = false;

  slides.forEach((slide) => {
    const variant = normalizeText(slide.dataset.variant || '');
    if (variant && selected && (variant.includes(selected) || selected.includes(variant))) {
      hasMatchingSlides = true;
    }
  });

  slides.forEach((slide, index) => {
    const rawVariant = slide.dataset.variant || '';
    const variant = normalizeText(rawVariant);
  
    const isGeneric = !variant;
    const matchesSelected =
      variant && selected && (variant.includes(selected) || selected.includes(variant));
  
    const isVideoSlide = slideIsVideo(slide);
  
    let show = false;
  
    if (isVideoSlide) {
      show = true;
    } else if (hasMatchingSlides) {
      show = matchesSelected || isGeneric;
    } else {
      show = isGeneric;
    }
  
    slide.style.display = show ? '' : 'none';
    if (show) visibleIndexes.push(index);
  });

  if (visibleIndexes.length === 0) {
    slides.forEach((slide, index) => {
      slide.style.display = '';
      visibleIndexes.push(index);
    });
  }

  gallery.classList.add('ready');

  if (swiper && swiper.update) swiper.update();

  if (visibleIndexes.length && swiper && swiper.slideTo) {
    swiper.slideTo(0, 0);
  }

  renderCarouselPagination(visibleIndexes[0]);
  deactivateAllVideos();
}


  const applySelection = (e) => {
    if (!e.isTrusted) return;
    updateImages(e.target.value);
  };

  radios.forEach((radio) => {
    radio.addEventListener('click', applySelection);
    radio.addEventListener('change', (e) => {
      if (!e.isTrusted) return;
      applySelection(e);
    });
  });

  enhanceVideoSlides();
  renderCarouselPagination(visibleIndexes[0] || 0);
  if (swiper && swiper.on) {
    swiper.on('slideChange', () => {
      const activeOriginalIndex = carouselDesktop
        ? (visibleIndexes[swiper.activeIndex] ?? visibleIndexes[0] ?? 0)
        : (typeof swiper.realIndex === 'number' ? swiper.realIndex : 0);
      renderCarouselPagination(activeOriginalIndex);
      deactivateAllVideos();
    });
  }

  window.addEventListener('resize', () => {
    if (!isMobileGallery()) {
      deactivateAllVideos();
    }
  });
}
