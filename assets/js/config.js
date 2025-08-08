/* ===============================================
   PORTFOLIO CONFIGURATION & DATA
   File: config.js
   Location: /assets/js/config.js
   =============================================== */

window.PortfolioConfig = {
    // Personal Information
    personal: {
        name: 'Bijay Koirala',
        title: 'Data Analyst & Automation Expert',
        email: 'bijaykoirala003@gmail.com',
        phone: '+9746665541',
        website: 'https://bijaykoirala0.com.np',
        location: 'Nepal 🇳🇵',
        timezone: 'GMT+5:45',
        availability: 'Available for Freelance | Intern | Part-time | Remote',
        resumePath: 'assets/resume/resume.pdf'
    },
    
    // Social Links
    social: {
        github: 'https://github.com/bijay085',
        linkedin: 'https://www.linkedin.com/in/bijay-koirala/',
        whatsapp: 'https://wa.me/9746665541',
        twitter: null,
        instagram: null
    },
    
    // GitHub Configuration
    github: {
        username: 'bijay085',
        apiBaseUrl: 'https://api.github.com',
        theme: 'dark',
        showIcons: true,
        countPrivate: true,
        cacheTime: 3600000 // 1 hour
    },
    
    // Skills Data
    skills: {
        'Programming Languages': [
            { name: 'Python', level: 85 },
            { name: 'JavaScript', level: 75 },
            { name: 'HTML/CSS', level: 90 },
            { name: 'PHP', level: 60 }
        ],
        'Automation & Scraping': [
            { name: 'Web Scraping', level: 95 },
            { name: 'Selenium', level: 90 },
            { name: 'Beautiful Soup', level: 85 },
            { name: 'Bot Development', level: 80 }
        ],
        'Data & Tools': [
            { name: 'Power BI', level: 75 },
            { name: 'Excel', level: 85 },
            { name: 'MySQL/MongoDB', level: 70 },
            { name: 'Git & GitHub', level: 80 }
        ]
    },
    
    // Typing Effect Texts
    typingTexts: [
        'Data Analyst 📊',
        'Web Based Analyzer 💻',
        'Automation Expert 🤖',
        'Web Scraping Specialist 🕷️',
        'Bot Developer 🤖',
        'Professional Sleeper 😴'
    ],
    
    // Performance Settings
    performance: {
        lazyLoadOffset: 100,
        animationDuration: 1000,
        debounceDelay: 20,
        throttleDelay: 100
    },
    
    // Feature Flags
    features: {
        enableBubbleTrail: true,
        enableTerminal: true,
        enableGithubStats: true,
        enableAnimations: true,
        enablePerformanceMonitoring: true,
        enableEasterEggs: true
    },
    
    // API Endpoints (for future use)
    api: {
        contact: '/api/contact',
        newsletter: '/api/newsletter',
        analytics: '/api/analytics'
    }
};