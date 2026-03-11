const gallery = document.querySelector('.custom-product-gallery');
if (gallery) {

  const slides = gallery.querySelectorAll('.swiper-slide');
  const radios = document.querySelectorAll('.product-custom fieldset input[type="radio"]');

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

  function updateImages(color) {
    const selected = color.toLowerCase().trim();

    slides.forEach(slide => {
      const variant = (slide.dataset.variant || '').toLowerCase().trim();
      const show = !variant || !variants.includes(variant) || variant === selected;
      slide.style.display = show ? '' : 'none';
    });

    gallery.classList.add('ready');

    if (swiper && swiper.update) swiper.update();
  }

  const checked = document.querySelector('fieldset input[type="radio"]:checked');
  if (checked) updateImages(checked.value);

  radios.forEach(radio => {
    radio.addEventListener('change', e => updateImages(e.target.value));
  });
}
