// Main JavaScript for cube animation and interaction

// Using a single color theme for cubes
const cubeColorClass = 'color-black';
let articles = [];
let activeCubes = [];
let currentArticleIndex = 0;

function generateSafePositions() {
    const cubeSize = window.innerWidth < 768 ? 90 : 140; // Smaller cubes on mobile
    const margin = 20; // Keep cubes away from edges
    
    const positions = [];
    const cols = Math.floor((window.innerWidth - margin * 2) / (cubeSize + 20));
    const rows = Math.floor((window.innerHeight - margin * 2) / (cubeSize + 20));
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            positions.push({
                top: margin + row * (cubeSize + 20) + 'px',
                left: margin + col * (cubeSize + 20) + 'px'
            });
        }
    }
    
    return positions;
}

let positions = generateSafePositions();

async function loadArticles() {
    try {
        const response = await fetch('data/archive.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        // Validate data structure
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Invalid or empty articles data');
        }
        
        articles = data;
        shuffleArray(articles);
        startCubeRotation();
    } catch (error) {
        // Show a fallback message if there's an error loading content
        const mainTitle = document.querySelector('.main-title');
        if (mainTitle) mainTitle.textContent = 'Content Loading Error';
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getRandomPosition() {
    const usedPositions = activeCubes.map(cube => cube.positionIndex);
    const availableIndices = [];
    
    for (let i = 0; i < positions.length; i++) {
        if (!usedPositions.includes(i)) {
            availableIndices.push(i);
        }
    }
    
    if (availableIndices.length === 0) {
        return { position: positions[0], index: 0 };
    }
    
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    return { position: positions[randomIndex], index: randomIndex };
}

function createCube(article) {
    const container = document.createElement('div');
    const positionData = getRandomPosition();
    const position = positionData.position;
    
    container.className = `cube-container ${cubeColorClass}`;
    container.style.top = position.top;
    container.style.left = position.left;
    container.onclick = () => openModal(article);

    // Get the title for the cube
    let shortTitle = article.title;
    
    // For longer titles, add a class to make the text smaller
    if (article.title.length > 20) {
        container.classList.add('small-text');
    }
    
    // If very long title, add extra-small class
    if (article.title.length > 35) {
        container.classList.add('extra-small-text');
    }

    container.innerHTML = `
        <div class="cube">
            <div class="cube-face front">${shortTitle}</div>
            <div class="cube-face back">${shortTitle}</div>
            <div class="cube-face right"></div>
            <div class="cube-face left"></div>
            <div class="cube-face top"></div>
            <div class="cube-face bottom"></div>
        </div>
    `;

    document.body.appendChild(container);
    setTimeout(() => container.classList.add('show'), 100);

    const removeTimeout = setTimeout(() => {
        removeCube(container);
    }, 20000); // Increased from 15 to 20 seconds

    activeCubes.push({
        element: container,
        timeout: removeTimeout,
        article: article,
        positionIndex: positionData.index
    });
}

function removeCube(container) {
    const cubeIndex = activeCubes.findIndex(cube => cube.element === container);
    if (cubeIndex !== -1) {
        clearTimeout(activeCubes[cubeIndex].timeout);
        activeCubes.splice(cubeIndex, 1);
    }

    container.classList.remove('show');
    container.classList.add('fade-out');
    
    setTimeout(() => {
        if (container.parentElement) {
            container.parentElement.removeChild(container);
        }
    }, 800);
}

function showNextCube() {
    if (articles.length === 0) return;
    if (activeCubes.length >= 5) return; // Increased maximum from 3 to 5 cubes

    const article = articles[currentArticleIndex % articles.length];
    currentArticleIndex++;

    if (currentArticleIndex % articles.length === 0) {
        shuffleArray(articles);
    }

    createCube(article);
}

function startCubeRotation() {
    showNextCube();
    setInterval(showNextCube, 4000);
}

function openModal(article) {
    const modal = document.getElementById('articleModal');
    const content = document.getElementById('modalContent');
    
    // Format content by splitting into paragraphs at sentences
    const formattedContent = formatContentIntoParagraphs(article.content);
    
    content.innerHTML = `
        <h2>${article.title}</h2>
        <div class="article-content">${formattedContent}</div>
        ${article.reference ? `<p class="reference-quote">${article.reference}</p>` : ''}
    `;
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('articleModal').style.display = 'none';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadArticles);

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('articleModal');
    if (e.target === modal) closeModal();
});

// Handle window resize to regenerate positions
window.addEventListener('resize', debounce(() => {
    positions = generateSafePositions();
    
    // Update existing cubes with new positions if needed
    activeCubes.forEach(cube => {
        if (cube.element.parentElement) {
            const newPositionData = getRandomPosition();
            const newPosition = newPositionData.position;
            cube.element.style.top = newPosition.top;
            cube.element.style.left = newPosition.left;
            cube.positionIndex = newPositionData.index;
        }
    });
}, 300));

// Debounce function to prevent too many resize calls
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

// Function to split content into paragraphs for better readability
function formatContentIntoParagraphs(content) {
    // If content is empty, return empty string
    if (!content) return '';
    
    // For article with HTML, ensure proper handling of tags
    if (content.includes('<b>')) {
        // Replace newlines with paragraph breaks first
        let formattedContent = content.replace(/\n/g, '</p><p>');
        
        // Create paragraphs by splitting at each sentence ending
        formattedContent = formattedContent.replace(/([.!?])\s+/g, '$1</p><p>');
        
        // Clean up any empty paragraphs
        formattedContent = formattedContent.replace(/<p>\s*<\/p>/g, '');
        
        // Ensure the content starts and ends with paragraph tags
        if (!formattedContent.startsWith('<p>')) {
            formattedContent = '<p>' + formattedContent;
        }
        if (!formattedContent.endsWith('</p>')) {
            formattedContent += '</p>';
        }
        
        return formattedContent;
    }
    
    // First, let's handle special cases that we don't want to split
    // Replace periods in IDs and preserve special sequences like [...]
    const preservedContent = content
        .replace(/(\b[A-Za-z]+)\.(\d+\b)/g, "$1##DOT##$2") // Replace periods in IDs
        .replace(/(\[\.\.\.\])/g, "##ELLIPSIS##") // Preserve [...] notation
        .replace(/(\[\.{3}\])/g, "##ELLIPSIS##") // Also match [...]
        .replace(/(\b[A-Za-z]+\d+\b)/g, "$1"); // Keep IDs intact
    
    // Split text into sentences that end with periods, question marks, or exclamation points
    // followed by a space or end of string, being careful not to split at ID numbers
    const regex = /[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g;
    const sentences = preservedContent.match(regex) || [preservedContent];
    
    // Create a paragraph for each sentence
    const paragraphs = sentences.map(sentence => {
        // Restore any replaced periods in IDs and special notations
        return sentence
            .replace(/##DOT##/g, ".") // Restore periods in IDs
            .replace(/##ELLIPSIS##/g, "[...]") // Restore [...] notation
            .trim();
    });
    
    // Join paragraphs with HTML paragraph tags
    return paragraphs.map(p => `<p>${p}</p>`).join('');
}