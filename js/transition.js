// Handle page transitions and flash effects

document.addEventListener('DOMContentLoaded', function() {
    // Flag to indicate if we're coming from the index page
    const fromIndex = sessionStorage.getItem('fromIndex');
    
    if (fromIndex === 'true') {
        // If coming from index, trigger the flash transition
        const transitionElement = document.querySelector('.page-transition');
        
        // Remove previous session storage
        sessionStorage.removeItem('fromIndex');
        
        // Add the flash animation class
        if (transitionElement) {
            transitionElement.classList.add('flash-transition');
            
            // Remove the animation class after it completes to allow future transitions
            setTimeout(() => {
                transitionElement.classList.remove('flash-transition');
            }, 600);
        }
    }
    
    // Add click listeners to links going to the dark theme pages
    document.querySelectorAll('a[href="about.html"], a[href="archive.html"]').forEach(link => {
        link.addEventListener('click', function(e) {
            // Only do this if we're on the index page (which doesn't have the dark-theme class)
            if (!document.body.classList.contains('dark-theme')) {
                // Set flag for destination page to know we're coming from index
                sessionStorage.setItem('fromIndex', 'true');
            }
        });
    });
});
