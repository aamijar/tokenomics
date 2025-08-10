// Main application initialization and global utilities
class App {
    constructor() {
        this.isInitialized = false;
        this.theme = 'dark';
        
        this.init();
    }
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Wait for DOM to be fully loaded
            await this.waitForDOM();
            
            // Initialize theme
            this.initializeTheme();
            
            // Initialize performance optimizations
            this.initializePerformance();
            
            // Initialize accessibility features
            this.initializeAccessibility();
            
            // Initialize error handling
            this.initializeErrorHandling();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ API Credits Swap app initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.handleInitializationError(error);
        }
    }
    
    waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    initializeTheme() {
        // Set theme based on system preference or saved preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        
        this.theme = savedTheme || (prefersDark ? 'dark' : 'dark'); // Always default to dark
        document.body.setAttribute('data-theme', this.theme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'dark');
            }
        });
    }
    
    setTheme(theme) {
        this.theme = theme;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }
    
    initializePerformance() {
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Initialize intersection observer for performance
        this.setupIntersectionObserver();
        
        // Debounce resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 150);
        });
    }
    
    preloadCriticalResources() {
        // Preload token logos (in a real app, these would be actual image files)
        const tokenLogos = Object.values(TOKENS).map(token => token.logo);
        tokenLogos.forEach(logo => {
            // In a real implementation, you'd preload actual image files
            // const link = document.createElement('link');
            // link.rel = 'preload';
            // link.href = logo;
            // link.as = 'image';
            // document.head.appendChild(link);
        });
    }
    
    setupIntersectionObserver() {
        // Observe elements for lazy loading and animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Trigger any lazy loading or animations
                    this.handleElementVisible(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        // Observe key elements
        const observeElements = document.querySelectorAll('.swap-card, .header, .footer');
        observeElements.forEach(el => observer.observe(el));
    }
    
    handleElementVisible(element) {
        // Trigger animations or lazy loading for visible elements
        if (element.classList.contains('swap-card')) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    }
    
    handleResize() {
        // Handle responsive adjustments
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('mobile', isMobile);
        
        // Adjust dropdown positions on mobile
        if (isMobile) {
            this.adjustMobileDropdowns();
        }
    }
    
    adjustMobileDropdowns() {
        const dropdowns = document.querySelectorAll('.token-dropdown');
        dropdowns.forEach(dropdown => {
            const rect = dropdown.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            
            if (rect.right > viewportWidth) {
                dropdown.style.right = '0';
                dropdown.style.left = 'auto';
            }
        });
    }
    
    initializeAccessibility() {
        // Add focus management
        this.setupFocusManagement();
        
        // Add keyboard navigation enhancements
        this.setupKeyboardNavigation();
        
        // Add screen reader announcements
        this.setupScreenReaderSupport();
    }
    
    setupFocusManagement() {
        // Trap focus in dropdown menus
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const activeDropdown = document.querySelector('.token-dropdown.open');
                if (activeDropdown) {
                    this.trapFocus(e, activeDropdown);
                }
            }
        });
    }
    
    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
    
    setupKeyboardNavigation() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to swap tokens
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (window.swapInterface && window.swapInterface.currentBuyToken) {
                    window.swapInterface.swapTokens();
                }
            }
            
            // Ctrl/Cmd + Enter to execute swap
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                const getStartedBtn = document.getElementById('getStartedBtn');
                if (getStartedBtn && !getStartedBtn.disabled) {
                    getStartedBtn.click();
                }
            }
        });
    }
    
    setupScreenReaderSupport() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
        document.body.appendChild(liveRegion);
        
        this.liveRegion = liveRegion;
    }
    
    announceToScreenReader(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
        }
    }
    
    initializeErrorHandling() {
        // Global error handlers
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.handleError(e.error);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.handleError(e.reason);
        });
    }
    
    handleError(error) {
        // In a production app, you'd send errors to a logging service
        console.error('Application error:', error);
        
        // Show user-friendly error message
        this.showErrorToast('Something went wrong. Please try again.');
    }
    
    handleInitializationError(error) {
        // Show critical error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h2>Unable to load application</h2>
            <p>Please refresh the page or try again later.</p>
            <button onclick="window.location.reload()">Refresh Page</button>
        `;
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-card);
            padding: 2rem;
            border-radius: 1rem;
            text-align: center;
            z-index: 1000;
        `;
        document.body.appendChild(errorDiv);
    }
    
    showErrorToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-primary);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
    
    // Utility methods
    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
    
    static formatNumber(number, decimals = 2) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }
    
    static debounce(func, wait) {
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
}

// Initialize app
const app = new App();

// Make app instance globally available for debugging
if (typeof window !== 'undefined') {
    window.app = app;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .swap-card {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease-out;
    }
    
    .swap-card.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);