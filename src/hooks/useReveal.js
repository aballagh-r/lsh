import { useEffect } from 'react';

// Re-scans for .reveal elements on every render (cheap) and fades them in
// as they enter the viewport. Works fine across language switches since it
// just re-observes whatever .reveal nodes currently exist in the DOM.
export default function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}
