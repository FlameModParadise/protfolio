/* ===============================================
   TYPING EFFECT COMPONENT
   File: typing.js
   Location: /assets/js/components/typing.js
   =============================================== */

(function() {
    'use strict';
    
    const typedTextElement = document.getElementById('typed-text');
    
    if (!typedTextElement) return;
    
    const textArray = [
        'Data Analyst 📊',
        'Web Based Analyzer 💻',
        'Automation Expert 🤖',
        'Web Scraping Specialist 🕷️',
        'Bot Developer 🤖',
        'Professional Sleeper 😴'
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
    
})();