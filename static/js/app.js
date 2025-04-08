document.addEventListener('DOMContentLoaded', function() {
    // UI Elements
    const listingForm = document.getElementById('listing-form');
    const addFeatureBtn = document.getElementById('add-feature');
    const featuresContainer = document.getElementById('features-container');
    const outputContainer = document.getElementById('output-container');
    const loadingOverlay = document.getElementById('loading-overlay');
    const errorContainer = document.getElementById('error-container');
    
    // URL handling elements
    const addUrlBtn = document.getElementById('add-url');
    const urlsContainer = document.getElementById('urls-container');
    
    // Initialize with default feature inputs
    if (featuresContainer.children.length === 0) {
        for (let i = 0; i < 3; i++) {
            addFeatureInput();
        }
    }
    
    // Event listeners
    if (addFeatureBtn) {
        addFeatureBtn.addEventListener('click', addFeatureInput);
    }
    
    if (addUrlBtn) {
        addUrlBtn.addEventListener('click', addUrlInput);
    }
    
    // Delegate event handling for dynamically created "remove" buttons
    document.addEventListener('click', function(e) {
        // Handle feature remove buttons
        if (e.target && e.target.classList.contains('remove-feature')) {
            e.target.closest('.feature-item').remove();
        }
        
        // Handle URL remove buttons
        if (e.target && e.target.classList.contains('remove-url')) {
            e.target.closest('.url-item').remove();
        }
    });
    
    // Handle form submission
    if (listingForm) {
        listingForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Set up copy buttons
    setupCopyButtons();
    
    // Function to add new feature input
    function addFeatureInput() {
        const newFeatureItem = document.createElement('div');
        newFeatureItem.className = 'feature-item';
        
        newFeatureItem.innerHTML = `
            <input type="text" class="form-control feature-input" placeholder="e.g., High-efficiency particulate air (HEPA) filter" required>
            <button type="button" class="btn btn-outline-danger remove-feature">×</button>
        `;
        
        featuresContainer.appendChild(newFeatureItem);
    }
    
    // Function to add URL input
    function addUrlInput() {
        const newUrlItem = document.createElement('div');
        newUrlItem.className = 'url-item input-group mb-2';
        
        newUrlItem.innerHTML = `
            <input type="url" class="form-control competitor-url" placeholder="https://www.amazon.com/dp/ASIN">
            <button type="button" class="btn btn-outline-danger remove-url">×</button>
        `;
        
        urlsContainer.appendChild(newUrlItem);
    }
    
    // Handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Get form values
        const productName = document.getElementById('product-name').value.trim();
        const category = document.getElementById('category').value.trim();
        
        // Get features
        const featureInputs = document.querySelectorAll('.feature-input');
        const features = Array.from(featureInputs)
            .map(input => input.value.trim())
            .filter(feature => feature !== '');
            
        // Get keywords (if provided)
        const keywordsInput = document.getElementById('keywords').value.trim();
        const keywords = keywordsInput ? keywordsInput.split(',').map(k => k.trim()).filter(k => k !== '') : [];
        
        // Get competitor URLs (if provided)
        const urlInputs = document.querySelectorAll('.competitor-url');
        const competitorUrls = Array.from(urlInputs)
            .map(input => input.value.trim())
            .filter(url => url !== '');
        
        // Validate inputs
        if (!productName || !category || features.length === 0) {
            showError('Please fill out all required fields');
            return;
        }
        
        // Validation for features
        if (features.length < 3) {
            showError('Please add at least 3 product features');
            return;
        }
        
        // Show loading overlay
        loadingOverlay.style.display = 'flex';
        errorContainer.style.display = 'none';
        
        // Prepare data for API request
        const requestData = {
            product_name: productName,
            category: category,
            features: features
        };
        
        // Add optional parameters if provided
        if (keywords.length > 0) {
            requestData.keywords = keywords;
        }
        
        if (competitorUrls.length > 0) {
            requestData.competitor_urls = competitorUrls.map((url, index) => {
                return { url: url, title: '', position: index };
            });
        }
        
        // Make API request
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
            showError(error.message);
            console.error('Error:', error);
        });
    }
    
    // Display the generated results
    function displayResults(data) {
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
        
        document.getElementById('copy-bullets').dataset.content = data.bullets.join('\n');
        
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
                
                // Position number
                const positionCell = document.createElement('td');
                positionCell.textContent = index + 1;
                row.appendChild(positionCell);
                
                // Product title
                const titleCell = document.createElement('td');
                titleCell.textContent = competitor.title || 'Competitor Product';
                row.appendChild(titleCell);
                
                // URL with link
                const urlCell = document.createElement('td');
                const urlLink = document.createElement('a');
                urlLink.href = competitor.url;
                urlLink.textContent = competitor.url;
                urlLink.target = '_blank';
                urlLink.rel = 'noopener noreferrer';
                urlCell.appendChild(urlLink);
                row.appendChild(urlCell);
                
                urlsList.appendChild(row);
                
                // Add to copy text
                urlsText += `${competitor.url}\n`;
            });
            
            // Set copy content for URLs
            document.getElementById('copy-urls').dataset.content = urlsText.trim();
        }
        
        // Display SEO analysis if available
        if (data.seo_analysis) {
            displaySeoAnalysis(data.seo_analysis);
        }
        
        // Show the output container
        outputContainer.style.display = 'block';
        
        // Scroll to results
        outputContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Display SEO analysis data
    function displaySeoAnalysis(seoData) {
        if (!seoData) return;
        
        // Update SEO score with animation
        if (seoData.seo_score && typeof seoData.seo_score.percentage === 'number') {
            const seoScoreElement = document.getElementById('seo-score');
            animateCount(seoScoreElement, 0, seoData.seo_score.percentage, 1000);
            
            // Add color class based on score
            const scoreCircle = document.querySelector('.seo-score-circle');
            if (scoreCircle) {
                // Remove any existing color classes
                scoreCircle.classList.remove('bg-success', 'bg-warning', 'bg-danger');
                
                // Add appropriate color class
                const score = seoData.seo_score.percentage;
                if (score >= 80) {
                    scoreCircle.classList.add('bg-success');
                } else if (score >= 50) {
                    scoreCircle.classList.add('bg-warning');
                } else {
                    scoreCircle.classList.add('bg-danger');
                }
            }
        }
        
        // Display recommendations
        if (seoData.recommendations && seoData.recommendations.length > 0) {
            const recommendationsElement = document.getElementById('keyword-recommendations');
            recommendationsElement.innerHTML = '';
            
            for (const recommendation of seoData.recommendations) {
                const li = document.createElement('li');
                li.textContent = recommendation;
                recommendationsElement.appendChild(li);
            }
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
                densityCell.textContent = data.percentage.toFixed(2) + '%';
                row.appendChild(densityCell);
                
                densityTable.appendChild(row);
            });
        }
    }
    
    // Function to animate count for SEO score
    function animateCount(element, start, end, duration) {
        if (!element) return;
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = end;
            }
        };
        window.requestAnimationFrame(step);
    }
    
    // Show error message
    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }
    
    // Set up copy buttons
    function setupCopyButtons() {
        const copyButtons = document.querySelectorAll('.copy-btn');
        
        copyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const content = button.dataset.content;
                
                if (content) {
                    // Create temporary textarea to copy from
                    const textarea = document.createElement('textarea');
                    textarea.value = content;
                    textarea.style.position = 'fixed'; // Prevent scrolling to the bottom
                    document.body.appendChild(textarea);
                    textarea.select();
                    
                    try {
                        // Execute copy command
                        document.execCommand('copy');
                        
                        // Update button text temporarily
                        const originalText = button.textContent;
                        button.textContent = 'Copied!';
                        
                        // Reset button text after 2 seconds
                        setTimeout(() => {
                            button.textContent = originalText;
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy text: ', err);
                    } finally {
                        // Remove the temporary textarea
                        document.body.removeChild(textarea);
                    }
                }
            });
        });
    }
});
