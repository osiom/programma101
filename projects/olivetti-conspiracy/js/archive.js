async function loadArchive() {
            try {
                const response = await fetch('data/archive.json');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const articles = await response.json();
                displayArchive(articles);
            } catch (error) {
                console.error('Error loading archive:', error);
            }
        }
        function displayArchive(articles) {
            const container = document.getElementById('archiveTable');
            
            // Sort articles by ID
            articles.sort((a, b) => a.id.localeCompare(b.id));
            
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
                tableHTML += `
                    <tr>
                        <td>${article.id}</td>
                        <td>${article.title}</td>
                        <td>${article.description}</td>
                        <td>${article.content.length > 100 ? article.content.substring(0, 100) + '...' : article.content}</td>
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
        document.addEventListener('DOMContentLoaded', loadArchive);