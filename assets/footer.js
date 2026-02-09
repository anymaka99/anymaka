/**
 *  @class
 *  @function ThemeFooter
 */

if (!customElements.get('theme-footer')) {
  class ThemeFooter extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.animations_enabled = document.body.classList.contains('animations-true') && typeof gsap !== 'undefined';

      if (document.body.classList.contains('template-product-quick-view')) {
        this.animations_enabled = false;
      }
      if (!this.animations_enabled) {
        return;
      }
      this.content = document.getElementById('main-content');
      this.wrapper = document.getElementById('wrapper');
      this.footer_bg = window.getComputedStyle(document.documentElement).getPropertyValue('--color-footer-bg');
      this.radius = window.getComputedStyle(document.documentElement).getPropertyValue('--block-border-radius');
      // this.setupAnimations();
      this.scaleClipPath();
    }
    setupAnimations() {
      let mm = gsap.matchMedia();
      this.wrapper.style.backgroundColor = this.footer_bg;
      mm.add({
        // set up any number of arbitrarily-named conditions. The function below will be called when ANY of them match.
        isDesktop: `(min-width: 768px)`,
        reduceMotion: "(prefers-reduced-motion: reduce)"
      }, (context) => {

        // context.conditions has a boolean property for each condition defined above indicating if it's matched or not.
        let {
          isDesktop,
          isMobile,
          reduceMotion
        } = context.conditions;

        gsap.to(this.content, {
          clipPath: !isDesktop || reduceMotion ? `inset(0px 0% 0% round 0` : `inset(0px 4% 0% round ${this.radius})`,
          duration: 0.5,
          inherit: false,
          ease: "none",
          scrollTrigger: {
            trigger: this,
            fastScrollEnd: true,
            scrub: 1,
            start: () => `top bottom`,
            end: () => `bottom bottom`
          }
        });
      });      
    }

    scaleClipPath(){
      // gsap.registerPlugin(ScrollTrigger);
      let scaleElms = document.querySelectorAll(".scale-clip-path");
      if(scaleElms.length > 0){
       scaleElms.forEach(function(scale){ 
    
         gsap.timeline({ scrollTrigger: {
                scroller:'body',
                trigger: scale,
                start: "top 50%",
                end: "top 5%",
                markers: false,
                scrub: true,
                ease: "power1.inOut",
            } })
        .fromTo(scale,
              {
                clipPath: "polygon(30% 30%, 70% 30%, 70% 70%, 30% 70%)"
              },
              {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration: 0.8
              });
          });
        // ScrollTrigger.refresh();
        console.log(ScrollTrigger,'refresh ScrollTrigger 1');
      }
    }  
  }
  customElements.define('theme-footer', ThemeFooter);
}