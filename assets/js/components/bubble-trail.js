/* File: bubble-trail.js */
/* Location: /htdocs/assets/js/bubble-trail.js */

// ===============================================
// SIMPLE BUBBLE TRAIL EFFECT
// ===============================================

(function() {
    'use strict';
    
    // Check if mobile device
    if (matchMedia('(hover: none) and (pointer: coarse)').matches) {
        console.log('Touch device detected, disabling bubble trail');
        return;
    }
    
    // Get container
    const bubbleContainer = document.getElementById('bubble-trail-container');
    if (!bubbleContainer) {
        console.log('Bubble container not found');
        return;
    }
    
    // Configuration
    const config = {
        bubbleRate: 3,          // Bubbles per movement (lower = fewer bubbles)
        minSize: 4,             // Minimum bubble size in px
        maxSize: 12,            // Maximum bubble size in px
        colors: ['purple', 'green', 'blue', 'pink'],
        maxBubbles: 30,         // Maximum bubbles on screen
        mouseThreshold: 10,     // Minimum mouse movement to create bubble
        clickBubbleSize: 20     // Size of click bubbles
    };
    
    // State
    let mouseX = 0;
    let mouseY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let moveCounter = 0;
    let isMouseMoving = false;
    let mouseTimer;
    
    // Initialize
    function init() {
        setupEventListeners();
        console.log('Bubble trail initialized');
    }
    
    // Setup Event Listeners
    function setupEventListeners() {
        // Mouse move - create trail bubbles
        document.addEventListener('mousemove', handleMouseMove);
        
        // Mouse click - create special bubble
        document.addEventListener('mousedown', handleMouseClick);
        
        // Touch events for hybrid devices
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
    }
    
    // Handle Mouse Movement
    function handleMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Calculate distance moved
        const distance = Math.sqrt(
            Math.pow(mouseX - lastMouseX, 2) + 
            Math.pow(mouseY - lastMouseY, 2)
        );
        
        // Only create bubble if mouse moved enough
        if (distance > config.mouseThreshold) {
            moveCounter++;
            
            // Create bubble based on rate
            if (moveCounter % config.bubbleRate === 0) {
                createBubble(mouseX, mouseY);
            }
            
            lastMouseX = mouseX;
            lastMouseY = mouseY;
        }
        
        // Detect if mouse is moving
        isMouseMoving = true;
        clearTimeout(mouseTimer);
        mouseTimer = setTimeout(() => {
            isMouseMoving = false;
        }, 100);
    }
    
    // Handle Mouse Click
    function handleMouseClick(e) {
        // Create multiple bubbles on click
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                createClickBubble(e.clientX, e.clientY);
            }, i * 50);
        }
    }
    
    // Handle Touch Start (for hybrid devices)
    function handleTouchStart(e) {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            createClickBubble(touch.clientX, touch.clientY);
        }
    }
    
    // Handle Touch Move
    function handleTouchMove(e) {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            moveCounter++;
            
            if (moveCounter % (config.bubbleRate * 2) === 0) {
                createBubble(touch.clientX, touch.clientY);
            }
        }
    }
    
    // Create Regular Bubble
    function createBubble(x, y) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Random size
        const size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
        
        // Random color
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        bubble.classList.add(color);
        
        // Random size class
        if (size < 6) {
            bubble.classList.add('small');
        } else if (size < 10) {
            bubble.classList.add('medium');
        } else {
            bubble.classList.add('large');
        }
        
        // Add glow effect randomly
        if (Math.random() > 0.7) {
            bubble.classList.add('glow');
        }
        
        // Position and size
        bubble.style.left = x + 'px';
        bubble.style.top = y + 'px';
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        
        // Add random horizontal drift
        const drift = (Math.random() - 0.5) * 30;
        bubble.style.transform = `translate(-50%, -50%) translateX(${drift}px)`;
        
        // Add to container
        bubbleContainer.appendChild(bubble);
        
        // Remove after animation
        setTimeout(() => {
            bubble.remove();
        }, 4000);
        
        // Limit bubbles on screen
        limitBubbles();
    }
    
    // Create Click Bubble (bigger and different)
    function createClickBubble(x, y) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble click-bubble';
        
        // Random color
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        bubble.classList.add(color);
        
        // Bigger size for click
        const size = config.clickBubbleSize + Math.random() * 10;
        
        // Random offset for multiple bubbles
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        
        // Position and size
        bubble.style.left = (x + offsetX) + 'px';
        bubble.style.top = (y + offsetY) + 'px';
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        
        // Add to container
        bubbleContainer.appendChild(bubble);
        
        // Remove after animation
        setTimeout(() => {
            bubble.remove();
        }, 600);
    }
    
    // Limit Number of Bubbles
    function limitBubbles() {
        const bubbles = bubbleContainer.querySelectorAll('.bubble:not(.click-bubble)');
        if (bubbles.length > config.maxBubbles) {
            // Remove oldest bubbles
            for (let i = 0; i < bubbles.length - config.maxBubbles; i++) {
                bubbles[i].remove();
            }
        }
    }
    
    // Performance Check
    function checkPerformance() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        function frame() {
            const currentTime = performance.now();
            frameCount++;
            
            if (currentTime >= lastTime + 1000) {
                const fps = (frameCount * 1000) / (currentTime - lastTime);
                
                // If FPS is too low, reduce bubble rate
                if (fps < 30) {
                    config.bubbleRate = Math.min(config.bubbleRate + 1, 10);
                    console.log('Low FPS detected, reducing bubble rate');
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(frame);
        }
        
        // Start monitoring
        requestAnimationFrame(frame);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Start performance monitoring
    checkPerformance();
    
})();