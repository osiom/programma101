console.log('main.js loaded successfully');

const colors = ['color-red', 'color-blue', 'color-yellow', 'color-green'];
let articles = [];
let activeCubes = [];
let currentArticleIndex = 0;

const positions = [
    { top: '20%', left: '15%' },
    { top: '25%', left: '75%' },
    { top: '70%', left: '20%' },
    { top: '75%', left: '80%' },
    { top: '35%', left: '10%' },
    { top: '60%', left: '85%' },
    { top: '15%', left: '60%' },
    { top: '80%', left: '40%' },
    { top: '40%', left: '85%' },
    { top: '65%', left: '15%' }
];

async function loadArticles() {
    try {
        const response = await fetch('data/archive.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        articles = await response.json();
        shuffleArray(articles);
        startCubeRotation();
    } catch (error) {
        console.error('Error loading articles:', error);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getRandomPosition() {
    return positions[Math.floor(Math.random() * positions.length)];
}

function createCube(article) {
    const container = document.createElement('div');
    const colorClass = colors[Math.floor(Math.random() * colors.length)];
    const position = getRandomPosition();
    
    container.className = `cube-container ${colorClass}`;
    container.style.top = position.top;
    container.style.left = position.left;
    container.onclick = () => openModal(article);

    const shortDescription = article.description.length > 25 ? 
        article.description.substring(0, 22) + '...' : 
        article.description;

    container.innerHTML = `
        <div class="cube">
            <div class="cube-face front">${shortDescription}</div>
            <div class="cube-face back">${article.title}</div>
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
    }, 10000);

    activeCubes.push({
        element: container,
        timeout: removeTimeout,
        article: article
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
    if (activeCubes.length >= 3) return;

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
    
    content.innerHTML = `
        <h2>${article.title}</h2>
        <p><strong>Description:</strong> ${article.description}</p>
        <div>${article.content}</div>
        ${article.reference ? `<p><a href="${article.reference}" target="_blank">Reference Link</a></p>` : ''}
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