/**
 * INTERACTIVE TERMINAL
 * File: /htdocs/assets/js/terminal.js
 * Handles terminal emulation and commands
 */

(function() {
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
            execute: () => 'visitor@bijaykoirala.com.np'
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
        'emacs': () => 'A great operating system, lacking only a decent editor 😏'
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

    /**
     * Initialize terminal
     */
    function init() {
        // Cache elements
        cacheElements();
        
        if (!elements.terminal) {
            console.warn('Terminal elements not found');
            return;
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Show welcome message
        showWelcome();
        
        // Focus input
        focusInput();
        
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
            // Create output element if not exists
            elements.output = document.createElement('div');
            elements.output.id = 'terminalOutput';
            elements.output.className = 'terminal-output';
            elements.terminal.insertBefore(elements.output, elements.terminal.firstChild);
        }
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        if (!elements.input) return;
        
        // Input events
        elements.input.addEventListener('keydown', handleKeyDown);
        elements.input.addEventListener('input', handleInput);
        
        // Click to focus
        if (elements.terminal) {
            elements.terminal.addEventListener('click', focusInput);
        }
        
        // Prevent form submission if in form
        const form = elements.input.closest('form');
        if (form) {
            form.addEventListener('submit', (e) => e.preventDefault());
        }
    }

    /**
     * Handle keydown events
     */
    function handleKeyDown(e) {
        switch(e.key) {
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
        
        // Add to output
        addLine(`${CONFIG.prompt} ${input}`, 'command');
        
        // Add to history
        if (input && input !== commandHistory[commandHistory.length - 1]) {
            commandHistory.push(input);
            if (commandHistory.length > CONFIG.maxHistory) {
                commandHistory.shift();
            }
        }
        historyIndex = commandHistory.length;
        
        // Parse and execute command
        const [cmd, ...args] = input.toLowerCase().split(' ');
        
        // Check for easter eggs first
        if (EASTER_EGGS[input.toLowerCase()]) {
            typeOutput(EASTER_EGGS[input.toLowerCase()]());
        }
        // Check for valid command
        else if (COMMANDS[cmd]) {
            const result = COMMANDS[cmd].execute(args);
            if (result instanceof Promise) {
                result.then(output => typeOutput(output))
                      .catch(error => typeOutput(`Error: ${error.message}`, 'error'));
            } else {
                typeOutput(result);
            }
        }
        // Unknown command
        else {
            typeOutput(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error');
        }
        
        // Clear input
        elements.input.value = '';
        currentInput = '';
        
        // Scroll to bottom
        scrollToBottom();
        
        setTimeout(() => {
            isProcessing = false;
        }, CONFIG.commandDelay);
    }

    /**
     * Show welcome message
     */
    function showWelcome() {
        const welcome = `
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     Welcome to Bijay's Interactive Terminal v1.0.0            ║
║                                                                ║
║     Type 'help' to see available commands                     ║
║     Type 'about' to learn more about me                       ║
║     Type 'projects' to see my work                           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
        `.trim();
        
        addLine(welcome, 'ascii');
    }

    /**
     * Command: help
     */
    function showHelp(args) {
        if (args.length > 0) {
            const cmd = args[0];
            if (COMMANDS[cmd]) {
                return `
${cmd} - ${COMMANDS[cmd].description}
Usage: ${COMMANDS[cmd].usage}
                `.trim();
            }
            return `No help available for '${cmd}'`;
        }
        
        let help = 'Available commands:\n\n';
        for (const [cmd, info] of Object.entries(COMMANDS)) {
            help += `  ${cmd.padEnd(12)} - ${info.description}\n`;
        }
        help += '\nTip: Use arrow keys to navigate command history';
        return help;
    }

    /**
     * Command: about
     */
    function showAbout() {
        return `
╔═══════════════════════════════════════════════════════════════╗
║                         ABOUT ME                              ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Name:       Bijay Koirala                                   ║
║  Location:   Nepal 🇳🇵                                        ║
║  Role:       Python Developer & Automation Expert            ║
║                                                               ║
║  I'm a passionate developer who loves building automation    ║
║  tools that make life easier. From web scraping to bot      ║
║  development, I turn repetitive tasks into efficient         ║
║  automated solutions.                                        ║
║                                                               ║
║  Specialties:                                                ║
║  • Web Scraping & Data Extraction                           ║
║  • Browser Automation with Selenium                         ║
║  • Discord & Telegram Bot Development                       ║
║  • API Development & Integration                            ║
║  • Process Automation & Optimization                        ║
║                                                               ║
║  Fun Facts:                                                  ║
║  • Can sleep 48 hours if possible 😴                        ║
║  • Anime enthusiast 🎌                                      ║
║  • Coffee-powered coder ☕                                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
        `.trim();
    }

    /**
     * Command: skills
     */
    function showSkills(args) {
        const category = args[0];
        
        const skills = {
            languages: ['Python (90%)', 'JavaScript (75%)', 'PHP (60%)', 'HTML/CSS (85%)'],
            automation: ['Selenium (95%)', 'BeautifulSoup (90%)', 'Scrapy (70%)', 'Playwright (65%)'],
            tools: ['Git (80%)', 'Docker (55%)', 'MySQL (70%)', 'MongoDB (65%)'],
            frameworks: ['Flask (75%)', 'FastAPI (70%)', 'Django (60%)', 'React (65%)']
        };
        
        if (category && skills[category]) {
            return `${category.toUpperCase()}:\n${skills[category].map(s => `  • ${s}`).join('\n')}`;
        }
        
        let output = 'TECHNICAL SKILLS:\n\n';
        for (const [cat, items] of Object.entries(skills)) {
            output += `${cat.toUpperCase()}:\n`;
            output += items.map(s => `  • ${s}`).join('\n');
            output += '\n\n';
        }
        return output.trim();
    }

    /**
     * Command: projects
     */
    function showProjects(args) {
        const filter = args[0];
        
        const projects = [
            { name: 'Netflix Automation Suite', type: 'automation', status: 'completed' },
            { name: 'ChatGPT Discord Bot', type: 'bot', status: 'active' },
            { name: 'E-commerce Price Tracker', type: 'scraping', status: 'completed' },
            { name: 'LinkedIn Job Scraper', type: 'scraping', status: 'completed' },
            { name: 'Telegram Trading Bot', type: 'bot', status: 'active' }
        ];
        
        let filtered = projects;
        if (filter) {
            filtered = projects.filter(p => p.type === filter);
        }
        
        if (filtered.length === 0) {
            return 'No projects found with that filter.';
        }
        
        let output = 'PROJECTS:\n\n';
        filtered.forEach(p => {
            output += `📁 ${p.name}\n`;
            output += `   Type: ${p.type} | Status: ${p.status}\n\n`;
        });
        return output.trim();
    }

    /**
     * Command: contact
     */
    function showContact() {
        return `
CONTACT INFORMATION:

📧 Email:     bijaykoirala003@gmail.com
📱 Phone:     +974 666 5541
🌐 Website:   bijaykoirala0.com.np
📍 Location:  Nepal (GMT+5:45)

SOCIAL MEDIA:
• GitHub:     github.com/bijay085
• LinkedIn:   linkedin.com/in/bijay-koirala
• WhatsApp:   wa.me/9746665541

Feel free to reach out for collaborations or opportunities!
        `.trim();
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
            return `Theme changed to: ${theme}`;
        }
        return 'Theme manager not available';
    }

    /**
     * Command: social media
     */
    function showSocial(args) {
        const platform = args[0];
        
        const socials = {
            github: 'https://github.com/bijay085',
            linkedin: 'https://linkedin.com/in/bijay-koirala',
            whatsapp: 'https://wa.me/9746665541',
            email: 'mailto:bijaykoirala003@gmail.com'
        };
        
        if (platform && socials[platform]) {
            window.open(socials[platform], '_blank');
            return `Opening ${platform}...`;
        }
        
        return Object.entries(socials)
            .map(([name, url]) => `${name}: ${url}`)
            .join('\n');
    }

    /**
     * Command: education
     */
    function showEducation() {
        return `
EDUCATION:

🎓 Bachelor's in Computer Science
   Currently Pursuing
   Focus: Data Science & Automation

📚 Self-Taught Developer
   3+ years of programming experience
   Continuous learning through online courses and projects

📜 Certifications:
   • Python Programming (Coursera)
   • Web Scraping with Python (Udemy)
   • Data Analysis with Pandas (DataCamp)
        `.trim();
    }

    /**
     * Command: experience
     */
    function showExperience() {
        return `
WORK EXPERIENCE:

💼 Freelance Developer (2022 - Present)
   • Built 15+ automation tools for clients
   • Developed web scraping solutions for e-commerce
   • Created Discord/Telegram bots for communities

🚀 Personal Projects (2021 - Present)
   • Netflix Automation Suite (1000+ hours saved)
   • Price tracking system for 5 e-commerce sites
   • Trading bot with 85% signal accuracy

🔧 Skills Developed:
   • Python automation & scripting
   • Web scraping at scale
   • Bot development & deployment
   • API design & integration
        `.trim();
    }

    /**
     * Command: matrix rain effect
     */
    function matrixRain() {
        // Simple ASCII matrix effect
        const chars = '01';
        let matrix = '';
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 50; j++) {
                matrix += chars[Math.floor(Math.random() * chars.length)];
            }
            matrix += '\n';
        }
        
        // Change theme to matrix if available
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
        // Mock weather data (in real app, would call weather API)
        return `
Weather in ${city}:
🌡️  Temperature: 22°C
☁️  Condition: Partly Cloudy
💨  Wind: 10 km/h
💧  Humidity: 65%
        `.trim();
    }

    /**
     * Command: list directory
     */
    function listDirectory() {
        return `
total 7
drwxr-xr-x  2 bijay bijay 4096 Mar 15 10:00 about/
drwxr-xr-x  3 bijay bijay 4096 Mar 15 10:00 projects/
drwxr-xr-x  2 bijay bijay 4096 Mar 15 10:00 skills/
drwxr-xr-x  2 bijay bijay 4096 Mar 15 10:00 contact/
-rw-r--r--  1 bijay bijay 2048 Mar 15 10:00 resume.pdf
-rw-r--r--  1 bijay bijay 1024 Mar 15 10:00 README.md
-rwxr-xr-x  1 bijay bijay  512 Mar 15 10:00 terminal.js
        `.trim();
    }

    /**
     * Command: cat file
     */
    function catFile(args) {
        const file = args[0];
        
        const files = {
            'readme.md': 'Welcome to my portfolio! This is built with vanilla JS and lots of coffee ☕',
            'skills.txt': 'Python, JavaScript, Web Scraping, Automation, Bot Development',
            'contact.txt': 'Email: bijaykoirala003@gmail.com\nPhone: +974 666 5541'
        };
        
        if (!file) {
            return 'Usage: cat [filename]';
        }
        
        return files[file.toLowerCase()] || `cat: ${file}: No such file or directory`;
    }

    /**
     * Command: show history
     */
    function showHistory() {
        if (commandHistory.length === 0) {
            return 'No command history';
        }
        
        return commandHistory
            .map((cmd, i) => `${(i + 1).toString().padStart(4)}  ${cmd}`)
            .join('\n');
    }

    /**
     * Command: exit terminal
     */
    function exitTerminal() {
        addLine('Goodbye! Thanks for visiting! 👋', 'success');
        setTimeout(() => {
            // Scroll to next section or hide terminal
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
            addLine(`${CONFIG.prompt} ${input}`, 'command');
            addLine(matches.join('  '), 'info');
        }
    }

    /**
     * Cancel current command
     */
    function cancelCommand() {
        elements.input.value = '';
        currentInput = '';
        addLine(`${CONFIG.prompt} ^C`, 'command');
    }

    /**
     * Add line to output
     */
    function addLine(text, className = '') {
        if (!elements.output) return;
        
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.innerHTML = text.replace(/\n/g, '<br>');
        elements.output.appendChild(line);
        
        scrollToBottom();
    }

    /**
     * Type output with animation
     */
    function typeOutput(text, className = '') {
        if (!text) return;
        
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        elements.output.appendChild(line);
        
        let index = 0;
        const typeChar = () => {
            if (index < text.length) {
                if (text[index] === '\n') {
                    line.innerHTML += '<br>';
                } else {
                    line.innerHTML += text[index];
                }
                index++;
                setTimeout(typeChar, CONFIG.typingSpeed);
            }
            scrollToBottom();
        };
        
        typeChar();
    }

    /**
     * Scroll to bottom of terminal
     */
    function scrollToBottom() {
        if (elements.terminal) {
            elements.terminal.scrollTop = elements.terminal.scrollHeight;
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