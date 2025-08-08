/**
 * SKILLS SECTION MANAGEMENT
 * File: /htdocs/assets/js/skills.js
 * Handles skills display, animations, and filtering
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        animationDelay: 100,
        animationDuration: 1500,
        enableAnimation: true,
        enableFiltering: true,
        enableTooltips: true,
        progressAnimationEasing: 'ease-out'
    };

    // Hardcoded fallback data (matching your experience level)
    const FALLBACK_SKILLS = {
        'Programming Languages': [
            { name: 'Python', level: 75, icon: 'fab fa-python', color: '#3776ab', experience: '7-8 months' },
            { name: 'JavaScript', level: 60, icon: 'fab fa-js', color: '#f7df1e', experience: '6 months' },
            { name: 'PHP', level: 50, icon: 'fab fa-php', color: '#777bb4', experience: 'Learning' },
            { name: 'HTML/CSS', level: 70, icon: 'fab fa-html5', color: '#e34c26', experience: '8 months' }
        ],
        'Automation & Scraping': [
            { name: 'Selenium', level: 80, icon: 'fas fa-browser', color: '#43b02a', experience: '7 months' },
            { name: 'BeautifulSoup', level: 75, icon: 'fas fa-spider', color: '#306998', experience: '6 months' },
            { name: 'Scrapy', level: 60, icon: 'fas fa-network-wired', color: '#60a839', experience: '4 months' },
            { name: 'Requests', level: 70, icon: 'fas fa-globe', color: '#3776ab', experience: '7 months' }
        ],
        'Tools & Technologies': [
            { name: 'Git & GitHub', level: 70, icon: 'fab fa-git-alt', color: '#f05032', experience: '7 months' },
            { name: 'VS Code', level: 80, icon: 'fas fa-code', color: '#007acc', experience: '8 months' },
            { name: 'Flask', level: 65, icon: 'fas fa-flask', color: '#000000', experience: '5 months' },
            { name: 'ChatGPT', level: 75, icon: 'fas fa-robot', color: '#74aa9c', experience: '6 months' }
        ],
        'Data Analysis': [
            { name: 'Pandas', level: 60, icon: 'fas fa-chart-line', color: '#130754', experience: '4 months' },
            { name: 'NumPy', level: 55, icon: 'fas fa-calculator', color: '#013243', experience: '3 months' },
            { name: 'Power BI', level: 50, icon: 'fas fa-chart-bar', color: '#f2c811', experience: 'Learning' },
            { name: 'Excel', level: 70, icon: 'fas fa-file-excel', color: '#217346', experience: '6 months' }
        ]
    };

    // Skills data - will be loaded from JSON or use fallback
    let SKILLS_DATA = JSON.parse(JSON.stringify(FALLBACK_SKILLS));

    /**
     * Try to load skills from JSON file
     */
    async function loadSkillsFromJSON() {
        try {
            const response = await fetch('/assets/data/portfolio.json');
            if (response.ok) {
                const data = await response.json();
                if (data.skills && typeof data.skills === 'object') {
                    // Transform JSON skills data to match our format
                    const transformedSkills = {};
                    
                    for (const [category, skills] of Object.entries(data.skills)) {
                        transformedSkills[category] = skills.map(skill => {
                            // Map skill to our format with icons and colors
                            const iconMap = {
                                'Python': { icon: 'fab fa-python', color: '#3776ab' },
                                'JavaScript': { icon: 'fab fa-js', color: '#f7df1e' },
                                'PHP': { icon: 'fab fa-php', color: '#777bb4' },
                                'HTML/CSS': { icon: 'fab fa-html5', color: '#e34c26' },
                                'Selenium': { icon: 'fas fa-browser', color: '#43b02a' },
                                'BeautifulSoup': { icon: 'fas fa-spider', color: '#306998' },
                                'Scrapy': { icon: 'fas fa-network-wired', color: '#60a839' },
                                'Requests': { icon: 'fas fa-globe', color: '#3776ab' },
                                'Git & GitHub': { icon: 'fab fa-git-alt', color: '#f05032' },
                                'VS Code': { icon: 'fas fa-code', color: '#007acc' },
                                'Flask': { icon: 'fas fa-flask', color: '#000000' },
                                'FastAPI': { icon: 'fas fa-bolt', color: '#009688' },
                                'Django': { icon: 'fab fa-python', color: '#092e20' },
                                'MySQL': { icon: 'fas fa-database', color: '#4479a1' },
                                'MongoDB': { icon: 'fas fa-database', color: '#47a248' },
                                'SQLite': { icon: 'fas fa-database', color: '#003b57' },
                                'ChatGPT': { icon: 'fas fa-robot', color: '#74aa9c' },
                                'Pandas': { icon: 'fas fa-chart-line', color: '#130754' },
                                'NumPy': { icon: 'fas fa-calculator', color: '#013243' },
                                'Power BI': { icon: 'fas fa-chart-bar', color: '#f2c811' },
                                'Excel': { icon: 'fas fa-file-excel', color: '#217346' }
                            };
                            
                            const defaultIcon = { icon: 'fas fa-cog', color: '#666666' };
                            const iconInfo = iconMap[skill.name] || defaultIcon;
                            
                            return {
                                name: skill.name,
                                level: skill.level || 50,
                                icon: iconInfo.icon,
                                color: iconInfo.color,
                                experience: skill.experience || skill.years || 'Learning'
                            };
                        });
                    }
                    
                    SKILLS_DATA = transformedSkills;
                    console.log('Skills loaded from portfolio.json');
                    
                    // Re-render if already initialized
                    if (elements.skillsContainer) {
                        renderSkills();
                    }
                }
            }
        } catch (error) {
            console.log('Using hardcoded skills data:', error);
            // Keep using FALLBACK_SKILLS
        }
    }

    // Cache DOM elements
    const elements = {
        skillsContainer: null,
        skillItems: [],
        filterButtons: [],
        searchInput: null
    };

    // State management
    let currentFilter = 'all';
    let animationObserver = null;
    let isAnimated = new Set();

    /**
     * Initialize skills section
     */
    function init() {
        // Cache elements
        cacheElements();
        
        // Try to load from JSON first
        loadSkillsFromJSON();
        
        // Render skills if container exists (will use fallback data initially)
        if (elements.skillsContainer) {
            renderSkills();
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Set up animations
        if (CONFIG.enableAnimation) {
            setupAnimations();
        }
        
        console.log('Skills section initialized');
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.skillsContainer = document.querySelector('.skills-container');
        elements.filterButtons = document.querySelectorAll('.skill-filter-btn');
        elements.searchInput = document.querySelector('.skill-search');
    }

    /**
     * Render skills dynamically
     */
    function renderSkills() {
        if (!elements.skillsContainer) return;
        
        // Clear existing content
        elements.skillsContainer.innerHTML = '';
        
        // Create skill categories
        Object.entries(SKILLS_DATA).forEach(([category, skills]) => {
            const categoryElement = createCategoryElement(category, skills);
            elements.skillsContainer.appendChild(categoryElement);
        });
        
        // Cache skill items
        elements.skillItems = document.querySelectorAll('.skill-item');
    }

    /**
     * Create category element
     */
    function createCategoryElement(categoryName, skills) {
        const category = document.createElement('div');
        category.className = 'skill-category';
        category.dataset.category = categoryName.toLowerCase().replace(/\s+/g, '-');
        
        // Category title
        const title = document.createElement('h3');
        title.className = 'category-title';
        title.innerHTML = `
            <i class="${getCategoryIcon(categoryName)}"></i>
            <span>${categoryName}</span>
        `;
        category.appendChild(title);
        
        // Skills grid
        const grid = document.createElement('div');
        grid.className = 'skills-grid';
        
        // Add skills
        skills.forEach((skill, index) => {
            const skillElement = createSkillElement(skill, index);
            grid.appendChild(skillElement);
        });
        
        category.appendChild(grid);
        
        return category;
    }

    /**
     * Create individual skill element
     */
    function createSkillElement(skill, index) {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.dataset.skill = skill.name.toLowerCase();
        skillItem.dataset.level = skill.level;
        skillItem.dataset.index = index;
        
        // Build skill HTML
        skillItem.innerHTML = `
            <div class="skill-icon" style="background: ${skill.color};">
                <i class="${skill.icon}"></i>
            </div>
            <div class="skill-info">
                <h4 class="skill-name">${skill.name}</h4>
                <div class="skill-bar">
                    <div class="skill-progress" data-level="${skill.level}"></div>
                </div>
                <span class="skill-percent">${skill.level}%</span>
                ${CONFIG.enableTooltips ? `
                    <div class="skill-tooltip">
                        <span class="tooltip-text">Experience: ${skill.experience}</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add hover effect
        if (CONFIG.enableTooltips) {
            addTooltipEvents(skillItem);
        }
        
        return skillItem;
    }

    /**
     * Get category icon
     */
    function getCategoryIcon(category) {
        const icons = {
            'Programming Languages': 'fas fa-code',
            'Automation & Scraping': 'fas fa-robot',
            'Tools & Technologies': 'fas fa-tools',
            'Data Analysis': 'fas fa-chart-line',
            'Frameworks': 'fas fa-layer-group',
            'Databases': 'fas fa-database'
        };
        
        return icons[category] || 'fas fa-cog';
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Filter buttons
        elements.filterButtons.forEach(button => {
            button.addEventListener('click', handleFilterClick);
        });
        
        // Search input
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', handleSearch);
        }
        
        // Skill item clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.skill-item')) {
                handleSkillClick(e.target.closest('.skill-item'));
            }
        });
    }

    /**
     * Set up animations
     */
    function setupAnimations() {
        // Create intersection observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        animationObserver = new IntersectionObserver(handleSkillIntersection, observerOptions);
        
        // Observe all skill items
        elements.skillItems.forEach(item => {
            animationObserver.observe(item);
        });
    }

    /**
     * Handle skill intersection for animations
     */
    function handleSkillIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isAnimated.has(entry.target)) {
                const skillItem = entry.target;
                const delay = skillItem.dataset.index * CONFIG.animationDelay;
                
                setTimeout(() => {
                    animateSkill(skillItem);
                    isAnimated.add(skillItem);
                }, delay);
                
                animationObserver.unobserve(skillItem);
            }
        });
    }

    /**
     * Animate individual skill
     */
    function animateSkill(skillItem) {
        // Fade in animation
        skillItem.style.opacity = '0';
        skillItem.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            skillItem.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
            skillItem.style.opacity = '1';
            skillItem.style.transform = 'translateY(0)';
        });
        
        // Animate progress bar
        const progressBar = skillItem.querySelector('.skill-progress');
        if (progressBar) {
            const level = progressBar.dataset.level;
            
            setTimeout(() => {
                progressBar.style.transition = `width ${CONFIG.animationDuration}ms ${CONFIG.progressAnimationEasing}`;
                progressBar.style.width = `${level}%`;
            }, 300);
        }
        
        // Animate percentage counter
        const percentElement = skillItem.querySelector('.skill-percent');
        if (percentElement) {
            animatePercentage(percentElement, skillItem.dataset.level);
        }
    }

    /**
     * Animate percentage counter
     */
    function animatePercentage(element, target) {
        let current = 0;
        const increment = target / (CONFIG.animationDuration / 16);
        
        function update() {
            current += increment;
            
            if (current < target) {
                element.textContent = `${Math.floor(current)}%`;
                requestAnimationFrame(update);
            } else {
                element.textContent = `${target}%`;
            }
        }
        
        update();
    }

    /**
     * Handle filter button click
     */
    function handleFilterClick(e) {
        const button = e.currentTarget;
        const filter = button.dataset.filter;
        
        // Update active state
        elements.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn === button);
        });
        
        // Apply filter
        filterSkills(filter);
        currentFilter = filter;
    }

    /**
     * Filter skills by category
     */
    function filterSkills(filter) {
        const categories = document.querySelectorAll('.skill-category');
        
        categories.forEach(category => {
            if (filter === 'all') {
                category.style.display = '';
                fadeIn(category);
            } else {
                const categoryType = category.dataset.category;
                if (categoryType === filter) {
                    category.style.display = '';
                    fadeIn(category);
                } else {
                    fadeOut(category, () => {
                        category.style.display = 'none';
                    });
                }
            }
        });
    }

    /**
     * Handle search input
     */
    function handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        elements.skillItems.forEach(item => {
            const skillName = item.dataset.skill;
            const matches = skillName.includes(searchTerm);
            
            if (matches) {
                item.style.display = '';
                fadeIn(item);
            } else {
                fadeOut(item, () => {
                    item.style.display = 'none';
                });
            }
        });
    }

    /**
     * Handle skill item click
     */
    function handleSkillClick(skillItem) {
        // Add click animation
        skillItem.style.transform = 'scale(0.95)';
        setTimeout(() => {
            skillItem.style.transform = '';
        }, 200);
        
        // Show skill details (could open modal or expand)
        const skillName = skillItem.querySelector('.skill-name').textContent;
        const skillLevel = skillItem.dataset.level;
        
        console.log(`Clicked on ${skillName} (${skillLevel}%)`);
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('skillClicked', {
            detail: { name: skillName, level: skillLevel }
        }));
    }

    /**
     * Add tooltip events
     */
    function addTooltipEvents(element) {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('touchstart', showTooltip);
        element.addEventListener('touchend', hideTooltip);
    }

    /**
     * Show tooltip
     */
    function showTooltip(e) {
        const tooltip = e.currentTarget.querySelector('.skill-tooltip');
        if (tooltip) {
            tooltip.classList.add('visible');
        }
    }

    /**
     * Hide tooltip
     */
    function hideTooltip(e) {
        const tooltip = e.currentTarget.querySelector('.skill-tooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
        }
    }

    /**
     * Fade in animation
     */
    function fadeIn(element) {
        element.style.opacity = '0';
        requestAnimationFrame(() => {
            element.style.transition = 'opacity 0.3s ease';
            element.style.opacity = '1';
        });
    }

    /**
     * Fade out animation
     */
    function fadeOut(element, callback) {
        element.style.transition = 'opacity 0.3s ease';
        element.style.opacity = '0';
        
        setTimeout(() => {
            if (callback) callback();
        }, 300);
    }

    /**
     * Public API
     */
    window.SkillsManager = {
        init: init,
        renderSkills: renderSkills,
        filterSkills: filterSkills,
        animateSkill: animateSkill,
        getSkillsData: () => SKILLS_DATA,
        updateSkillLevel: (skillName, newLevel) => {
            const skill = document.querySelector(`[data-skill="${skillName.toLowerCase()}"]`);
            if (skill) {
                skill.dataset.level = newLevel;
                const progress = skill.querySelector('.skill-progress');
                if (progress) {
                    progress.style.width = `${newLevel}%`;
                }
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