/* ===============================================
   SERVICES DATA & LOADER COMPONENT
   File: services.js
   Location: /assets/js/components/services.js
   =============================================== */

(function() {
    'use strict';
    
    const servicesData = [
        {
            icon: 'fas fa-spider',
            title: 'Web Scraping',
            description: 'Data extraction from any website with custom scrapers and automation tools',
            features: ['Data Mining', 'API Integration', 'Real-time Scraping']
        },
        {
            icon: 'fas fa-robot',
            title: 'Bot Development',
            description: 'Custom Telegram and Discord bots for automation and user engagement',
            features: ['Custom Commands', 'API Integration', 'Workflow Automation']
        },
        {
            icon: 'fas fa-cogs',
            title: 'Process Automation',
            description: 'Workflow automation to save time and increase productivity',
            features: ['Task Automation', 'Data Processing', 'Report Generation']
        },
        {
            icon: 'fas fa-plug',
            title: 'API Development',
            description: 'RESTful API design and integration with third-party services',
            features: ['RESTful Design', 'Documentation', 'Third-party Integration']
        }
    ];
    
    function createServiceCard(service, delay = 0) {
        return `
            <div class="service-card" data-aos="fade-up" data-aos-delay="${delay}">
                <div class="service-icon">
                    <i class="${service.icon}"></i>
                </div>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
                <div class="service-features">
                    <ul>
                        ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    function loadServices() {
        const servicesGrid = document.getElementById('services-grid');
        if (!servicesGrid) return;
        
        let servicesHTML = '';
        servicesData.forEach((service, index) => {
            servicesHTML += createServiceCard(service, (index + 1) * 100);
        });
        
        servicesGrid.innerHTML = servicesHTML;
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadServices);
    } else {
        loadServices();
    }
    
})();