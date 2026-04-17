/*
 * Copyright © 2025 Abdellah Boubker
 * All rights reserved.
 */

// Header shrink
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  header.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile nav
const navToggle = document.getElementById('nav-toggle');
const navList = document.getElementById('nav-list');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.innerHTML = isOpen
      ? '<ion-icon name="close-outline" aria-hidden="true"></ion-icon>'
      : '<ion-icon name="menu-outline" aria-hidden="true"></ion-icon>';
  });
}

// Scrollspy
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) current = section.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href').substring(1) === current);
  });
});

// Smooth scroll
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const el = document.querySelector(targetId);
    window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    if (navList.classList.contains('active')) {
      navList.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.innerHTML = '<ion-icon name="menu-outline"></ion-icon>';
    }
  });
});

// Reveal on scroll
const revealElements = document.querySelectorAll('.reveal');
function checkReveal() {
  const windowHeight = window.innerHeight;
  const revealPoint = 150;
  revealElements.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < windowHeight - revealPoint) el.classList.add('active');
  });
}
['load','scroll'].forEach(evt => window.addEventListener(evt, checkReveal));

// Portfolio filters (added categories)
const portfolioFilters = document.querySelectorAll('.portfolio-filter');
const portfolioItems = document.querySelectorAll('.portfolio-card');
portfolioFilters.forEach(filter => {
  filter.addEventListener('click', function() {
    portfolioFilters.forEach(f => f.classList.remove('active'));
    this.classList.add('active');
    const filterValue = this.getAttribute('data-filter');

    portfolioItems.forEach(item => {
      const show = filterValue === 'all' || item.getAttribute('data-category') === filterValue;
      item.style.display = show ? 'block' : 'none';
      item.style.opacity = show ? '1' : '0';
      item.style.transform = show ? 'translateY(0)' : 'translateY(20px)';
    });
  });
});

// Contact Form (Formspree)
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const original = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon><span>Envoi…</span>';

    try {
      const res = await fetch(contactForm.action, {
        method: contactForm.method,
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        contactForm.style.display = 'none';
        formSuccess.style.display = 'block';
        contactForm.reset();
      } else throw new Error('Erreur réseau');
    } catch (err) {
      console.error(err);
      submitBtn.disabled = false;
      submitBtn.innerHTML = original;
      alert("Problème d'envoi. Réessayez plus tard.");
    }
  });
}

// Animate skill bars on load
window.addEventListener('load', () => {
  document.querySelectorAll('.skill-progress').forEach(bar => {
    const target = bar.style.width;
    bar.style.width = '0';
    setTimeout(() => { bar.style.width = target; }, 400);
  });
});

// Cursor effect (respect reduced motion)
const cursor = document.querySelector('.highlight-cursor');
const useMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (cursor && useMotion) {
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  ['mousedown','mouseup'].forEach(evt => {
    document.addEventListener(evt, () => cursor.classList.toggle('active'));
  });
  document.querySelectorAll('a,button,.portfolio-card,.service-card,.tech-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
}
