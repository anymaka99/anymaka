const gallery = document.querySelector('.custom-product-gallery');
if (gallery) {

  const slides = gallery.querySelectorAll('.swiper-slide');
  const radios = document.querySelectorAll('.product-custom fieldset input[type="radio"]');
  const isMobileGallery = () => window.matchMedia && window.matchMedia('(max-width: 1067px)').matches;

  const swiper = new Swiper(gallery, {
    slidesPerView: 1,
    spaceBetween: 16,
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    breakpoints: {
      1068: { enabled: false }
    }
  });

  const variants = Array.from(radios).map(r => r.value.toLowerCase().trim());

  function withAutoplayMuted(src) {
    if (!src) return null;
    try {
      const url = new URL(src, window.location.href);
      const host = (url.hostname || '').toLowerCase();

      // YouTube
      if (host.includes('youtube.com') || host.includes('youtu.be')) {
        url.searchParams.set('autoplay', '1');
        url.searchParams.set('mute', '1');
        url.searchParams.set('playsinline', '1');
        if (!url.searchParams.has('enablejsapi')) url.searchParams.set('enablejsapi', '1');
        return url.toString();
      }

      // Vimeo
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
        if (!isMobileGallery()) return;
        deactivateAllVideos();
        slide.classList.add('is-video-active');
        swiper.allowTouchMove = false;
        startSlideMedia(slide);
      });

      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        slide.classList.remove('is-video-active');
        stopSlideMedia(slide);
        swiper.allowTouchMove = true;
      });

      slide.appendChild(activator);
      slide.appendChild(closeBtn);
    });
  }

  function updateImages(color) {
    const selected = color.toLowerCase().trim();

    slides.forEach(slide => {
      const variant = (slide.dataset.variant || '').toLowerCase().trim();
      const show = !variant || !variants.includes(variant) || variant === selected;
      slide.style.display = show ? '' : 'none';
    });

    gallery.classList.add('ready');

    if (swiper && swiper.update) swiper.update();
    deactivateAllVideos();
  }

  const checked = document.querySelector('fieldset input[type="radio"]:checked');
  if (checked) updateImages(checked.value);

  radios.forEach(radio => {
    radio.addEventListener('change', e => updateImages(e.target.value));
  });

  enhanceVideoSlides();
  if (swiper && swiper.on) {
    swiper.on('slideChange', () => {
      deactivateAllVideos();
    });
  }

  window.addEventListener('resize', () => {
    if (!isMobileGallery()) {
      deactivateAllVideos();
    }
  });
}
