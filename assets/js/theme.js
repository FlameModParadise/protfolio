/**
 * THEME MANAGEMENT SYSTEM
 * File: /htdocs/assets/js/theme.js
 * 
 * @description Advanced theme switcher with dark/light modes, custom themes,
 * accent colors, system detection, and keyboard shortcuts.
 * 
 * @version 2.0.0
 * @author Portfolio Team
 */

class ThemeManager {
    /**
     * Default configuration settings
     * @private
     */
    static #config = {
        defaultTheme: 'dark',
        storageKey: 'portfolio-theme',
        accentStorageKey: 'portfolio-accent',
        transitionDuration: 300,
        themes: ['dark', 'light', 'cyberpunk', 'matrix', 'ocean', 'minimal'],
        accents: ['blue', 'purple', 'pink', 'green', 'orange', 'red'],
        enableSystemDetection: true,
        enableKeyboardShortcuts: true,
        debugMode: false
    };

    /**
     * Theme color mappings for meta tags
     * @private
     */
    static #themeColors = {
        dark: '#0a0a0a',
        light: '#ffffff',
        cyberpunk: '#0a0014',
        matrix: '#000000',
        ocean: '#001e3c',
        minimal: '#ffffff'
    };

    /**
     * Theme icon mappings
     * @private
     */
    static #themeIcons = {
        light: 'fas fa-sun',
        dark: 'fas fa-moon',
        cyberpunk: 'fas fa-robot',
        matrix: 'fas fa-code',
        ocean: 'fas fa-water',
        minimal: 'fas fa-circle'
    };

    /**
     * @constructor
     */
    constructor() {
        this.currentTheme = ThemeManager.#config.defaultTheme;
        this.currentAccent = null;
        this.systemPreference = null;
        this.elements = {};
        this.listeners = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize the theme manager
     * @public
     * @returns {void}
     */
    init() {
        if (this.isInitialized) {
            this.#log('Theme manager already initialized');
            return;
        }

        try {
            this.#cacheElements();
            this.#detectSystemPreference();
            this.#loadStoredPreferences();
            this.#setupEventListeners();
            this.#applyTheme(this.currentTheme, false);
            
            this.isInitialized = true;
            this.#log('Theme manager initialized successfully', this.currentTheme);
        } catch (error) {
            console.error('Failed to initialize theme manager:', error);
        }
    }

    /**
     * Cache DOM elements for better performance
     * @private
     */
    #cacheElements() {
        this.elements = {
            body: document.body,
            themeToggle: document.getElementById('themeToggle'),
            themeIcon: document.getElementById('themeIcon'),
            themePicker: document.querySelector('.theme-picker'),
            metaThemeColor: document.querySelector('meta[name="theme-color"]')
        };

        if (!this.elements.body) {
            throw new Error('Document body not found');
        }
    }

    /**
     * Detect system color scheme preference
     * @private
     */
    #detectSystemPreference() {
        if (!ThemeManager.#config.enableSystemDetection || !window.matchMedia) {
            return;
        }

        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.systemPreference = darkModeQuery.matches ? 'dark' : 'light';
        
        this.#log('System preference detected:', this.systemPreference);
    }

    /**
     * Load saved preferences from localStorage
     * @private
     */
    #loadStoredPreferences() {
        try {
            const savedTheme = localStorage.getItem(ThemeManager.#config.storageKey);
            const savedAccent = localStorage.getItem(ThemeManager.#config.accentStorageKey);

            // Validate and set theme
            if (this.#isValidTheme(savedTheme)) {
                this.currentTheme = savedTheme;
            } else if (this.systemPreference) {
                this.currentTheme = this.systemPreference;
            }

            // Validate and set accent
            if (this.#isValidAccent(savedAccent)) {
                this.currentAccent = savedAccent;
            }

            this.#log('Loaded preferences:', { theme: this.currentTheme, accent: this.currentAccent });
        } catch (error) {
            this.#log('Error loading preferences:', error);
        }
    }

    /**
     * Save current preferences to localStorage
     * @private
     */
    #savePreferences() {
        try {
            localStorage.setItem(ThemeManager.#config.storageKey, this.currentTheme);
            
            if (this.currentAccent) {
                localStorage.setItem(ThemeManager.#config.accentStorageKey, this.currentAccent);
            } else {
                localStorage.removeItem(ThemeManager.#config.accentStorageKey);
            }

            this.#log('Preferences saved');
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    }

    /**
     * Set up all event listeners
     * @private
     */
    #setupEventListeners() {
        // Theme toggle button
        this.#addListener(this.elements.themeToggle, 'click', () => this.toggleTheme());

        // Theme picker buttons
        if (this.elements.themePicker) {
            this.#setupThemePickerListeners();
        }

        // Keyboard shortcuts
        if (ThemeManager.#config.enableKeyboardShortcuts) {
            this.#setupKeyboardShortcuts();
        }

        // System theme change detection
        this.#setupSystemThemeListener();

        // Custom theme event
        this.#addListener(window, 'setTheme', (event) => {
            if (event.detail?.theme) {
                this.setTheme(event.detail.theme);
            }
        });
    }

    /**
     * Set up theme picker button listeners
     * @private
     */
    #setupThemePickerListeners() {
        const buttons = this.elements.themePicker.querySelectorAll('.theme-picker-btn');
        
        buttons.forEach(button => {
            this.#addListener(button, 'click', () => {
                const theme = button.dataset.theme;
                if (theme) {
                    this.setTheme(theme);
                }
            });
        });
    }

    /**
     * Set up keyboard shortcuts
     * @private
     */
    #setupKeyboardShortcuts() {
        this.#addListener(document, 'keydown', (event) => {
            const isModified = event.ctrlKey || event.metaKey;
            
            if (!isModified || !event.shiftKey) {
                return;
            }

            // Toggle theme: Ctrl/Cmd + Shift + T
            if (event.key === 'T') {
                event.preventDefault();
                this.toggleTheme();
                return;
            }

            // Quick theme switch: Ctrl/Cmd + Shift + 1-6
            const numberKey = parseInt(event.key);
            if (numberKey >= 1 && numberKey <= ThemeManager.#config.themes.length) {
                event.preventDefault();
                this.setTheme(ThemeManager.#config.themes[numberKey - 1]);
            }
        });
    }

    /**
     * Set up system theme change listener
     * @private
     */
    #setupSystemThemeListener() {
        if (!ThemeManager.#config.enableSystemDetection || !window.matchMedia) {
            return;
        }

        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        this.#addListener(darkModeQuery, 'change', (event) => {
            this.systemPreference = event.matches ? 'dark' : 'light';
            
            // Auto-switch only if no manual theme is set
            const hasManualTheme = localStorage.getItem(ThemeManager.#config.storageKey);
            if (!hasManualTheme) {
                this.setTheme(this.systemPreference);
            }
        });
    }

    /**
     * Apply theme to the document
     * @private
     * @param {string} theme - Theme name to apply
     * @param {boolean} animate - Whether to animate the transition
     */
    #applyTheme(theme, animate = true) {
        if (!this.#isValidTheme(theme)) {
            console.warn(`Invalid theme: ${theme}`);
            return;
        }

        // Handle transition animation
        if (animate) {
            this.#startTransition();
        }

        // Apply theme attributes
        this.elements.body.setAttribute('data-theme', theme);
        
        if (this.currentAccent) {
            this.elements.body.setAttribute('data-accent', this.currentAccent);
        }

        // Update UI elements
        this.#updateMetaThemeColor(theme);
        this.#updateToggleIcon(theme);
        this.#updateThemePicker(theme);

        // Clean up transition
        if (animate) {
            this.#endTransition();
        }

        // Dispatch change event
        this.#dispatchThemeChangeEvent(theme);
    }

    /**
     * Start theme transition animation
     * @private
     */
    #startTransition() {
        this.elements.body.classList.add('theme-transition');
    }

    /**
     * End theme transition animation
     * @private
     */
    #endTransition() {
        setTimeout(() => {
            this.elements.body.classList.remove('theme-transition');
        }, ThemeManager.#config.transitionDuration);
    }

    /**
     * Update meta theme color for mobile browsers
     * @private
     * @param {string} theme - Current theme
     */
    #updateMetaThemeColor(theme) {
        if (!this.elements.metaThemeColor) {
            return;
        }

        const color = ThemeManager.#themeColors[theme] || ThemeManager.#themeColors.dark;
        this.elements.metaThemeColor.content = color;
    }

    /**
     * Update toggle button icon
     * @private
     * @param {string} theme - Current theme
     */
    #updateToggleIcon(theme) {
        if (!this.elements.themeIcon) {
            return;
        }

        const iconClass = ThemeManager.#themeIcons[theme] || ThemeManager.#themeIcons.dark;
        this.elements.themeIcon.className = iconClass;
    }

    /**
     * Update theme picker active state
     * @private
     * @param {string} theme - Current theme
     */
    #updateThemePicker(theme) {
        if (!this.elements.themePicker) {
            return;
        }

        const buttons = this.elements.themePicker.querySelectorAll('.theme-picker-btn');
        buttons.forEach(button => {
            const isActive = button.dataset.theme === theme;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', isActive);
        });
    }

    /**
     * Dispatch theme change event
     * @private
     * @param {string} theme - New theme
     */
    #dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: {
                theme,
                accent: this.currentAccent,
                timestamp: Date.now()
            }
        });
        
        window.dispatchEvent(event);
    }

    /**
     * Add event listener with tracking
     * @private
     * @param {Element} element - DOM element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    #addListener(element, event, handler) {
        if (!element) return;

        element.addEventListener(event, handler);
        
        // Track listeners for cleanup
        if (!this.listeners.has(element)) {
            this.listeners.set(element, []);
        }
        
        this.listeners.get(element).push({ event, handler });
    }

    /**
     * Validate theme name
     * @private
     * @param {string} theme - Theme to validate
     * @returns {boolean}
     */
    #isValidTheme(theme) {
        return theme && ThemeManager.#config.themes.includes(theme);
    }

    /**
     * Validate accent name
     * @private
     * @param {string} accent - Accent to validate
     * @returns {boolean}
     */
    #isValidAccent(accent) {
        return accent && ThemeManager.#config.accents.includes(accent);
    }

    /**
     * Log debug messages
     * @private
     * @param {...any} args - Arguments to log
     */
    #log(...args) {
        if (ThemeManager.#config.debugMode) {
            console.log('[ThemeManager]', ...args);
        }
    }

    // ============================
    // PUBLIC API METHODS
    // ============================

    /**
     * Set a specific theme
     * @public
     * @param {string} theme - Theme name
     * @returns {boolean} Success status
     */
    setTheme(theme) {
        if (!this.#isValidTheme(theme)) {
            console.error(`Invalid theme: ${theme}`);
            return false;
        }

        if (theme === this.currentTheme) {
            this.#log('Theme already active:', theme);
            return true;
        }

        this.currentTheme = theme;
        this.#applyTheme(theme);
        this.#savePreferences();
        
        this.#log('Theme changed to:', theme);
        return true;
    }

    /**
     * Toggle between light and dark themes
     * @public
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        
        // Animate toggle button
        if (this.elements.themeToggle) {
            this.#animateToggleButton();
        }
    }

    /**
     * Animate toggle button rotation
     * @private
     */
    #animateToggleButton() {
        this.elements.themeToggle.style.transform = 'rotate(180deg)';
        
        setTimeout(() => {
            this.elements.themeToggle.style.transform = '';
        }, 300);
    }

    /**
     * Set accent color
     * @public
     * @param {string} accent - Accent color name
     * @returns {boolean} Success status
     */
    setAccent(accent) {
        if (!this.#isValidAccent(accent)) {
            console.error(`Invalid accent: ${accent}`);
            return false;
        }

        this.currentAccent = accent;
        this.elements.body.setAttribute('data-accent', accent);
        this.#savePreferences();
        
        this.#log('Accent changed to:', accent);
        return true;
    }

    /**
     * Get current theme
     * @public
     * @returns {string} Current theme name
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Get current accent
     * @public
     * @returns {string|null} Current accent name
     */
    getCurrentAccent() {
        return this.currentAccent;
    }

    /**
     * Get available themes
     * @public
     * @returns {string[]} Array of theme names
     */
    getAvailableThemes() {
        return [...ThemeManager.#config.themes];
    }

    /**
     * Get available accents
     * @public
     * @returns {string[]} Array of accent names
     */
    getAvailableAccents() {
        return [...ThemeManager.#config.accents];
    }

    /**
     * Get computed theme colors for charts/visualizations
     * @public
     * @returns {Object} Color values object
     */
    getThemeColors() {
        const computedStyle = getComputedStyle(this.elements.body);
        
        return {
            primary: computedStyle.getPropertyValue('--primary')?.trim() || '',
            secondary: computedStyle.getPropertyValue('--secondary')?.trim() || '',
            background: computedStyle.getPropertyValue('--bg-primary')?.trim() || '',
            text: computedStyle.getPropertyValue('--text-primary')?.trim() || '',
            border: computedStyle.getPropertyValue('--border-primary')?.trim() || '',
            accent: computedStyle.getPropertyValue('--accent')?.trim() || ''
        };
    }

    /**
     * Create theme picker UI dynamically
     * @public
     * @param {HTMLElement} container - Container element for picker
     */
    createThemePicker(container = document.body) {
        const picker = document.createElement('div');
        picker.className = 'theme-picker';
        picker.setAttribute('role', 'group');
        picker.setAttribute('aria-label', 'Theme selector');
        
        ThemeManager.#config.themes.forEach(theme => {
            const button = document.createElement('button');
            button.className = 'theme-picker-btn';
            button.dataset.theme = theme;
            button.title = this.#formatThemeName(theme);
            button.setAttribute('aria-label', `Switch to ${theme} theme`);
            button.setAttribute('type', 'button');
            
            button.addEventListener('click', () => this.setTheme(theme));
            picker.appendChild(button);
        });
        
        container.appendChild(picker);
        this.elements.themePicker = picker;
        
        this.#log('Theme picker created');
    }

    /**
     * Format theme name for display
     * @private
     * @param {string} theme - Theme name
     * @returns {string} Formatted name
     */
    #formatThemeName(theme) {
        return theme.charAt(0).toUpperCase() + theme.slice(1);
    }

    /**
     * Enable debug mode
     * @public
     */
    enableDebugMode() {
        ThemeManager.#config.debugMode = true;
        this.#log('Debug mode enabled');
    }

    /**
     * Disable debug mode
     * @public
     */
    disableDebugMode() {
        ThemeManager.#config.debugMode = false;
    }

    /**
     * Clean up event listeners
     * @public
     */
    destroy() {
        // Remove all tracked listeners
        this.listeners.forEach((handlers, element) => {
            handlers.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        
        this.listeners.clear();
        this.isInitialized = false;
        
        this.#log('Theme manager destroyed');
    }
}

// ============================
// INITIALIZATION
// ============================

// Create global instance
const themeManager = new ThemeManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => themeManager.init());
} else {
    themeManager.init();
}

// Export to global scope for backward compatibility
window.ThemeManager = {
    // Instance methods
    init: () => themeManager.init(),
    setTheme: (theme) => themeManager.setTheme(theme),
    toggleTheme: () => themeManager.toggleTheme(),
    setAccent: (accent) => themeManager.setAccent(accent),
    getCurrentTheme: () => themeManager.getCurrentTheme(),
    getCurrentAccent: () => themeManager.getCurrentAccent(),
    getThemes: () => themeManager.getAvailableThemes(),
    getAccents: () => themeManager.getAvailableAccents(),
    getColors: () => themeManager.getThemeColors(),
    createPicker: (container) => themeManager.createThemePicker(container),
    enableDebug: () => themeManager.enableDebugMode(),
    disableDebug: () => themeManager.disableDebugMode(),
    destroy: () => themeManager.destroy(),
    
    // Direct instance access
    instance: themeManager
};