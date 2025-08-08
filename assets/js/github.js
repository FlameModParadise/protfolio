/**
 * GITHUB STATS INTEGRATION
 * File: /htdocs/assets/js/github.js
 * Handles GitHub API integration and stats display
 */
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        username: 'bijay085',
        apiUrl: 'https://api.github.com',
        cacheTime: 3600000, // 1 hour in milliseconds
        enableCache: true,
        retryAttempts: 3,
        retryDelay: 1000,
        // Hidden repositories (won't show in activity or recent repos)
        hiddenRepos: ['License'],
        // GitHub Stats Card Configuration
        statsTheme: 'radical',
        statsOptions: {
            show_icons: true,
            hide_border: false,
            count_private: true,
            include_all_commits: true
        }
    };
    // Cache DOM elements
    const elements = {
        repoCount: null,
        starCount: null,
        forkCount: null,
        followerCount: null,
        githubChart: null,
        languageChart: null,
        contributionsChart: null,
        recentRepos: null,
        activityFeed: null
    };
    
    // State management
    let userData = null;
    let reposData = null;
    let statsCache = null;
    let isLoading = false;
    
    /**
     * Initialize GitHub integration
     */
    async function init() {
        // Cache elements
        cacheElements();
       
        // Check for cached data
        if (CONFIG.enableCache) {
            loadCachedData();
        }
       
        // Fetch fresh data
        await fetchGitHubData();
       
        // Render stats
        renderStats();
       
        // Set up refresh interval
        setInterval(() => {
            fetchGitHubData();
        }, CONFIG.cacheTime);
       
        console.log('GitHub integration initialized');
    }
    
    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.repoCount = document.getElementById('repoCount');
        elements.starCount = document.getElementById('starCount');
        elements.forkCount = document.getElementById('forkCount');
        elements.followerCount = document.getElementById('followerCount');
        elements.githubChart = document.getElementById('github-chart');
        elements.languageChart = document.getElementById('language-chart');
        elements.contributionsChart = document.getElementById('github-contributions');
        elements.recentRepos = document.getElementById('recent-repos');
        elements.activityFeed = document.getElementById('activity-feed');
    }
    
    /**
     * Load cached data from localStorage
     */
    function loadCachedData() {
        try {
            const cached = localStorage.getItem('github_stats');
            if (cached) {
                const data = JSON.parse(cached);
                const now = Date.now();
               
                if (now - data.timestamp < CONFIG.cacheTime) {
                    statsCache = data;
                    userData = data.user;
                    reposData = data.repos;
                    renderStats();
                    console.log('Loaded GitHub stats from cache');
                }
            }
        } catch (error) {
            console.error('Error loading cached data:', error);
        }
    }
    
    /**
     * Save data to cache
     */
    function saveToCache() {
        if (!CONFIG.enableCache) return;
       
        try {
            const data = {
                timestamp: Date.now(),
                user: userData,
                repos: reposData
            };
            localStorage.setItem('github_stats', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    }
    
    /**
     * Fetch GitHub data with retry logic
     */
    async function fetchGitHubData() {
        if (isLoading) return;
       
        isLoading = true;
        let attempts = 0;
       
        while (attempts < CONFIG.retryAttempts) {
            try {
                // Fetch user data
                const userResponse = await fetchWithTimeout(
                    `${CONFIG.apiUrl}/users/${CONFIG.username}`
                );
                userData = await userResponse.json();
               
                // Fetch repositories
                const reposResponse = await fetchWithTimeout(
                    `${CONFIG.apiUrl}/users/${CONFIG.username}/repos?per_page=100&sort=updated`
                );
                reposData = await reposResponse.json();
               
                // Calculate additional stats
                calculateStats();
               
                // Save to cache
                saveToCache();
               
                // Render stats
                renderStats();
               
                isLoading = false;
                return;
               
            } catch (error) {
                attempts++;
                console.error(`GitHub API attempt ${attempts} failed:`, error);
               
                if (attempts < CONFIG.retryAttempts) {
                    await sleep(CONFIG.retryDelay * attempts);
                }
            }
        }
       
        isLoading = false;
        console.error('Failed to fetch GitHub data after all attempts');
    }
    
    /**
     * Fetch with timeout
     */
    function fetchWithTimeout(url, timeout = 5000) {
        return Promise.race([
            fetch(url),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
        ]);
    }
    
    /**
     * Calculate additional statistics
     */
    function calculateStats() {
        if (!reposData || !Array.isArray(reposData)) return;
       
        // Calculate total stars
        const totalStars = reposData.reduce((sum, repo) =>
            sum + (repo.stargazers_count || 0), 0
        );
       
        // Calculate total forks
        const totalForks = reposData.reduce((sum, repo) =>
            sum + (repo.forks_count || 0), 0
        );
       
        // Get language statistics
        const languages = {};
        reposData.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });
       
        // Store calculated stats
        if (userData) {
            userData.total_stars = totalStars;
            userData.total_forks = totalForks;
            userData.languages = languages;
        }
    }
    
    /**
     * Render statistics to DOM
     */
    function renderStats() {
        if (!userData) return;
       
        // Update stat cards
        updateStatCard(elements.repoCount, userData.public_repos);
        updateStatCard(elements.starCount, userData.total_stars || 0);
        updateStatCard(elements.forkCount, userData.total_forks || 0);
        updateStatCard(elements.followerCount, userData.followers);
       
        // Update GitHub stats images
        updateGitHubCharts();
       
        // Render recent repositories
        if (reposData && elements.recentRepos) {
            renderRecentRepos();
        }
       
        // Render activity feed
        if (elements.activityFeed) {
            renderActivityFeed();
        }
       
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('githubStatsLoaded', {
            detail: { user: userData, repos: reposData }
        }));
    }
    
    /**
     * Update stat card with animation
     */
    function updateStatCard(element, value) {
        if (!element) return;
       
        const currentValue = parseInt(element.textContent) || 0;
        const targetValue = value || 0;
       
        // Animate counter
        animateCounter(element, currentValue, targetValue, 1000);
    }
    
    /**
     * Animate counter from current to target value
     */
    function animateCounter(element, from, to, duration) {
        const start = Date.now();
        const range = to - from;
       
        const update = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
           
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
           
            const current = Math.floor(from + range * easeOutQuart);
            element.textContent = formatNumber(current);
           
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
       
        update();
    }
    
    /**
     * Format number with K/M suffix
     */
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    /**
     * Update GitHub chart images
     */
    function updateGitHubCharts() {
        // GitHub Stats Card
        if (elements.githubChart) {
            const statsUrl = `https://github-readme-stats.vercel.app/api?username=${CONFIG.username}&theme=${CONFIG.statsTheme}&show_icons=true&count_private=true&include_all_commits=true`;
            elements.githubChart.src = statsUrl;
            elements.githubChart.alt = 'GitHub Stats';
           
            // Handle load error
            elements.githubChart.onerror = () => {
                elements.githubChart.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'stats-fallback';
                fallback.innerHTML = createStatsFallback();
                elements.githubChart.parentElement.appendChild(fallback);
            };
        }
       
        // Language Stats Card
        if (elements.languageChart) {
            const langUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=${CONFIG.username}&layout=compact&theme=${CONFIG.statsTheme}`;
            elements.languageChart.src = langUrl;
            elements.languageChart.alt = 'Top Languages';
        }
       
        // Contribution Streak Card
        if (elements.contributionsChart) {
            const streakUrl = `https://github-readme-streak-stats.herokuapp.com/?user=${CONFIG.username}&theme=${CONFIG.statsTheme}`;
            elements.contributionsChart.src = streakUrl;
            elements.contributionsChart.alt = 'GitHub Streak';
        }
    }
    
    /**
     * Create fallback stats display
     */
    function createStatsFallback() {
        if (!userData) return '';
       
        return `
            <div class="github-stats-fallback">
                <h3>${userData.name || CONFIG.username}'s GitHub Stats</h3>
                <div class="stats-grid">
                    <div class="stat">
                        <span class="stat-value">${userData.public_repos}</span>
                        <span class="stat-label">Repositories</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${userData.followers}</span>
                        <span class="stat-label">Followers</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${userData.following}</span>
                        <span class="stat-label">Following</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${userData.total_stars || 0}</span>
                        <span class="stat-label">Total Stars</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render recent repositories
     */
    function renderRecentRepos() {
        if (!reposData || !elements.recentRepos) return;
       
        // Sort by updated date, filter out forks and hidden repos, then get top 6
        const recentRepos = reposData
            .filter(repo => !repo.fork && !CONFIG.hiddenRepos.includes(repo.name))
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 6);
       
        elements.recentRepos.innerHTML = `
            <h3 class="github-section-title">Recent Repositories</h3>
            <div class="repos-grid">
                ${recentRepos.map(repo => createRepoCard(repo)).join('')}
            </div>
        `;
    }
    
    /**
     * Create repository card HTML
     */
    function createRepoCard(repo) {
        return `
            <div class="repo-card">
                <div class="repo-header">
                    <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-name">
                        <i class="fas fa-book"></i> ${repo.name}
                    </a>
                    ${repo.homepage ? `
                        <a href="${repo.homepage}" target="_blank" rel="noopener" class="repo-link">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    ` : ''}
                </div>
                <p class="repo-description">${repo.description || 'No description available'}</p>
                <div class="repo-stats">
                    ${repo.language ? `
                        <span class="repo-language">
                            <span class="language-dot" style="background: ${getLanguageColor(repo.language)}"></span>
                            ${repo.language}
                        </span>
                    ` : ''}
                    <span class="repo-stat">
                        <i class="fas fa-star"></i> ${repo.stargazers_count}
                    </span>
                    <span class="repo-stat">
                        <i class="fas fa-code-branch"></i> ${repo.forks_count}
                    </span>
                </div>
            </div>
        `;
    }
    
    /**
     * Get language color
     */
    function getLanguageColor(language) {
        const colors = {
            JavaScript: '#f1e05a',
            Python: '#3572A5',
            HTML: '#e34c26',
            CSS: '#563d7c',
            PHP: '#4F5D95',
            TypeScript: '#2b7489',
            Java: '#b07219',
            'C++': '#f34b7d',
            Shell: '#89e051',
            Ruby: '#701516'
        };
       
        return colors[language] || '#586069';
    }
    
    /**
     * Render activity feed
     */
    async function renderActivityFeed() {
        if (!elements.activityFeed) return;
       
        try {
            const response = await fetch(
                `${CONFIG.apiUrl}/users/${CONFIG.username}/events/public?per_page=15`
            );
            const events = await response.json();
            
            // Filter out events from hidden repositories
            const filteredEvents = events.filter(event => {
                // Check if the repository name (without username) is in the hidden list
                const repoName = event.repo.name.split('/')[1];
                return !CONFIG.hiddenRepos.includes(repoName);
            });
           
            elements.activityFeed.innerHTML = `
                <h3 class="github-section-title">Recent Activity</h3>
                <div class="activity-list">
                    ${filteredEvents.slice(0, 5).map(event => createActivityItem(event)).join('')}
                </div>
            `;
        } catch (error) {
            console.error('Error fetching activity:', error);
        }
    }
    
    /**
     * Create activity item HTML
     */
    function createActivityItem(event) {
        const eventTypes = {
            PushEvent: { icon: 'fa-upload', text: 'Pushed to' },
            CreateEvent: { icon: 'fa-plus', text: 'Created' },
            WatchEvent: { icon: 'fa-star', text: 'Starred' },
            ForkEvent: { icon: 'fa-code-branch', text: 'Forked' },
            IssuesEvent: { icon: 'fa-exclamation-circle', text: 'Opened issue in' },
            PullRequestEvent: { icon: 'fa-code-branch', text: 'Opened PR in' }
        };
       
        const eventInfo = eventTypes[event.type] || { icon: 'fa-circle', text: 'Activity in' };
        const repoName = event.repo.name;
        const time = formatTime(event.created_at);
       
        return `
            <div class="activity-item">
                <i class="fas ${eventInfo.icon} activity-icon"></i>
                <div class="activity-content">
                    <span class="activity-text">${eventInfo.text}</span>
                    <a href="https://github.com/${repoName}" target="_blank" rel="noopener" class="activity-repo">
                        ${repoName}
                    </a>
                    <span class="activity-time">${time}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Format time to relative string
     */
    function formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
       
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
       
        if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else if (days < 30) {
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
    
    /**
     * Sleep utility function
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Public API
     */
    window.GitHubManager = {
        init: init,
        refresh: fetchGitHubData,
        getUser: () => userData,
        getRepos: () => reposData,
        getStats: () => ({
            repos: userData?.public_repos || 0,
            stars: userData?.total_stars || 0,
            forks: userData?.total_forks || 0,
            followers: userData?.followers || 0
        })
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();