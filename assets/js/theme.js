/**
 * THEME MANAGEMENT
 * File: /htdocs/assets/js/theme.js
 * Handles dark/light theme switching and custom color schemes
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        defaultTheme: 'dark',
        storageKey: 'portfolio-theme',
        accentStorageKey: 'portfolio-accent',
        transitionDuration: 300,
        themes: ['dark', 'light', 'cyberpunk', 'matrix', 'ocean', 'minimal'],
        accents: ['blue', 'purple', 'pink', 'green', 'orange', 'red'],
        enableSystemDetection: true,
        enableKeyboardShortcuts: true
    };

    // Cache DOM elements
    const elements = {
        body: document.body,
        themeToggle: null,
        themeIcon: null,
        themePicker: null,
        metaThemeColor: null
    };

    // State management
    let currentTheme = CONFIG.defaultTheme;
    let currentAccent = null;
    let systemPreference = null;

    /**
     * Initialize theme manager
     */
    function init() {
        // Cache elements
        cacheElements();
        
        // Detect system preference
        if (CONFIG.enableSystemDetection) {
            detectSystemPreference();
        }
        
        // Load saved theme or use default
        loadTheme();
        
        // Set up event listeners
        setupEventListeners();
        
        // Apply initial theme
        applyTheme(currentTheme, false);
        
        console.log('Theme manager initialized:', currentTheme);
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.themeToggle = document.getElementById('themeToggle');
        elements.themeIcon = document.getElementById('themeIcon');
        elements.themePicker = document.querySelector('.theme-picker');
        elements.metaThemeColor = document.querySelector('meta[name="theme-color"]');
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Theme toggle button
        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', toggleTheme);
        }
        
        // Theme picker buttons
        if (elements.themePicker) {
            const pickerButtons = elements.themePicker.querySelectorAll('.theme-picker-btn');
            pickerButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const theme = btn.dataset.theme;
                    if (theme) setTheme(theme);
                });
            });
        }
        
        // Keyboard shortcuts
        if (CONFIG.enableKeyboardShortcuts) {
            document.addEventListener('keydown', handleKeyboard);
        }
        
        // System theme change detection
        if (CONFIG.enableSystemDetection && window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkModeQuery.addEventListener('change', handleSystemThemeChange);
        }
        
        // Custom theme event listener
        window.addEventListener('setTheme', (e) => {
            if (e.detail && e.detail.theme) {
                setTheme(e.detail.theme);
            }
        });
    }

    /**
     * Detect system color scheme preference
     */
    function detectSystemPreference() {
        if (!window.matchMedia) return;
        
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        systemPreference = darkModeQuery.matches ? 'dark' : 'light';
    }

    /**
     * Load saved theme from storage
     */
    function loadTheme() {
        try {
            // Check localStorage
            const savedTheme = localStorage.getItem(CONFIG.storageKey);
            const savedAccent = localStorage.getItem(CONFIG.accentStorageKey);
            
            if (savedTheme && CONFIG.themes.includes(savedTheme)) {
                currentTheme = savedTheme;
            } else if (systemPreference) {
                // Use system preference if no saved theme
                currentTheme = systemPreference;
            }
            
            if (savedAccent && CONFIG.accents.includes(savedAccent)) {
                currentAccent = savedAccent;
            }
        } catch (error) {
            console.error('Error loading theme from storage:', error);
        }
    }

    /**
     * Save theme to storage
     */
    function saveTheme() {
        try {
            localStorage.setItem(CONFIG.storageKey, currentTheme);
            if (currentAccent) {
                localStorage.setItem(CONFIG.accentStorageKey, currentAccent);
            } else {
                localStorage.removeItem(CONFIG.accentStorageKey);
            }
        } catch (error) {
            console.error('Error saving theme to storage:', error);
        }
    }

    /**
     * Apply theme to document
     */
    function applyTheme(theme, animate = true) {
        if (!CONFIG.themes.includes(theme)) {
            console.warn('Invalid theme:', theme);
            return;
        }
        
        // Add transition class for smooth change
        if (animate) {
            elements.body.classList.add('theme-transition');
        }
        
        // Set theme attribute
        elements.body.setAttribute('data-theme', theme);
        
        // Set accent if exists
        if (currentAccent) {
            elements.body.setAttribute('data-accent', currentAccent);
        }
        
        // Update theme color meta tag
        updateMetaThemeColor(theme);
        
        // Update toggle icon
        updateToggleIcon(theme);
        
        // Update theme picker
        updateThemePicker(theme);
        
        // Remove transition class after animation
        if (animate) {
            setTimeout(() => {
                elements.body.classList.remove('theme-transition');
            }, CONFIG.transitionDuration);
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme, accent: currentAccent }
        }));
    }

    /**
     * Set specific theme
     */
    function setTheme(theme) {
        if (theme === currentTheme) return;
        
        currentTheme = theme;
        applyTheme(theme);
        saveTheme();
        
        console.log('Theme changed to:', theme);
    }

    /**
     * Toggle between light and dark themes
     */
    function toggleTheme() {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        
        // Add rotation animation to icon
        if (elements.themeToggle) {
            elements.themeToggle.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                elements.themeToggle.style.transform = '';
            }, 300);
        }
    }

    /**
     * Set accent color
     */
    function setAccent(accent) {
        if (!CONFIG.accents.includes(accent)) {
            console.warn('Invalid accent:', accent);
            return;
        }
        
        currentAccent = accent;
        elements.body.setAttribute('data-accent', accent);
        saveTheme();
        
        console.log('Accent changed to:', accent);
    }

    /**
     * Update toggle button icon
     */
    function updateToggleIcon(theme) {
        if (!elements.themeIcon) return;
        
        // Remove all icon classes
        elements.themeIcon.className = '';
        
        // Add appropriate icon
        switch(theme) {
            case 'light':
                elements.themeIcon.className = 'fas fa-sun';
                break;
            case 'dark':
                elements.themeIcon.className = 'fas fa-moon';
                break;
            case 'cyberpunk':
                elements.themeIcon.className = 'fas fa-robot';
                break;
            case 'matrix':
                elements.themeIcon.className = 'fas fa-code';
                break;
            case 'ocean':
                elements.themeIcon.className = 'fas fa-water';
                break;
            default:
                elements.themeIcon.className = 'fas fa-moon';
        }
    }

    /**
     * Update meta theme color for mobile browsers
     */
    function updateMetaThemeColor(theme) {
        if (!elements.metaThemeColor) return;
        
        const colors = {
            dark: '#0a0a0a',
            light: '#ffffff',
            cyberpunk: '#0a0014',
            matrix: '#000000',
            ocean: '#001e3c',
            minimal: '#ffffff'
        };
        
        elements.metaThemeColor.content = colors[theme] || colors.dark;
    }

    /**
     * Update theme picker active state
     */
    function updateThemePicker(theme) {
        if (!elements.themePicker) return;
        
        const buttons = elements.themePicker.querySelectorAll('.theme-picker-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    /**
     * Handle system theme change
     */
    function handleSystemThemeChange(e) {
        systemPreference = e.matches ? 'dark' : 'light';
        
        // Only auto-switch if user hasn't manually set a theme
        const savedTheme = localStorage.getItem(CONFIG.storageKey);
        if (!savedTheme) {
            setTheme(systemPreference);
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboard(e) {
        // Ctrl/Cmd + Shift + T: Toggle theme
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            toggleTheme();
        }
        
        // Ctrl/Cmd + Shift + 1-6: Quick theme switch
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            const num = parseInt(e.key);
            if (num >= 1 && num <= CONFIG.themes.length) {
                e.preventDefault();
                setTheme(CONFIG.themes[num - 1]);
            }
        }
    }

    /**
     * Get theme colors for charts/visualizations
     */
    function getThemeColors() {
        const computedStyle = getComputedStyle(elements.body);
        
        return {
            primary: computedStyle.getPropertyValue('--primary').trim(),
            secondary: computedStyle.getPropertyValue('--secondary').trim(),
            background: computedStyle.getPropertyValue('--bg-primary').trim(),
            text: computedStyle.getPropertyValue('--text-primary').trim(),
            border: computedStyle.getPropertyValue('--border-primary').trim()
        };
    }

    /**
     * Create theme picker UI dynamically
     */
    function createThemePicker() {
        const picker = document.createElement('div');
        picker.className = 'theme-picker';
        
        CONFIG.themes.forEach(theme => {
            const btn = document.createElement('button');
            btn.className = 'theme-picker-btn';
            btn.dataset.theme = theme;
            btn.title = theme.charAt(0).toUpperCase() + theme.slice(1);
            btn.addEventListener('click', () => setTheme(theme));
            picker.appendChild(btn);
        });
        
        document.body.appendChild(picker);
        elements.themePicker = picker;
    }

    /**
     * Public API
     */
    window.ThemeManager = {
        init: init,
        setTheme: setTheme,
        toggleTheme: toggleTheme,
        setAccent: setAccent,
        getCurrentTheme: () => currentTheme,
        getCurrentAccent: () => currentAccent,
        getThemes: () => CONFIG.themes,
        getAccents: () => CONFIG.accents,
        getColors: getThemeColors,
        createPicker: createThemePicker
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();