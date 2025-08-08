/* ===============================================
   PROJECTS DATA & LOADER COMPONENT
   File: projects.js
   Location: /assets/js/components/projects.js
   =============================================== */

(function() {
    'use strict';
    
    const projectsData = [
        {
            id: 1,
            featured: true,
            private: false,
            title: 'API/Web Scraping Suite',
            overline: 'Featured Collection',
            description: '<strong>15+ Private Automation Tools</strong> including Netflix, Outlook, ChatGPT integrations. Professional-grade web scraping and API automation solutions for various platforms.',
            technologies: ['Python', 'Selenium', 'BeautifulSoup', 'Requests', 'API Integration'],
            icon: 'fas fa-spider',
            stats: {
                tools: '15+',
                status: 'Private'
            },
            image: 'assets/projects/project1.png',
            github: null,
            demo: null
        },
        {
            id: 2,
            featured: false,
            private: false,
            title: 'Bot Ecosystem',
            overline: 'Automation',
            description: 'Telegram & Discord bots for workflow automation and enhanced user experience. Custom bot solutions for various automation needs.',
            technologies: ['Python', 'Telebot', 'Discord.py', 'API Integration'],
            icon: 'fas fa-robot',
            image: 'assets/projects/project2.png',
            github: 'https://github.com/bijay085',
            demo: null
        },
        {
            id: 3,
            featured: false,
            private: false,
            title: 'CMS Platform',
            overline: 'Web Development',
            description: 'Full-featured Content Management System with modern UI/UX. Dynamic content loading with JSON-based data management.',
            technologies: ['HTML/CSS', 'JavaScript', 'JSON', 'Frontend'],
            icon: 'fas fa-globe',
            image: 'assets/projects/project3.png',
            github: 'https://github.com/bijay085',
            demo: null
        },
        {
            id: 4,
            featured: false,
            private: false,
            title: 'FraudShield System',
            overline: 'College Project',
            description: 'E-commerce fraud detection system with rule-based transaction monitoring. Protects online transactions using intelligent pattern recognition.',
            technologies: ['Python', 'Flask', 'MongoDB', 'Frontend'],
            icon: 'fas fa-shield-alt',
            image: 'assets/projects/project4.png',
            github: 'https://github.com/bijay085',
            demo: null
        },
        {
            id: 5,
            featured: false,
            private: false,
            title: 'Gamified Learning Tracker',
            overline: 'Educational',
            description: 'Interactive progress tracking system with gamification elements for enhanced motivation. Makes learning fun and engaging.',
            technologies: ['PHP', 'MySQL', 'HTML/CSS', 'JavaScript'],
            icon: 'fas fa-gamepad',
            image: 'assets/projects/project5.png',
            github: 'https://github.com/bijay085',
            demo: null
        }
    ];
    
    function createProjectCard(project, delay = 0) {
        const cardClass = project.featured ? 'project-card featured' : 'project-card';
        const badges = [];
        
        if (project.featured) {
            badges.push('<div class="featured-badge">Featured</div>');
        }
        if (project.private) {
            badges.push('<div class="private-badge"><i class="fas fa-lock"></i> Private</div>');
        }
        
        const stats = project.stats ? `
            <div class="project-stats">
                ${Object.entries(project.stats).map(([key, value]) => 
                    `<span><i class="fas fa-${key === 'tools' ? 'tools' : 'lock'}"></i> ${value}</span>`
                ).join('')}
            </div>
        ` : '';
        
        const projectLinks = (project.github || project.demo) ? `
            <div class="project-overlay">
                <div class="project-links">
                    ${project.github ? `<a href="${project.github}" target="_blank" rel="noopener"><i class="fab fa-github"></i></a>` : ''}
                    ${project.demo ? `<a href="${project.demo}" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i></a>` : ''}
                </div>
            </div>
        ` : '';
        
        return `
            <div class="${cardClass}" data-aos="fade-up" data-aos-delay="${delay}">
                ${badges.join('')}
                <div class="project-image">
                    <img src="${project.image}" 
                         alt="${project.title}"
                         loading="lazy"
                         onerror="this.parentElement.classList.add('no-image'); this.parentElement.innerHTML='<i class=\\'${project.icon}\\'></i>';">
                    ${projectLinks}
                </div>
                <div class="project-content">
                    <p class="project-overline">${project.overline}</p>
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <ul class="project-tech-list">
                        ${project.technologies.map(tech => `<li>${tech}</li>`).join('')}
                    </ul>
                    ${stats}
                </div>
            </div>
        `;
    }
    
    function loadProjects() {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;
        
        let projectsHTML = '';
        projectsData.forEach((project, index) => {
            projectsHTML += createProjectCard(project, (index + 1) * 100);
        });
        
        // Add "More Projects" card
        projectsHTML += `
            <div class="project-card more-projects" data-aos="fade-up" data-aos-delay="${(projectsData.length + 1) * 100}">
                <div class="project-image">
                    <img src="assets/projects/project6.png" 
                         alt="More Projects"
                         loading="lazy"
                         onerror="this.parentElement.classList.add('no-image'); this.parentElement.innerHTML='<i class=\\'fas fa-plus\\'></i>';">
                </div>
                <div class="project-content">
                    <p class="project-overline">Explore More</p>
                    <h3 class="project-title">View All Projects</h3>
                    <p class="project-description">
                        Check out my GitHub for more projects including automation scripts,
                        web applications, and experimental tools.
                    </p>
                    <div class="project-cta" style="margin-top: 20px; text-align: center;">
                        <a href="https://github.com/bijay085?tab=repositories" target="_blank" rel="noopener" class="btn btn-outline">
                            <i class="fab fa-github"></i> View on GitHub
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        projectsGrid.innerHTML = projectsHTML;
        
        // Re-initialize project card hover effects
        initProjectCardEffects();
    }
    
    function initProjectCardEffects() {
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
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadProjects);
    } else {
        loadProjects();
    }
    
})();