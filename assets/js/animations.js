/**
 * ANIMATION CONTROLLER
 * File: /htdocs/assets/js/animations.js
 * Handles all animations, scroll effects, and dynamic text
 * Version: 3.1
 */
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        observerThreshold: 0.1,
        observerRootMargin: '0px 0px -50px 0px',
        typingSpeed: 400,
        typingDeleteSpeed: 200,
        typingDelay: 7000,
        typingStartDelay: 1500,
        typingPauseBetweenWords: 2500,
        countUpDuration: 2500,
        parallaxSpeed: 0.3,
        parallaxSmoothness: 0.08,
        mouseEffectSmoothness: 0.05,
        enableParallax: true,
        enableScrollAnimations: true,
        enableTypingEffect: true,
        enableCounters: true,
        enableSmoothScroll: true
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
        typingCursor: null,
        counters: [],
        parallaxElements: [],
        progressBars: [],
        skillItems: []
    };
    
    // State management
    let typingIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isTyping = false;
    let typingTimeout = null;
    let observer = null;
    let scrollY = 0;
    let targetScrollY = 0;
    let rafId = null;
    
    /**
     * Initialize animations
     */
    function init() {
        // Cache elements
        cacheElements();
        
        // Set up smooth scroll
        if (CONFIG.enableSmoothScroll) {
            setupSmoothScroll();
        }
        
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
        setupScrollProgress();
        
        // Add fade-in animation to body
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 1s ease';
            document.body.style.opacity = '1';
        }, 100);
    }
    
    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.animatedElements = document.querySelectorAll('[data-aos], .animate-on-scroll');
        elements.typingElement = document.getElementById('titleText');
        elements.typingCursor = document.querySelector('.typing-cursor');
        elements.counters = document.querySelectorAll('[data-count]');
        elements.parallaxElements = document.querySelectorAll('.parallax');
        elements.progressBars = document.querySelectorAll('.skill-progress');
        elements.skillItems = document.querySelectorAll('.skill-item');
    }
    
    /**
     * Set up smooth scroll for anchor links
     */
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    smoothScrollTo(target.offsetTop - 80, 1000);
                }
            });
        });
    }
    
    /**
     * Smooth scroll to position with easing
     */
    function smoothScrollTo(targetPosition, duration) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeInOutCubic = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            window.scrollTo(0, startPosition + distance * easeInOutCubic);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    }
    
    /**
     * Set up scroll-triggered animations with smoother transitions
     */
    function setupScrollAnimations() {
        // Create intersection observer with multiple thresholds for smoother animations
        const observerOptions = {
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
            rootMargin: CONFIG.observerRootMargin
        };
        
        observer = new IntersectionObserver(handleIntersection, observerOptions);
        
        // Observe all animated elements
        elements.animatedElements.forEach(element => {
            observer.observe(element);
            
            // Add initial state with smoother transition
            element.style.opacity = '0';
            element.style.transform = 'translateY(40px)';
            element.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    }
    
    /**
     * Handle intersection observer callback with smoother animations
     */
    function handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
                const element = entry.target;
                const delay = parseInt(element.dataset.aosDelay) || 0;
                
                setTimeout(() => {
                    element.classList.add('aos-animate');
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0) scale(1)';
                    
                    // Add subtle scale animation for certain elements
                    if (element.classList.contains('card') || element.classList.contains('stat-card')) {
                        element.style.transform = 'translateY(0) scale(1)';
                        element.style.opacity = '1';
                    }
                    
                    // Trigger specific animations
                    if (element.classList.contains('skill-item')) {
                        animateSkillBar(element);
                    }
                    
                    if (element.hasAttribute('data-count')) {
                        animateCounter(element);
                    }
                    
                    // Add entrance animation class
                    element.classList.add('entrance-animation');
                }, delay);
                
                // Stop observing after animation
                observer.unobserve(element);
            }
        });
    }
    
    /**
     * Set up typing effect with cursor for hero title
     */
    function setupTypingEffect() {
        if (!elements.typingElement) return;
        
        // Add smooth transition to typing element
        elements.typingElement.style.transition = 'opacity 0.2s ease';
        
        // Create cursor if it doesn't exist
        if (!elements.typingCursor) {
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            cursor.textContent = '|';
            cursor.style.cssText = `
                display: inline-block;
                animation: blink 1s infinite;
                color: var(--primary);
                font-weight: 300;
                margin-left: 2px;
            `;
            elements.typingElement.parentNode.insertBefore(cursor, elements.typingElement.nextSibling);
            elements.typingCursor = cursor;
        }
        
        // Add CSS for cursor blink animation
        if (!document.querySelector('#cursor-animation')) {
            const style = document.createElement('style');
            style.id = 'cursor-animation';
            style.textContent = `
                @keyframes blink {
                    0%, 49% { opacity: 1; }
                    50%, 100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Start typing animation with initial delay
        setTimeout(() => {
            typeText();
        }, CONFIG.typingStartDelay);
    }
    
    /**
     * Enhanced typing animation with smoother effect
     */
    function typeText() {
        if (!elements.typingElement || !CONFIG.enableTypingEffect) {
            return;
        }
        
        const currentString = TYPING_STRINGS[typingIndex];
        const displayText = currentString.substring(0, charIndex);
        
        // Update text
        elements.typingElement.textContent = displayText;
        
        if (isDeleting) {
            // Deletion
            charIndex--;
            
            if (charIndex === 0) {
                isDeleting = false;
                typingIndex = (typingIndex + 1) % TYPING_STRINGS.length;
                // Pause before typing next string
                typingTimeout = setTimeout(typeText, CONFIG.typingPauseBetweenWords);
                return;
            }
            
            // Delete speed
            typingTimeout = setTimeout(typeText, CONFIG.typingDeleteSpeed);
        } else {
            // Add character
            charIndex++;
            
            if (charIndex === currentString.length) {
                // Text complete - pause cursor blinking to show completion
                if (elements.typingCursor) {
                    elements.typingCursor.style.animation = 'none';
                    elements.typingCursor.style.opacity = '1';
                }
                
                // Set flag to start deleting after delay
                isDeleting = true;
                
                // Pause at the end
                typingTimeout = setTimeout(() => {
                    // Resume cursor blinking before deletion
                    if (elements.typingCursor) {
                        elements.typingCursor.style.animation = 'blink 1s infinite';
                    }
                    typeText();
                }, CONFIG.typingDelay);
                return;
            }
            
            // Typing speed
            typingTimeout = setTimeout(typeText, CONFIG.typingSpeed);
        }
    }
    
    /**
     * Set up counter animations
     */
    function setupCounters() {
        elements.counters.forEach(counter => {
            counter.dataset.originalText = counter.textContent;
            counter.textContent = '0';
            counter.style.transition = 'transform 0.3s ease';
        });
    }
    
    /**
     * Enhanced counter animation with easing
     */
    function animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = CONFIG.countUpDuration;
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth acceleration/deceleration
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            
            const current = Math.floor(target * easeOutQuart);
            element.textContent = current.toLocaleString();
            
            // Add scale effect during counting
            const scale = 1 + (Math.sin(progress * Math.PI) * 0.05);
            element.style.transform = `scale(${scale})`;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
                element.style.transform = 'scale(1)';
                
                // Add suffix if exists
                const suffix = element.dataset.suffix || '';
                element.textContent += suffix;
                
                // Add completion animation
                element.classList.add('counter-complete');
            }
        }
        
        requestAnimationFrame(updateCounter);
    }
    
    /**
     * Enhanced skill progress bar animation
     */
    function animateSkillBar(skillItem) {
        const progressBar = skillItem.querySelector('.skill-progress');
        const percentLabel = skillItem.querySelector('.skill-percent');
        if (!progressBar) return;
        
        const level = parseInt(skillItem.dataset.level) || 0;
        
        // Smooth width animation
        setTimeout(() => {
            progressBar.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            progressBar.style.width = `${level}%`;
            
            // Animate percentage number if exists
            if (percentLabel) {
                let currentPercent = 0;
                const increment = level / 50;
                
                const updatePercent = () => {
                    currentPercent = Math.min(currentPercent + increment, level);
                    percentLabel.textContent = `${Math.floor(currentPercent)}%`;
                    
                    if (currentPercent < level) {
                        requestAnimationFrame(updatePercent);
                    } else {
                        percentLabel.textContent = `${level}%`;
                    }
                };
                
                updatePercent();
            }
        }, 300);
    }
    
    /**
     * Enhanced parallax scrolling with smoothing
     */
    function setupParallax() {
        if (!elements.parallaxElements.length) return;
        
        let ticking = false;
        
        function updateParallax() {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleSmoothParallax();
                    ticking = false;
                });
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', updateParallax, { passive: true });
        
        // Initial position
        handleSmoothParallax();
    }
    
    /**
     * Smooth parallax effect with lerping
     */
    function handleSmoothParallax() {
        targetScrollY = window.pageYOffset;
        
        // Smooth interpolation
        scrollY += (targetScrollY - scrollY) * CONFIG.parallaxSmoothness;
        
        elements.parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallaxSpeed) || CONFIG.parallaxSpeed;
            const offset = element.dataset.parallaxOffset || 0;
            const yPos = -(scrollY * speed) + parseFloat(offset);
            
            // Use transform3d for better performance
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
        
        // Continue animation if scrolling
        if (Math.abs(targetScrollY - scrollY) > 0.1) {
            rafId = requestAnimationFrame(handleSmoothParallax);
        }
    }
    
    /**
     * Set up progress bars with smooth animation
     */
    function setupProgressBars() {
        elements.progressBars.forEach(bar => {
            // Set initial width to 0
            bar.style.width = '0%';
            bar.style.transition = 'width 2s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Add gradient animation
            bar.style.background = 'linear-gradient(90deg, var(--primary), var(--primary-dark), var(--secondary))';
            bar.style.backgroundSize = '200% 100%';
            bar.style.animation = 'gradientShift 3s ease infinite';
        });
        
        // Add gradient animation CSS
        if (!document.querySelector('#gradient-animation')) {
            const style = document.createElement('style');
            style.id = 'gradient-animation';
            style.textContent = `
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Enhanced hover effects with spring animations
     */
    function setupHoverEffects() {
        // Project cards with spring effect
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            let isHovered = false;
            let animationFrame;
            let currentY = 0;
            let targetY = 0;
            let currentScale = 1;
            let targetScale = 1;
            
            card.addEventListener('mouseenter', function() {
                isHovered = true;
                targetY = -12;
                targetScale = 1.02;
                animateCard();
            });
            
            card.addEventListener('mouseleave', function() {
                isHovered = false;
                targetY = 0;
                targetScale = 1;
                animateCard();
            });
            
            function animateCard() {
                currentY += (targetY - currentY) * 0.1;
                currentScale += (targetScale - currentScale) * 0.1;
                
                card.style.transform = `translateY(${currentY}px) scale(${currentScale})`;
                
                if (Math.abs(targetY - currentY) > 0.1 || Math.abs(targetScale - currentScale) > 0.001) {
                    animationFrame = requestAnimationFrame(animateCard);
                }
            }
        });
        
        // Social links with rotation effect
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                this.style.transform = 'rotate(360deg) scale(1.2)';
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.transform = 'rotate(0) scale(1)';
            });
        });
        
        // Buttons with ripple effect
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    left: ${x}px;
                    top: ${y}px;
                    pointer-events: none;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
        
        // Add ripple animation CSS
        if (!document.querySelector('#ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Enhanced mouse movement effects with smoothing
     */
    function setupMouseEffects() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        let isAnimating = false;
        
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width;
            mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height;
            
            if (!isAnimating) {
                isAnimating = true;
                animateElements();
            }
        });
        
        hero.addEventListener('mouseleave', () => {
            mouseX = 0;
            mouseY = 0;
        });
        
        // Smooth animation loop with improved performance
        function animateElements() {
            currentX += (mouseX - currentX) * CONFIG.mouseEffectSmoothness;
            currentY += (mouseY - currentY) * CONFIG.mouseEffectSmoothness;
            
            const parallaxElements = hero.querySelectorAll('.hero-gradient, .hero-particles');
            parallaxElements.forEach((element, index) => {
                const speed = (index + 1) * 15;
                const rotateZ = (currentX * 5) + 'deg';
                element.style.transform = `translate3d(${currentX * speed}px, ${currentY * speed}px, 0) rotateZ(${rotateZ})`;
            });
            
            // Continue animation if mouse is moving
            if (Math.abs(mouseX - currentX) > 0.001 || Math.abs(mouseY - currentY) > 0.001) {
                requestAnimationFrame(animateElements);
            } else {
                isAnimating = false;
            }
        }
    }
    
    /**
     * Add scroll progress indicator
     */
    function setupScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
        
        function updateScrollProgress() {
            const winScroll = document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        }
        
        window.addEventListener('scroll', throttle(updateScrollProgress, 10), { passive: true });
    }
    
    /**
     * Reveal animation for elements
     */
    function reveal(element, delay = 0) {
        setTimeout(() => {
            element.style.transition = 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
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
     * Improved throttle function
     */
    function throttle(func, limit) {
        let inThrottle;
        let lastRun;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                lastRun = Date.now();
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                    if ((Date.now() - lastRun) >= limit) {
                        func.apply(context, args);
                    }
                }, limit);
            }
        };
    }
    
    /**
     * Cleanup function
     */
    function cleanup() {
        // Clear timeouts
        if (typingTimeout) clearTimeout(typingTimeout);
        
        // Cancel animation frames
        if (rafId) cancelAnimationFrame(rafId);
        
        // Disconnect observer
        if (observer) observer.disconnect();
        
        // Remove event listeners
        window.removeEventListener('scroll', updateParallax);
    }
    
    /**
     * Public API
     */
    window.AnimationController = {
        init: init,
        cleanup: cleanup,
        reveal: reveal,
        staggerReveal: staggerReveal,
        animateCounter: animateCounter,
        animateSkillBar: animateSkillBar,
        updateConfig: (newConfig) => {
            Object.assign(CONFIG, newConfig);
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
})();