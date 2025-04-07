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
        
        // Setup copy buttons
        setupCopyButtons();
        
        // Scroll to results
        outputContainer.scrollIntoView({ behavior: 'smooth' });
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