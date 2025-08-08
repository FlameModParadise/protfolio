/**
 * ANIMATION CONTROLLER
 * File: /htdocs/assets/js/animations.js
 * Handles all animations, scroll effects, and dynamic text
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        observerThreshold: 0.1,
        observerRootMargin: '0px 0px -100px 0px',
        typingSpeed: 100,
        typingDelay: 2000,
        countUpDuration: 2000,
        parallaxSpeed: 0.5,
        enableParallax: true,
        enableScrollAnimations: true,
        enableTypingEffect: true,
        enableCounters: true
    };

    // Typing animation text
    const TYPING_STRINGS = [
        'Python Developer',
        'Automation Expert',
        'Web Scraper',
        'Bot Developer',
        'Data Analyst',
        'Problem Solver'
    ];

    // Cache DOM elements
    const elements = {
        animatedElements: [],
        typingElement: null,
        counters: [],
        parallaxElements: [],
        progressBars: []
    };

    // State management
    let typingIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let observer = null;

    /**
     * Initialize animations
     */
    function init() {
        // Cache elements
        cacheElements();
        
        // Set up animations
        if (CONFIG.enableScrollAnimations) {
            setupScrollAnimations();
        }
        
        if (CONFIG.enableTypingEffect) {
            setupTypingEffect();
        }
        
        if (CONFIG.enableCounters) {
            setupCounters();
        }
        
        if (CONFIG.enableParallax) {
            setupParallax();
        }
        
        // Set up additional effects
        setupProgressBars();
        setupHoverEffects();
        setupMouseEffects();
        
        console.log('Animations initialized');
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.animatedElements = document.querySelectorAll('[data-aos], .animate-on-scroll');
        elements.typingElement = document.getElementById('titleText');
        elements.counters = document.querySelectorAll('[data-count]');
        elements.parallaxElements = document.querySelectorAll('.parallax');
        elements.progressBars = document.querySelectorAll('.skill-progress');
    }

    /**
     * Set up scroll-triggered animations
     */
    function setupScrollAnimations() {
        // Create intersection observer
        const observerOptions = {
            threshold: CONFIG.observerThreshold,
            rootMargin: CONFIG.observerRootMargin
        };
        
        observer = new IntersectionObserver(handleIntersection, observerOptions);
        
        // Observe all animated elements
        elements.animatedElements.forEach(element => {
            observer.observe(element);
            
            // Add initial state
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
        });
    }

    /**
     * Handle intersection observer callback
     */
    function handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.dataset.aosDelay || 0;
                
                setTimeout(() => {
                    element.classList.add('aos-animate');
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                    
                    // Trigger specific animations
                    if (element.classList.contains('skill-item')) {
                        animateSkillBar(element);
                    }
                    
                    if (element.hasAttribute('data-count')) {
                        animateCounter(element);
                    }
                }, delay);
                
                // Stop observing after animation
                observer.unobserve(element);
            }
        });
    }

    /**
     * Set up typing effect for hero title
     */
    function setupTypingEffect() {
        if (!elements.typingElement) return;
        
        // Start typing animation
        typeText();
    }

    /**
     * Typing animation function
     */
    function typeText() {
        if (!elements.typingElement) return;
        
        const currentString = TYPING_STRINGS[typingIndex];
        
        if (isDeleting) {
            // Delete character
            elements.typingElement.textContent = currentString.substring(0, charIndex - 1);
            charIndex--;
            
            if (charIndex === 0) {
                isDeleting = false;
                typingIndex = (typingIndex + 1) % TYPING_STRINGS.length;
                setTimeout(typeText, 500);
                return;
            }
        } else {
            // Add character
            elements.typingElement.textContent = currentString.substring(0, charIndex + 1);
            charIndex++;
            
            if (charIndex === currentString.length) {
                isDeleting = true;
                setTimeout(typeText, CONFIG.typingDelay);
                return;
            }
        }
        
        const speed = isDeleting ? CONFIG.typingSpeed / 2 : CONFIG.typingSpeed;
        setTimeout(typeText, speed);
    }

    /**
     * Set up counter animations
     */
    function setupCounters() {
        elements.counters.forEach(counter => {
            counter.dataset.originalText = counter.textContent;
            counter.textContent = '0';
        });
    }

    /**
     * Animate counter
     */
    function animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = CONFIG.countUpDuration;
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
                
                // Add suffix if exists
                const suffix = element.dataset.suffix || '';
                element.textContent += suffix;
            }
        };
        
        updateCounter();
    }

    /**
     * Animate skill progress bar
     */
    function animateSkillBar(skillItem) {
        const progressBar = skillItem.querySelector('.skill-progress');
        if (!progressBar) return;
        
        const level = skillItem.dataset.level || 0;
        
        setTimeout(() => {
            progressBar.style.width = `${level}%`;
        }, 200);
    }

    /**
     * Set up parallax scrolling
     */
    function setupParallax() {
        if (!elements.parallaxElements.length) return;
        
        window.addEventListener('scroll', throttle(handleParallax, 16));
        
        // Initial position
        handleParallax();
    }

    /**
     * Handle parallax effect
     */
    function handleParallax() {
        const scrolled = window.pageYOffset;
        
        elements.parallaxElements.forEach(element => {
            const speed = element.dataset.parallaxSpeed || CONFIG.parallaxSpeed;
            const yPos = -(scrolled * speed);
            
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    /**
     * Set up progress bars
     */
    function setupProgressBars() {
        elements.progressBars.forEach(bar => {
            // Set initial width to 0
            bar.style.width = '0%';
            bar.style.transition = 'width 1.5s ease';
        });
    }

    /**
     * Set up hover effects
     */
    function setupHoverEffects() {
        // Project cards
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
        
        // Social links
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.animation = 'pulse 0.5s';
            });
            
            link.addEventListener('animationend', function() {
                this.style.animation = '';
            });
        });
    }

    /**
     * Set up mouse movement effects
     */
    function setupMouseEffects() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width;
            mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height;
        });
        
        // Smooth animation loop
        function animate() {
            currentX += (mouseX - currentX) * 0.1;
            currentY += (mouseY - currentY) * 0.1;
            
            const parallaxElements = hero.querySelectorAll('.hero-gradient, .hero-particles');
            parallaxElements.forEach((element, index) => {
                const speed = (index + 1) * 10;
                element.style.transform = `translate(${currentX * speed}px, ${currentY * speed}px)`;
            });
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }

    /**
     * Reveal animation for elements
     */
    function reveal(element, delay = 0) {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.classList.add('revealed');
        }, delay);
    }

    /**
     * Stagger animation for multiple elements
     */
    function staggerReveal(elements, baseDelay = 0, staggerDelay = 100) {
        elements.forEach((element, index) => {
            reveal(element, baseDelay + (index * staggerDelay));
        });
    }

    /**
     * Throttle function for performance
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Public API
     */
    window.AnimationController = {
        init: init,
        reveal: reveal,
        staggerReveal: staggerReveal,
        animateCounter: animateCounter,
        animateSkillBar: animateSkillBar,
        pauseTyping: () => { CONFIG.enableTypingEffect = false; },
        resumeTyping: () => { CONFIG.enableTypingEffect = true; typeText(); },
        disableParallax: () => { CONFIG.enableParallax = false; },
        enableParallax: () => { CONFIG.enableParallax = true; }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();