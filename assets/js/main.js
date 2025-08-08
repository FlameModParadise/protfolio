/**
 * MAIN APPLICATION CONTROLLER
 * File: /htdocs/assets/js/main.js
 * Initializes all modules and manages global functionality
 */

(function() {
    'use strict';

    // Global configuration
    const APP_CONFIG = {
        version: '1.0.0',
        debug: false,
        enableAnalytics: true,
        enableServiceWorker: false,
        enablePWA: false,
        apiBaseUrl: '/api',
        loadDelay: 100
    };

    // Module initialization order
    const MODULES = [
        'PreloaderManager',
        'ThemeManager',
        'NavigationManager',
        'AnimationController',
        'SkillsManager',
        'ProjectsManager',
        'TerminalManager',
        'GitHubManager',
        'ContactFormManager'
    ];

    // Global state
    const state = {
        initialized: false,
        modules: {},
        performance: {
            startTime: performance.now(),
            loadTime: 0,
            metrics: {}
        }
    };

    /**
     * Initialize application
     */
    async function init() {
        try {
            // Mark start time
            markPerformance('appStart');
            
            // Check browser compatibility
            if (!checkBrowserCompatibility()) {
                showBrowserWarning();
                return;
            }
            
            // Initialize modules
            await initializeModules();
            
            // Set up global event handlers
            setupGlobalHandlers();
            
            // Initialize third-party integrations
            initializeIntegrations();
            
            // Set up performance monitoring
            setupPerformanceMonitoring();
            
            // Register service worker
            if (APP_CONFIG.enableServiceWorker) {
                registerServiceWorker();
            }
            
            // Mark app as initialized
            state.initialized = true;
            markPerformance('appReady');
            
            // Log initialization complete
            const loadTime = performance.now() - state.performance.startTime;
            console.log(`✅ Portfolio initialized in ${loadTime.toFixed(2)}ms`);
            
            // Dispatch ready event
            window.dispatchEvent(new CustomEvent('portfolioReady', {
                detail: { loadTime, version: APP_CONFIG.version }
            }));
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            handleInitError(error);
        }
    }

    /**
     * Check browser compatibility
     */
    function checkBrowserCompatibility() {
        const required = [
            'IntersectionObserver',
            'requestAnimationFrame',
            'localStorage',
            'fetch',
            'Promise'
        ];
        
        for (const feature of required) {
            if (!(feature in window)) {
                console.warn(`Missing required feature: ${feature}`);
                return false;
            }
        }
        
        return true;
    }

    /**
     * Show browser compatibility warning
     */
    function showBrowserWarning() {
        const warning = document.createElement('div');
        warning.className = 'browser-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <h2>Browser Not Supported</h2>
                <p>Please update your browser to view this portfolio.</p>
                <p>Recommended browsers: Chrome, Firefox, Safari, Edge</p>
            </div>
        `;
        document.body.appendChild(warning);
    }

    /**
     * Initialize all modules
     */
    async function initializeModules() {
        for (const moduleName of MODULES) {
            try {
                if (window[moduleName] && typeof window[moduleName].init === 'function') {
                    markPerformance(`${moduleName}Start`);
                    await window[moduleName].init();
                    state.modules[moduleName] = window[moduleName];
                    markPerformance(`${moduleName}End`);
                    
                    if (APP_CONFIG.debug) {
                        console.log(`✓ ${moduleName} initialized`);
                    }
                } else {
                    console.warn(`Module ${moduleName} not found or has no init method`);
                }
            } catch (error) {
                console.error(`Failed to initialize ${moduleName}:`, error);
            }
            
            // Small delay between module initialization
            await sleep(APP_CONFIG.loadDelay);
        }
    }

    /**
     * Set up global event handlers
     */
    function setupGlobalHandlers() {
        // Smooth scroll for anchor links
        document.addEventListener('click', handleAnchorClick);
        
        // Lazy load images
        lazyLoadImages();
        
        // Handle external links
        document.addEventListener('click', handleExternalLinks);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        // Window resize debounced
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(handleResize, 250);
        });
        
        // Page visibility change
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Handle errors globally
        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        
        // Back to top button
        setupBackToTop();
        
        // Copy email/phone on click
        setupContactCopy();
        
        // Set current year in footer
        updateFooterYear();
    }

    /**
     * Handle anchor link clicks
     */
    function handleAnchorClick(e) {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (!target) return;
        
        e.preventDefault();
        
        // Use NavigationManager if available
        if (state.modules.NavigationManager) {
            state.modules.NavigationManager.scrollTo(target);
        } else {
            // Fallback smooth scroll
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Lazy load images
     */
    function lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('img[loading="lazy"]');
            
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Load image
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        
                        // Stop observing
                        imageObserver.unobserve(img);
                        
                        // Add loaded class
                        img.classList.add('loaded');
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }

    /**
     * Handle external links
     */
    function handleExternalLinks(e) {
        const link = e.target.closest('a[href^="http"]');
        if (!link) return;
        
        const hostname = new URL(link.href).hostname;
        if (hostname !== window.location.hostname) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            
            // Track external link click
            if (APP_CONFIG.enableAnalytics && window.gtag) {
                window.gtag('event', 'click', {
                    'event_category': 'outbound',
                    'event_label': link.href
                });
            }
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboardShortcuts(e) {
        // Skip if typing in input
        if (e.target.matches('input, textarea')) return;
        
        // Keyboard shortcuts
        const shortcuts = {
            'g h': () => navigateToSection('home'),
            'g a': () => navigateToSection('about'),
            'g s': () => navigateToSection('skills'),
            'g p': () => navigateToSection('projects'),
            'g c': () => navigateToSection('contact'),
            '?': () => showKeyboardShortcuts(),
            '/': () => focusSearch(),
            'Escape': () => closeModals()
        };
        
        // Build key combination
        const key = `${e.ctrlKey ? 'ctrl+' : ''}${e.shiftKey ? 'shift+' : ''}${e.key}`;
        
        if (shortcuts[key]) {
            e.preventDefault();
            shortcuts[key]();
        }
    }

    /**
     * Navigate to section
     */
    function navigateToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Show keyboard shortcuts help
     */
    function showKeyboardShortcuts() {
        alert(`
Keyboard Shortcuts:
- g h: Go to Home
- g a: Go to About
- g s: Go to Skills
- g p: Go to Projects
- g c: Go to Contact
- ?: Show this help
- /: Focus search
- Esc: Close modals
        `);
    }

    /**
     * Focus search input
     */
    function focusSearch() {
        const search = document.querySelector('.project-search, .skill-search');
        if (search) {
            search.focus();
        }
    }

    /**
     * Close all modals
     */
    function closeModals() {
        // Close project modal
        const modal = document.querySelector('.project-modal.active');
        if (modal) {
            modal.classList.remove('active');
        }
        
        // Close mobile menu
        if (state.modules.NavigationManager && state.modules.NavigationManager.isMenuOpen()) {
            state.modules.NavigationManager.closeMenu();
        }
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        // Update CSS custom property for viewport height (mobile fix)
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Dispatch custom resize event
        window.dispatchEvent(new CustomEvent('optimizedResize'));
    }

    /**
     * Handle visibility change
     */
    function handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - pause animations
            if (state.modules.AnimationController) {
                state.modules.AnimationController.pauseTyping();
            }
        } else {
            // Page is visible - resume animations
            if (state.modules.AnimationController) {
                state.modules.AnimationController.resumeTyping();
            }
        }
    }

    /**
     * Handle global errors
     */
    function handleGlobalError(event) {
        console.error('Global error:', event.error);
        
        // Log to analytics if enabled
        if (APP_CONFIG.enableAnalytics && window.gtag) {
            window.gtag('event', 'exception', {
                'description': event.error?.message || 'Unknown error',
                'fatal': false
            });
        }
    }

    /**
     * Handle unhandled promise rejections
     */
    function handleUnhandledRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);
        
        // Log to analytics if enabled
        if (APP_CONFIG.enableAnalytics && window.gtag) {
            window.gtag('event', 'exception', {
                'description': event.reason?.message || 'Unhandled promise rejection',
                'fatal': false
            });
        }
    }

    /**
     * Set up back to top button
     */
    function setupBackToTop() {
        const button = document.getElementById('backToTop');
        if (!button) return;
        
        // Show/hide based on scroll
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                if (window.pageYOffset > 300) {
                    button.classList.add('visible');
                } else {
                    button.classList.remove('visible');
                }
            }, 100);
        });
        
        // Scroll to top on click
        button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /**
     * Set up contact copy functionality
     */
    function setupContactCopy() {
        // Copy email on click
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const email = link.href.replace('mailto:', '');
                copyToClipboard(email);
                showToast('Email copied to clipboard!');
            });
        });
        
        // Copy phone on click
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const phone = link.href.replace('tel:', '');
                copyToClipboard(phone);
                showToast('Phone number copied to clipboard!');
            });
        });
    }

    /**
     * Copy text to clipboard
     */
    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    }

    /**
     * Show toast notification
     */
    function showToast(message, duration = 3000) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('visible'), 100);
        
        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Update footer year
     */
    function updateFooterYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    /**
     * Initialize third-party integrations
     */
    function initializeIntegrations() {
        // Initialize AOS (Animate On Scroll) if available
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                offset: 100
            });
        }
        
        // Initialize Google Analytics if configured
        if (APP_CONFIG.enableAnalytics && window.gtag) {
            window.gtag('config', 'GA_MEASUREMENT_ID', {
                'page_title': 'Portfolio',
                'page_path': '/'
            });
        }
        
        // Initialize reCAPTCHA if needed
        if (window.grecaptcha) {
            // reCAPTCHA will be initialized by contact form
        }
    }

    /**
     * Set up performance monitoring
     */
    function setupPerformanceMonitoring() {
        // Log performance metrics
        if (window.performance && window.performance.getEntriesByType) {
            const perfData = window.performance.getEntriesByType('navigation')[0];
            
            if (perfData) {
                const metrics = {
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                    domInteractive: perfData.domInteractive,
                    pageLoadTime: perfData.loadEventEnd - perfData.fetchStart
                };
                
                state.performance.metrics = metrics;
                
                if (APP_CONFIG.debug) {
                    console.log('Performance Metrics:', metrics);
                }
                
                // Send to analytics
                if (APP_CONFIG.enableAnalytics && window.gtag) {
                    window.gtag('event', 'timing_complete', {
                        'name': 'load',
                        'value': Math.round(metrics.pageLoadTime)
                    });
                }
            }
        }
        
        // Monitor Core Web Vitals
        if ('PerformanceObserver' in window) {
            try {
                // Largest Contentful Paint
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                
                // First Input Delay
                const fidObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
                
                // Cumulative Layout Shift
                const clsObserver = new PerformanceObserver((entryList) => {
                    let cls = 0;
                    entryList.getEntries().forEach(entry => {
                        if (!entry.hadRecentInput) {
                            cls += entry.value;
                        }
                    });
                    console.log('CLS:', cls);
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (error) {
                console.warn('Performance Observer not supported:', error);
            }
        }
    }

    /**
     * Register service worker
     */
    async function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showToast('New version available! Refresh to update.');
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Handle initialization error
     */
    function handleInitError(error) {
        console.error('Initialization error:', error);
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'init-error';
        errorDiv.innerHTML = `
            <h2>Oops! Something went wrong</h2>
            <p>Please refresh the page or try again later.</p>
            <button onclick="location.reload()">Refresh Page</button>
        `;
        document.body.appendChild(errorDiv);
    }

    /**
     * Mark performance timing
     */
    function markPerformance(name) {
        if (window.performance && window.performance.mark) {
            window.performance.mark(name);
        }
    }

    /**
     * Sleep utility
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Public API
     */
    window.PortfolioApp = {
        version: APP_CONFIG.version,
        init: init,
        getState: () => state,
        getModules: () => state.modules,
        getPerformance: () => state.performance,
        showToast: showToast,
        copyToClipboard: copyToClipboard,
        navigateToSection: navigateToSection,
        isInitialized: () => state.initialized
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also ensure initialization on window load
    window.addEventListener('load', () => {
        if (!state.initialized) {
            init();
        }
    });

})();
/**
 * SCROLL INDICATOR ENHANCEMENT
 * Add this to your main.js or create a new file
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        
        // Get scroll indicator element
        const scrollIndicator = document.querySelector('.hero-scroll-indicator');
        const scrollLink = document.querySelector('.scroll-down');
        
        if (!scrollIndicator || !scrollLink) {
            console.warn('Scroll indicator elements not found');
            return;
        }

        // Smooth scroll on click
        scrollLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Calculate offset for fixed navbar
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = targetSection.offsetTop - navbarHeight;
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Optional: Add a subtle animation to the indicator
                scrollIndicator.style.transform = 'translateX(-50%) scale(0.9)';
                setTimeout(() => {
                    scrollIndicator.style.transform = 'translateX(-50%) scale(1)';
                }, 200);
            }
        });

        // Hide scroll indicator when scrolling down
        let lastScrollTop = 0;
        let isIndicatorVisible = true;

        function handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Hide indicator after scrolling 100px
            if (scrollTop > 100 && isIndicatorVisible) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
                isIndicatorVisible = false;
            } 
            // Show indicator when back at top
            else if (scrollTop <= 100 && !isIndicatorVisible) {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.pointerEvents = 'auto';
                isIndicatorVisible = true;
            }

            lastScrollTop = scrollTop;
        }

        // Throttle scroll event for performance
        let scrollTimer;
        window.addEventListener('scroll', function() {
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
            scrollTimer = setTimeout(handleScroll, 50);
        });

        // Initial check
        handleScroll();

        // Add hover effect enhancement
        scrollLink.addEventListener('mouseenter', function() {
            const wheel = this.querySelector('.wheel');
            if (wheel) {
                wheel.style.animationDuration = '1s';
            }
        });

        scrollLink.addEventListener('mouseleave', function() {
            const wheel = this.querySelector('.wheel');
            if (wheel) {
                wheel.style.animationDuration = '2s';
            }
        });

        // Optional: Add keyboard support
        document.addEventListener('keydown', function(e) {
            // Press 'S' to scroll down from hero
            if (e.key === 's' || e.key === 'S') {
                const heroSection = document.querySelector('.hero');
                if (heroSection && window.pageYOffset < heroSection.offsetHeight) {
                    scrollLink.click();
                }
            }
        });

        // Test if animation is working
        console.log('Scroll indicator initialized successfully');
        
        // Debug: Check if CSS is applied correctly
        const mouseElement = document.querySelector('.mouse');
        const wheelElement = document.querySelector('.wheel');
        
        if (mouseElement && wheelElement) {
            const mouseStyles = window.getComputedStyle(mouseElement);
            const wheelStyles = window.getComputedStyle(wheelElement);
            
            console.log('Mouse element styles:', {
                width: mouseStyles.width,
                height: mouseStyles.height,
                border: mouseStyles.border,
                position: mouseStyles.position
            });
            
            console.log('Wheel element styles:', {
                animation: wheelStyles.animation,
                position: wheelStyles.position,
                background: wheelStyles.background
            });
        }
    });

    // Alternative: Simpler version without dependencies
    function initScrollIndicator() {
        const scrollDown = document.querySelector('.scroll-down');
        
        if (scrollDown) {
            scrollDown.onclick = function(e) {
                e.preventDefault();
                const about = document.getElementById('about');
                if (about) {
                    about.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                return false;
            };
        }
    }

    // Call simple version as backup
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollIndicator);
    } else {
        initScrollIndicator();
    }

})();