/**
 * MAIN APPLICATION CONTROLLER - FIXED VERSION
 * File: /htdocs/assets/js/main.js
 * Initializes all modules and manages global functionality
 * INCLUDES: Scroll to top fix, scroll indicator fix, size adjustments
 */

(function() {
    'use strict';

    // ============================
    // CRITICAL FIX #1: FORCE PAGE TO START AT TOP
    // ============================
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Prevent browser from auto-scrolling to hash
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    
    // Remove hash from URL without scrolling
    if (window.location.hash) {
        history.replaceState(null, null, ' ');
    }

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
            // ============================
            // FIX #2: FORCE SCROLL TO TOP BEFORE INIT
            // ============================
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            
            // Mark start time
            markPerformance('appStart');
            
            // Check browser compatibility
            if (!checkBrowserCompatibility()) {
                showBrowserWarning();
                return;
            }
            
            // ============================
            // FIX #3: APPLY SIZE REDUCTIONS
            // ============================
            applySizeReductions();
            
            // Initialize modules
            await initializeModules();
            
            // Set up global event handlers
            setupGlobalHandlers();
            
            // ============================
            // FIX #4: INITIALIZE SCROLL INDICATOR
            // ============================
            initializeScrollIndicator();
            
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
            
            // ============================
            // FIX #5: FINAL SCROLL TO TOP AFTER INIT
            // ============================
            setTimeout(() => {
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            }, 100);
            
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
     * FIX: Apply size reductions to make everything smaller
     */
    function applySizeReductions() {
        const root = document.documentElement;
        
        // Reduce all spacing by 25%
        root.style.setProperty('--space-1', '0.2rem');
        root.style.setProperty('--space-2', '0.4rem');
        root.style.setProperty('--space-3', '0.6rem');
        root.style.setProperty('--space-4', '0.8rem');
        root.style.setProperty('--space-5', '1rem');
        root.style.setProperty('--space-6', '1.2rem');
        root.style.setProperty('--space-8', '1.6rem');
        root.style.setProperty('--space-10', '2rem');
        root.style.setProperty('--space-12', '2.4rem');
        root.style.setProperty('--space-16', '3.2rem');
        root.style.setProperty('--space-20', '4rem');
        
        // Reduce font sizes
        root.style.setProperty('--text-xs', '0.7rem');
        root.style.setProperty('--text-sm', '0.8rem');
        root.style.setProperty('--text-base', '0.9rem');
        root.style.setProperty('--text-lg', '1rem');
        root.style.setProperty('--text-xl', '1.1rem');
        root.style.setProperty('--text-2xl', '1.3rem');
        root.style.setProperty('--text-3xl', '1.6rem');
        root.style.setProperty('--text-4xl', '2rem');
        root.style.setProperty('--text-5xl', '2.5rem');
        root.style.setProperty('--text-6xl', '3rem');
        
        // Reduce section padding
        root.style.setProperty('--section-padding', '3rem 0');
        
        // Reduce navbar height
        root.style.setProperty('--navbar-height', '3.5rem');
        
        // Apply to sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.paddingTop = '3rem';
            section.style.paddingBottom = '3rem';
        });
        
        // Make hero smaller
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.minHeight = '90vh';
            hero.style.paddingBottom = '60px';
        }
        
        // Make containers more compact
        const containers = document.querySelectorAll('.container');
        containers.forEach(container => {
            container.style.maxWidth = '1200px';
            container.style.padding = '0 1rem';
        });
    }

    /**
     * FIX: Initialize scroll indicator properly
     */
    function initializeScrollIndicator() {
        const scrollIndicator = document.querySelector('.hero-scroll-indicator');
        const scrollLink = document.querySelector('.scroll-down');
        
        if (!scrollIndicator || !scrollLink) {
            console.warn('Scroll indicator not found, creating it...');
            createScrollIndicator();
            return;
        }
        
        // Make sure it's visible and clickable
        scrollIndicator.style.position = 'absolute';
        scrollIndicator.style.bottom = '2rem';
        scrollIndicator.style.left = '50%';
        scrollIndicator.style.transform = 'translateX(-50%)';
        scrollIndicator.style.zIndex = '10';
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.pointerEvents = 'auto';
        
        // Add click functionality
        scrollLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                const navbarHeight = 60;
                const targetPosition = aboutSection.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
        
        // Show/hide based on scroll
        let isVisible = true;
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100 && isVisible) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
                isVisible = false;
            } else if (scrollTop <= 100 && !isVisible) {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.pointerEvents = 'auto';
                isVisible = true;
            }
        });
    }

    /**
     * Create scroll indicator if missing
     */
    function createScrollIndicator() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        const indicatorHTML = `
            <div class="hero-scroll-indicator" style="position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 10;">
                <a href="#about" class="scroll-down" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: rgba(255,255,255,0.6); text-decoration: none; cursor: pointer;">
                    <div class="mouse" style="width: 26px; height: 42px; border: 2px solid rgba(255,255,255,0.6); border-radius: 15px; position: relative;">
                        <div class="wheel" style="width: 4px; height: 10px; background: rgba(255,255,255,0.6); border-radius: 2px; position: absolute; top: 8px; left: 50%; transform: translateX(-50%); animation: scroll-wheel 2s infinite;"></div>
                    </div>
                    <span class="scroll-text" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500;">Scroll Down</span>
                </a>
            </div>
        `;
        
        hero.insertAdjacentHTML('beforeend', indicatorHTML);
        
        // Add animation CSS if not exists
        if (!document.querySelector('#scroll-indicator-styles')) {
            const style = document.createElement('style');
            style.id = 'scroll-indicator-styles';
            style.textContent = `
                @keyframes scroll-wheel {
                    0% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
                }
                .hero-scroll-indicator { animation: bounce 2s infinite; }
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
                    40% { transform: translateX(-50%) translateY(-10px); }
                    60% { transform: translateX(-50%) translateY(-5px); }
                }
                .scroll-down:hover { transform: translateY(3px); }
                .scroll-down:hover .mouse { border-color: var(--primary) !important; }
                .scroll-down:hover .wheel { background: var(--primary) !important; }
            `;
            document.head.appendChild(style);
        }
        
        // Reinitialize
        setTimeout(initializeScrollIndicator, 100);
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
        
        const navbarHeight = 60;
        const targetPosition = target.offsetTop - navbarHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
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
            const navbarHeight = 60;
            const targetPosition = section.offsetTop - navbarHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
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
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 100);
        
        // Remove after duration
        setTimeout(() => {
            toast.style.opacity = '0';
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
        isInitialized: () => state.initialized,
        scrollToTop: () => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }
    };

    // ============================
    // CRITICAL: FORCE SCROLL TO TOP BEFORE DOM READY
    // ============================
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Force scroll to top again
            window.scrollTo(0, 0);
            init();
        });
    } else {
        // Force scroll to top again
        window.scrollTo(0, 0);
        init();
    }

    // Also ensure initialization on window load
    window.addEventListener('load', () => {
        // Force scroll to top on load
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        if (!state.initialized) {
            init();
        }
    });

})();