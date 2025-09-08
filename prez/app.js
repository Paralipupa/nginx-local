// Presentation JavaScript
class PresentationApp {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 12;
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.currentSlideSpan = document.getElementById('currentSlide');
        this.totalSlidesSpan = document.getElementById('totalSlides');
        this.slidesContainer = document.getElementById('slidesContainer');

        this.init();
    }

    init() {
        // Ensure elements exist before proceeding
        if (!this.prevBtn || !this.nextBtn || !this.fullscreenBtn) {
            console.error('Navigation elements not found!');
            return;
        }

        this.setupEventListeners();
        this.updateSlideIndicator();
        this.updateNavigationButtons();
        this.preloadSlides();
        
        console.log('Presentation initialized successfully');
    }

    setupEventListeners() {
        // Navigation buttons with explicit event binding
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Previous button clicked');
                this.previousSlide();
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Next button clicked');
                this.nextSlide();
            });
        }

        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Fullscreen button clicked');
                this.toggleFullscreen();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));

        // Click navigation on slides
        if (this.slidesContainer) {
            this.slidesContainer.addEventListener('click', (e) => {
                // Don't trigger slide navigation if clicking on navigation buttons
                if (e.target.closest('.navigation')) {
                    return;
                }

                if (e.target.classList.contains('slide') || e.target.closest('.slide')) {
                    const rect = this.slidesContainer.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const centerX = rect.width / 2;
                    
                    if (clickX > centerX) {
                        this.nextSlide();
                    } else {
                        this.previousSlide();
                    }
                }
            });
        }

        // Touch/swipe navigation for mobile
        this.setupTouchNavigation();

        // Resize handler
        window.addEventListener('resize', () => this.handleResize());

        // Fullscreen change handlers
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
    }

    setupTouchNavigation() {
        let startX = null;
        let startY = null;

        if (this.slidesContainer) {
            this.slidesContainer.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            });

            this.slidesContainer.addEventListener('touchend', (e) => {
                if (!startX || !startY) return;

                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const diffX = startX - endX;
                const diffY = startY - endY;

                // Only handle horizontal swipes (ignore vertical scrolling)
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    if (diffX > 0) {
                        this.nextSlide();
                    } else {
                        this.previousSlide();
                    }
                }

                startX = null;
                startY = null;
            });
        }
    }

    handleKeyNavigation(e) {
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                this.previousSlide();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case 'PageDown':
            case ' ':
                e.preventDefault();
                this.nextSlide();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides);
                break;
            case 'F11':
            case 'f':
            case 'F':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'Escape':
                if (this.isFullscreen()) {
                    e.preventDefault();
                    this.exitFullscreen();
                }
                break;
        }

        // Number keys for direct slide navigation
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) {
            e.preventDefault();
            if (num <= this.totalSlides) {
                this.goToSlide(num);
            }
        }
    }

    nextSlide() {
        console.log(`Attempting to go to next slide. Current: ${this.currentSlide}, Total: ${this.totalSlides}`);
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        console.log(`Attempting to go to previous slide. Current: ${this.currentSlide}`);
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    goToSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides || slideNumber === this.currentSlide) {
            return;
        }

        console.log(`Navigating from slide ${this.currentSlide} to slide ${slideNumber}`);

        // Remove active class from current slide
        const currentSlideElement = document.querySelector('.slide.active');
        if (currentSlideElement) {
            currentSlideElement.classList.remove('active');
        }

        // Add active class to new slide
        const newSlideElement = document.querySelector(`[data-slide="${slideNumber}"]`);
        if (newSlideElement) {
            newSlideElement.classList.add('active');
        }

        this.currentSlide = slideNumber;
        this.updateSlideIndicator();
        this.updateNavigationButtons();
        
        // Trigger slide change event
        this.onSlideChange(slideNumber);
    }

    updateSlideIndicator() {
        if (this.currentSlideSpan) {
            this.currentSlideSpan.textContent = this.currentSlide;
        }
        if (this.totalSlidesSpan) {
            this.totalSlidesSpan.textContent = this.totalSlides;
        }
    }

    updateNavigationButtons() {
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentSlide === 1;
        }
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentSlide === this.totalSlides;
        }
    }

    onSlideChange(slideNumber) {
        console.log(`Successfully navigated to slide ${slideNumber}`);
        
        // Add entrance animations for slide content
        const currentSlideElement = document.querySelector('.slide.active');
        if (currentSlideElement) {
            this.animateSlideContent(currentSlideElement);
        }
    }

    animateSlideContent(slideElement) {
        // Add staggered animations for slide content
        const animatableElements = slideElement.querySelectorAll(
            '.task-list li, .problem-card, .area-item, .feature, .step, .tech-solution, .result-item, .metric-card'
        );
        
        animatableElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100 + 200);
        });
    }

    preloadSlides() {
        // Ensure all slides are properly positioned
        this.slides.forEach((slide, index) => {
            const slideNumber = index + 1;
            slide.setAttribute('data-slide', slideNumber);
            
            if (slideNumber === 1) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    }

    toggleFullscreen() {
        console.log('Toggling fullscreen mode');
        if (this.isFullscreen()) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    enterFullscreen() {
        console.log('Entering fullscreen');
        const element = document.documentElement;
        
        try {
            if (element.requestFullscreen) {
                element.requestFullscreen().catch(err => console.error('Fullscreen error:', err));
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else {
                console.log('Fullscreen API not supported, using manual fullscreen');
                this.enterManualFullscreen();
            }
        } catch (error) {
            console.error('Error entering fullscreen:', error);
            this.enterManualFullscreen();
        }
    }

    enterManualFullscreen() {
        document.body.classList.add('manual-fullscreen');
        if (this.fullscreenBtn) {
            this.fullscreenBtn.innerHTML = '⛶';
            this.fullscreenBtn.title = 'Exit fullscreen';
        }
    }

    exitFullscreen() {
        console.log('Exiting fullscreen');
        try {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(err => console.error('Exit fullscreen error:', err));
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else {
                this.exitManualFullscreen();
            }
        } catch (error) {
            console.error('Error exiting fullscreen:', error);
            this.exitManualFullscreen();
        }
    }

    exitManualFullscreen() {
        document.body.classList.remove('manual-fullscreen');
        if (this.fullscreenBtn) {
            this.fullscreenBtn.innerHTML = '⛶';
            this.fullscreenBtn.title = 'Enter fullscreen';
        }
    }

    isFullscreen() {
        return !!(document.fullscreenElement || 
                 document.webkitFullscreenElement || 
                 document.mozFullScreenElement || 
                 document.msFullscreenElement ||
                 document.body.classList.contains('manual-fullscreen'));
    }

    handleFullscreenChange() {
        const fullscreenBtn = this.fullscreenBtn;
        if (!fullscreenBtn) return;

        if (this.isFullscreen()) {
            fullscreenBtn.innerHTML = '⛶';
            fullscreenBtn.title = 'Exit fullscreen (Esc)';
            document.body.classList.add('fullscreen');
        } else {
            fullscreenBtn.innerHTML = '⛶';
            fullscreenBtn.title = 'Enter fullscreen (F11)';
            document.body.classList.remove('fullscreen');
            document.body.classList.remove('manual-fullscreen');
        }
    }

    handleResize() {
        // Handle any resize-specific logic
        console.log('Window resized');
    }

    // Public methods for external control
    getCurrentSlide() {
        return this.currentSlide;
    }

    getTotalSlides() {
        return this.totalSlides;
    }

    // Auto-advance functionality (optional)
    startAutoAdvance(intervalMs = 30000) {
        this.stopAutoAdvance();
        this.autoAdvanceInterval = setInterval(() => {
            if (this.currentSlide < this.totalSlides) {
                this.nextSlide();
            } else {
                this.stopAutoAdvance();
            }
        }, intervalMs);
    }

    stopAutoAdvance() {
        if (this.autoAdvanceInterval) {
            clearInterval(this.autoAdvanceInterval);
            this.autoAdvanceInterval = null;
        }
    }
}

// Utility functions
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

// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing presentation...');
    
    // Wait a bit to ensure all elements are rendered
    setTimeout(() => {
        window.presentation = new PresentationApp();
        
        // Add some helpful console messages
        console.log('🎯 Presentation Controls:');
        console.log('├── Click arrow buttons or use arrow keys to navigate');
        console.log('├── Space/PageDown for next slide');
        console.log('├── PageUp for previous slide');
        console.log('├── Home/End for first/last slide');
        console.log('├── F11 or F to toggle fullscreen');
        console.log('├── Number keys (1-9) for direct slide navigation');
        console.log('└── Swipe on mobile devices');
        
        // Expose helpful methods to global scope for debugging
        window.goToSlide = (n) => window.presentation.goToSlide(n);
        window.nextSlide = () => window.presentation.nextSlide();
        window.prevSlide = () => window.presentation.previousSlide();
        window.toggleFullscreen = () => window.presentation.toggleFullscreen();
    }, 100);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.presentation) {
        if (document.hidden) {
            window.presentation.stopAutoAdvance();
        }
    }
});

// Prevent context menu on right click in presentation mode
document.addEventListener('contextmenu', (e) => {
    if (window.presentation && window.presentation.isFullscreen()) {
        e.preventDefault();
    }
});

// Add smooth scrolling behavior for any internal links
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href') && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
});