// ===============================================
// GITHUB STATS FUNCTIONALITY WITH ERROR HANDLING
// ===============================================

(function() {
    'use strict';
    
    // Configuration
    const GITHUB_USERNAME = 'bijay085';
    const config = {
        username: GITHUB_USERNAME,
        theme: 'tokyonight',
        showIcons: true,
        countPrivate: true,
        showActivity: true,
        maxRecentActivity: 5
    };
    
    // Fallback data (update these with your actual stats)
    const fallbackData = {
        repos: 15,
        followers: 10,
        stars: 6,
        contributions: 704
    };
    
    // State
    let hasLoaded = false;
    let isLoading = false;
    
    // Initialize Lazy Loading
    function init() {
        setupLazyLoading();
        console.log('GitHub stats lazy loading initialized');
    }
    
    // Setup Intersection Observer for Lazy Loading
    function setupLazyLoading() {
        const githubSection = document.querySelector('.github-section');
        
        if (!githubSection) {
            console.log('GitHub section not found');
            return;
        }
        
        const observerOptions = {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasLoaded && !isLoading) {
                    console.log('GitHub section in view, loading stats...');
                    isLoading = true;
                    loadAllStats();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        observer.observe(githubSection);
    }
    
    // Load All Stats
    async function loadAllStats() {
        showLoadingStates();
        
        // Load GitHub card images (these don't have rate limits)
        const imagePromises = [
            loadContributionGraph(),
            loadLanguageStats(),
            loadStreakStats()
        ];
        
        // Load API data with error handling
        const dataPromises = [
            loadGitHubStats().catch(handleApiError),
            fetchRecentActivity().catch(handleActivityError)
        ];
        
        try {
            await Promise.all([...imagePromises, ...dataPromises]);
            hasLoaded = true;
            console.log('GitHub stats loaded');
        } catch (error) {
            console.error('Error loading GitHub stats:', error);
            useFallbackData();
        } finally {
            isLoading = false;
        }
    }
    
    // Handle API errors
    function handleApiError(error) {
        console.warn('GitHub API error, using fallback data:', error.message);
        useFallbackData();
    }
    
    // Handle activity errors
    function handleActivityError(error) {
        console.warn('Activity API error:', error.message);
        const activityList = document.getElementById('activity-list');
        const loading = document.querySelector('.activity-loading');
        
        if (loading) loading.style.display = 'none';
        if (activityList) {
            activityList.innerHTML = '<p class="no-activity">Recent activity unavailable</p>';
        }
    }
    
    // Use fallback data when API fails
    function useFallbackData() {
        animateNumber('public-repos', fallbackData.repos);
        animateNumber('followers', fallbackData.followers);
        animateNumber('total-stars', fallbackData.stars);
        animateNumber('total-contributions', fallbackData.contributions);
    }
    
    // Show Loading States
    function showLoadingStates() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(num => {
            num.textContent = '...';
            num.style.opacity = '0.5';
        });
    }
    
    // Load Basic GitHub Stats with better error handling
    async function loadGitHubStats() {
        try {
            const response = await fetch(`https://api.github.com/users/${config.username}`);
            
            // Check for rate limit
            if (response.status === 403) {
                const rateLimitReset = response.headers.get('X-RateLimit-Reset');
                const resetTime = rateLimitReset ? new Date(rateLimitReset * 1000).toLocaleTimeString() : 'soon';
                console.warn(`GitHub API rate limit exceeded. Resets at ${resetTime}`);
                throw new Error('Rate limit exceeded');
            }
            
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            
            const data = await response.json();
            
            animateNumber('public-repos', data.public_repos || 0);
            animateNumber('followers', data.followers || 0);
            
            // Try to fetch stars, but don't fail if it doesn't work
            fetchTotalStars().catch(() => {
                animateNumber('total-stars', fallbackData.stars);
            });
            
            // Use fallback for contributions (can't get from API easily)
            animateNumber('total-contributions', fallbackData.contributions);
            
        } catch (error) {
            throw error; // Will be caught by handleApiError
        }
    }
    
    // Fetch Total Stars with error handling
    async function fetchTotalStars() {
        try {
            const response = await fetch(`https://api.github.com/users/${config.username}/repos?per_page=100`);
            
            if (response.status === 403) {
                throw new Error('Rate limit exceeded');
            }
            
            if (!response.ok) {
                throw new Error(`Failed to fetch repos: ${response.status}`);
            }
            
            const repos = await response.json();
            
            let totalStars = 0;
            repos.forEach(repo => {
                totalStars += repo.stargazers_count || 0;
            });
            
            animateNumber('total-stars', totalStars);
            
        } catch (error) {
            console.warn('Error fetching stars:', error.message);
            throw error;
        }
    }
    
    // Load Contribution Graph (uses image, no API limits)
    function loadContributionGraph() {
        return new Promise((resolve) => {
            const chart = document.getElementById('github-chart');
            const loading = document.querySelector('.graph-loading');
            
            if (!chart) {
                resolve();
                return;
            }
            
            const imageUrl = `https://github-readme-stats.vercel.app/api?username=${config.username}&show_icons=true&theme=${config.theme}&include_all_commits=true&count_private=true`;
            
            const img = new Image();
            img.onload = () => {
                chart.src = imageUrl;
                chart.classList.add('loaded');
                if (loading) loading.style.display = 'none';
                resolve();
            };
            
            img.onerror = () => {
                if (loading) {
                    loading.innerHTML = '<p>Unable to load GitHub chart</p>';
                }
                resolve();
            };
            
            img.src = imageUrl;
        });
    }
    
    // Load Language Stats (uses image, no API limits)
    function loadLanguageStats() {
        return new Promise((resolve) => {
            const chart = document.getElementById('language-chart');
            const loading = document.querySelector('.language-loading');
            
            if (!chart) {
                resolve();
                return;
            }
            
            const imageUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=${config.username}&layout=compact&theme=${config.theme}&langs_count=6`;
            
            const img = new Image();
            img.onload = () => {
                chart.src = imageUrl;
                chart.classList.add('loaded');
                if (loading) loading.style.display = 'none';
                resolve();
            };
            
            img.onerror = () => {
                if (loading) {
                    loading.innerHTML = '<p>Unable to load language stats</p>';
                }
                resolve();
            };
            
            img.src = imageUrl;
        });
    }
    
    // Load Streak Stats (uses image, no API limits)
    function loadStreakStats() {
        return new Promise((resolve) => {
            const chart = document.getElementById('streak-chart');
            const loading = document.querySelector('.streak-loading');
            
            if (!chart) {
                resolve();
                return;
            }
            
            const imageUrl = `https://github-readme-streak-stats.herokuapp.com/?user=${config.username}&theme=${config.theme}`;
            
            const img = new Image();
            img.onload = () => {
                chart.src = imageUrl;
                chart.classList.add('loaded');
                if (loading) loading.style.display = 'none';
                resolve();
            };
            
            img.onerror = () => {
                if (loading) {
                    loading.innerHTML = '<p>Unable to load streak stats</p>';
                }
                resolve();
            };
            
            img.src = imageUrl;
        });
    }
    
    // Fetch Recent Activity with better error handling
    async function fetchRecentActivity() {
        const activityList = document.getElementById('activity-list');
        const loading = document.querySelector('.activity-loading');
        
        const hiddenRepos = [
            'bijay085/License',
        ];
        
        try {
            const response = await fetch(`https://api.github.com/users/${config.username}/events/public?per_page=20`);
            
            if (response.status === 403) {
                throw new Error('Rate limit exceeded');
            }
            
            if (!response.ok) {
                throw new Error(`Failed to fetch activity: ${response.status}`);
            }
            
            const events = await response.json();
            
            if (loading) loading.style.display = 'none';
            if (activityList) activityList.innerHTML = '';
            
            let activityCount = 0;
            events.forEach(event => {
                if (activityCount >= config.maxRecentActivity) return;
                
                if (event.repo && hiddenRepos.includes(event.repo.name)) {
                    return;
                }
                
                const activityItem = createActivityItem(event);
                if (activityItem && activityList) {
                    activityList.appendChild(activityItem);
                    activityCount++;
                }
            });
            
            if (activityCount === 0 && activityList) {
                activityList.innerHTML = '<p class="no-activity">No recent public activity</p>';
            }
            
        } catch (error) {
            throw error; // Will be caught by handleActivityError
        }
    }
    
    // Create Activity Item
    function createActivityItem(event) {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        let icon = 'fa-code';
        let text = '';
        let repoName = event.repo ? event.repo.name : '';
        
        switch(event.type) {
            case 'PushEvent':
                icon = 'fa-upload';
                const commits = event.payload.commits ? event.payload.commits.length : 0;
                text = `Pushed ${commits} commit${commits > 1 ? 's' : ''} to`;
                break;
                
            case 'CreateEvent':
                icon = 'fa-plus';
                text = `Created ${event.payload.ref_type || 'repository'}`;
                break;
                
            case 'WatchEvent':
                icon = 'fa-star';
                text = 'Starred';
                break;
                
            case 'ForkEvent':
                icon = 'fa-code-branch';
                text = 'Forked';
                break;
                
            case 'IssuesEvent':
                icon = 'fa-exclamation-circle';
                text = `${event.payload.action} issue in`;
                break;
                
            case 'PullRequestEvent':
                icon = 'fa-code-pull-request';
                text = `${event.payload.action} pull request in`;
                break;
                
            case 'IssueCommentEvent':
                icon = 'fa-comment';
                text = 'Commented on issue in';
                break;
                
            default:
                return null;
        }
        
        const timeAgo = getTimeAgo(new Date(event.created_at));
        
        item.style.opacity = '0';
        item.style.animation = 'fadeIn 0.5s forwards';
        
        item.innerHTML = `
            <div class="activity-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="activity-content">
                <p class="activity-text">
                    ${text} ${repoName ? `<a href="https://github.com/${repoName}" target="_blank">${repoName}</a>` : ''}
                </p>
                <span class="activity-time">${timeAgo}</span>
            </div>
        `;
        
        return item;
    }
    
    // Get Time Ago
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) {
            return Math.floor(interval) + ' year' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
        }
        
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + ' month' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
        }
        
        interval = seconds / 86400;
        if (interval > 1) {
            return Math.floor(interval) + ' day' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
        }
        
        interval = seconds / 3600;
        if (interval > 1) {
            return Math.floor(interval) + ' hour' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
        }
        
        interval = seconds / 60;
        if (interval > 1) {
            return Math.floor(interval) + ' minute' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
        }
        
        return 'Just now';
    }
    
    // Animate Number
    function animateNumber(elementId, targetNumber) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.style.opacity = '1';
        
        const duration = 1000;
        const start = performance.now();
        const startNumber = 0;
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * easeOutQuart);
            
            element.textContent = currentNumber.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        
        requestAnimationFrame(updateNumber);
    }
    
    // Add CSS for animations
    function addAnimationStyles() {
        if (!document.getElementById('github-animations')) {
            const style = document.createElement('style');
            style.id = 'github-animations';
            style.innerHTML = `
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .activity-item {
                    animation: fadeIn 0.5s forwards;
                }
                
                .no-activity {
                    color: var(--text-secondary);
                    text-align: center;
                    padding: 2rem;
                    font-style: italic;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            addAnimationStyles();
        });
    } else {
        init();
        addAnimationStyles();
    }
    
})();