/**
 * theme.js — APAR Theme Manager
 * 
 * Manages light/dark mode with:
 * 1. localStorage saved preference
 * 2. System preference (prefers-color-scheme)
 * 3. Default: light
 * 
 * Usage:
 *   APAR.Theme.toggle()       — Switch theme
 *   APAR.Theme.get()          — Get current theme ('light' | 'dark')
 *   APAR.Theme.set('dark')    — Set specific theme
 * 
 * No external dependencies.
 * Loads synchronously to prevent flash of wrong theme (FOWT).
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'apar-theme';
  var DEFAULT_THEME = 'light';
  var ATTRIBUTE = 'data-theme';

  /**
   * Detect system preference
   */
  function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return DEFAULT_THEME;
  }

  /**
   * Read saved theme from localStorage
   */
  function getSavedTheme() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch (e) {
      // localStorage not available
    }
    return null;
  }

  /**
   * Save theme to localStorage
   */
  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // localStorage not available
    }
  }

  /**
   * Apply theme to document
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute(ATTRIBUTE, theme);

    // Update meta theme-color for mobile browsers
    var metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0F172A' : '#FFFFFF');
    }

    // Dispatch event for other scripts
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  }

  /**
   * Get current active theme
   */
  function getTheme() {
    return document.documentElement.getAttribute(ATTRIBUTE) || DEFAULT_THEME;
  }

  /**
   * Set theme explicitly
   */
  function setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    saveTheme(theme);
    applyTheme(theme);
    updateToggleButtons(theme);
  }

  /**
   * Toggle between light and dark
   */
  function toggleTheme() {
    var current = getTheme();
    var next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  /**
   * Update toggle button icons
   */
  function updateToggleButtons(theme) {
    var btns = document.querySelectorAll('.theme-toggle, .mobile-theme-toggle');
    btns.forEach(function (btn) {
      var label = btn.getAttribute('aria-label') || btn.getAttribute('data-label');
      if (label) {
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      }
    });
  }

  /**
   * Initialize theme on page load
   * Priority: localStorage > system > default
   */
  function init() {
    var saved = getSavedTheme();
    var theme = saved || getSystemTheme();
    applyTheme(theme);

    // Listen for system preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        // Only auto-switch if user hasn't manually set a preference
        if (!getSavedTheme()) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }

    // Bind toggle buttons
    document.addEventListener('DOMContentLoaded', function () {
      var btns = document.querySelectorAll('.theme-toggle, .mobile-theme-toggle');
      btns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          toggleTheme();
        });
      });
      updateToggleButtons(theme);
    });
  }

  // Initialize immediately (before DOMContentLoaded to prevent FOWT)
  init();

  // Public API
  window.APAR = window.APAR || {};
  window.APAR.Theme = {
    get: getTheme,
    set: setTheme,
    toggle: toggleTheme
  };

})();
