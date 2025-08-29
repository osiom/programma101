let articles = [];

async function loadArchive() {
            try {
                const response = await fetch('data/archive.json');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                articles = await response.json();
                displayArchive(articles);
            } catch (error) {
                console.error('Error loading archive:', error);
            }
        }
        function displayArchive(articles) {
            const container = document.getElementById('archiveTable');
            
            // Sort articles by ID
            articles.sort((a, b) => a.id.localeCompare(b.id));
            
            // Check if we're on mobile
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                displayCardsView(articles, container);
            } else {
                displayTableView(articles, container);
            }
        }

function displayTableView(articles, container) {
    let tableHTML = `
        <table class="archive-data">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Content</th>
                    <th>Reference</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    articles.forEach(article => {
        const shortContent = article.content.length > 100 ? article.content.substring(0, 100) + '...' : article.content;
        tableHTML += `
            <tr>
                <td>${article.id}</td>
                <td>${article.title}</td>
                <td>${article.description}</td>
                <td>
                    ${shortContent}
                    ${article.content.length > 100 ? `<br><button class="view-full-btn" onclick="showFullContent('${article.id}', \`${article.title}\`, \`${article.content}\`)")}', '${article.content.replace(/'/g, "\\'")}')" >View Full</button>` : ''}
                </td>
                <td>${article.reference ? `<a href="${article.reference}" target="_blank">Link</a>` : 'No link'}</td>
            </tr>
        `;
    });
                    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

function displayCardsView(articles, container) {
    let cardsHTML = '<div class="archive-cards">';
    
    articles.forEach(article => {
        cardsHTML += `
            <div class="archive-card">
                <div class="card-id">ID: ${article.id}</div>
                <h3 class="card-title">${article.title}</h3>
                <p class="card-description">${article.description}</p>
                <div class="card-actions">
                    <button class="view-content-btn" onclick="showFullContent('${article.id}', \`${article.title}\`, \`${article.content}\`)">View Content</button>
                    ${article.reference ? `<a href="${article.reference}" target="_blank" class="reference-link">Reference</a>` : ''}
                </div>
            </div>
        `;
    });
    
    cardsHTML += '</div>';
    container.innerHTML = cardsHTML;
}

function showFullContent(id, title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalContent').textContent = content;
    document.getElementById('contentModal').style.display = 'flex';
}

function closeContentModal(event) {
    const modal = document.getElementById('contentModal');
    if (!event || event.target === modal || event.target.classList.contains('close-content-modal')) {
        modal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', loadArchive);

// Handle window resize to switch between table and cards
window.addEventListener('resize', debounce(() => {
    if (articles.length > 0) {
        displayArchive(articles);
    }
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