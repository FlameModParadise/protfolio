/* ===============================================
   GITHUB STATS - ENHANCED VERSION
   File: github-stats.js
   Location: /htdocs/assets/js/github-stats.js
   =============================================== */

(function() {
    'use strict';
    
    // ===============================================
    // CONFIGURATION
    // ===============================================
    const GITHUB_USERNAME = 'bijay085';
    const config = {
        username: GITHUB_USERNAME,
        apiBaseUrl: 'https://api.github.com',
        theme: 'dark',
        showIcons: true,
        countPrivate: true,
        showActivity: true,
        cacheTime: 3600000, // 1 hour cache
        animationDuration: 1000,
        retryAttempts: 3,
        retryDelay: 1000
    };
    
    // ===============================================
    // STATE MANAGEMENT
    // ===============================================
    const state = {
        hasLoaded: false,
        isLoading: false,
        stats: {
            contributions: 0,
            repositories: 0,
            followers: 0,
            stars: 0
        }
    };
    
    // ===============================================
    // CACHE MANAGEMENT
    // ===============================================
    const cache = {
        get(key) {
            const item = localStorage.getItem(`github_stats_${key}`);
            if (!item) return null;
            
            const { data, timestamp } = JSON.parse(item);
            const isExpired = Date.now() - timestamp > config.cacheTime;
            
            if (isExpired) {
                localStorage.removeItem(`github_stats_${key}`);
                return null;
            }
            
            return data;
        },
        
        set(key, data) {
            const item = {
                data,
                timestamp: Date.now()
            };
            try {
                localStorage.setItem(`github_stats_${key}`, JSON.stringify(item));
            } catch (e) {
                console.warn('Failed to cache data:', e);
            }
        }
    };
    
    // ===============================================
    // INITIALIZATION
    // ===============================================
    function init() {
        if (!document.querySelector('.github-section')) {
            console.warn('GitHub section not found');
            return;
        }
        
        setupLazyLoading();
        setupThemeDetection();
        console.log('GitHub stats initialized');
    }
    
    // ===============================================
    // THEME DETECTION
    // ===============================================
    function setupThemeDetection() {
        const isDarkMode = document.body.classList.contains('light-theme') === false;
        config.theme = isDarkMode ? 'dark' : 'light';
        
        // Listen for theme changes
        const observer = new MutationObserver(() => {
            const newTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            if (newTheme !== config.theme) {
                config.theme = newTheme;
                updateImageThemes();
            }
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
    
    // ===============================================
    // LAZY LOADING SETUP
    // ===============================================
    function setupLazyLoading() {
        const githubSection = document.querySelector('.github-section');
        
        const observerOptions = {
            root: null,
            rootMargin: '100px',
            threshold: 0.01
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !state.hasLoaded && !state.isLoading) {
                    state.isLoading = true;
                    loadAllStats();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        observer.observe(githubSection);
    }
    
    // ===============================================
    // MAIN LOADING FUNCTION
    // ===============================================
    async function loadAllStats() {
        try {
            showLoadingState();
            
            // Check cache first
            const cachedStats = cache.get('user_stats');
            if (cachedStats) {
                console.log('Using cached stats');
                updateStatsDisplay(cachedStats);
            } else {
                await fetchGitHubStats();
            }
            
            // Load images in parallel
            await Promise.all([
                loadGitHubStatsImage(),
                loadLanguageStatsImage(),
                loadStreakStatsImage()
            ]);
            
            state.hasLoaded = true;
            console.log('All GitHub content loaded');
            
        } catch (error) {
            console.error('Error loading GitHub stats:', error);
            useFallbackStats();
        } finally {
            state.isLoading = false;
        }
    }
    
    // ===============================================
    // LOADING STATE UI
    // ===============================================
    function showLoadingState() {
        const elements = ['total-contributions', 'public-repos', 'followers', 'total-stars'];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = '<span style="opacity: 0.5;">...</span>';
            }
        });
    }
    
    // ===============================================
    // FETCH GITHUB STATS WITH RETRY
    // ===============================================
    async function fetchGitHubStats(attempt = 1) {
        try {
            // Fetch user data
            const userData = await fetchWithRetry(`${config.apiBaseUrl}/users/${config.username}`);
            
            // Fetch repositories for star count
            const repos = await fetchWithRetry(
                `${config.apiBaseUrl}/users/${config.username}/repos?per_page=100&sort=stars`
            );
            
            // Calculate total stars
            const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
            
            // Fetch contribution data (using GraphQL would be better but requires auth)
            // For now, we'll estimate based on recent activity
            const events = await fetchWithRetry(
                `${config.apiBaseUrl}/users/${config.username}/events/public?per_page=100`
            );
            
            // Estimate contributions (rough calculation)
            const recentContributions = events.length * 4; // Rough estimate
            const estimatedTotal = Math.max(386, recentContributions); // Use known minimum
            
            const stats = {
                contributions: estimatedTotal,
                repositories: userData.public_repos || 0,
                followers: userData.followers || 0,
                stars: totalStars
            };
            
            // Cache the results
            cache.set('user_stats', stats);
            
            // Update display
            updateStatsDisplay(stats);
            
            console.log('GitHub stats fetched successfully:', stats);
            
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            
            if (attempt < config.retryAttempts) {
                await delay(config.retryDelay * attempt);
                return fetchGitHubStats(attempt + 1);
            }
            
            throw error;
        }
    }
    
    // ===============================================
    // FETCH WITH RETRY HELPER
    // ===============================================
    async function fetchWithRetry(url) {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        return response.json();
    }
    
    // ===============================================
    // UPDATE STATS DISPLAY
    // ===============================================
    function updateStatsDisplay(stats) {
        state.stats = stats;
        animateNumber('total-contributions', stats.contributions);
        animateNumber('public-repos', stats.repositories);
        animateNumber('followers', stats.followers);
        animateNumber('total-stars', stats.stars);
    }
    
    // ===============================================
    // FALLBACK STATS
    // ===============================================
    function useFallbackStats() {
        console.log('Using fallback stats');
        const fallbackStats = {
            contributions: 386,
            repositories: 15,
            followers: 10,
            stars: 6
        };
        updateStatsDisplay(fallbackStats);
    }
    
    // ===============================================
    // IMAGE LOADING FUNCTIONS
    // ===============================================
    function loadGitHubStatsImage() {
        return loadImage('github-chart', getStatsImageUrl());
    }
    
    function loadLanguageStatsImage() {
        return loadImage('language-chart', getLanguageImageUrl());
    }
    
    function loadStreakStatsImage() {
        return loadImage('streak-chart', getStreakImageUrl());
    }
    
    function loadImage(elementId, url) {
        return new Promise((resolve) => {
            const img = document.getElementById(elementId);
            if (!img) {
                resolve();
                return;
            }
            
            const tempImg = new Image();
            
            tempImg.onload = function() {
                img.src = this.src;
                img.classList.add('loaded');
                img.style.display = 'block';
                
                const loading = img.parentElement?.querySelector('.card-loading');
                if (loading) {
                    loading.style.display = 'none';
                }
                resolve();
            };
            
            tempImg.onerror = function() {
                const loading = img.parentElement?.querySelector('.card-loading');
                if (loading) {
                    loading.innerHTML = `
                        <i class="fas fa-exclamation-circle" style="color: #ff6b6b;"></i>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">
                            Unable to load chart
                        </p>
                    `;
                }
                resolve();
            };
            
            // Set source to trigger load
            tempImg.src = url;
        });
    }
    
    // ===============================================
    // IMAGE URL GENERATORS
    // ===============================================
    function getStatsImageUrl() {
        const theme = config.theme === 'dark' ? 'dark' : 'default';
        const params = new URLSearchParams({
            username: config.username,
            show_icons: 'true',
            count_private: 'true',
            hide_border: 'true',
            theme: theme,
            title_color: '6366f1',
            icon_color: '10b981',
            text_color: config.theme === 'dark' ? '9ca3af' : '4b5563',
            bg_color: config.theme === 'dark' ? '1a1a1b' : 'ffffff',
            cache_seconds: '3600'
        });
        
        return `https://github-readme-stats.vercel.app/api?${params}`;
    }
    
    function getLanguageImageUrl() {
        const theme = config.theme === 'dark' ? 'dark' : 'default';
        const params = new URLSearchParams({
            username: config.username,
            layout: 'compact',
            hide_border: 'true',
            theme: theme,
            title_color: '6366f1',
            text_color: config.theme === 'dark' ? '9ca3af' : '4b5563',
            bg_color: config.theme === 'dark' ? '1a1a1b' : 'ffffff',
            cache_seconds: '3600'
        });
        
        return `https://github-readme-stats.vercel.app/api/top-langs/?${params}`;
    }
    
    function getStreakImageUrl() {
        const params = new URLSearchParams({
            user: config.username,
            theme: config.theme === 'dark' ? 'dark' : 'default',
            hide_border: 'true',
            background: config.theme === 'dark' ? '1a1a1b' : 'ffffff',
            stroke: config.theme === 'dark' ? '9ca3af' : '4b5563',
            ring: '6366f1',
            fire: '10b981',
            currStreakNum: config.theme === 'dark' ? 'f3f4f6' : '111827',
            sideNums: config.theme === 'dark' ? '9ca3af' : '4b5563',
            cache_seconds: '3600'
        });
        
        return `https://streak-stats.demolab.com/?${params}`;
    }
    
    // ===============================================
    // UPDATE THEMES FOR IMAGES
    // ===============================================
    function updateImageThemes() {
        if (state.hasLoaded) {
            console.log('Updating image themes...');
            Promise.all([
                loadGitHubStatsImage(),
                loadLanguageStatsImage(),
                loadStreakStatsImage()
            ]);
        }
    }
    
    // ===============================================
    // NUMBER ANIMATION
    // ===============================================
    function animateNumber(elementId, targetNumber) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Clear any existing animation
        if (element.animationFrame) {
            cancelAnimationFrame(element.animationFrame);
        }
        
        const startNumber = parseInt(element.textContent) || 0;
        const duration = config.animationDuration;
        const start = performance.now();
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * easeOutExpo);
            
            element.textContent = formatNumber(currentNumber);
            
            if (progress < 1) {
                element.animationFrame = requestAnimationFrame(updateNumber);
            } else {
                element.textContent = formatNumber(targetNumber);
                element.classList.add('animated');
            }
        }
        
        requestAnimationFrame(updateNumber);
    }
    
    // ===============================================
    // UTILITY FUNCTIONS
    // ===============================================
    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k+';
        }
        return num + '+';
    }
    
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ===============================================
    // INITIALIZATION
    // ===============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export for debugging
    window.GitHubStats = {
        config,
        state,
        reload: loadAllStats,
        clearCache: () => {
            localStorage.removeItem('github_stats_user_stats');
            console.log('Cache cleared');
        }
    };
    
})();