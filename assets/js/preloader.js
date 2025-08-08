/**
 * PRELOADER MANAGEMENT
 * File: /htdocs/assets/js/preloader.js
 * Handles page loading animation and smooth reveal
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        minLoadTime: 800,      // Minimum time to show preloader (ms)
        maxLoadTime: 5000,     // Maximum time before force hide (ms)
        fadeOutDuration: 500,  // Fade out animation duration (ms)
        enablePreloader: true  // Toggle preloader on/off
    };

    // Cache DOM elements
    const elements = {
        preloader: null,
        progressBar: null,
        progressText: null,
        body: document.body
    };

    // State management
    let startTime = Date.now();
    let assetsLoaded = false;
    let windowLoaded = false;

    /**
     * Initialize preloader
     */
    function init() {
        // Check if preloader should be enabled
        if (!CONFIG.enablePreloader) {
            hidePreloader();
            return;
        }

        // Get preloader element
        elements.preloader = document.getElementById('preloader');
        
        if (!elements.preloader) {
            console.warn('Preloader element not found');
            return;
        }

        // Set up event listeners
        setupEventListeners();

        // Start loading simulation
        simulateProgress();

        // Force hide after max time
        setTimeout(() => {
            if (elements.preloader && !elements.preloader.classList.contains('fade-out')) {
                console.log('Force hiding preloader after max time');
                hidePreloader();
            }
        }, CONFIG.maxLoadTime);
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Window load event
        window.addEventListener('load', handleWindowLoad);

        // DOM content loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', handleDOMReady);
        } else {
            handleDOMReady();
        }

        // Track important assets
        trackAssets();
    }

    /**
     * Handle DOM ready event
     */
    function handleDOMReady() {
        console.log('DOM ready');
        
        // Add loaded class to body for CSS animations
        elements.body.classList.add('dom-loaded');
    }

    /**
     * Handle window load event
     */
    function handleWindowLoad() {
        console.log('Window loaded');
        windowLoaded = true;
        
        // Check if minimum time has passed
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, CONFIG.minLoadTime - elapsedTime);
        
        setTimeout(() => {
            hidePreloader();
        }, remainingTime);
    }

    /**
     * Track loading of important assets
     */
    function trackAssets() {
        const images = document.querySelectorAll('img[src]');
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        const scripts = document.querySelectorAll('script[src]');
        
        let totalAssets = images.length + stylesheets.length + scripts.length;
        let loadedAssets = 0;

        // Track images
        images.forEach(img => {
            if (img.complete) {
                loadedAssets++;
            } else {
                img.addEventListener('load', () => {
                    loadedAssets++;
                    updateProgress(loadedAssets, totalAssets);
                });
                img.addEventListener('error', () => {
                    loadedAssets++;
                    updateProgress(loadedAssets, totalAssets);
                });
            }
        });

        // Track stylesheets
        stylesheets.forEach(link => {
            // Check if already loaded
            if (link.sheet) {
                loadedAssets++;
            } else {
                link.addEventListener('load', () => {
                    loadedAssets++;
                    updateProgress(loadedAssets, totalAssets);
                });
            }
        });

        // Update initial progress
        updateProgress(loadedAssets, totalAssets);
    }

    /**
     * Update loading progress
     */
    function updateProgress(loaded, total) {
        if (total === 0) return;
        
        const progress = (loaded / total) * 100;
        
        // Update progress bar if it exists
        if (elements.progressBar) {
            elements.progressBar.style.width = `${progress}%`;
        }
        
        // Update progress text if it exists
        if (elements.progressText) {
            elements.progressText.textContent = `${Math.round(progress)}%`;
        }
        
        // Check if all assets loaded
        if (loaded >= total) {
            assetsLoaded = true;
            console.log('All tracked assets loaded');
        }
    }

    /**
     * Simulate loading progress (fallback)
     */
    function simulateProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            
            if (progress >= 100 || windowLoaded) {
                clearInterval(interval);
                progress = 100;
            }
            
            // Update visual progress
            if (elements.progressBar) {
                elements.progressBar.style.width = `${Math.min(progress, 100)}%`;
            }
            
            if (elements.progressText) {
                elements.progressText.textContent = `${Math.min(Math.round(progress), 100)}%`;
            }
        }, 100);
    }

    /**
     * Hide preloader with animation
     */
    function hidePreloader() {
        if (!elements.preloader) return;
        
        console.log('Hiding preloader');
        
        // Add fade out class
        elements.preloader.classList.add('fade-out');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (elements.preloader && elements.preloader.parentNode) {
                elements.preloader.parentNode.removeChild(elements.preloader);
            }
            
            // Add loaded class to body
            elements.body.classList.add('loaded');
            
            // Trigger custom event
            window.dispatchEvent(new CustomEvent('preloaderHidden'));
            
            // Initialize animations after preloader
            initializePostLoadAnimations();
        }, CONFIG.fadeOutDuration);
    }

    /**
     * Initialize animations after preloader hides
     */
    function initializePostLoadAnimations() {
        // Trigger AOS animations if available
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
        
        // Add visible class to animated elements
        const animatedElements = document.querySelectorAll('[data-animate]');
        animatedElements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, index * 100);
        });
        
        // Start hero animations
        const heroElements = document.querySelectorAll('.hero-content > *');
        heroElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
            el.classList.add('animate-fadeInUp');
        });
    }

    /**
     * Public API
     */
    window.PreloaderManager = {
        init: init,
        hide: hidePreloader,
        getLoadTime: () => Date.now() - startTime,
        isLoaded: () => windowLoaded && assetsLoaded
    };

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();