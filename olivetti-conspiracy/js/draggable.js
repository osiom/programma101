console.log("draggable.js loaded!");

class DraggableFrame {
    constructor(frameId) {
        this.frameId = frameId;
        this.frame = document.getElementById(frameId);
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        
        // Get the initial position from CSS
        const rect = this.frame.getBoundingClientRect();
        this.currentX = rect.left;
        this.currentY = rect.top;
        
        // Set initial transform to maintain current position
        this.updatePosition();
        
        this.init();
    }

    init() {
        this.frame.addEventListener('mousedown', (e) => this.dragStart(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', (e) => this.dragEnd(e));
        this.frame.addEventListener('dragstart', (e) => e.preventDefault());
    }

    dragStart(e) {
        console.log("Starting drag for", this.frameId);
        this.isDragging = true;
        this.offsetX = e.clientX - this.currentX;
        this.offsetY = e.clientY - this.currentY;
        this.frame.classList.add('dragging');
        e.preventDefault();
    }

    drag(e) {
        if (this.isDragging) {
            this.currentX = e.clientX - this.offsetX;
            this.currentY = e.clientY - this.offsetY;
            
            // Keep within bounds
            this.currentX = Math.max(0, Math.min(this.currentX, window.innerWidth - this.frame.offsetWidth));
            this.currentY = Math.max(0, Math.min(this.currentY, window.innerHeight - this.frame.offsetHeight));
            
            this.updatePosition();
        }
    }

    dragEnd(e) {
        this.isDragging = false;
        this.frame.classList.remove('dragging');
    }

    updatePosition() {
        const rotation = this.frameId === 'pintoriFrame1' ? '-1deg' : '2deg';
        this.frame.style.position = 'fixed';
        this.frame.style.left = this.currentX + 'px';
        this.frame.style.top = this.currentY + 'px';
        this.frame.style.right = 'auto'; // Clear any right positioning
        this.frame.style.transform = `rotate(${rotation})`;
    }
}