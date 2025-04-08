document.addEventListener('DOMContentLoaded', function() {
    // Initialize the form
    const form = document.getElementById('listing-form');
    const featuresContainer = document.getElementById('features-container');
    const addFeatureBtn = document.getElementById('add-feature');
    const loadingOverlay = document.getElementById('loading-overlay');
    const outputContainer = document.getElementById('output-container');
    const errorContainer = document.getElementById('error-container');
    
    // Add first feature input
    if (featuresContainer.children.length === 0) {
        addFeatureInput();
    }
    
    // Add feature input button
    addFeatureBtn.addEventListener('click', function() {
        addFeatureInput();
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        errorContainer.style.display = 'none';
        errorContainer.textContent = '';
        
        // Get form data
        const productName = document.getElementById('product-name').value.trim();
        const category = document.getElementById('category').value.trim();
        const featureInputs = document.querySelectorAll('.feature-input');
        
        // Validate inputs
        if (!productName || !category) {
            showError('Product name and category are required.');
            return;
        }
        
        // Collect features (skip empty ones)
        const features = [];
        featureInputs.forEach(input => {
            const value = input.value.trim();
            if (value) {
                features.push(value);
            }
        });
        
        if (features.length === 0) {
            showError('At least one product feature is required.');
            return;
        }
        
        // Show loading overlay
        loadingOverlay.style.display = 'flex';
        
        // Prepare request data
        const requestData = {
            product_name: productName,
            category: category,
            features: features
        };
        
        // Make API call
        fetch('/api/generate-listing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.detail || 'Failed to generate listing');
                });
            }
            return response.json();
        })
        .then(data => {
            // Hide loading overlay
            loadingOverlay.style.display = 'none';
            
            // Display results
            displayResults(data);
        })
        .catch(error => {
            // Hide loading overlay
            loadingOverlay.style.display = 'none';
            
            // Show error message
            showError(error.message || 'Failed to generate listing. Please try again.');
        });
    });
    
    // Function to add a new feature input
    function addFeatureInput() {
        const featureItem = document.createElement('div');
        featureItem.className = 'feature-item';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control feature-input';
        input.placeholder = 'Enter a product feature';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-outline-danger';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', function() {
            if (featuresContainer.children.length > 1) {
                featuresContainer.removeChild(featureItem);
            } else {
                input.value = ''; // Just clear the input if it's the last one
            }
        });
        
        featureItem.appendChild(input);
        featureItem.appendChild(removeBtn);
        featuresContainer.appendChild(featureItem);
        
        // Focus the new input
        input.focus();
    }
    
    // Function to display results
    function displayResults(data) {
        // Show output container
        outputContainer.style.display = 'block';
        
        // Set title
        document.getElementById('product-title').textContent = data.title;
        document.getElementById('copy-title').dataset.content = data.title;
        
        // Set bullet points
        const bulletsList = document.getElementById('bullets-list');
        bulletsList.innerHTML = '';
        data.bullets.forEach(bullet => {
            const li = document.createElement('li');
            li.textContent = bullet;
            bulletsList.appendChild(li);
        });
        document.getElementById('copy-bullets').dataset.content = data.bullets.join('\n• ');
        
        // Set description
        document.getElementById('product-description').textContent = data.description;
        document.getElementById('copy-description').dataset.content = data.description;
        
        // Set keywords
        if (data.keywords && data.keywords.length > 0) {
            const keywordsContainer = document.getElementById('keywords-container');
            keywordsContainer.innerHTML = '';
            
            // Create keyword badges
            data.keywords.forEach(keyword => {
                const badge = document.createElement('span');
                badge.className = 'badge bg-secondary me-2 mb-2';
                badge.textContent = keyword;
                keywordsContainer.appendChild(badge);
            });
            
            // Set copy content
            document.getElementById('copy-keywords').dataset.content = data.keywords.join(', ');
        }
        
        // Set competitor URLs
        if (data.competitor_urls && data.competitor_urls.length > 0) {
            const urlsList = document.getElementById('competitor-urls-list');
            urlsList.innerHTML = '';
            
            // Prepare content for copy button
            let urlsText = '';
            
            // Add each competitor URL to the table
            data.competitor_urls.forEach((competitor, index) => {
                const row = document.createElement('tr');
                
                // Index column
                const indexCell = document.createElement('th');
                indexCell.scope = 'row';
                indexCell.textContent = index + 1;
                row.appendChild(indexCell);
                
                // Title column
                const titleCell = document.createElement('td');
                titleCell.textContent = competitor.title;
                row.appendChild(titleCell);
                
                // URL column with copy button
                const urlCell = document.createElement('td');
                
                // URL truncated display with tooltip
                const urlSpan = document.createElement('span');
                const shortUrl = competitor.url.length > 30 ? 
                    competitor.url.substring(0, 30) + '...' : 
                    competitor.url;
                urlSpan.textContent = shortUrl;
                urlSpan.title = competitor.url;
                urlSpan.className = 'me-2';
                urlCell.appendChild(urlSpan);
                
                // Individual copy button for this URL
                const copyBtn = document.createElement('button');
                copyBtn.className = 'btn btn-sm btn-outline-info';
                copyBtn.textContent = 'Copy';
                copyBtn.dataset.content = competitor.url;
                copyBtn.addEventListener('click', function() {
                    navigator.clipboard.writeText(this.dataset.content).then(() => {
                        const originalText = this.textContent;
                        this.textContent = 'Copied!';
                        setTimeout(() => {
                            this.textContent = originalText;
                        }, 2000);
                    });
                });
                urlCell.appendChild(copyBtn);
                
                row.appendChild(urlCell);
                urlsList.appendChild(row);
                
                // Add to copy all content
                urlsText += `${index + 1}. ${competitor.title}: ${competitor.url}\n`;
            });
            
            // Set copy all button content
            document.getElementById('copy-urls').dataset.content = urlsText;
        }
        
        // Display SEO analysis if available
        if (data.seo_analysis) {
            displaySeoAnalysis(data.seo_analysis);
        }
        
        // Setup copy buttons
        setupCopyButtons();
        
        // Scroll to results
        outputContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Function to display SEO analysis
    function displaySeoAnalysis(seoData) {
        // Display SEO score
        const score = seoData.seo_score.percentage || 0;
        const scoreElement = document.getElementById('seo-score');
        const ratingElement = document.getElementById('seo-rating');
        const scoreCircle = document.getElementById('seo-score-circle');
        
        // Animate score counting up
        animateCount(scoreElement, 0, score, 1500);
        
        // Display rating
        ratingElement.textContent = seoData.seo_score.rating || 'Not Rated';
        
        // Set circle color based on score
        let colorClass = 'bg-danger';
        if (score >= 70) colorClass = 'bg-success';
        else if (score >= 50) colorClass = 'bg-warning';
        
        // Update circle progress
        scoreCircle.style.background = `conic-gradient(var(--bs-${colorClass.substring(3)}) 0%, var(--bs-${colorClass.substring(3)}) ${score}%, var(--bs-gray) ${score}% 100%)`;
        
        // Display recommendations
        const recommendationsElement = document.getElementById('seo-recommendations');
        recommendationsElement.innerHTML = '';
        if (seoData.recommendations && seoData.recommendations.length > 0) {
            seoData.recommendations.forEach(rec => {
                const li = document.createElement('li');
                li.textContent = rec;
                recommendationsElement.appendChild(li);
            });
        } else {
            // No recommendations means perfect score
            const li = document.createElement('li');
            li.textContent = "Great job! Your listing is well-optimized for Amazon search.";
            recommendationsElement.appendChild(li);
        }
        
        // Display title analysis
        if (seoData.title_analysis) {
            const titleAnalysis = document.getElementById('title-analysis');
            const charCount = seoData.title_analysis.character_count;
            const charLimit = seoData.title_analysis.character_limit;
            let statusClass = 'text-success';
            
            if (charCount > charLimit) {
                statusClass = 'text-danger';
            } else if (charCount < 100) {
                statusClass = 'text-warning';
            }
            
            titleAnalysis.innerHTML = `
                <div class="${statusClass}">
                    Character count: ${charCount}/${charLimit} 
                    ${charCount > charLimit ? '(Too long)' : charCount < 100 ? '(Could be longer)' : '(Optimal)'}
                </div>
            `;
        }
        
        // Display keyword density analysis
        if (seoData.keyword_density) {
            const densityTable = document.getElementById('keyword-density-table');
            densityTable.innerHTML = '';
            
            Object.entries(seoData.keyword_density).forEach(([keyword, data]) => {
                const row = document.createElement('tr');
                
                // Keyword
                const keywordCell = document.createElement('td');
                keywordCell.textContent = keyword;
                row.appendChild(keywordCell);
                
                // Count
                const countCell = document.createElement('td');
                countCell.textContent = data.count;
                row.appendChild(countCell);
                
                // Density
                const densityCell = document.createElement('td');
                densityCell.textContent = data.percentage + '%';
                row.appendChild(densityCell);
                
                // Status
                const statusCell = document.createElement('td');
                let statusClass = 'keyword-status-good';
                let statusText = 'Good';
                
                if (data.percentage < 0.5) {
                    statusClass = 'keyword-status-warning';
                    statusText = 'Too Low';
                } else if (data.percentage > 2.5) {
                    statusClass = 'keyword-status-danger';
                    statusText = 'Too High';
                }
                
                statusCell.innerHTML = `<span class="${statusClass}">${statusText}</span>`;
                row.appendChild(statusCell);
                
                densityTable.appendChild(row);
            });
        }
    }
    
    // Function to animate a number counting up
    function animateCount(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentCount = Math.floor(progress * (end - start) + start);
            element.textContent = currentCount;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = end;  // Ensure the final value is exact
            }
        };
        window.requestAnimationFrame(step);
    }
    
    // Function to show error message
    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }
    
    // Setup copy buttons functionality
    function setupCopyButtons() {
        const copyButtons = document.querySelectorAll('.copy-btn');
        
        copyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const content = this.dataset.content;
                navigator.clipboard.writeText(content).then(() => {
                    // Change button text temporarily
                    const originalText = this.textContent;
                    this.textContent = 'Copied!';
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 2000);
                });
            });
        });
    }
});
