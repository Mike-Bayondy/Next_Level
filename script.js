// script.js — interactions & lazy-loading YouTube embeds
document.addEventListener('DOMContentLoaded', function () {
  // Update year
  const y = new Date().getFullYear();
  document.getElementById('year').textContent = y;

  // Nav toggle (mobile)
  const navToggle = document.getElementById('nav-toggle');
  const navList = document.getElementById('nav-list');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navList.classList.toggle('show');
    });
  }

  // Mailto fallback for contact button
  const mailBtn = document.getElementById('contact-mailto');
  if (mailBtn) {
    mailBtn.addEventListener('click', () => {
      const name = document.getElementById('name').value || '—';
      const email = document.getElementById('email').value || '—';
      const message = document.getElementById('message').value || '';
      const subject = encodeURIComponent('Contact — Next Level');
      const body = encodeURIComponent(`Nom: ${name}\nEmail: ${email}\n\n${message}`);
      location.href = `mailto:contact@nextlevel.example?subject=${subject}&body=${body}`;
    });
  }

  // Modal (partenariat)
  const openPartner = document.getElementById('open-partner-modal');
  const partnerModal = document.getElementById('partner-modal');
  const closePartner = document.getElementById('close-partner-modal');
  if (openPartner && partnerModal) {
    openPartner.addEventListener('click', () => {
      partnerModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
    closePartner.addEventListener('click', () => {
      partnerModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
    // close on outside click
    partnerModal.addEventListener('click', (e) => {
      if (e.target === partnerModal) {
        partnerModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }

  // Partner form example: submit handler (demo)
  const partnerForm = document.getElementById('partner-form');
  if (partnerForm) {
    partnerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // Here tu peux envoyer via fetch à ton endpoint (Formspree / Zapier / API interne)
      alert('Merci — votre proposition a été reçue. Nous vous répondrons par email.');
      partnerForm.reset();
      partnerModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  }

  // Lazy-load YouTube embeds using IntersectionObserver
  const ytLites = document.querySelectorAll('.yt-lite');
  if ('IntersectionObserver' in window) {
    const options = { root: null, rootMargin: '200px', threshold: 0.01 };
    const observer = new IntersectionObserver(onIntersect, options);
    ytLites.forEach((el) => observer.observe(el));
  } else {
    // fallback: load on click
    ytLites.forEach(setupLiteClick);
  }

  function onIntersect(entries, obs) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // replace with actual iframe only when clicked for UX / bandwidth
        setupLiteClick(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }

  function setupLiteClick(container) {
    if (!container) return;
    const play = container.querySelector('.yt-play');
    const thumb = container.querySelector('.yt-thumb');
    const src = container.getAttribute('data-src');
    function loadIframe() {
      if (!src) return;
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', src + '?rel=0&showinfo=0');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      // remove children and append iframe
      container.innerHTML = '';
      container.appendChild(iframe);
    }
    if (play) play.addEventListener('click', loadIframe);
    if (thumb) thumb.addEventListener('click', loadIframe);
    // For accessibility: load on Enter key when container focused
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        loadIframe();
        e.preventDefault();
      }
    });
  }

  // Progressive enhancement: allow adding videos dynamically
  window.NL_addVideoCard = function (videoId, title, duration) {
    const grid = document.getElementById('videos-grid');
    if (!grid) return;
    const article = document.createElement('article');
    article.className = 'video-card card';
    article.innerHTML = `
      <div class="yt-lite" data-src="https://www.youtube.com/embed/${videoId}" aria-label="Vidéo: ${title}">
        <button class="yt-play" aria-label="Charger la vidéo"> ▶ </button>
        <img class="yt-thumb" alt="Vignette ${title}" src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" />
      </div>
      <div class="video-meta">
        <h3>${title}</h3>
        <p class="muted">Résumé 90s — durée : ${duration}</p>
        <a class="link" href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener">Voir sur YouTube →</a>
      </div>
    `;
    grid.appendChild(article);
    // attach lazy load click
    setupLiteClick(article.querySelector('.yt-lite'));
  };

});
