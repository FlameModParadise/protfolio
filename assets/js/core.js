/* ===============================================
   CORE JAVASCRIPT - Essential functionality only
   File: core.js
   Location: /assets/js/core.js
   =============================================== */

(function() {
    'use strict';
    
    // ===============================================
    // DOM CACHE
    // ===============================================
    const DOM = {
        navbar: null,
        navMenu: null,
        hamburger: null,
        navLinks: null,
        themeToggle: null,
        backToTopBtn: null,
        preloader: null,
        contactForm: null,
        yearSpan: null
    };
    
    // ===============================================
    // INITIALIZE DOM ELEMENTS
    // ===============================================
    function initDOM() {
        DOM.navbar = document.getElementById('navbar');
        DOM.navMenu = document.getElementById('nav-menu');
        DOM.hamburger = document.getElementById('hamburger');
        DOM.navLinks = document.querySelectorAll('.nav-link');
        DOM.themeToggle = document.getElementById('theme-toggle');
        DOM.backToTopBtn = document.getElementById('back-to-top');
        DOM.preloader = document.getElementById('preloader');
        DOM.contactForm = document.getElementById('contact-form');
        DOM.yearSpan = document.getElementById('year');
    }
    
    // ===============================================
    // PRELOADER
    // ===============================================
    function handlePreloader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (DOM.preloader) {
                    DOM.preloader.classList.add('hide');
                    setTimeout(() => {
                        DOM.preloader.style.display = 'none';
                    }, 500);
                }
            }, 500);
        });
    }
    
    // ===============================================
    // THEME MANAGEMENT
    // ===============================================
    function initTheme() {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.body.classList.add(currentTheme);
            if (currentTheme === 'light-theme' && DOM.themeToggle) {
                DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        }
        
        if (DOM.themeToggle) {
            DOM.themeToggle.addEventListener('click', toggleTheme);
        }
    }
    
    function toggleTheme() {
        document.body.classList.toggle('light-theme');
        const icon = DOM.themeToggle.querySelector('i');
        
        if (document.body.classList.contains('light-theme')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('theme', 'light-theme');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.removeItem('theme');
        }
    }
    
    // ===============================================
    // NAVIGATION
    // ===============================================
    function initNavigation() {
        // Scroll effects
        let isScrolling = false;
        window.addEventListener('scroll', () => {
            if (!isScrolling) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    isScrolling = false;
                });
                isScrolling = true;
            }
        });
        
        // Mobile menu
        if (DOM.hamburger) {
            DOM.hamburger.addEventListener('click', toggleMobileMenu);
        }
        
        // Close mobile menu on link click
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        // Close mobile menu on outside click
        document.addEventListener('click', (e) => {
            if (DOM.navbar && !DOM.navbar.contains(e.target) && 
                DOM.navMenu && DOM.navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }
    
    function handleScroll() {
        // Navbar scroll effect
        if (window.scrollY > 50) {
            DOM.navbar?.classList.add('scrolled');
        } else {
            DOM.navbar?.classList.remove('scrolled');
        }
        
        // Update active nav link
        updateActiveNavLink();
        
        // Back to top button
        if (window.scrollY > 300) {
            DOM.backToTopBtn?.classList.add('show');
        } else {
            DOM.backToTopBtn?.classList.remove('show');
        }
    }
    
    function toggleMobileMenu() {
        DOM.hamburger?.classList.toggle('active');
        DOM.navMenu?.classList.toggle('active');
    }
    
    function closeMobileMenu() {
        DOM.hamburger?.classList.remove('active');
        DOM.navMenu?.classList.remove('active');
    }
    
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                DOM.navLinks.forEach(link => link.classList.remove('active'));
                navLink?.classList.add('active');
            }
        });
    }
    
    // ===============================================
    // SMOOTH SCROLLING
    // ===============================================
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    const offsetTop = target.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        if (DOM.backToTopBtn) {
            DOM.backToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }
    
    // ===============================================
    // CONTACT FORM
    // ===============================================
    function initContactForm() {
        if (DOM.contactForm) {
            DOM.contactForm.addEventListener('submit', handleFormSubmit);
        }
    }
    
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(DOM.contactForm);
        const formObject = Object.fromEntries(formData);
        
        if (!validateForm(formObject)) {
            return;
        }
        
        const submitBtn = DOM.contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            await simulateFormSubmission(formObject);
            showNotification('Message sent successfully!', 'success');
            DOM.contactForm.reset();
        } catch (error) {
            showNotification('Failed to send message. Please try again.', 'error');
            console.error('Form submission error:', error);
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    }
    
    function validateForm(data) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!data.name || data.name.length < 2) {
            showNotification('Please enter a valid name (at least 2 characters)', 'error');
            return false;
        }
        
        if (!emailRegex.test(data.email)) {
            showNotification('Please enter a valid email address', 'error');
            return false;
        }
        
        if (!data.subject || data.subject.length < 3) {
            showNotification('Please enter a subject (at least 3 characters)', 'error');
            return false;
        }
        
        if (!data.message || data.message.length < 10) {
            showNotification('Please enter a message (at least 10 characters)', 'error');
            return false;
        }
        
        return true;
    }
    
    function simulateFormSubmission(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form data submitted:', data);
                resolve();
            }, 2000);
        });
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
    
    // ===============================================
    // SKILL BARS ANIMATION
    // ===============================================
    function initSkillBars() {
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skillBars = entry.target.querySelectorAll('.skill-progress');
                    skillBars.forEach(bar => {
                        const width = bar.style.width;
                        bar.style.width = '0';
                        setTimeout(() => {
                            bar.style.width = width;
                            bar.style.transition = 'width 1.5s ease-out';
                        }, 100);
                    });
                    skillObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        const skillsSection = document.querySelector('.skills');
        if (skillsSection) {
            skillObserver.observe(skillsSection);
        }
    }
    
    // ===============================================
    // PROJECT CARDS HOVER
    // ===============================================
    function initProjectCards() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });
    }
    
    // ===============================================
    // LAZY LOADING
    // ===============================================
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }
    
    // ===============================================
    // UTILITIES
    // ===============================================
    function updateYear() {
        if (DOM.yearSpan) {
            DOM.yearSpan.textContent = new Date().getFullYear();
        }
    }
    
    // ===============================================
    // PERFORMANCE MONITORING
    // ===============================================
    function monitorPerformance() {
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`Page load time: ${pageLoadTime}ms`);
                
                if (pageLoadTime > 3000) {
                    console.warn('Page load time is above 3 seconds. Consider optimization.');
                }
            }
        });
    }
    
    // ===============================================
    // INITIALIZATION
    // ===============================================
    function init() {
        initDOM();
        handlePreloader();
        initTheme();
        initNavigation();
        initSmoothScrolling();
        initContactForm();
        initSkillBars();
        initProjectCards();
        initLazyLoading();
        updateYear();
        monitorPerformance();
        
        console.log('%c Portfolio Initialized Successfully! ', 'background: #6366f1; color: white; font-size: 16px; padding: 10px; border-radius: 5px;');
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export for other modules
    window.Portfolio = {
        showNotification: showNotification
    };
    
})();