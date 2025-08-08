/**
 * INTERACTIVE TERMINAL
 * File: /htdocs/assets/js/terminal.js
 * Handles terminal emulation and commands
 */

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        prompt: 'bijay@portfolio:~$',
        cursor: '█',
        typingSpeed: 30,
        commandDelay: 100,
        maxHistory: 50,
        enableSound: false,
        enableAutocomplete: true
    };

    // Terminal commands
    const COMMANDS = {
        help: {
            description: 'Show available commands',
            usage: 'help [command]',
            execute: showHelp
        },
        about: {
            description: 'Display information about me',
            usage: 'about',
            execute: showAbout
        },
        skills: {
            description: 'List my technical skills',
            usage: 'skills [category]',
            execute: showSkills
        },
        projects: {
            description: 'Show my projects',
            usage: 'projects [filter]',
            execute: showProjects
        },
        services: {
            description: 'Show services I offer',
            usage: 'services',
            execute: showServices
        },
        stats: {
            description: 'Show portfolio statistics',
            usage: 'stats',
            execute: showStats
        },
        contact: {
            description: 'Display contact information',
            usage: 'contact',
            execute: showContact
        },
        resume: {
            description: 'Download my resume',
            usage: 'resume',
            execute: downloadResume
        },
        clear: {
            description: 'Clear terminal screen',
            usage: 'clear',
            execute: clearTerminal
        },
        theme: {
            description: 'Change theme (dark/light/matrix)',
            usage: 'theme [name]',
            execute: changeTheme
        },
        social: {
            description: 'Show social media links',
            usage: 'social [platform]',
            execute: showSocial
        },
        education: {
            description: 'Display education information',
            usage: 'education',
            execute: showEducation
        },
        experience: {
            description: 'Show work experience',
            usage: 'experience',
            execute: showExperience
        },
        reload: {
            description: 'Reload portfolio data',
            usage: 'reload',
            execute: reloadData
        },
        info: {
            description: 'Show system info',
            usage: 'info',
            execute: showInfo
        },
        json: {
            description: 'View JSON data sections',
            usage: 'json [section]',
            execute: showJson
        },
        matrix: {
            description: 'Enter the Matrix',
            usage: 'matrix',
            execute: matrixRain
        },
        joke: {
            description: 'Tell a programming joke',
            usage: 'joke',
            execute: tellJoke
        },
        quote: {
            description: 'Show an inspirational quote',
            usage: 'quote',
            execute: showQuote
        },
        weather: {
            description: 'Show current weather',
            usage: 'weather [city]',
            execute: showWeather
        },
        whoami: {
            description: 'Display current user',
            usage: 'whoami',
            execute: () => {
                if (portfolioData && portfolioData.personal) {
                    const website = portfolioData.personal.website.replace('https://', '');
                    return 'visitor@' + website;
                }
                return 'visitor@bijaykoirala0.com.np';
            }
        },
        date: {
            description: 'Display current date and time',
            usage: 'date',
            execute: () => new Date().toString()
        },
        echo: {
            description: 'Echo back the input',
            usage: 'echo [text]',
            execute: (args) => args.join(' ')
        },
        ls: {
            description: 'List directory contents',
            usage: 'ls',
            execute: listDirectory
        },
        cat: {
            description: 'Display file contents',
            usage: 'cat [filename]',
            execute: catFile
        },
        pwd: {
            description: 'Print working directory',
            usage: 'pwd',
            execute: () => '/home/bijay/portfolio'
        },
        history: {
            description: 'Show command history',
            usage: 'history',
            execute: showHistory
        },
        exit: {
            description: 'Exit terminal',
            usage: 'exit',
            execute: exitTerminal
        }
    };

    // Hidden easter eggs
    const EASTER_EGGS = {
        'sudo': () => 'Nice try! But you don\'t have sudo privileges here 😄',
        'rm -rf /': () => 'Whoa! Let\'s not destroy everything! 🔥',
        'hack': () => 'I\'m in! Just kidding... 🤖',
        'coffee': () => '☕ Here\'s your virtual coffee! *brewing sounds*',
        'hello world': () => 'Hello, fellow developer! 👋',
        '42': () => 'The answer to life, universe, and everything! 🌌',
        'ping': () => 'Pong! 🏓',
        'vim': () => 'Type :q to exit... just kidding, you\'re stuck forever! 😈',
        'emacs': () => 'A great operating system, lacking only a decent editor 😏',
        'python': () => portfolioData ?
            'My favorite! Python level: ' + portfolioData.skills['Programming Languages'][0].level + '%' :
            'My favorite language! 🐍',
        'bijay': () => portfolioData ?
            portfolioData.personal.tagline :
            'That\'s me! 👋'
    };

    // Cache DOM elements
    const elements = {
        terminal: null,
        output: null,
        input: null,
        inputLine: null,
        cursor: null
    };

    // State management
    let commandHistory = [];
    let historyIndex = -1;
    let currentInput = '';
    let isProcessing = false;
    let isInitialized = false;
    let portfolioData = null;

    /**
     * Load portfolio data from JSON
     */
    async function loadPortfolioData() {
        try {
            const response = await fetch('/assets/data/portfolio.json');
            if (response.ok) {
                portfolioData = await response.json();
                console.log('Portfolio data loaded successfully');

                // Update prompt with user's name
                if (portfolioData.personal && portfolioData.personal.name) {
                    const firstName = portfolioData.personal.name.split(' ')[0].toLowerCase();
                    CONFIG.prompt = firstName + '@portfolio:~$';
                }

                return true;
            }
        } catch (error) {
            console.error('Error loading portfolio.json:', error);
        }
        return false;
    }

    /**
     * Initialize terminal
     */
    async function init() {
        if (isInitialized) {
            console.log('Terminal already initialized');
            return;
        }

        // Load portfolio data first
        await loadPortfolioData();

        cacheElements();

        if (!elements.terminal) {
            console.warn('Terminal elements not found');
            return;
        }

        if (elements.output) {
            elements.output.innerHTML = '';
        }

        setupEventListeners();
        showWelcome();
        focusInput();

        isInitialized = true;
        console.log('Terminal initialized');
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.terminal = document.getElementById('terminalBody');
        elements.output = document.getElementById('terminalOutput');
        elements.input = document.getElementById('terminalInput');

        if (!elements.output && elements.terminal) {
            elements.output = document.createElement('div');
            elements.output.id = 'terminalOutput';
            elements.output.className = 'terminal-output';

            const inputLine = elements.terminal.querySelector('.terminal-input-line');
            elements.terminal.innerHTML = '';
            elements.terminal.appendChild(elements.output);
            if (inputLine) {
                elements.terminal.appendChild(inputLine);
            }
        }
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        if (!elements.input) return;

        elements.input.removeEventListener('keydown', handleKeyDown);
        elements.input.removeEventListener('input', handleInput);

        elements.input.addEventListener('keydown', handleKeyDown);
        elements.input.addEventListener('input', handleInput);

        if (elements.terminal) {
            elements.terminal.removeEventListener('click', focusInput);
            elements.terminal.addEventListener('click', focusInput);
        }

        const form = elements.input.closest('form');
        if (form) {
            form.addEventListener('submit', (e) => e.preventDefault());
        }
    }

    /**
     * Handle keydown events
     */
    function handleKeyDown(e) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                processCommand();
                break;
            case 'ArrowUp':
                e.preventDefault();
                navigateHistory(-1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                navigateHistory(1);
                break;
            case 'Tab':
                e.preventDefault();
                if (CONFIG.enableAutocomplete) {
                    autocomplete();
                }
                break;
            case 'c':
                if (e.ctrlKey) {
                    e.preventDefault();
                    cancelCommand();
                }
                break;
            case 'l':
                if (e.ctrlKey) {
                    e.preventDefault();
                    clearTerminal();
                }
                break;
        }
    }

    /**
     * Handle input changes
     */
    function handleInput(e) {
        currentInput = e.target.value;
    }

    /**
     * Process command
     */
    function processCommand() {
        if (isProcessing) return;

        const input = elements.input.value.trim();
        if (!input) return;

        isProcessing = true;

        // Store current scroll position
        const wasAtBottom = elements.terminal && 
            (elements.terminal.scrollHeight - elements.terminal.scrollTop - elements.terminal.clientHeight < 100);

        // Only force scroll if user was already at bottom
        if (wasAtBottom && elements.terminal) {
            elements.terminal.scrollTop = elements.terminal.scrollHeight;
        }

        addLine(CONFIG.prompt + ' ' + input, 'command');

        if (input && input !== commandHistory[commandHistory.length - 1]) {
            commandHistory.push(input);
            if (commandHistory.length > CONFIG.maxHistory) {
                commandHistory.shift();
            }
        }
        historyIndex = commandHistory.length;

        const parts = input.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (EASTER_EGGS[input.toLowerCase()]) {
            typeOutput(EASTER_EGGS[input.toLowerCase()]());
        }
        else if (COMMANDS[cmd]) {
            try {
                const result = COMMANDS[cmd].execute(args);
                if (result instanceof Promise) {
                    result.then(output => typeOutput(output))
                        .catch(error => typeOutput('Error: ' + error.message, 'error'));
                } else if (result) {
                    typeOutput(result);
                }
            } catch (error) {
                typeOutput('Error executing command: ' + error.message, 'error');
            }
        }
        else {
            typeOutput('Command not found: ' + cmd + '. Type \'help\' for available commands.', 'error');
        }

        elements.input.value = '';
        currentInput = '';

        setTimeout(() => {
            isProcessing = false;
        }, CONFIG.commandDelay);
    }

    /**
     * Show welcome message
     */
    function showWelcome() {
        let dataStatus;
        if (portfolioData) {
            dataStatus = '║     ✅ Data loaded from portfolio.json                        ║';
        } else {
            dataStatus = '║     📄 Using fallback data (portfolio.json not loaded)       ║';
        }

        const welcome = '╔════════════════════════════════════════════════════════════════╗\n' +
            '║                                                                ║\n' +
            '║     Welcome to Bijay\'s Interactive Terminal v1.0.0            ║\n' +
            dataStatus + '\n' +
            '║                                                                ║\n' +
            '║     Type \'help\' to see available commands                     ║\n' +
            '║     Type \'about\' to learn more about me                       ║\n' +
            '║     Type \'projects\' to see my work                           ║\n' +
            '║     Type \'reload\' to refresh data from JSON                  ║\n' +
            '║                                                                ║\n' +
            '╚════════════════════════════════════════════════════════════════╝';

        addLine(welcome, 'ascii');
    }

    /**
     * Command: help
     */
    function showHelp(args) {
        if (args.length > 0) {
            const cmd = args[0];
            if (COMMANDS[cmd]) {
                return cmd + ' - ' + COMMANDS[cmd].description + '\nUsage: ' + COMMANDS[cmd].usage;
            }
            return 'No help available for: ' + cmd;
        }

        let help = 'Available commands:\n\n';
        for (const [cmd, info] of Object.entries(COMMANDS)) {
            help += '  ' + cmd.padEnd(12) + ' - ' + info.description + '\n';
        }
        help += '\nTip: Use arrow keys to navigate command history';
        return help;
    }

    /**
     * Command: about
     */
    function showAbout() {
        if (portfolioData && portfolioData.personal) {
            const p = portfolioData.personal;

            let output = '╔═══════════════════════════════════════════════════════════════╗\n';
            output += '║                         ABOUT ME                              ║\n';
            output += '╠═══════════════════════════════════════════════════════════════╣\n';
            output += '║                                                               ║\n';
            output += '║  Name:       ' + p.name + '                                   ║\n';
            output += '║  Location:   ' + p.location + ' 🇳🇵                                        ║\n';
            output += '║  Role:       ' + p.title.substring(0, 40) + '        ║\n';
            output += '║  Email:      ' + p.email + '                    ║\n';
            output += '║  Website:    ' + p.website + '              ║\n';
            output += '║                                                               ║\n';
            output += '║  ' + p.tagline.substring(0, 50) + '        ║\n';
            output += '║                                                               ║\n';
            output += '║  Languages: ' + p.languages.join(', ') + '                        ║\n';
            output += '║  Interests: ' + p.interests.slice(0, 3).join(', ') + '             ║\n';
            output += '║                                                               ║\n';
            output += '╚═══════════════════════════════════════════════════════════════╝';

            return output;
        }

        // Fallback if data not loaded
        const fallback = '╔═══════════════════════════════════════════════════════════════╗\n' +
            '║                         ABOUT ME                              ║\n' +
            '╠═══════════════════════════════════════════════════════════════╣\n' +
            '║                                                               ║\n' +
            '║  Name:       Bijay Koirala                                   ║\n' +
            '║  Location:   Nepal 🇳🇵                                        ║\n' +
            '║  Role:       Python Developer & Automation Enthusiast        ║\n' +
            '║                                                               ║\n' +
            '║  Fresher passionate about automation and web scraping        ║\n' +
            '║                                                               ║\n' +
            '║  Specialties:                                                ║\n' +
            '║  • Web Scraping & Data Extraction                           ║\n' +
            '║  • Browser Automation with Selenium                         ║\n' +
            '║  • Discord & Telegram Bot Development                       ║\n' +
            '║  • API Development & Integration                            ║\n' +
            '║  • Process Automation & Optimization                        ║\n' +
            '║                                                               ║\n' +
            '╚═══════════════════════════════════════════════════════════════╝';

        return fallback;
    }

    /**
     * Command: skills
     */
    function showSkills(args) {
        const category = args[0];

        if (portfolioData && portfolioData.skills) {
            const skills = portfolioData.skills;

            if (category) {
                // Find matching category (case insensitive)
                const key = Object.keys(skills).find(k =>
                    k.toLowerCase().includes(category.toLowerCase())
                );

                if (key && skills[key]) {
                    let output = key.toUpperCase() + ':\n';
                    skills[key].forEach(s => {
                        output += '  • ' + s.name + ' (' + s.level + '%) - ' + s.experience + '\n';
                    });
                    return output.trim();
                }
                return 'Category not found. Available: ' + Object.keys(skills).join(', ');
            }

            // Show all skills
            let output = 'TECHNICAL SKILLS:\n\n';
            for (const [cat, items] of Object.entries(skills)) {
                output += cat.toUpperCase() + ':\n';
                items.forEach(s => {
                    output += '  • ' + s.name + ' (' + s.level + '%)\n';
                });
                output += '\n';
            }
            return output.trim();
        }

        // Fallback
        const skills = {
            languages: ['Python (60%)', 'JavaScript (30%)', 'PHP (10%)', 'HTML/CSS (50%)'],
            automation: ['Selenium (30%)', 'BeautifulSoup (30%)', 'Scrapy (10%)', 'Requests (50%)'],
            tools: ['Git (60%)', 'VS Code (80%)', 'MySQL (40%)', 'MongoDB (35%)'],
            frameworks: ['Flask (5%)', 'Discord.py (55%)', 'Telebot (45%)']
        };

        if (category && skills[category]) {
            return category.toUpperCase() + ':\n' + skills[category].map(s => '  • ' + s).join('\n');
        }

        let output = 'TECHNICAL SKILLS:\n\n';
        for (const [cat, items] of Object.entries(skills)) {
            output += cat.toUpperCase() + ':\n';
            output += items.map(s => '  • ' + s).join('\n');
            output += '\n\n';
        }
        return output.trim();
    }

    /**
     * Command: projects
     */
    function showProjects(args) {
        const filter = args[0];

        if (portfolioData && portfolioData.projects) {
            let projects = portfolioData.projects;

            if (filter) {
                projects = projects.filter(p =>
                    p.category === filter ||
                    p.status === filter ||
                    p.category.toLowerCase().includes(filter.toLowerCase())
                );
            }

            if (projects.length === 0) {
                return 'No projects found with filter: ' + filter;
            }

            let output = 'PROJECTS (' + projects.length + ' total):\n\n';
            projects.forEach(p => {
                output += '📁 ' + p.title + '\n';
                output += '   ' + p.description + '\n';
                output += '   Category: ' + p.category + ' | Status: ' + p.status + '\n';
                output += '   Tech: ' + p.technologies.join(', ') + '\n';
                if (p.github) {
                    output += '   GitHub: ' + p.github + '\n';
                }
                if (p.demo) {
                    output += '   Demo: ' + p.demo + '\n';
                }
                output += '\n';
            });
            return output.trim();
        }

        // Fallback
        const projects = [
            { name: 'API/Web Scraping Suite', type: 'automation', status: 'private' },
            { name: 'Bot Ecosystem', type: 'bot', status: 'active' },
            { name: 'CMS Platform', type: 'web', status: 'completed' },
            { name: 'Gamified Learning Tracker', type: 'web', status: 'completed' },
            { name: 'FraudShield System', type: 'web', status: 'completed' }
        ];

        let filtered = projects;
        if (filter) {
            filtered = projects.filter(p => p.type === filter || p.status === filter);
        }

        if (filtered.length === 0) {
            return 'No projects found with that filter.';
        }

        let output = 'PROJECTS:\n\n';
        filtered.forEach(p => {
            output += '📁 ' + p.name + '\n';
            output += '   Type: ' + p.type + ' | Status: ' + p.status + '\n\n';
        });
        return output.trim();
    }

    /**
     * Command: show services
     */
    function showServices() {
        if (portfolioData && portfolioData.services) {
            let output = 'SERVICES OFFERED:\n\n';

            portfolioData.services.forEach(service => {
                output += '💼 ' + service.title + '\n';
                output += '   ' + service.description + '\n';
                output += '   Price Range: ' + service.price_range + '\n';
                output += '   Features:\n';
                service.features.forEach(f => {
                    output += '   • ' + f + '\n';
                });
                output += '\n';
            });

            return output.trim();
        }

        return 'Services data not available. Use "reload" to refresh data.';
    }

    /**
     * Command: show stats
     */
    function showStats() {
        if (portfolioData && portfolioData.stats) {
            const s = portfolioData.stats;

            let output = '📊 PORTFOLIO STATISTICS:\n\n';
            output += '• Projects Completed:  ' + s.projects_completed + '\n';
            output += '• Clients Served:      ' + s.clients_served + '\n';
            output += '• Revenue Earned:      $' + s.revenue_earned + '+\n';
            output += '• Experience:          ' + s.months_experience + ' months\n';
            output += '• Response Time:       ' + s.response_time + '\n';
            output += '• Availability:        ' + s.availability;

            return output;
        }

        return 'Stats data not available. Use "reload" to refresh data.';
    }

    /**
     * Command: contact
     */
    function showContact() {
        if (portfolioData) {
            const p = portfolioData.personal;
            const s = portfolioData.social;

            let output = 'CONTACT INFORMATION:\n\n';
            output += '📧 Email:     ' + p.email + '\n';
            output += '📱 Phone:     ' + p.phone + '\n';
            output += '🌐 Website:   ' + p.website + '\n';
            output += '📍 Location:  ' + p.location + ' (' + p.timezone + ')\n\n';

            output += 'SOCIAL MEDIA:\n';
            output += '• GitHub:     ' + s.github + '\n';
            output += '• LinkedIn:   ' + s.linkedin + '\n';
            output += '• WhatsApp:   ' + s.whatsapp + '\n';
            output += '• Discord:    ' + s.discord + '\n';
            output += '• Telegram:   ' + s.telegram + '\n\n';

            output += p.available ? '✅ Available for hire!' : '❌ Not available';

            return output;
        }

        // Fallback
        const fallback = 'CONTACT INFORMATION:\n\n' +
            '📧 Email:     bijaykoirala003@gmail.com\n' +
            '📱 Phone:     +9746665541\n' +
            '🌐 Website:   bijaykoirala0.com.np\n' +
            '📍 Location:  Nepal (GMT+5:45)\n\n' +
            'SOCIAL MEDIA:\n' +
            '• GitHub:     github.com/bijay085\n' +
            '• LinkedIn:   linkedin.com/in/bijay-koirala\n' +
            '• WhatsApp:   wa.me/9746665541\n\n' +
            'Feel free to reach out for collaborations or opportunities!';

        return fallback;
    }

    /**
     * Command: download resume
     */
    function downloadResume() {
        const link = document.createElement('a');
        link.href = '/assets/docs/resume.pdf';
        link.download = 'Bijay_Koirala_Resume.pdf';
        link.click();
        return 'Downloading resume... Check your downloads folder!';
    }

    /**
     * Command: change theme
     */
    function changeTheme(args) {
        const theme = args[0];
        if (!theme) {
            return 'Usage: theme [dark|light|cyberpunk|matrix|ocean]';
        }

        if (window.ThemeManager) {
            window.ThemeManager.setTheme(theme);
            return 'Theme changed to: ' + theme;
        }
        return 'Theme manager not available';
    }

    /**
     * Command: social media
     */
    function showSocial(args) {
        const platform = args[0];

        if (portfolioData && portfolioData.social) {
            const socials = portfolioData.social;

            if (platform && socials[platform]) {
                window.open(socials[platform], '_blank');
                return 'Opening ' + platform + '...';
            }

            return Object.entries(socials)
                .map(([name, url]) => name + ': ' + url)
                .join('\n');
        }

        // Fallback
        const socials = {
            github: 'https://github.com/bijay085',
            linkedin: 'https://linkedin.com/in/bijay-koirala',
            whatsapp: 'https://wa.me/9746665541',
            discord: 'https://discord.com/users/1346023819810443336',
            telegram: 'https://t.me/flamemodparadise'
        };

        if (platform && socials[platform]) {
            window.open(socials[platform], '_blank');
            return 'Opening ' + platform + '...';
        }

        return Object.entries(socials)
            .map(([name, url]) => name + ': ' + url)
            .join('\n');
    }

    /**
     * Command: education
     */
    function showEducation() {
        if (portfolioData) {
            let output = 'EDUCATION:\n\n';

            portfolioData.education.forEach(edu => {
                output += '🎓 ' + edu.degree + '\n';
                output += '   ' + edu.institution + '\n';
                output += '   ' + edu.period + ' (' + edu.status + ')\n';
                output += '   Focus: ' + edu.focus + '\n\n';
            });

            if (portfolioData.certifications.length > 0) {
                output += '📜 Certifications:\n';
                portfolioData.certifications.forEach(cert => {
                    output += '   • ' + cert.name + ' (' + cert.issuer + ', ' + cert.date + ')\n';
                });
            }

            return output.trim();
        }

        // Fallback
        const fallback = 'EDUCATION:\n\n' +
            '🎓 Bachelor in Computer Application\n' +
            '   Nepal Mega College\n' +
            '   2021 - 2026 (Pursuing)\n' +
            '   Focus: Application Development\n\n' +
            '📜 Certifications:\n' +
            '   • Python Programming (Coursera, 2023)\n' +
            '   • Data Analysis Beginner (Coursera, 2024)';

        return fallback;
    }

    /**
     * Command: experience
     */
    function showExperience() {
        if (portfolioData) {
            let output = 'WORK EXPERIENCE:\n\n';

            portfolioData.experience.forEach(exp => {
                output += '💼 ' + exp.title + ' @ ' + exp.company + '\n';
                output += '   ' + exp.period + '\n';
                output += '   ' + exp.description + '\n';
                exp.achievements.forEach(ach => {
                    output += '   • ' + ach + '\n';
                });
                output += '\n';
            });

            const stats = portfolioData.stats;
            output += '📊 STATISTICS:\n';
            output += '   • Projects Completed: ' + stats.projects_completed + '\n';
            output += '   • Clients Served: ' + stats.clients_served + '\n';
            output += '   • Revenue Earned: $' + stats.revenue_earned + '+\n';
            output += '   • Experience: ' + stats.months_experience + ' months\n';
            output += '   • Response Time: ' + stats.response_time + '\n';

            return output.trim();
        }

        // Fallback
        const fallback = 'WORK EXPERIENCE:\n\n' +
            '💼 Freelance Developer (2024 - Present)\n' +
            '   • Building automation tools and web scraping solutions\n' +
            '   • Developed 18+ projects for clients\n' +
            '   • Earned $200+ in revenue\n' +
            '   • Created Python tools and scripts per client requirements\n\n' +
            '🔧 Skills Developed:\n' +
            '   • Python automation & scripting\n' +
            '   • Web scraping at scale\n' +
            '   • Bot development & deployment\n' +
            '   • API design & integration';

        return fallback;
    }

    /**
     * Command: reload data
     */
    async function reloadData() {
        portfolioData = null; // Clear existing data
        const loaded = await loadPortfolioData();
        if (loaded) {
            return '✅ Portfolio data reloaded successfully!\n📁 Loaded ' + Object.keys(portfolioData).length + ' sections from portfolio.json';
        }
        return '❌ Failed to reload portfolio data. Check console for errors.';
    }

    /**
     * Command: show system info
     */
    function showInfo() {
        if (portfolioData) {
            const p = portfolioData;

            let output = 'SYSTEM INFORMATION:\n\n';
            output += '📁 Data Source: /assets/data/portfolio.json\n';
            output += '✅ Status: Loaded Successfully\n\n';

            output += 'DATA SECTIONS:\n';
            output += '• Personal Info: ✓\n';
            output += '• Skills: ' + Object.keys(p.skills).length + ' categories\n';
            output += '• Projects: ' + p.projects.length + ' items\n';
            output += '• Services: ' + p.services.length + ' items\n';
            output += '• Experience: ' + p.experience.length + ' items\n';
            output += '• Education: ' + p.education.length + ' items\n';
            output += '• Certifications: ' + p.certifications.length + ' items\n';
            output += '• Social Links: ' + Object.keys(p.social).length + ' platforms\n';
            output += '• Stats: ' + Object.keys(p.stats).length + ' metrics\n\n';

            output += 'SETTINGS:\n';
            output += '• Theme: ' + p.settings.theme + '\n';
            output += '• Animations: ' + (p.settings.enable_animations ? 'Enabled' : 'Disabled') + '\n';
            output += '• Terminal: ' + (p.settings.enable_terminal ? 'Enabled' : 'Disabled') + '\n';
            output += '• Maintenance: ' + (p.settings.maintenance_mode ? 'ON' : 'OFF') + '\n\n';

            output += 'Use \'json [section]\' to view raw data';

            return output;
        }

        return 'SYSTEM INFORMATION:\n\n📁 Data Source: /assets/data/portfolio.json\n❌ Status: Not Loaded\n\nUse \'reload\' command to load portfolio data.';
    }

    /**
     * Command: show JSON sections
     */
    function showJson(args) {
        if (!portfolioData) {
            return 'Portfolio data not loaded. Use "reload" to load data.';
        }

        const section = args[0];

        if (section) {
            if (portfolioData[section]) {
                return 'Section: ' + section + '\n' + JSON.stringify(portfolioData[section], null, 2);
            }
            return 'Section not found. Available: ' + Object.keys(portfolioData).join(', ');
        }

        return 'Available sections: ' + Object.keys(portfolioData).join(', ') + '\nUsage: json [section]';
    }

    /**
     * Command: matrix rain effect
     */
    function matrixRain() {
        const chars = '01';
        let matrix = '';
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 50; j++) {
                matrix += chars[Math.floor(Math.random() * chars.length)];
            }
            matrix += '\n';
        }

        if (window.ThemeManager) {
            window.ThemeManager.setTheme('matrix');
        }

        return matrix + '\nYou are in the Matrix now...';
    }

    /**
     * Command: tell joke
     */
    function tellJoke() {
        const jokes = [
            'Why do programmers prefer dark mode?\nBecause light attracts bugs! 🐛',
            'Why do Python programmers wear glasses?\nBecause they can\'t C! 👓',
            'How many programmers does it take to change a light bulb?\nNone. It\'s a hardware problem! 💡',
            'Why did the programmer quit his job?\nBecause he didn\'t get arrays! 📊',
            'What\'s a programmer\'s favorite hangout place?\nThe Foo Bar! 🍺',
            'Why do programmers always mix up Halloween and Christmas?\nBecause Oct 31 == Dec 25! 🎃',
            '!false\nIt\'s funny because it\'s true! 😄'
        ];

        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    /**
     * Command: show quote
     */
    function showQuote() {
        const quotes = [
            '"Talk is cheap. Show me the code." - Linus Torvalds',
            '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." - Martin Fowler',
            '"First, solve the problem. Then, write the code." - John Johnson',
            '"Programming isn\'t about what you know; it\'s about what you can figure out." - Chris Pine',
            '"The only way to learn a new programming language is by writing programs in it." - Dennis Ritchie',
            '"Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday\'s code." - Dan Salomon'
        ];

        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    /**
     * Command: show weather (mock)
     */
    async function showWeather(args) {
        const city = args.join(' ') || 'Kathmandu';
        return 'Weather in ' + city + ':\n🌡️  Temperature: 22°C\n☁️  Condition: Partly Cloudy\n💨  Wind: 10 km/h\n💧  Humidity: 65%';
    }

    /**
     * Command: list directory
     */
    function listDirectory() {
        const jsonStatus = portfolioData ? '8192' : '0';

        let output = 'total 8\n';
        output += 'drwxr-xr-x  2 bijay bijay 4096 Mar 15 10:00 about/\n';
        output += 'drwxr-xr-x  3 bijay bijay 4096 Mar 15 10:00 projects/\n';
        output += 'drwxr-xr-x  2 bijay bijay 4096 Mar 15 10:00 skills/\n';
        output += 'drwxr-xr-x  2 bijay bijay 4096 Mar 15 10:00 contact/\n';
        output += 'drwxr-xr-x  2 bijay bijay 4096 Mar 15 10:00 assets/\n';
        output += '-rw-r--r--  1 bijay bijay ' + jsonStatus + ' Mar 15 10:00 portfolio.json\n';
        output += '-rw-r--r--  1 bijay bijay 2048 Mar 15 10:00 resume.pdf\n';
        output += '-rw-r--r--  1 bijay bijay 1024 Mar 15 10:00 README.md\n';
        output += '-rwxr-xr-x  1 bijay bijay  512 Mar 15 10:00 terminal.js';

        return output;
    }

    /**
     * Command: cat file
     */
    function catFile(args) {
        const file = args[0];

        const files = {
            'readme.md': 'Welcome to my portfolio! Built with vanilla JS and lots of coffee ☕',
            'skills.txt': portfolioData ?
                'Skills loaded from portfolio.json. Use "skills" command to view.' :
                'Python, JavaScript, Web Scraping, Automation, Bot Development',
            'contact.txt': portfolioData ?
                'Email: ' + portfolioData.personal.email + '\nPhone: ' + portfolioData.personal.phone :
                'Email: bijaykoirala003@gmail.com\nPhone: +9746665541',
            'portfolio.json': portfolioData ?
                'Portfolio data loaded! ' + Object.keys(portfolioData).length + ' sections available.' :
                'Portfolio data not loaded. Use "reload" command to load it.'
        };

        if (!file) {
            return 'Usage: cat [filename]';
        }

        return files[file.toLowerCase()] || 'cat: ' + file + ': No such file or directory';
    }

    /**
     * Command: show history
     */
    function showHistory() {
        if (commandHistory.length === 0) {
            return 'No command history';
        }

        return commandHistory
            .map((cmd, i) => (i + 1).toString().padStart(4) + '  ' + cmd)
            .join('\n');
    }

    /**
     * Command: exit terminal
     */
    function exitTerminal() {
        addLine('Goodbye! Thanks for visiting! 👋', 'success');
        setTimeout(() => {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 1000);
        return '';
    }

    /**
     * Clear terminal
     */
    function clearTerminal() {
        if (elements.output) {
            elements.output.innerHTML = '';
        }
        return '';
    }

    /**
     * Navigate command history
     */
    function navigateHistory(direction) {
        if (commandHistory.length === 0) return;

        historyIndex += direction;

        if (historyIndex < 0) {
            historyIndex = 0;
        } else if (historyIndex >= commandHistory.length) {
            historyIndex = commandHistory.length;
            elements.input.value = currentInput;
            return;
        }

        elements.input.value = commandHistory[historyIndex];
    }

    /**
     * Autocomplete command
     */
    function autocomplete() {
        const input = elements.input.value.toLowerCase();
        if (!input) return;

        const matches = Object.keys(COMMANDS).filter(cmd =>
            cmd.startsWith(input)
        );

        if (matches.length === 1) {
            elements.input.value = matches[0];
        } else if (matches.length > 1) {
            addLine(CONFIG.prompt + ' ' + input, 'command');
            addLine(matches.join('  '), 'info');
        }
    }

    /**
     * Cancel current command
     */
    function cancelCommand() {
        elements.input.value = '';
        currentInput = '';
        addLine(CONFIG.prompt + ' ^C', 'command');
    }

    /**
     * Add line to output
     */
    function addLine(text, className) {
        if (!elements.output) return;

        const line = document.createElement('div');
        line.className = 'terminal-line ' + (className || '');
        line.innerHTML = text.replace(/\n/g, '<br>');
        elements.output.appendChild(line);

        // Don't force scroll, just call scrollToBottom which checks if near bottom
        scrollToBottom();
    }

    /**
     * Type output with animation
     */
    function typeOutput(text, className) {
        if (!text) return;

        const line = document.createElement('div');
        line.className = 'terminal-line ' + (className || '');
        elements.output.appendChild(line);

        // Track scroll state
        let lastScrollTop = elements.terminal ? elements.terminal.scrollTop : 0;
        let userHasScrolled = false;

        let index = 0;
        const typeChar = () => {
            if (index < text.length) {
                if (text[index] === '\n') {
                    line.innerHTML += '<br>';
                } else {
                    line.innerHTML += text[index];
                }
                index++;

                // Check if user manually scrolled (more than 5px difference)
                if (elements.terminal && Math.abs(elements.terminal.scrollTop - lastScrollTop) > 5) {
                    userHasScrolled = true;
                }

                // Only auto-scroll if user hasn't manually scrolled
                if (!userHasScrolled && elements.terminal) {
                    const isNearBottom = elements.terminal.scrollHeight - elements.terminal.scrollTop - elements.terminal.clientHeight < 100;
                    if (isNearBottom) {
                        elements.terminal.scrollTop = elements.terminal.scrollHeight;
                        lastScrollTop = elements.terminal.scrollTop;
                    }
                }

                setTimeout(typeChar, CONFIG.typingSpeed);
            }
        };

        typeChar();
    }

    /**
     * Scroll to bottom of terminal (only if already near bottom)
     */
    function scrollToBottom() {
        if (elements.terminal) {
            // Check if user is near the bottom (within 100px)
            const isNearBottom = elements.terminal.scrollHeight - elements.terminal.scrollTop - elements.terminal.clientHeight < 100;

            // Only auto-scroll if user is already near the bottom
            if (isNearBottom) {
                elements.terminal.scrollTop = elements.terminal.scrollHeight;
            }
        }
    }

    /**
     * Focus input
     */
    function focusInput() {
        if (elements.input) {
            elements.input.focus();
        }
    }

    /**
     * Public API
     */
    window.TerminalManager = {
        init: init,
        execute: processCommand,
        clear: clearTerminal,
        addLine: addLine,
        typeOutput: typeOutput,
        getHistory: () => commandHistory,
        addCommand: (name, handler) => {
            COMMANDS[name] = {
                description: 'Custom command',
                usage: name,
                execute: handler
            };
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();