/**
 * CONTACT FORM HANDLER
 * File: /htdocs/assets/js/contact.js
 * Handles contact form validation, submission, and feedback
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        formEndpoint: '/api/contact.php',
        enableValidation: true,
        enableSpamProtection: true,
        enableLocalStorage: true,
        maxMessageLength: 1000,
        minMessageLength: 10,
        submitCooldown: 5000, // 5 seconds
        recaptchaSiteKey: '', // Add if using reCAPTCHA
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phoneRegex: /^[\d\s\-\+\(\)]+$/
    };

    // Form field configurations
    const FIELD_CONFIG = {
        name: {
            min: 2,
            max: 50,
            pattern: /^[a-zA-Z\s'-]+$/,
            error: 'Please enter a valid name (2-50 characters)'
        },
        email: {
            pattern: CONFIG.emailRegex,
            error: 'Please enter a valid email address'
        },
        subject: {
            min: 3,
            max: 100,
            error: 'Subject must be 3-100 characters'
        },
        message: {
            min: CONFIG.minMessageLength,
            max: CONFIG.maxMessageLength,
            error: `Message must be ${CONFIG.minMessageLength}-${CONFIG.maxMessageLength} characters`
        }
    };

    // Cache DOM elements
    const elements = {
        form: null,
        fields: {},
        submitBtn: null,
        statusDiv: null,
        charCounter: null
    };

    // State management
    let isSubmitting = false;
    let lastSubmitTime = 0;
    let formData = {};

    /**
     * Initialize contact form
     */
    function init() {
        // Cache elements
        cacheElements();
        
        if (!elements.form) {
            console.warn('Contact form not found');
            return;
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Load saved form data
        if (CONFIG.enableLocalStorage) {
            loadSavedFormData();
        }
        
        // Set up spam protection
        if (CONFIG.enableSpamProtection) {
            setupSpamProtection();
        }
        
        console.log('Contact form initialized');
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.form = document.getElementById('contactForm');
        
        if (elements.form) {
            // Cache form fields
            elements.fields = {
                name: elements.form.querySelector('#contactName'),
                email: elements.form.querySelector('#contactEmail'),
                subject: elements.form.querySelector('#contactSubject'),
                message: elements.form.querySelector('#contactMessage')
            };
            
            elements.submitBtn = elements.form.querySelector('.btn-submit');
            elements.statusDiv = document.getElementById('formStatus');
            
            // Create character counter if doesn't exist
            const messageField = elements.fields.message;
            if (messageField && !elements.charCounter) {
                createCharCounter(messageField);
            }
        }
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Form submission
        elements.form.addEventListener('submit', handleSubmit);
        
        // Field validation
        Object.entries(elements.fields).forEach(([fieldName, field]) => {
            if (field) {
                // Real-time validation
                field.addEventListener('blur', () => validateField(fieldName, field));
                field.addEventListener('input', () => {
                    clearFieldError(field);
                    if (CONFIG.enableLocalStorage) {
                        saveFormData();
                    }
                });
                
                // Special handling for message field
                if (fieldName === 'message') {
                    field.addEventListener('input', updateCharCounter);
                }
            }
        });
        
        // Clear status on form interaction
        elements.form.addEventListener('focus', clearStatus, true);
    }

    /**
     * Handle form submission
     */
    async function handleSubmit(e) {
        e.preventDefault();
        
        // Check cooldown
        if (!checkCooldown()) {
            showStatus('Please wait before submitting again', 'error');
            return;
        }
        
        // Check if already submitting
        if (isSubmitting) return;
        
        // Validate all fields
        if (!validateForm()) {
            showStatus('Please fix the errors above', 'error');
            return;
        }
        
        // Collect form data
        formData = collectFormData();
        
        // Start submission
        isSubmitting = true;
        setSubmitButtonState(true);
        clearStatus();
        
        try {
            // Submit form
            const response = await submitForm(formData);
            
            if (response.success) {
                handleSuccess(response);
            } else {
                handleError(response.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            handleError('Network error. Please try again later.');
        } finally {
            isSubmitting = false;
            setSubmitButtonState(false);
            lastSubmitTime = Date.now();
        }
    }

    /**
     * Validate entire form
     */
    function validateForm() {
        let isValid = true;
        
        Object.entries(elements.fields).forEach(([fieldName, field]) => {
            if (field && !validateField(fieldName, field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    /**
     * Validate individual field
     */
    function validateField(fieldName, field) {
        const value = field.value.trim();
        const config = FIELD_CONFIG[fieldName];
        
        if (!config) return true;
        
        // Check required
        if (!value) {
            showFieldError(field, `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`);
            return false;
        }
        
        // Check min length
        if (config.min && value.length < config.min) {
            showFieldError(field, config.error);
            return false;
        }
        
        // Check max length
        if (config.max && value.length > config.max) {
            showFieldError(field, config.error);
            return false;
        }
        
        // Check pattern
        if (config.pattern && !config.pattern.test(value)) {
            showFieldError(field, config.error);
            return false;
        }
        
        // Special validation for email
        if (fieldName === 'email' && !validateEmail(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        
        clearFieldError(field);
        return true;
    }

    /**
     * Validate email address
     */
    function validateEmail(email) {
        return CONFIG.emailRegex.test(email.toLowerCase());
    }

    /**
     * Show field error
     */
    function showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        formGroup.classList.add('error');
        
        let errorElement = formGroup.querySelector('.form-error');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'form-error';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Add shake animation
        field.classList.add('shake');
        setTimeout(() => field.classList.remove('shake'), 500);
    }

    /**
     * Clear field error
     */
    function clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        formGroup.classList.remove('error');
        
        const errorElement = formGroup.querySelector('.form-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    /**
     * Collect form data
     */
    function collectFormData() {
        const data = {};
        
        Object.entries(elements.fields).forEach(([fieldName, field]) => {
            if (field) {
                data[fieldName] = field.value.trim();
            }
        });
        
        // Add metadata
        data.timestamp = new Date().toISOString();
        data.userAgent = navigator.userAgent;
        data.referrer = document.referrer;
        
        return data;
    }

    /**
     * Submit form to server
     */
    async function submitForm(data) {
        // If no backend endpoint, simulate submission
        if (!CONFIG.formEndpoint || CONFIG.formEndpoint === '/api/contact.php') {
            // Simulate API call
            return simulateSubmission(data);
        }
        
        const response = await fetch(CONFIG.formEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    /**
     * Simulate form submission (for demo)
     */
    async function simulateSubmission(data) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Log form data
        console.log('Form submission (simulated):', data);
        
        // Store in localStorage as fallback
        const submissions = JSON.parse(localStorage.getItem('contact_submissions') || '[]');
        submissions.push(data);
        localStorage.setItem('contact_submissions', JSON.stringify(submissions));
        
        // Return success
        return {
            success: true,
            message: 'Message sent successfully (simulated)',
            data: data
        };
    }

    /**
     * Handle successful submission
     */
    function handleSuccess(response) {
        // Show success message
        showStatus('Thank you! Your message has been sent successfully. I\'ll get back to you soon!', 'success');
        
        // Clear form
        elements.form.reset();
        
        // Clear saved data
        if (CONFIG.enableLocalStorage) {
            localStorage.removeItem('contact_form_data');
        }
        
        // Update character counter
        updateCharCounter();
        
        // Show success animation
        showSuccessAnimation();
        
        // Track event
        if (window.gtag) {
            window.gtag('event', 'contact_form_submit', {
                'event_category': 'engagement',
                'event_label': 'Contact Form'
            });
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('contactFormSubmitted', {
            detail: response.data
        }));
    }

    /**
     * Handle submission error
     */
    function handleError(message) {
        showStatus(message, 'error');
        
        // Track error
        if (window.gtag) {
            window.gtag('event', 'contact_form_error', {
                'event_category': 'engagement',
                'event_label': message
            });
        }
    }

    /**
     * Show status message
     */
    function showStatus(message, type = 'info') {
        if (!elements.statusDiv) {
            // Create status div if doesn't exist
            elements.statusDiv = document.createElement('div');
            elements.statusDiv.id = 'formStatus';
            elements.statusDiv.className = 'form-status';
            elements.form.appendChild(elements.statusDiv);
        }
        
        elements.statusDiv.textContent = message;
        elements.statusDiv.className = `form-status ${type}`;
        elements.statusDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds for success
        if (type === 'success') {
            setTimeout(clearStatus, 5000);
        }
    }

    /**
     * Clear status message
     */
    function clearStatus() {
        if (elements.statusDiv) {
            elements.statusDiv.style.display = 'none';
            elements.statusDiv.className = 'form-status';
        }
    }

    /**
     * Set submit button state
     */
    function setSubmitButtonState(isLoading) {
        if (!elements.submitBtn) return;
        
        if (isLoading) {
            elements.submitBtn.disabled = true;
            elements.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            elements.submitBtn.classList.add('loading');
        } else {
            elements.submitBtn.disabled = false;
            elements.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            elements.submitBtn.classList.remove('loading');
        }
    }

    /**
     * Check submission cooldown
     */
    function checkCooldown() {
        const now = Date.now();
        return now - lastSubmitTime > CONFIG.submitCooldown;
    }

    /**
     * Create character counter
     */
    function createCharCounter(field) {
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.innerHTML = `<span class="char-count">0</span> / ${CONFIG.maxMessageLength}`;
        
        field.parentElement.appendChild(counter);
        elements.charCounter = counter;
    }

    /**
     * Update character counter
     */
    function updateCharCounter() {
        if (!elements.charCounter || !elements.fields.message) return;
        
        const count = elements.fields.message.value.length;
        const countElement = elements.charCounter.querySelector('.char-count');
        
        countElement.textContent = count;
        
        // Change color based on count
        if (count > CONFIG.maxMessageLength) {
            elements.charCounter.style.color = 'var(--error)';
        } else if (count > CONFIG.maxMessageLength * 0.9) {
            elements.charCounter.style.color = 'var(--warning)';
        } else {
            elements.charCounter.style.color = 'var(--text-tertiary)';
        }
    }

    /**
     * Save form data to localStorage
     */
    function saveFormData() {
        const data = collectFormData();
        localStorage.setItem('contact_form_data', JSON.stringify(data));
    }

    /**
     * Load saved form data
     */
    function loadSavedFormData() {
        try {
            const saved = localStorage.getItem('contact_form_data');
            if (saved) {
                const data = JSON.parse(saved);
                
                Object.entries(data).forEach(([fieldName, value]) => {
                    if (elements.fields[fieldName] && fieldName !== 'timestamp') {
                        elements.fields[fieldName].value = value;
                    }
                });
                
                updateCharCounter();
            }
        } catch (error) {
            console.error('Error loading saved form data:', error);
        }
    }

    /**
     * Set up spam protection
     */
    function setupSpamProtection() {
        // Add honeypot field
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.style.display = 'none';
        honeypot.tabIndex = -1;
        honeypot.autocomplete = 'off';
        elements.form.appendChild(honeypot);
        
        // Check honeypot on submit
        elements.form.addEventListener('submit', (e) => {
            if (honeypot.value) {
                e.preventDefault();
                console.warn('Spam detected');
                return false;
            }
        });
        
        // Add timestamp field for time-based validation
        const timestamp = document.createElement('input');
        timestamp.type = 'hidden';
        timestamp.name = 'timestamp';
        timestamp.value = Date.now();
        elements.form.appendChild(timestamp);
    }

    /**
     * Show success animation
     */
    function showSuccessAnimation() {
        // Create checkmark animation
        const successIcon = document.createElement('div');
        successIcon.className = 'form-success-icon';
        successIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        
        elements.form.appendChild(successIcon);
        
        // Animate
        setTimeout(() => {
            successIcon.classList.add('animate');
        }, 100);
        
        // Remove after animation
        setTimeout(() => {
            successIcon.remove();
        }, 2000);
    }

    /**
     * Public API
     */
    window.ContactFormManager = {
        init: init,
        validate: validateForm,
        submit: () => elements.form.dispatchEvent(new Event('submit')),
        reset: () => elements.form.reset(),
        getData: () => formData,
        setField: (field, value) => {
            if (elements.fields[field]) {
                elements.fields[field].value = value;
            }
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();