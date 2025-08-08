/* File: terminal.js */
/* Location: /htdocs/assets/js/terminal.js */

// ===============================================
// INTERACTIVE TERMINAL FUNCTIONALITY
// ===============================================

(function() {
    'use strict';
    
    // Terminal Elements
    const terminalInput = document.getElementById('terminal-input');
    const terminalContent = document.getElementById('terminal-content');
    const terminalBody = document.getElementById('terminal-body');
    
    if (!terminalInput || !terminalContent) {
        console.log('Terminal elements not found');
        return;
    }
    
    // Command History
    let commandHistory = [];
    let historyIndex = -1;
    
    // ASCII Art
    const ASCII_ART = {
        logo: `
        ____  _  _               
        |  _ \\(_)(_) __ _ _   _   
        | |_) | || |/ _\` | | | |  
        |  _ <| || | (_| | |_| |  
        |___|/ |\\__,_|\\__, |  
                |__/        |___/   
        `,
        welcome: `
╔══════════════════════════════════════╗
║   Welcome to Bijay's Portfolio CLI   ║
╚══════════════════════════════════════╝
        `
    };
    
    // Commands Database
    const COMMANDS = {
        help: {
            description: 'Show available commands',
            usage: 'help',
            execute: () => {
                const commands = [
                    { cmd: 'about', desc: 'Learn about me' },
                    { cmd: 'skills', desc: 'List my technical skills' },
                    { cmd: 'projects', desc: 'View my projects' },
                    { cmd: 'contact', desc: 'Get my contact information' },
                    { cmd: 'social', desc: 'Find me on social media' },
                    { cmd: 'resume', desc: 'Download my resume' },
                    { cmd: 'education', desc: 'View my education' },
                    { cmd: 'experience', desc: 'View my experience' },
                    { cmd: 'clear', desc: 'Clear the terminal' },
                    { cmd: 'theme', desc: 'Toggle dark/light theme' },
                    { cmd: 'date', desc: 'Show current date and time' },
                    { cmd: 'whoami', desc: 'Display current user' },
                    { cmd: 'pwd', desc: 'Print working directory' },
                    { cmd: 'ls', desc: 'List available sections' },
                    { cmd: 'matrix', desc: 'Enter the matrix' },
                    { cmd: 'snake', desc: 'Play snake game' },
                    { cmd: 'joke', desc: 'Tell me a programming joke' },
                    { cmd: 'quote', desc: 'Get an inspirational quote' },
                    { cmd: 'exit', desc: 'Close terminal' }
                ];
                
                let output = '<div class="terminal-line terminal-info">Available Commands:</div>';
                output += '<div class="terminal-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>';
                
                commands.forEach(cmd => {
                    output += `<div class="terminal-line">  <span class="terminal-success">${cmd.cmd.padEnd(12)}</span> - ${cmd.desc}</div>`;
                });
                
                output += '<div class="terminal-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>';
                output += '<div class="terminal-line terminal-comment">Tip: Use arrow keys for command history</div>';
                
                return output;
            }
        },
        
        about: {
            description: 'Learn about me',
            execute: () => {
                return `
                    <div class="terminal-line terminal-info">About Me:</div>
                    <div class="terminal-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    <div class="terminal-line">Name: <span class="terminal-success">Bijay</span></div>
                    <div class="terminal-line">Role: <span class="terminal-success">Web Developer & Programmer</span></div>
                    <div class="terminal-line">Location: <span class="terminal-success">Your Location</span></div>
                    <div class="terminal-line">Passion: <span class="terminal-success">Building cool stuff with code</span></div>
                    <div class="terminal-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    <div class="terminal-line terminal-comment">I love creating web experiences and solving problems through code!</div>
                `;
            }
        },
        
        skills: {
            description: 'List my technical skills',
            execute: () => {
                const skills = {
                    'Languages': ['HTML', 'CSS', 'JavaScript', 'Python', 'Java'],
                    'Tools': ['Git', 'GitHub', 'VS Code', 'Command Line'],
                    'Learning': ['React', 'Node.js', 'MongoDB']
                };
                
                let output = '<div class="terminal-line terminal-info">Technical Skills:</div>';
                output += '<div class="terminal-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>';
                
                for (const [category, items] of Object.entries(skills)) {
                    output += `<div class="terminal-line"><span class="terminal-success">${category}:</span></div>`;
                    items.forEach(item => {
                        output += `<div class="terminal-line terminal-output">• ${item}</div>`;
                    });
                }
                
                return output;
            }
        },
        
        projects: {
            description: 'View my projects',
            execute: () => {
                const projects = [
                    { name: 'E-Commerce Website', tech: 'HTML, CSS, JS', link: 'github.com/bijay085' },
                    { name: 'Task Manager App', tech: 'Python, Tkinter', link: 'github.com/bijay085' },
                    { name: 'Weather Dashboard', tech: 'JavaScript, API', link: 'github.com/bijay085' },
                    { name: 'Calculator', tech: 'Java, Swing', link: 'github.com/bijay085' }
                ];
                
                let output = '<div class="terminal-line terminal-info">My Projects:</div>';
                output += '<div class="terminal-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>';
                
                projects.forEach((project, index) => {
                    output += `<div class="terminal-line">${index + 1}. <span class="terminal-success">${project.name}</span></div>`;
                    output += `<div class="terminal-line terminal-output">   Tech: ${project.tech}</div>`;
                    output += `<div class="terminal-line terminal-output">   Link: ${project.link}</div>`;
                });
                
                return output;
            }
        },
        
        contact: {
            description: 'Get my contact information',
            execute: () => {
                return `
                    <div class="terminal-line terminal-info">Contact Information:</div>
                    <div class="terminal-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    <div class="terminal-line">📧 Email: <span class="terminal-success">your.email@example.com</span></div>
                    <div class="terminal-line">📱 Phone: <span class="terminal-success">+123 456 7890</span></div>
                    <div class="terminal-line">🌍 Location: <span class="terminal-success">Your City, Country</span></div>
                    <div class="terminal-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    <div class="terminal-line terminal-comment">Feel free to reach out!</div>
                `;
            }
        },
        
        social: {
            description: 'Find me on social media',
            execute: () => {
                return `
                    <div class="terminal-line terminal-info">Social Media:</div>
                    <div class="terminal-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    <div class="terminal-line">GitHub: <span class="terminal-success">github.com/bijay085</span></div>
                    <div class="terminal-line">LinkedIn: <span class="terminal-success">linkedin.com/in/yourprofile</span></div>
                    <div class="terminal-line">Twitter: <span class="terminal-success">twitter.com/yourprofile</span></div>
                    <div class="terminal-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                `;
            }
        },
        
        resume: {
            description: 'Download my resume',
            execute: () => {
                window.open('assets/resume/resume.pdf', '_blank');
                return '<div class="terminal-line terminal-success">✓ Resume download started...</div>';
            }
        },
        
        education: {
            description: 'View my education',
            execute: () => {
                return `
                    <div class="terminal-line terminal-info">Education:</div>
                    <div class="terminal-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    <div class="terminal-line"><span class="terminal-success">Your Degree</span></div>
                    <div class="terminal-line terminal-output">Your University</div>
                    <div class="terminal-line terminal-output">Year: 2020 - 2024</div>
                    <div class="terminal-line terminal-output">GPA: X.XX</div>
                    <div class="terminal-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                `;
            }
        },
        
        experience: {
            description: 'View my experience',
            execute: () => {
                return `
                    <div class="terminal-line terminal-info">Experience:</div>
                    <div class="terminal-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    <div class="terminal-line terminal-success">Freelance Projects</div>
                    <div class="terminal-line terminal-output">• Built responsive websites</div>
                    <div class="terminal-line terminal-output">• Created Python automation scripts</div>
                    <div class="terminal-line terminal-output">• Developed web applications</div>
                    <div class="terminal-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                `;
            }
        },
        
        clear: {
            description: 'Clear the terminal',
            execute: () => {
                terminalContent.innerHTML = '';
                return null;
            }
        },
        
        theme: {
            description: 'Toggle dark/light theme',
            execute: () => {
                document.body.classList.toggle('light-theme');
                const isLight = document.body.classList.contains('light-theme');
                localStorage.setItem('theme', isLight ? 'light-theme' : '');
                return `<div class="terminal-line terminal-success">Theme switched to ${isLight ? 'light' : 'dark'} mode</div>`;
            }
        },
        
        date: {
            description: 'Show current date and time',
            execute: () => {
                const now = new Date();
                return `<div class="terminal-line terminal-info">${now.toString()}</div>`;
            }
        },
        
        whoami: {
            description: 'Display current user',
            execute: () => {
                return '<div class="terminal-line terminal-success">visitor@bijay-portfolio</div>';
            }
        },
        
        pwd: {
            description: 'Print working directory',
            execute: () => {
                return '<div class="terminal-line terminal-info">/home/bijay/portfolio</div>';
            }
        },
        
        ls: {
            description: 'List available sections',
            execute: () => {
                const sections = ['about/', 'skills/', 'projects/', 'contact/', 'resume.pdf'];
                let output = '<div class="terminal-line">';
                sections.forEach(section => {
                    const isDir = section.endsWith('/');
                    output += `<span class="${isDir ? 'terminal-info' : 'terminal-success'}">${section}</span>  `;
                });
                output += '</div>';
                return output;
            }
        },
        
        matrix: {
            description: 'Enter the matrix',
            execute: () => {
                createMatrixEffect();
                return '<div class="terminal-line terminal-success">Entering the Matrix... Press any key to exit.</div>';
            }
        },
        
        joke: {
            description: 'Tell me a programming joke',
            execute: () => {
                const jokes = [
                    'Why do programmers prefer dark mode? Because light attracts bugs!',
                    'How many programmers does it take to change a light bulb? None. It\'s a hardware problem.',
                    'Why do Java developers wear glasses? Because they don\'t C#!',
                    'What\'s a programmer\'s favorite hangout place? Foo Bar!',
                    'Why did the programmer quit his job? Because he didn\'t get arrays!',
                    '!false - It\'s funny because it\'s true',
                    'Why do programmers always mix up Halloween and Christmas? Because Oct 31 == Dec 25!'
                ];
                const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
                return `<div class="terminal-line terminal-warning">😄 ${randomJoke}</div>`;
            }
        },
        
        quote: {
            description: 'Get an inspirational quote',
            execute: () => {
                const quotes = [
                    '"The only way to do great work is to love what you do." - Steve Jobs',
                    '"Code is like humor. When you have to explain it, it\'s bad." - Cory House',
                    '"First, solve the problem. Then, write the code." - John Johnson',
                    '"Programming isn\'t about what you know; it\'s about what you can figure out." - Chris Pine',
                    '"The best error message is the one that never shows up." - Thomas Fuchs'
                ];
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                return `<div class="terminal-line terminal-info">💡 ${randomQuote}</div>`;
            }
        },
        
        exit: {
            description: 'Close terminal',
            execute: () => {
                const terminal = document.querySelector('.terminal-section');
                terminal.style.display = 'none';
                return null;
            }
        }
    };
    
    // Initialize Terminal
    function initTerminal() {
        // Focus on input when clicking terminal
        terminalBody.addEventListener('click', () => {
            terminalInput.focus();
        });
        
        // Handle input
        terminalInput.addEventListener('keydown', handleInput);
    }
    
    // Handle Input Events
    function handleInput(e) {
        if (e.key === 'Enter') {
            processCommand();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateHistory(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateHistory(1);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            autocomplete();
        }
    }
    
    // Process Command
    function processCommand() {
        const input = terminalInput.value.trim();
        
        if (!input) return;
        
        // Add command to history
        commandHistory.push(input);
        historyIndex = commandHistory.length;
        
        // Display command in terminal
        addLine(`bijay@portfolio:~$ ${input}`, 'terminal-command');
        
        // Parse and execute command
        const [cmd, ...args] = input.toLowerCase().split(' ');
        
        if (COMMANDS[cmd]) {
            const output = COMMANDS[cmd].execute(args);
            if (output) {
                terminalContent.innerHTML += output;
            }
        } else if (input === '') {
            // Empty command, do nothing
        } else {
            addLine(`Command not found: ${cmd}. Type 'help' for available commands.`, 'terminal-error');
        }
        
        // Clear input
        terminalInput.value = '';
        
        // Scroll to bottom
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
    
    // Add Line to Terminal
    function addLine(text, className = '') {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.innerHTML = text;
        terminalContent.appendChild(line);
    }
    
    // Navigate Command History
    function navigateHistory(direction) {
        if (commandHistory.length === 0) return;
        
        historyIndex += direction;
        
        if (historyIndex < 0) {
            historyIndex = 0;
        } else if (historyIndex >= commandHistory.length) {
            historyIndex = commandHistory.length;
            terminalInput.value = '';
            return;
        }
        
        terminalInput.value = commandHistory[historyIndex];
    }
    
    // Autocomplete Command
    function autocomplete() {
        const input = terminalInput.value.toLowerCase();
        if (!input) return;
        
        const matches = Object.keys(COMMANDS).filter(cmd => cmd.startsWith(input));
        
        if (matches.length === 1) {
            terminalInput.value = matches[0];
        } else if (matches.length > 1) {
            addLine(`Suggestions: ${matches.join(', ')}`, 'terminal-info');
        }
    }
    
    // Matrix Effect
    function createMatrixEffect() {
        const matrix = document.createElement('div');
        matrix.id = 'matrix-effect';
        matrix.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: black;
            z-index: 9999;
            overflow: hidden;
        `;
        
        document.body.appendChild(matrix);
        
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        matrix.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const chars = '01'.split('');
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = [];
        
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }
        
        function drawMatrix() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        
        const matrixInterval = setInterval(drawMatrix, 35);
        
        // Exit on any key press
        const exitMatrix = (e) => {
            clearInterval(matrixInterval);
            matrix.remove();
            document.removeEventListener('keydown', exitMatrix);
        };
        
        setTimeout(() => {
            document.addEventListener('keydown', exitMatrix);
        }, 100);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTerminal);
    } else {
        initTerminal();
    }
    
})();