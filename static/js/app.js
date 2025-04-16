document.addEventListener('DOMContentLoaded', function () {
    const API_BASE = 'https://ai-assistant-cfce.onrender.com';

    const listingForm = document.getElementById('listing-form');
    const addFeatureBtn = document.getElementById('add-feature');
    const featuresContainer = document.getElementById('features-container');
    const outputContainer = document.getElementById('output-container');
    const loadingOverlay = document.getElementById('loading-overlay');
    const errorContainer = document.getElementById('error-container');

    const addUrlBtn = document.getElementById('add-url');
    const urlsContainer = document.getElementById('urls-container');
    const analyzeCompetitorsBtn = document.getElementById('analyze-competitors');
    const competitorAnalysisSection = document.getElementById('competitor-analysis');
    const competitorAnalysisContent = document.getElementById('competitor-analysis-content');

    if (featuresContainer && featuresContainer.children.length === 0) {
        for (let i = 0; i < 3; i++) {
            addFeatureInput();
        }
    }

    if (addFeatureBtn) {
        addFeatureBtn.addEventListener('click', addFeatureInput);
    }

    if (addUrlBtn) {
        addUrlBtn.addEventListener('click', addUrlInput);
    }

    if (analyzeCompetitorsBtn) {
        analyzeCompetitorsBtn.addEventListener('click', analyzeCompetitors);
    }

    document.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('remove-feature')) {
            e.target.closest('.feature-item').remove();
        }
        if (e.target && e.target.classList.contains('remove-url')) {
            e.target.closest('.url-item').remove();
        }
    });

    if (listingForm) {
        listingForm.addEventListener('submit', handleFormSubmit);
    }

    setupCopyButtons();

    function addFeatureInput() {
        if (!featuresContainer) return;

        const newFeatureItem = document.createElement('div');
        newFeatureItem.className = 'feature-item';

        newFeatureItem.innerHTML = `
            <input type="text" class="form-control feature-input" placeholder="e.g., High-efficiency particulate air (HEPA) filter" required>
            <button type="button" class="btn btn-outline-danger remove-feature">×</button>
        `;

        featuresContainer.appendChild(newFeatureItem);
    }

    function addUrlInput() {
        const newUrlItem = document.createElement('div');
        newUrlItem.className = 'url-item input-group mb-2';
        newUrlItem.innerHTML = `
            <input type="url" class="form-control competitor-url" placeholder="https://www.amazon.com/dp/ASIN">
            <button type="button" class="btn btn-outline-danger remove-url">×</button>
        `;
        urlsContainer.appendChild(newUrlItem);
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        errorContainer.style.display = 'none';
        outputContainer.style.display = 'none';
        loadingOverlay.style.display = 'flex';

        const title = document.getElementById('product-name').value;
        const category = document.getElementById('category').value;
        const keywords = document.getElementById('keywords').value;

        const featureInputs = document.querySelectorAll('.feature-input');
        const features = Array.from(featureInputs).map(input => input.value.trim()).filter(Boolean);

        const urlInputs = document.querySelectorAll('.competitor-url');
        const competitorUrls = Array.from(urlInputs)
            .map(input => input.value.trim())
            .filter(url => url.startsWith('http'));

        try {
            const response = await fetch(`${API_BASE}/api/generate-listing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    category,
                    features,
                    keywords,
                    competitor_urls: competitorUrls
                })
            });

            const result = await response.json();

            loadingOverlay.style.display = 'none';

            if (result.error) {
                showError(result.error);
                return;
            }

            displayGeneratedListing(result.listing);
        } catch (error) {
            loadingOverlay.style.display = 'none';
            showError('Failed to generate listing. Please try again.');
        }
    }

    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }

    function displayGeneratedListing(listingText) {
        document.getElementById('product-title').textContent = '';
        document.getElementById('bullets-list').innerHTML = '';
        document.getElementById('product-description').textContent = '';
        document.getElementById('seo-score').textContent = '0';
        document.getElementById('title-analysis').textContent = '';
        document.getElementById('keyword-recommendations').innerHTML = '';
        document.getElementById('keyword-density-table').innerHTML = '';
        document.getElementById('keywords-container').textContent = '';
        document.getElementById('competitor-urls-list').innerHTML = '';

        document.getElementById('product-title').textContent = listingText;
        outputContainer.style.display = 'block';
    }

    async function analyzeCompetitors() {
        const urlInputs = document.querySelectorAll('.competitor-url');
        const urls = Array.from(urlInputs)
            .map(input => input.value.trim())
            .filter(url => url.startsWith('http'));

        if (urls.length === 0) return;

        try {
            const response = await fetch(`${API_BASE}/api/analyze-competitors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls })
            });

            const result = await response.json();

            competitorAnalysisContent.innerHTML = result.analysis
                .map(entry => `<p><strong>${entry.url}</strong><br>${entry.insight}</p>`)
                .join('');

            competitorAnalysisSection.style.display = 'block';
        } catch (error) {
            showError('Failed to analyze competitors.');
        }
    }

    function setupCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', function () {
                const targetId = this.id.replace('copy-', '');
                const content = document.getElementById(`product-${targetId}`)?.textContent || '';
                navigator.clipboard.writeText(content).then(() => {
                    this.textContent = 'Copied!';
                    setTimeout(() => (this.textContent = 'Copy'), 2000);
                });
            });
        });
    }
});
