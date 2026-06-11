/* ═══════════════════════════════════════════════════════════════
   CAFJT BASKETBALL CLUB — script.js
   Features:
     - Mobile navigation toggle
     - Navbar scroll behavior
     - Scroll reveal animations (IntersectionObserver)
     - Active nav link highlighting
     - Image gallery lightbox
     - Registration form validation + progress bar
     - Back-to-top button
     - Footer year + newsletter feedback
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════
   UTILITY
══════════════════════════════════════ */

/** Safely query a single element — returns null rather than throwing */
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

/* ══════════════════════════════════════
   FOOTER YEAR
══════════════════════════════════════ */
$$('#footerYear').forEach(el => { el.textContent = new Date().getFullYear(); });

/* ══════════════════════════════════════
   NAVBAR — scroll effect
══════════════════════════════════════ */
(function initNavbar() {
  const navbar = $('#navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();

/* ══════════════════════════════════════
   MOBILE NAV TOGGLE
══════════════════════════════════════ */
(function initMobileNav() {
  const hamburger     = $('#hamburger');
  const navLinks      = $('#navLinks');
  const mobileOverlay = $('#mobileOverlay');

  if (!hamburger || !navLinks) return;

  function openMenu() {
    hamburger.classList.add('open');
    navLinks.classList.add('mobile-open');
    mobileOverlay?.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('mobile-open');
    mobileOverlay?.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close when a nav link is clicked
  $$('.nav-link, .nav-cta', navLinks).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close when clicking overlay
  mobileOverlay?.addEventListener('click', closeMenu);

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && hamburger.classList.contains('open')) closeMenu();
  });
})();

/* ══════════════════════════════════════
   ACTIVE NAV LINK — IntersectionObserver
══════════════════════════════════════ */
(function initActiveNav() {
  const navLinks = $$('.nav-link[href^="#"]');
  if (!navLinks.length) return;

  const sectionIds = navLinks.map(l => l.getAttribute('href').slice(1));
  const sections   = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ══════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════ */
(function initScrollReveal() {
  const revealEls = $$('.reveal');
  if (!revealEls.length) return;

  // Stagger siblings inside grid/flex parents
  const staggerParents = new Set();
  revealEls.forEach(el => {
    if (el.parentElement) staggerParents.add(el.parentElement);
  });
  staggerParents.forEach(parent => {
    const children = $$('.reveal', parent);
    if (children.length > 1) {
      children.forEach((child, i) => {
        child.style.transitionDelay = `${i * 0.1}s`;
      });
    }
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate only once
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════
   BACK TO TOP
══════════════════════════════════════ */
(function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ══════════════════════════════════════
   GALLERY LIGHTBOX
══════════════════════════════════════ */
(function initLightbox() {
  const lightbox      = $('#lightbox');
  const lightboxPhoto = $('#lightboxPhoto');
  const lightboxCaption = $('#lightboxCaption');
  const closeBtn      = $('#lightboxClose');
  const prevBtn       = $('#lightboxPrev');
  const nextBtn       = $('#lightboxNext');
  const galleryItems  = $$('.gallery-item');

  if (!lightbox || !galleryItems.length) return;

  // Collect gallery data from each item's caption and background
  const galleryData = galleryItems.map(item => {
    const overlay = item.querySelector('.gallery-overlay span');
    const photo   = item.querySelector('.gallery-photo');
    // Extract the CSS class for styling (gp-1 through gp-6)
    const photoClass = photo ? [...photo.classList].find(c => c.startsWith('gp-')) : '';
    return {
      caption: overlay ? overlay.textContent : '',
      photoClass,
      element: photo,
    };
  });

  let currentIndex = 0;

  function showPhoto(index) {
    currentIndex = (index + galleryData.length) % galleryData.length;
    const data = galleryData[currentIndex];

    // Replicate the photo styling in lightbox
    lightboxPhoto.className = `lightbox-photo ${data.photoClass}`;
    lightboxCaption.textContent = data.caption;

    // Accessibility
    lightbox.querySelector('.lightbox-content').setAttribute('aria-label', data.caption);
  }

  function openLightbox(index) {
    showPhoto(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    // Return focus to the triggering gallery item
    galleryItems[currentIndex]?.focus();
  }

  // Open on click / Enter key
  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => showPhoto(currentIndex - 1));
  nextBtn.addEventListener('click', () => showPhoto(currentIndex + 1));

  // Click outside content closes
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showPhoto(currentIndex - 1);
    if (e.key === 'ArrowRight') showPhoto(currentIndex + 1);
  });
})();

/* ══════════════════════════════════════
   NEWSLETTER FORM (index.html)
══════════════════════════════════════ */
(function initNewsletter() {
  const form = $('#newsletterForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input || !input.value.trim()) return;

    const btn = form.querySelector('button');
    btn.innerHTML = '<i class="fas fa-check"></i>';
    btn.style.background = '#4ADE80';
    input.value = '';
    input.placeholder = 'Thanks! You\'re subscribed.';

    // Reset after 4 seconds
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-paper-plane"></i>';
      btn.style.background = '';
      input.placeholder = 'Your email address';
    }, 4000);
  });
})();

/* ══════════════════════════════════════
   REGISTRATION FORM VALIDATION
══════════════════════════════════════ */
(function initRegisterForm() {
  const form           = $('#registerForm');
  const successEl      = $('#registerSuccess');
  const submitBtn      = $('#submitBtn');
  const progressBar    = $('#progressBar');
  const progressLabel  = $('#progressLabel');

  if (!form) return;

  /* ─── Validation Rules ─── */
  const rules = {
    fullName: {
      validate: v => v.trim().length >= 3,
      message: 'Please enter your full name (min. 3 characters).',
    },
    dob: {
      validate: v => {
        if (!v) return false;
        const dob  = new Date(v);
        const now  = new Date();
        const age  = (now - dob) / (1000 * 60 * 60 * 24 * 365.25);
        return age >= 5 && age <= 80;
      },
      message: 'Please enter a valid date of birth (age 5–80).',
    },
    email: {
      validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message: 'Please enter a valid email address.',
    },
    phone: {
      validate: v => /^[\d\s\+\-\(\)]{7,20}$/.test(v.trim()),
      message: 'Please enter a valid phone number.',
    },
    address: {
      validate: v => v.trim().length >= 8,
      message: 'Please enter your full address.',
    },
    team: {
      validate: v => v !== '',
      message: 'Please select a team.',
    },
    emergencyName: {
      validate: v => v.trim().length >= 3,
      message: 'Please enter the emergency contact name.',
    },
    emergencyPhone: {
      validate: v => /^[\d\s\+\-\(\)]{7,20}$/.test(v.trim()),
      message: 'Please enter the emergency contact phone number.',
    },
    consent: {
      validate: (_, el) => el.checked,
      message: 'You must agree to the Club Rules and Code of Conduct.',
    },
  };

  /* ─── Show / clear field errors ─── */
  function setFieldState(fieldId, isValid, message = '') {
    const fg  = $(`#fg-${fieldId}`);
    const err = $(`#${fieldId}-error`);
    if (!fg) return;

    fg.classList.toggle('is-valid', isValid);
    fg.classList.toggle('is-error', !isValid);
    if (err) err.textContent = isValid ? '' : message;
  }

  function clearFieldState(fieldId) {
    const fg  = $(`#fg-${fieldId}`);
    const err = $(`#${fieldId}-error`);
    if (!fg) return;
    fg.classList.remove('is-valid', 'is-error');
    if (err) err.textContent = '';
  }

  /* ─── Validate a single field ─── */
  function validateField(name) {
    const rule = rules[name];
    if (!rule) return true;

    const el = form.elements[name];
    if (!el) return true;

    const value  = el.type === 'checkbox' ? '' : el.value;
    const valid  = rule.validate(value, el);
    setFieldState(name, valid, rule.message);
    return valid;
  }

  /* ─── Progress bar ─── */
  function updateProgress() {
    const fieldNames = Object.keys(rules);
    let filled = 0;

    fieldNames.forEach(name => {
      const el = form.elements[name];
      if (!el) return;
      if (el.type === 'checkbox') {
        if (el.checked) filled++;
      } else if (el.value && el.value.trim()) {
        filled++;
      }
    });

    const pct = Math.round((filled / fieldNames.length) * 100);
    if (progressBar)   progressBar.style.width = `${pct}%`;
    if (progressLabel) progressLabel.textContent = `${pct}% complete`;
  }

  /* ─── Live validation on blur + progress on input ─── */
  Object.keys(rules).forEach(name => {
    const el = form.elements[name];
    if (!el) return;

    el.addEventListener('blur', () => validateField(name));

    // Clear error on re-focus, update progress live
    el.addEventListener('focus', () => clearFieldState(name));
    el.addEventListener('input', updateProgress);
    el.addEventListener('change', () => {
      validateField(name);
      updateProgress();
    });
  });

  /* ─── Submit ─── */
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate all fields
    const fieldNames = Object.keys(rules);
    const results    = fieldNames.map(name => validateField(name));
    const allValid   = results.every(Boolean);

    if (!allValid) {
      // Scroll to first error
      const firstError = $('.is-error', form);
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = firstError.querySelector('input, select, textarea');
        input?.focus();
      }
      return;
    }

    // Simulate async submission
    const btnText   = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    btnText.hidden   = true;
    btnLoader.hidden = false;
    submitBtn.disabled = true;

    await new Promise(r => setTimeout(r, 1600)); // simulate network delay

    // Show success
    form.hidden          = true;
    successEl.hidden     = false;
    successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Reset progress
    if (progressBar)   progressBar.style.width = '100%';
    if (progressLabel) progressLabel.textContent = 'Submitted!';
  });

  // Initial progress
  updateProgress();
})();

/* ══════════════════════════════════════
   SMOOTH SCROLL for anchor links
══════════════════════════════════════ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id     = anchor.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h')) || 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();