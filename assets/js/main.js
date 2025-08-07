/* File: main.js */
/* Location: /htdocs/assets/js/main.js */

// ===============================================
// 1. GLOBAL VARIABLES & DOM ELEMENTS
// ===============================================

// DOM Elements
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('nav-menu');
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');
const backToTopBtn = document.getElementById('back-to-top');
const preloader = document.getElementById('preloader');
const contactForm = document.getElementById('contact-form');
const yearSpan = document.getElementById('year');

// Variables
let isScrolling = false;
let scrollTimeout;

// ===============================================
// 2. PRELOADER
// ===============================================

window.addEventListener('load', () => {
    // Hide preloader after page loads
    setTimeout(() => {
        if (preloader) {
            preloader.classList.add('hide');
            // Remove from DOM after animation
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    }, 500);
});

// ===============================================
// 3. THEME TOGGLE
// ===============================================

// Check for saved theme preference
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.body.classList.add(currentTheme);
    if (currentTheme === 'light-theme' && themeToggle) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Theme toggle functionality
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        
        // Update icon
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('light-theme')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('theme', 'light-theme');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.removeItem('theme');
        }
    });
}

// ===============================================
// 4. NAVIGATION
// ===============================================

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            isScrolling = false;
        });
        isScrolling = true;
    }
    
    // Update active nav link based on scroll position
    updateActiveNavLink();
    
    // Show/hide back to top button
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

// Mobile menu toggle
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking nav links
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Update active navigation link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) navLink.classList.add('active');
        }
    });
}

// ===============================================
// 5. SMOOTH SCROLLING
// ===============================================

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Back to top button
if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===============================================
// 6. TYPING EFFECT
// ===============================================

const typedTextElement = document.getElementById('typed-text');
if (typedTextElement) {
    const textArray = [
        'Web Developer',
        'Programmer',
        'Problem Solver',
        'Tech Enthusiast',
        'Continuous Learner'
    ];
    
    let textArrayIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentText = textArray[textArrayIndex];
        
        if (isDeleting) {
            // Remove characters
            typedTextElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            // Add characters
            typedTextElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        // Check if word is complete
        if (!isDeleting && charIndex === currentText.length) {
            // Pause at end of word
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Move to next word
            isDeleting = false;
            textArrayIndex++;
            if (textArrayIndex >= textArray.length) {
                textArrayIndex = 0;
            }
            typingSpeed = 500;
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Start typing effect
    type();
}

// ===============================================
// 7. FORM HANDLING
// ===============================================

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const formObject = Object.fromEntries(formData);
        
        // Basic validation
        if (!validateForm(formObject)) {
            return;
        }
        
        // Get submit button and change state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // For InfinityFree, you'll need to create a PHP handler
            // For now, we'll simulate the submission
            await simulateFormSubmission(formObject);
            
            // Success message
            showNotification('Message sent successfully!', 'success');
            contactForm.reset();
            
        } catch (error) {
            // Error message
            showNotification('Failed to send message. Please try again.', 'error');
            console.error('Form submission error:', error);
            
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

// Form validation
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

// Simulate form submission (replace with actual PHP endpoint)
function simulateFormSubmission(data) {
    return new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
            console.log('Form data submitted:', data);
            resolve();
        }, 2000);
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
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
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// ===============================================
// 8. SKILL BARS ANIMATION
// ===============================================

// Animate skill bars when they come into view
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

// Observe skills section
const skillsSection = document.querySelector('.skills');
if (skillsSection) {
    skillObserver.observe(skillsSection);
}

// ===============================================
// 9. PROJECT CARDS HOVER EFFECT
// ===============================================

// Add tilt effect to project cards
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

// ===============================================
// 10. DYNAMIC YEAR
// ===============================================

// Update copyright year
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

// ===============================================
// 11. LAZY LOADING IMAGES
// ===============================================

// Lazy load images
const lazyImages = document.querySelectorAll('img[data-src]');

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

// ===============================================
// 12. KEYBOARD NAVIGATION
// ===============================================

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    // ESC key closes mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
    
    // Ctrl/Cmd + K focuses search (if you add search later)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        console.log('Search shortcut pressed');
    }
});

// ===============================================
// 13. PERFORMANCE MONITORING
// ===============================================

// Log performance metrics
window.addEventListener('load', () => {
    if ('performance' in window) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page load time: ${pageLoadTime}ms`);
        
        // Send to analytics if needed
        if (pageLoadTime > 3000) {
            console.warn('Page load time is above 3 seconds. Consider optimization.');
        }
    }
});

// ===============================================
// 14. UTILITY FUNCTIONS
// ===============================================

// Debounce function for scroll events
function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Throttle function for resize events
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

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ===============================================
// 15. EASTER EGGS
// ===============================================

// Konami code easter egg
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateEasterEgg() {
    console.log('🎉 Konami Code Activated!');
    
    // Add fun animation
    document.body.style.animation = 'rainbow 3s linear';
    
    // Create confetti or special effect
    createConfetti();
    
    setTimeout(() => {
        document.body.style.animation = '';
    }, 3000);
}

// Create confetti effect
function createConfetti() {
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -10px;
            transform: rotate(${Math.random() * 360}deg);
            animation: fall ${Math.random() * 3 + 2}s linear;
            z-index: 10000;
        `;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

// ===============================================
// 16. CONSOLE MESSAGES
// ===============================================

// Welcome message in console
console.log('%c Welcome to My Portfolio! ', 'background: #6366f1; color: white; font-size: 16px; padding: 10px; border-radius: 5px;');
console.log('%c Feel free to explore the code! ', 'color: #10b981; font-size: 14px;');
console.log('%c Try the Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A ', 'color: #f59e0b; font-size: 12px;');

// ===============================================
// 17. ANIMATIONS CSS (INJECT IF NEEDED)
// ===============================================

// Add animation styles if not in CSS
if (!document.querySelector('#dynamic-animations')) {
    const style = document.createElement('style');
    style.id = 'dynamic-animations';
    style.innerHTML = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
        
        @keyframes fall {
            to {
                transform: translateY(110vh) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
}

// ===============================================
// 18. INITIALIZATION
// ===============================================

// Initialize all components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio initialized successfully!');
    
    // Check for any missing elements
    const requiredElements = [
        { id: 'navbar', name: 'Navigation Bar' },
        { id: 'contact-form', name: 'Contact Form' },
        { id: 'theme-toggle', name: 'Theme Toggle' }
    ];
    
    requiredElements.forEach(element => {
        if (!document.getElementById(element.id)) {
            console.warn(`${element.name} element not found. Some features may not work.`);
        }
    });
});


// ===============================================
// END OF SCRIPT
// ===============================================