/* ================================================
   THE GILDED EDGE — Scripts
   ================================================ */

'use strict';

// ── Nav: add background on scroll ─────────────────
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });


// ── Mobile nav toggle ──────────────────────────────
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navMenu.setAttribute('aria-hidden', String(!isOpen));
});

// Close menu when a link is tapped
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.setAttribute('aria-hidden', 'true');
  });
});


// ── Scroll-in animations ───────────────────────────
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.animate-in').forEach(el => animObserver.observe(el));


// ── Gallery: staggered column-by-column reveal ─────
const galleryObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter(e => e.isIntersecting);
  if (!visible.length) return;

  // Sort by x position so items cascade left → right
  visible.sort((a, b) => a.boundingClientRect.left - b.boundingClientRect.left);

  visible.forEach((entry, i) => {
    entry.target.style.transitionDelay = `${i * 120}ms`;
    entry.target.classList.add('gallery--revealed');
    galleryObserver.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.gallery__item').forEach(el => galleryObserver.observe(el));


// ── Service accordion ──────────────────────────────
document.querySelectorAll('.service__toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.service__card');
    const isOpen = card.classList.contains('is-open');
    card.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(!isOpen));
    card.querySelector('.service__menu').setAttribute('aria-hidden', String(isOpen));
  });
});


// ── Gallery captions: tap to reveal on mobile ──────
document.querySelectorAll('.gallery__item--captioned').forEach(item => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    item.classList.toggle('caption-open');
  });
});


// ── Gallery videos: hover to play ─────────────────
const isTouchDevice = window.matchMedia('(hover: none)').matches;

document.querySelectorAll('.gallery__item--video video').forEach(video => {
  const item = video.closest('.gallery__item');

  if (isTouchDevice) {
    // Mobile: play when scrolled into view, pause when out
    const videoScrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
          video.currentTime = 0;
        }
      });
    }, { threshold: 0.5 });
    videoScrollObserver.observe(item);

    // Tap to pause/resume
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      video.paused ? video.play() : video.pause();
    });
  } else {
    // Desktop: hover to play, leave to pause & reset
    item.addEventListener('mouseenter', () => video.play());
    item.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  }
});


// ── Gallery lightbox ───────────────────────────────
const galleryGrid   = document.getElementById('galleryGrid');
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev  = document.getElementById('lightboxPrev');
const lightboxNext  = document.getElementById('lightboxNext');

let currentIndex = 0;

function getImages() {
  return Array.from(galleryGrid.querySelectorAll('.gallery__item img'));
}

function openLightbox(index) {
  const imgs = getImages();
  if (!imgs.length) return;
  currentIndex = index;
  lightboxImg.src = imgs[currentIndex].src;
  lightboxImg.alt = imgs[currentIndex].alt;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function navigate(direction) {
  const imgs = getImages();
  if (!imgs.length) return;
  currentIndex = (currentIndex + direction + imgs.length) % imgs.length;
  lightboxImg.src = imgs[currentIndex].src;
  lightboxImg.alt = imgs[currentIndex].alt;
}

// Click on gallery item
galleryGrid.addEventListener('click', (e) => {
  const item = e.target.closest('.gallery__item');
  if (!item) return;
  const img = item.querySelector('img');
  if (!img) return; // placeholder, no action
  const items = Array.from(galleryGrid.querySelectorAll('.gallery__item'));
  const realItems = items.filter(i => i.querySelector('img'));
  openLightbox(realItems.indexOf(item));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => navigate(-1));
lightboxNext.addEventListener('click', () => navigate(1));

// Click outside image to close
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   navigate(-1);
  if (e.key === 'ArrowRight')  navigate(1);
});

// Touch/swipe on lightbox
let touchStartX = 0;

lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) < 50) return;
  navigate(delta < 0 ? 1 : -1);
}, { passive: true });
