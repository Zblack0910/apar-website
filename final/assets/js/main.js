/**
 * main.js — APAR Interactions
 * 
 * Responsibilities:
 * 1. Mobile menu (open/close + overlay)
 * 2. Smooth scroll to sections
 * 3. Sticky header shadow on scroll
 * 4. FAQ accordion
 * 5. Active page highlight in nav
 * 
 * Rule: No SEO content is rendered by JavaScript.
 * All content is static HTML.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────
     1. MOBILE MENU
     ───────────────────────────────── */

  function initMobileMenu() {
    var menuBtn = document.querySelector('.mobile-menu-btn');
    var menu = document.querySelector('.mobile-menu');
    var overlay = document.querySelector('.mobile-menu__overlay');

    if (!menuBtn || !menu) return;

    function openMenu() {
      menuBtn.classList.add('active');
      menuBtn.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
      menu.classList.add('is-open');
      if (overlay) overlay.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menuBtn.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      menu.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-visible');
      document.body.style.overflow = '';
    }

    function toggleMenu() {
      if (menu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    menuBtn.addEventListener('click', function (e) {
      e.preventDefault();
      toggleMenu();
    });

    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }

    // Close on escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
      }
    });

    // Close menu on link click
    var menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on resize to desktop
    var mql = window.matchMedia('(min-width: 768px)');
    mql.addEventListener('change', function (e) {
      if (e.matches) closeMenu();
    });
  }


  /* ─────────────────────────────────
     2. SMOOTH SCROLL
     ───────────────────────────────── */

  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var targetId = link.getAttribute('href');
      if (targetId === '#' || targetId === '#!') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      var headerHeight = 72;
      var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Update URL without scroll
      history.pushState(null, null, targetId);
    });
  }


  /* ─────────────────────────────────
     3. STICKY HEADER SHADOW
     ───────────────────────────────── */

  function initStickyHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var scrollThreshold = 10;
    var isScrolled = false;

    function onScroll() {
      var scrolled = window.pageYOffset > scrollThreshold;

      if (scrolled !== isScrolled) {
        isScrolled = scrolled;
        if (isScrolled) {
          header.classList.add('site-header--scrolled');
        } else {
          header.classList.remove('site-header--scrolled');
        }
      }
    }

    // Use passive listener for performance
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Check initial state
  }


  /* ─────────────────────────────────
     4. FAQ ACCORDION
     ───────────────────────────────── */

  function initFAQ() {
    var faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function (item) {
      var question = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');

      if (!question || !answer) return;

      question.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        // Close all other FAQ items (optional: remove for multi-open)
        // faqItems.forEach(function (other) {
        //   if (other !== item) other.classList.remove('is-open');
        // });

        if (isOpen) {
          item.classList.remove('is-open');
          question.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('is-open');
          question.setAttribute('aria-expanded', 'true');
        }
      });

      // Keyboard support
      question.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        }
      });
    });
  }


  /* ─────────────────────────────────
     5. ACTIVE PAGE HIGHLIGHT
     ───────────────────────────────── */

  function initActivePage() {
    // Links are relative (so the site can be served from any folder), therefore
    // they must be resolved against the current document before comparing.
    function normalize(path) {
      path = path.replace(/\/index\.html$/, '/');
      if (path.charAt(path.length - 1) !== '/') path += '/';
      return path;
    }

    var currentPath = normalize(window.location.pathname);
    var lang = document.documentElement.getAttribute('lang') || 'fa';
    var homePath = normalize('/' + lang + '/');

    var navLinks = document.querySelectorAll('.nav-menu a, .mobile-nav a');
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;

      var url;
      try {
        url = new URL(href, window.location.href);
      } catch (e) {
        return;
      }
      if (url.origin !== window.location.origin) return;

      var linkPath = normalize(url.pathname);
      var isHome = linkPath.slice(-homePath.length) === homePath;
      var isCurrent = linkPath === currentPath;
      var isSection = !isHome && currentPath.indexOf(linkPath) === 0;

      if (isCurrent || isSection) link.classList.add('active');
    });
  }


  /* ─────────────────────────────────
     INIT ALL
     ───────────────────────────────── */

  function init() {
    initMobileMenu();
    initSmoothScroll();
    initStickyHeader();
    initFAQ();
    initActivePage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for other scripts if needed
  window.APAR = window.APAR || {};
  window.APAR.Main = {
    closeMobileMenu: function () {
      var menu = document.querySelector('.mobile-menu');
      if (menu) {
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
      }
      var overlay = document.querySelector('.mobile-menu__overlay');
      if (overlay) overlay.classList.remove('is-visible');
      var btn = document.querySelector('.mobile-menu-btn');
      if (btn) {
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
    }
  };

})();
