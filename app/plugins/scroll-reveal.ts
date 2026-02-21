export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('scroll-reveal', {
    getSSRProps() {
      return {};
    },
    mounted(el: HTMLElement) {
      el.classList.add('scroll-reveal');
      requestAnimationFrame(() => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              el.classList.add('scroll-reveal--visible');
              observer.unobserve(el);
            }
          },
          { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
        );
        observer.observe(el);
      });
    },
  });
});
