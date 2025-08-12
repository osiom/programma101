console.log("main.js loaded!");


// Simple initialization when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing frames...");
    
    // Initialize both draggable frames
    if (typeof DraggableFrame !== 'undefined') {
        const frame1 = new DraggableFrame('pintoriFrame1');
        const frame2 = new DraggableFrame('pintoriFrame2');
        const frame3 = new DraggableFrame('pintoriFrame3');
        console.log("Frames initialized successfully");
    } else {
        console.error("DraggableFrame class not found!");
    }
});