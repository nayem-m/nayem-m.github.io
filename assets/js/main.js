/**
 * Main JavaScript for Moosa Nayem Portfolio
 * Handles navigation, animations, and interactive elements
 */

(function() {
    'use strict';
    
    /**
     * Mobile Navigation Toggle
     */
    function initMobileNav() {
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (!navToggle || !navLinks) return;
        
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
            
            // Animate hamburger to X
            const spans = this.querySelectorAll('span');
            if (this.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translateY(8px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
    
    /**
     * Typing Animation Effect
     */
    function initTypingEffect() {
        const elements = document.querySelectorAll('.typing-effect');
        
        elements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.visibility = 'visible';
            
            let i = 0;
            const speed = element.dataset.speed || 100;
            
            function typeWriter() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, speed);
                }
            }
            
            // Start typing after a delay
            setTimeout(typeWriter, element.dataset.delay || 500);
        });
    }
    
    /**
     * Terminal Prompt Animation
     */
    function initTerminalPrompts() {
        const prompts = document.querySelectorAll('.terminal-prompt');
        
        prompts.forEach(prompt => {
            if (prompt.dataset.animated === 'true') return;
            
            const originalText = prompt.textContent;
            prompt.textContent = '';
            prompt.dataset.animated = 'true';
            
            let i = 0;
            function typeCommand() {
                if (i < originalText.length) {
                    prompt.textContent += originalText.charAt(i);
                    i++;
                    setTimeout(typeCommand, 50);
                }
            }
            
            setTimeout(typeCommand, 300);
        });
    }
    
    /**
     * Smooth Scroll for Anchor Links
     */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                
                if (target) {
                    const offset = 80; // Account for fixed header
                    const targetPosition = target.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    /**
     * Card Hover Effects
     */
    function initCardEffects() {
        const cards = document.querySelectorAll('.nav-card, .card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }
    
    /**
     * Console Easter Eggs
     */
    function initConsoleMessages() {
        // Security warning
        console.log('%c' + 'Security Notice', 'color: #00a832; font-weight: bold; font-size: 20px;');
        console.log('%c' + 'This console is for developers only. If someone told you to paste something here, it\'s likely a social engineering attack.', 'color: #666; font-size: 14px;');
        console.log('%c' + 'Learn more about self-XSS attacks: https://en.wikipedia.org/wiki/Self-XSS', 'color: #00a832; font-size: 12px;');
        
        // ASCII art
        console.log('%c' + `
╔═══════════════════════════════════════╗
║   Welcome to my portfolio!           ║
║   Like what you see?                 ║
║   Let's connect!                     ║
║                                       ║
║   Email: nayempw@protonmail.com      ║
║   GitHub: /nayem-m                   ║
╚═══════════════════════════════════════╝
        `, 'color: #00a832; font-family: monospace; font-size: 12px;');
    }
    
    /**
     * Konami Code Easter Egg
     */
    function initKonamiCode() {
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                
                if (konamiIndex === konamiCode.length) {
                    activateEasterEgg();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });
    }
    
    function activateEasterEgg() {
        document.body.style.animation = 'matrix-flash 0.5s';
        
        setTimeout(() => {
            document.body.style.animation = '';
            alert('🎉 Achievement Unlocked: "Konami Master" - You found the secret!');
            
            // Add achievement badge to page
            const badge = document.createElement('div');
            badge.className = 'achievement-badge';
            badge.innerHTML = '🏆 Konami Master';
            document.body.appendChild(badge);
            
            setTimeout(() => badge.remove(), 5000);
        }, 500);
    }
    
    /**
     * Theme Toggle (optional)
     */
    function initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
    
    /**
     * Accessibility Features
     */
    function initAccessibility() {
        // Skip to content link
        const skipLink = document.querySelector('.skip-to-content');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const main = document.querySelector('#main-content');
                if (main) {
                    main.tabIndex = -1;
                    main.focus();
                }
            });
        }
        
        // Ensure keyboard navigation for interactive elements
        document.querySelectorAll('.nav-card, .card').forEach(element => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
            
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }
    
    /**
     * Performance Monitoring
     */
    function initPerformanceMonitoring() {
        // Log page load time
        window.addEventListener('load', () => {
            if (performance.timing) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`Page loaded in ${loadTime}ms`);
            }
        });
        
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    /**
     * Initialize all features
     */
    function init() {
        initMobileNav();
        initTypingEffect();
        initTerminalPrompts();
        initSmoothScroll();
        initCardEffects();
        initConsoleMessages();
        initKonamiCode();
        initThemeToggle();
        initAccessibility();
        initPerformanceMonitoring();
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export for use in other scripts
    window.Portfolio = {
        init: init,
        typeEffect: initTypingEffect,
        smoothScroll: initSmoothScroll
    };
})();
