/**
 * PROJECTS SECTION MANAGEMENT
 * File: /htdocs/assets/js/projects.js
 * Handles project display, filtering, and modal views
 */

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        projectsPerLoad: 6,
        animationDelay: 100,
        enableFiltering: true,
        enableModal: true,
        enableLazyLoad: true,
        imageLoadTimeout: 5000
    };

    // Projects data - Updated to match your GitHub
    const PROJECTS_DATA = [
        {
            id: 1,
            title: 'API/Web Scraping Suite',
            category: 'automation',
            description: '15+ Private automation tools for Netflix, Outlook, ChatGPT and more.',
            longDescription: 'A comprehensive suite of 15+ automation tools for various platforms including Netflix, Outlook, ChatGPT integration. These private tools automate repetitive tasks and save countless hours.',
            technologies: ['Python', 'Requests', 'Selenium', 'API'],
            image: '/assets/images/projects/api-suite.jpg',
            github: null,
            demo: null,
            featured: true,
            date: '2024-01',
            status: 'private'
        },
        {
            id: 2,
            title: 'ChatGPT Discord Bot',
            category: 'bot',
            description: 'Intelligent Discord bot powered by ChatGPT API for community engagement and moderation.',
            longDescription: 'Advanced Discord bot that integrates ChatGPT API to provide intelligent responses, moderate content, answer questions, and engage with community members. Features custom commands and learning capabilities.',
            technologies: ['Python', 'Discord.py', 'OpenAI API', 'PostgreSQL'],
            image: '/assets/images/projects/chatgpt-bot.jpg',
            github: 'https://github.com/bijay085',
            demo: 'https://discord.gg/example',
            featured: true,
            date: '2024-02',
            status: 'active'
        },
        {
            id: 3,
            title: 'E-commerce Price Tracker',
            category: 'scraping',
            description: 'Real-time price monitoring across multiple e-commerce platforms with alert system.',
            longDescription: 'Automated web scraper that monitors product prices across Amazon, eBay, and other platforms. Sends email/SMS alerts when prices drop below threshold. Includes historical price charts and analytics.',
            technologies: ['Python', 'BeautifulSoup', 'Scrapy', 'Redis'],
            image: '/assets/images/projects/price-tracker.jpg',
            github: 'https://github.com/bijay085',
            demo: null,
            featured: false,
            date: '2023-11',
            status: 'completed'
        },
        {
            id: 4,
            title: 'LinkedIn Job Scraper',
            category: 'scraping',
            description: 'Automated job listing scraper with filtering and application tracking features.',
            longDescription: 'Scrapes LinkedIn job postings based on keywords, location, and filters. Automatically tracks applications, saves job descriptions, and provides analytics on job market trends.',
            technologies: ['Python', 'Selenium', 'Pandas', 'SQLite'],
            image: '/assets/images/projects/job-scraper.jpg',
            github: 'https://github.com/bijay085',
            demo: null,
            featured: false,
            date: '2023-10',
            status: 'completed'
        },
        {
            id: 5,
            title: 'Telegram Trading Bot',
            category: 'bot',
            description: 'Cryptocurrency trading signals bot with real-time alerts and portfolio tracking.',
            longDescription: 'Telegram bot that provides cryptocurrency trading signals, price alerts, portfolio tracking, and market analysis. Integrates with multiple exchanges via APIs.',
            technologies: ['Python', 'python-telegram-bot', 'ccxt', 'TradingView'],
            image: '/assets/images/projects/trading-bot.jpg',
            github: 'https://github.com/bijay085',
            demo: null,
            featured: true,
            date: '2024-01',
            status: 'active'
        },
        {
            id: 6,
            title: 'Portfolio Website',
            category: 'web',
            description: 'Modern, responsive portfolio website with dark mode and animations.',
            longDescription: 'This portfolio website you are viewing! Built with vanilla JavaScript, CSS3 animations, and optimized for performance. Features dark/light themes and smooth scrolling.',
            technologies: ['HTML5', 'CSS3', 'JavaScript', 'PHP'],
            image: '/assets/images/projects/portfolio.jpg',
            github: 'https://github.com/bijay085/portfolio',
            demo: 'https://bijaykoirala0.com.np',
            featured: true,
            date: '2024-03',
            status: 'active'
        },
        {
            id: 7,
            title: 'Instagram Analytics Tool',
            category: 'automation',
            description: 'Comprehensive Instagram analytics and automation tool for content creators.',
            longDescription: 'Analyzes Instagram profiles, tracks follower growth, engagement rates, and optimal posting times. Includes automated posting and hashtag research features.',
            technologies: ['Python', 'Instagrapi', 'FastAPI', 'React'],
            image: '/assets/images/projects/instagram-tool.jpg',
            github: 'https://github.com/bijay085',
            demo: null,
            featured: false,
            date: '2023-12',
            status: 'completed'
        },
        {
            id: 8,
            title: 'WhatsApp Bulk Sender',
            category: 'automation',
            description: 'Automated WhatsApp message sender for marketing and notifications.',
            longDescription: 'Sends bulk WhatsApp messages with personalization, media attachments, and scheduling. Includes contact management and delivery tracking.',
            technologies: ['Python', 'Selenium', 'Flask', 'SQLite'],
            image: '/assets/images/projects/whatsapp-sender.jpg',
            github: null,
            demo: null,
            featured: false,
            date: '2023-09',
            status: 'private'
        }
    ];

    // Cache DOM elements
    const elements = {
        projectsGrid: null,
        filterButtons: [],
        loadMoreBtn: null,
        projectModal: null,
        searchInput: null
    };

    // State management
    let currentFilter = 'all';
    let displayedProjects = 0;
    let filteredProjects = [...PROJECTS_DATA];
    let isLoading = false;

    /**
     * Try to load projects from JSON file
     */
    async function loadProjectsFromJSON() {
        try {
            const response = await fetch('/assets/data/portfolio.json');
            if (response.ok) {
                const data = await response.json();
                if (data.projects && Array.isArray(data.projects)) {
                    PROJECTS_DATA.length = 0; // Clear array
                    PROJECTS_DATA.push(...data.projects); // Add JSON data
                    filteredProjects = [...PROJECTS_DATA];
                    console.log('Projects loaded from portfolio.json');

                    // Re-render if already initialized
                    if (elements.projectsGrid) {
                        displayedProjects = 0;
                        renderProjects();
                    }
                }
            }
        } catch (error) {
            console.log('Using hardcoded projects data:', error);
            // Keep using FALLBACK_PROJECTS
        }
    }

    /**
     * Initialize projects section
     */
    function init() {
        // Cache elements
        cacheElements();

        // Try to load from JSON first
        loadProjectsFromJSON();

        // Render initial projects (will use fallback data)
        if (elements.projectsGrid) {
            renderProjects();
        }

        // Set up event listeners
        setupEventListeners();

        // Create modal if enabled
        if (CONFIG.enableModal) {
            createModal();
        }

        console.log('Projects section initialized');
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.projectsGrid = document.getElementById('projectsGrid');
        elements.filterButtons = document.querySelectorAll('.filter-btn');
        elements.loadMoreBtn = document.getElementById('loadMoreProjects');
        elements.searchInput = document.querySelector('.project-search');
    }

    /**
     * Render projects
     */
    function renderProjects(append = false) {
        if (!elements.projectsGrid || isLoading) return;

        isLoading = true;

        // Calculate projects to show
        const startIndex = append ? displayedProjects : 0;
        const endIndex = Math.min(startIndex + CONFIG.projectsPerLoad, filteredProjects.length);
        const projectsToShow = filteredProjects.slice(startIndex, endIndex);

        // Clear grid if not appending
        if (!append) {
            elements.projectsGrid.innerHTML = '';
            displayedProjects = 0;
        }

        // Render each project
        projectsToShow.forEach((project, index) => {
            const projectElement = createProjectElement(project);
            elements.projectsGrid.appendChild(projectElement);

            // Animate entrance
            setTimeout(() => {
                projectElement.classList.add('visible');
            }, index * CONFIG.animationDelay);
        });

        // Update displayed count
        displayedProjects = endIndex;

        // Update load more button
        updateLoadMoreButton();

        // Set up lazy loading for images
        if (CONFIG.enableLazyLoad) {
            lazyLoadImages();
        }

        isLoading = false;
    }

    /**
     * Create project element
     */
    function createProjectElement(project) {
        const article = document.createElement('article');
        article.className = 'project-card';
        article.dataset.category = project.category;
        article.dataset.projectId = project.id;

        // Build project HTML
        article.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" 
                     alt="${project.title}" 
                     loading="lazy"
                     onerror="this.src='/assets/images/placeholder.jpg'">
                <div class="project-overlay">
                    <div class="overlay-content">
                        ${project.github ? `
                            <a href="${project.github}" 
                               target="_blank" 
                               rel="noopener" 
                               class="project-link" 
                               aria-label="View Code">
                                <i class="fas fa-code"></i>
                            </a>
                        ` : ''}
                        ${project.demo ? `
                            <a href="${project.demo}" 
                               target="_blank" 
                               rel="noopener" 
                               class="project-link" 
                               aria-label="Live Demo">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        ` : ''}
                        ${CONFIG.enableModal ? `
                            <button class="project-link project-details-btn" 
                                    aria-label="View Details">
                                <i class="fas fa-info-circle"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                ${project.featured ? '<span class="project-badge">Featured</span>' : ''}
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech =>
            `<span class="tech-tag">${tech}</span>`
        ).join('')}
                </div>
                <div class="project-meta">
                    <span class="project-date">${formatDate(project.date)}</span>
                    <span class="project-status status-${project.status}">${project.status}</span>
                </div>
            </div>
        `;

        return article;
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Filter buttons
        elements.filterButtons.forEach(button => {
            button.addEventListener('click', handleFilterClick);
        });

        // Load more button
        if (elements.loadMoreBtn) {
            elements.loadMoreBtn.addEventListener('click', loadMoreProjects);
        }

        // Search input
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
        }

        // Project details buttons (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.project-details-btn')) {
                const projectCard = e.target.closest('.project-card');
                const projectId = projectCard.dataset.projectId;
                showProjectModal(projectId);
            }
        });
    }

    /**
     * Handle filter click
     */
    function handleFilterClick(e) {
        const button = e.currentTarget;
        const filter = button.dataset.filter;

        if (filter === currentFilter) return;

        // Update active state
        elements.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn === button);
        });

        // Apply filter
        currentFilter = filter;
        filterProjects();
    }

    /**
     * Filter projects
     */
    function filterProjects() {
        if (currentFilter === 'all') {
            filteredProjects = [...PROJECTS_DATA];
        } else {
            filteredProjects = PROJECTS_DATA.filter(project =>
                project.category === currentFilter
            );
        }

        // Re-render projects
        displayedProjects = 0;
        renderProjects();
    }

    /**
     * Load more projects
     */
    function loadMoreProjects() {
        renderProjects(true);
    }

    /**
     * Update load more button
     */
    function updateLoadMoreButton() {
        if (!elements.loadMoreBtn) return;

        if (displayedProjects >= filteredProjects.length) {
            elements.loadMoreBtn.style.display = 'none';
        } else {
            elements.loadMoreBtn.style.display = '';
            elements.loadMoreBtn.textContent = `Load More (${filteredProjects.length - displayedProjects} remaining)`;
        }
    }

    /**
     * Handle search
     */
    function handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();

        if (searchTerm === '') {
            filterProjects();
            return;
        }

        filteredProjects = PROJECTS_DATA.filter(project =>
            project.title.toLowerCase().includes(searchTerm) ||
            project.description.toLowerCase().includes(searchTerm) ||
            project.technologies.some(tech => tech.toLowerCase().includes(searchTerm))
        );

        displayedProjects = 0;
        renderProjects();
    }

    /**
     * Create modal for project details
     */
    function createModal() {
        const modal = document.createElement('div');
        modal.className = 'project-modal';
        modal.id = 'projectModal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="Close modal">&times;</button>
                    ×
                </button>
                <div class="modal-body"></div>
            </div>
        `;

        document.body.appendChild(modal);
        elements.projectModal = modal;

        // Close modal events
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    /**
     * Show project modal
     */
    function showProjectModal(projectId) {
        const project = PROJECTS_DATA.find(p => p.id == projectId);
        if (!project || !elements.projectModal) return;

        const modalBody = elements.projectModal.querySelector('.modal-body');

        modalBody.innerHTML = `
            <div class="modal-header">
                <img src="${project.image}" alt="${project.title}" class="modal-image">
                ${project.featured ? '<span class="project-badge">Featured</span>' : ''}
            </div>
            <div class="modal-details">
                <h2 class="modal-title">${project.title}</h2>
                <div class="modal-meta">
                    <span class="modal-date">${formatDate(project.date)}</span>
                    <span class="modal-status status-${project.status}">${project.status}</span>
                </div>
                <p class="modal-description">${project.longDescription}</p>
                <div class="modal-tech">
                    <h3>Technologies Used:</h3>
                    <div class="tech-list">
                        ${project.technologies.map(tech =>
            `<span class="tech-tag">${tech}</span>`
        ).join('')}
                    </div>
                </div>
                <div class="modal-actions">
                    ${project.github ? `
                        <a href="${project.github}" 
                           target="_blank" 
                           rel="noopener" 
                           class="btn btn-primary">
                            <i class="fab fa-github"></i> View Code
                        </a>
                    ` : ''}
                    ${project.demo ? `
                        <a href="${project.demo}" 
                           target="_blank" 
                           rel="noopener" 
                           class="btn btn-secondary">
                            <i class="fas fa-external-link-alt"></i> Live Demo
                        </a>
                    ` : ''}
                </div>
            </div>
        `;

        // Show modal
        elements.projectModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close modal
     */
    function closeModal() {
        if (!elements.projectModal) return;

        elements.projectModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Lazy load images
     */
    function lazyLoadImages() {
        const images = elements.projectsGrid.querySelectorAll('img[loading="lazy"]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    /**
     * Format date
     */
    function formatDate(dateString) {
        const date = new Date(dateString + '-01');
        return date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    }

    /**
     * Debounce function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Public API
     */
    window.ProjectsManager = {
        init: init,
        renderProjects: renderProjects,
        filterProjects: filterProjects,
        showProjectModal: showProjectModal,
        getProjectsData: () => PROJECTS_DATA,
        getFilteredProjects: () => filteredProjects,
        addProject: (project) => {
            PROJECTS_DATA.push(project);
            filterProjects();
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();