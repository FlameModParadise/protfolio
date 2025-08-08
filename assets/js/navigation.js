/**
 * NAVIGATION MANAGEMENT
 * File: /htdocs/assets/js/navigation.js
 * Handles navbar scroll effects, mobile menu, and smooth scrolling
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        scrollThreshold: 50,           // Pixels before navbar changes
        smoothScrollDuration: 800,     // Smooth scroll animation duration
        mobileBreakpoint: 768,         // Mobile menu breakpoint
        navbarHeight: 64,              // Fixed navbar height
        scrollOffset: 80,              // Offset for scroll positioning
        throttleDelay: 100,            // Throttle scroll events
        activeClass: 'active',         // Active nav item class
        scrolledClass: 'scrolled'      // Navbar scrolled class
    };

    // Cache DOM elements
    const elements = {
        navbar: null,
        navMenu: null,
        hamburger: null,
        navLinks: [],
        sections: [],
        body: document.body
    };

    // State management
    let isMenuOpen = false;
    let currentSection = null;
    let scrollTimer = null;
    let lastScrollTop = 0;

    /**
     * Initialize navigation
     */
    function init() {
        // Cache elements
        cacheElements();
        
        if (!elements.navbar) {
            console.warn('Navigation elements not found');
            return;
        }

        // Set up event listeners
        setupEventListeners();
        
        // Set initial state
        handleScroll();
        updateActiveSection();
        
        console.log('Navigation initialized');
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.navbar = document.getElementById('navbar');
        elements.navMenu = document.getElementById('navMenu');
        elements.hamburger = document.getElementById('hamburger');
        elements.navLinks = Array.from(document.querySelectorAll('.nav-link'));
        elements.sections = Array.from(document.querySelectorAll('section[id]'));
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Scroll events
        window.addEventListener('scroll', throttle(handleScroll, CONFIG.throttleDelay));
        
        // Hamburger menu
        if (elements.hamburger) {
            elements.hamburger.addEventListener('click', toggleMobileMenu);
        }
        
        // Nav links
        elements.navLinks.forEach(link => {
            link.addEventListener('click', handleNavClick);
        });
        
        // Close mobile menu on outside click
        document.addEventListener('click', handleOutsideClick);
        
        // Handle resize
        window.addEventListener('resize', debounce(handleResize, 250));
        
        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboard);
    }

    /**
     * Handle scroll events
     */
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class
        if (scrollTop > CONFIG.scrollThreshold) {
            elements.navbar.classList.add(CONFIG.scrolledClass);
        } else {
            elements.navbar.classList.remove(CONFIG.scrolledClass);
        }
        
        // Hide/show navbar on scroll (optional)
        if (CONFIG.hideOnScroll) {
            if (scrollTop > lastScrollTop && scrollTop > CONFIG.scrollThreshold * 2) {
                // Scrolling down
                elements.navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                elements.navbar.style.transform = 'translateY(0)';
            }
        }
        
        lastScrollTop = scrollTop;
        
        // Update active section
        updateActiveSection();
    }

    /**
     * Update active navigation item based on scroll position
     */
    function updateActiveSection() {
        const scrollPosition = window.scrollY + CONFIG.scrollOffset;
        
        // Find current section
        let current = null;
        
        elements.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        // Fallback to last section if at bottom
        if (!current && window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) {
            current = elements.sections[elements.sections.length - 1]?.getAttribute('id');
        }
        
        // Update active class
        if (current !== currentSection) {
            currentSection = current;
            
            elements.navLinks.forEach(link => {
                link.classList.remove(CONFIG.activeClass);
                
                if (link.getAttribute('href') === `#${current}` || 
                    link.dataset.section === current) {
                    link.classList.add(CONFIG.activeClass);
                }
            });
        }
    }

    /**
     * Handle navigation link click
     */
    function handleNavClick(e) {
        const link = e.currentTarget;
        const targetId = link.getAttribute('href');
        
        // Check if it's an anchor link
        if (targetId && targetId.startsWith('#')) {
            e.preventDefault();
            
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                smoothScrollTo(targetSection);
            }
            
            // Close mobile menu
            if (isMenuOpen) {
                toggleMobileMenu();
            }
            
            // Update active state immediately
            elements.navLinks.forEach(l => l.classList.remove(CONFIG.activeClass));
            link.classList.add(CONFIG.activeClass);
        }
    }

    /**
     * Smooth scroll to element
     */
    function smoothScrollTo(element) {
        const targetPosition = element.offsetTop - CONFIG.navbarHeight;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = CONFIG.smoothScrollDuration;
        let start = null;
        
        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function
            const ease = easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition + distance * ease);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    }

    /**
     * Easing function for smooth scroll
     */
    function easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Toggle mobile menu
     */
    function toggleMobileMenu() {
        isMenuOpen = !isMenuOpen;
        
        if (elements.navMenu) {
            elements.navMenu.classList.toggle('active');
        }
        
        if (elements.hamburger) {
            elements.hamburger.classList.toggle('active');
        }
        
        // Prevent body scroll when menu is open
        elements.body.style.overflow = isMenuOpen ? 'hidden' : '';
        
        // Accessibility
        elements.hamburger?.setAttribute('aria-expanded', isMenuOpen);
        elements.navMenu?.setAttribute('aria-hidden', !isMenuOpen);
    }

    /**
     * Handle clicks outside mobile menu
     */
    function handleOutsideClick(e) {
        if (!isMenuOpen) return;
        
        const isClickInsideMenu = elements.navMenu?.contains(e.target);
        const isClickOnHamburger = elements.hamburger?.contains(e.target);
        
        if (!isClickInsideMenu && !isClickOnHamburger) {
            toggleMobileMenu();
        }
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        // Close mobile menu on desktop
        if (window.innerWidth > CONFIG.mobileBreakpoint && isMenuOpen) {
            toggleMobileMenu();
        }
        
        // Recalculate section positions
        updateActiveSection();
    }

    /**
     * Handle keyboard navigation
     */
    function handleKeyboard(e) {
        // Escape key closes mobile menu
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMobileMenu();
        }
        
        // Tab navigation for accessibility
        if (e.key === 'Tab' && isMenuOpen) {
            // Trap focus within mobile menu
            const focusableElements = elements.navMenu.querySelectorAll(
                'a, button, [tabindex]:not([tabindex="-1"])'
            );
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Throttle function for performance
     */
    function throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        
        return function(...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    /**
     * Debounce function for performance
     */
    function debounce(func, delay) {
        let timeoutId;
        
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Public API
     */
    window.NavigationManager = {
        init: init,
        scrollTo: smoothScrollTo,
        toggleMenu: toggleMobileMenu,
        closeMenu: () => isMenuOpen && toggleMobileMenu(),
        getCurrentSection: () => currentSection,
        isMenuOpen: () => isMenuOpen
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();