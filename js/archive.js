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
                    <th>Content</th>
                    <th>Reference</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    articles.forEach(article => {
        // For content with HTML tags, use a text-only version for the preview
        let plainContent = article.content.replace(/<[^>]*>/g, '');
        const shortContent = plainContent.length > 100 ? plainContent.substring(0, 100) + '...' : plainContent;
        tableHTML += `
            <tr>
                <td>${article.id}</td>
                <td>${article.title}</td>
                <td>
                    ${shortContent}
                    ${article.content.length > 100 ? `<br><button class="view-full-btn" onclick="openArticleModal('${article.id}')">View Full</button>` : ''}
                </td>
                <td><span class="table-reference">${article.reference}</span></td>
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
        // For content with HTML tags, use a text-only version for the preview
        let plainContent = article.content.replace(/<[^>]*>/g, '');
        const shortContent = plainContent.length > 60 ? plainContent.substring(0, 60) + '...' : plainContent;
        cardsHTML += `
            <div class="archive-card">
                <div class="card-id">ID: ${article.id}</div>
                <h3 class="card-title">${article.title}</h3>
                <p class="card-content">${shortContent}</p>
                <div class="card-actions">
                    <button class="view-content-btn" onclick="openArticleModal('${article.id}')">View Content</button>
                </div>
            </div>
        `;
    });
    
    cardsHTML += '</div>';
    container.innerHTML = cardsHTML;
}

function openArticleModal(id) {
    const article = articles.find(a => a.id === id);
    if (!article) {
        console.error('Article not found with ID:', id);
        return;
    }
    
    document.getElementById('modalTitle').textContent = article.title;
    
    const modalContent = document.getElementById('modalContent');
    // Format content by splitting into paragraphs at sentences
    const formattedContent = formatContentIntoParagraphs(article.content);
    
    modalContent.innerHTML = `
        <div class="article-content">${formattedContent}</div>
        ${article.reference ? `<p class="reference-quote">${article.reference}</p>` : ''}
    `;
    
    // Show the modal
    const modal = document.getElementById('contentModal');
    modal.style.display = 'flex';
    
}

function closeContentModal(event) {
    const modal = document.getElementById('contentModal');
    
    // If there's no event, or if the click was on the modal backdrop or close button
    if (!event || event.target === modal || event.target.classList.contains('close-modal')) {
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

// Function to split content into paragraphs for better readability
function formatContentIntoParagraphs(content) {
    // If content is empty, return empty string
    if (!content) return '';
    
    // For article with HTML tags or special formatting
    if (content.includes('<b>') || content.includes('<i>') || content.includes("factory's")) {
        // First, preprocess the text to mark known sentence boundaries
        let preprocessed = content
            // Mark sentence boundaries
            .replace(/\?\s+/g, '?<SENTENCE_BREAK>')
            .replace(/!\s+/g, '!<SENTENCE_BREAK>')
            .replace(/\.\s+(?=[A-Z])/g, '.<SENTENCE_BREAK>');
        
        // Don't split in the middle of possessives and quotes
        preprocessed = preprocessed
            .replace(/\.\s*'\s*(?![A-Z])/g, ".") // Fix quotes not followed by capital letters
            .replace(/factory's/g, "factory<APOSTROPHE>s")
            .replace(/perhaps:/g, "perhaps<COLON>");
        
        // Convert to paragraphs
        let formattedContent = '<p>' + preprocessed.split('<SENTENCE_BREAK>').join('</p><p>') + '</p>';
        
        // Restore special characters
        formattedContent = formattedContent
            .replace(/<APOSTROPHE>/g, "'")
            .replace(/<COLON>/g, ":");
        
        // Clean up any empty paragraphs
        formattedContent = formattedContent.replace(/<p>\s*<\/p>/g, '');
        
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