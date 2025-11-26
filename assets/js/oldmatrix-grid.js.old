/**
 * Matrix Grid Background Animation
 * Creates an interactive matrix-style grid that responds to mouse movement
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        cellSize: 50,
        characters: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン',
        baseSpeed: {
            normal: 20,
            reverse: 25
        },
        mouseEffect: {
            radius: 100,
            speedMultiplier: 0.5
        },
        opacity: {
            grid: 0.08,
            highlight: 0.3
        }
    };
    
    /**
     * Initialize the matrix grid
     */
    function initMatrixGrid() {
        const matrixGrid = document.getElementById('matrixGrid');
        if (!matrixGrid) return;
        
        // Clear existing grid if any
        matrixGrid.innerHTML = '';
        
        // Calculate number of rows needed
        const rows = Math.ceil(window.innerHeight / CONFIG.cellSize) + 2;
        
        // Generate grid rows
        for (let i = 0; i < rows; i++) {
            const row = createRow(i);
            matrixGrid.appendChild(row);
        }
        
        // Set up mouse interaction
        setupMouseInteraction();
    }
    
    /**
     * Create a single row of the grid
     */
    function createRow(index) {
        const row = document.createElement('div');
        row.className = index % 2 === 0 ? 'grid-row' : 'grid-row reverse';
        
        // Calculate cells needed for full width coverage
        const cellsPerRow = Math.ceil(window.innerWidth / CONFIG.cellSize) * 2;
        
        for (let j = 0; j < cellsPerRow; j++) {
            const cell = createCell();
            row.appendChild(cell);
        }
        
        return row;
    }
    
    /**
     * Create a single cell with random character
     */
    function createCell() {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        
        // Assign random character
        const randomChar = CONFIG.characters[Math.floor(Math.random() * CONFIG.characters.length)];
        cell.setAttribute('data-char', randomChar);
        
        return cell;
    }
    
    /**
     * Set up mouse interaction for the grid
     */
    function setupMouseInteraction() {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let animationFrame = null;
        
        // Mouse move handler
        function handleMouseMove(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Cancel previous animation frame
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            
            // Schedule update
            animationFrame = requestAnimationFrame(() => {
                updateGridAnimation(mouseX, mouseY);
                updateCellHighlights(mouseX, mouseY);
            });
        }
        
        // Touch support for mobile
        function handleTouchMove(e) {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                handleMouseMove({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            }
        }
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
    }
    
    /**
     * Update grid animation based on mouse position
     */
    function updateGridAnimation(mouseX, mouseY) {
        const centerX = window.innerWidth / 2;
        const speedMultiplier = (mouseX - centerX) / centerX;
        
        const rows = document.querySelectorAll('.grid-row');
        rows.forEach((row, index) => {
            const baseSpeed = index % 2 === 0 ? CONFIG.baseSpeed.normal : CONFIG.baseSpeed.reverse;
            const newSpeed = baseSpeed * (1 - speedMultiplier * CONFIG.mouseEffect.speedMultiplier);
            
            // Clamp speed to reasonable bounds
            const clampedSpeed = Math.max(5, Math.min(50, newSpeed));
            row.style.animationDuration = `${clampedSpeed}s`;
            
            // Change direction based on mouse position
            if (mouseX < centerX) {
                row.style.animationDirection = index % 2 === 0 ? 'reverse' : 'normal';
            } else {
                row.style.animationDirection = index % 2 === 0 ? 'normal' : 'reverse';
            }
        });
    }
    
    /**
     * Update cell highlights based on mouse proximity
     */
    function updateCellHighlights(mouseX, mouseY) {
        const cells = document.querySelectorAll('.grid-cell');
        
        // Use RAF to batch DOM updates
        cells.forEach(cell => {
            const rect = cell.getBoundingClientRect();
            const cellCenterX = rect.left + rect.width / 2;
            const cellCenterY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(cellCenterX - mouseX, 2) + 
                Math.pow(cellCenterY - mouseY, 2)
            );
            
            if (distance < CONFIG.mouseEffect.radius) {
                const intensity = 1 - (distance / CONFIG.mouseEffect.radius);
                cell.style.borderColor = 'var(--primary-green)';
                cell.style.opacity = CONFIG.opacity.highlight * intensity;
            } else {
                cell.style.borderColor = '';
                cell.style.opacity = '';
            }
        });
    }
    
    /**
     * Handle window resize
     */
    function handleResize() {
        // Debounce resize events
        clearTimeout(handleResize.timeout);
        handleResize.timeout = setTimeout(() => {
            initMatrixGrid();
        }, 250);
    }
    
    /**
     * Initialize when DOM is ready
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initMatrixGrid);
        } else {
            initMatrixGrid();
        }
        
        // Handle resize events
        window.addEventListener('resize', handleResize);
        
        // Handle page visibility changes (pause animation when hidden)
        document.addEventListener('visibilitychange', () => {
            const matrixGrid = document.getElementById('matrixGrid');
            if (!matrixGrid) return;
            
            if (document.hidden) {
                matrixGrid.style.animationPlayState = 'paused';
            } else {
                matrixGrid.style.animationPlayState = 'running';
            }
        });
    }
    
    // Start initialization
    init();
    
    // Export for use in other scripts if needed
    window.MatrixGrid = {
        init: initMatrixGrid,
        updateAnimation: updateGridAnimation,
        CONFIG: CONFIG
    };
})();
