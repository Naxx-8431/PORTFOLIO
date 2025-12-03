document.getElementById("year").textContent = new Date().getFullYear();


document.addEventListener('DOMContentLoaded', function () {
  const items = document.querySelectorAll('.fade-on-scroll');
  if (!items.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('fade-in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(i => obs.observe(i));
});