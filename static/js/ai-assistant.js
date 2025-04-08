/**
 * AI Assistant Mascot
 * Provides contextual tips and guidance throughout the listing generation process
 */

class AIAssistant {
    constructor() {
        this.container = null;
        this.tipElement = null;
        this.assistantElement = null;
        this.isVisible = false;
        this.currentTip = '';
        this.tipQueue = [];
        this.tipTimeout = null;
        
        // Initialize tips for different form sections
        this.tips = {
            welcome: [
                "👋 Hi there! I'm Listy, your AI listing assistant!",
                "Need help creating a great Amazon listing? I'm here to guide you!"
            ],
            productName: [
                "A clear, descriptive product name helps buyers find your product",
                "Keep your product name concise but descriptive",
                "Include your main keywords in your product name for better SEO"
            ],
            category: [
                "Choosing the right category helps shoppers find your product",
                "Be specific with your category - it affects how Amazon ranks your listing"
            ],
            features: [
                "Highlight unique selling points that set your product apart",
                "Describe benefits, not just features - how does it make life better?",
                "Quantify when possible - numbers are powerful (e.g., '50% more durable')"
            ],
            keywords: [
                "Include relevant search terms buyers might use to find your product",
                "Think about problem-solving terms customers might search for",
                "Don't worry about repeating words or plurals - Amazon's algorithm handles that"
            ],
            competitorUrls: [
                "Adding competitor listings helps me understand what's working in your niche",
                "Look at top-selling products to see what keywords they're targeting"
            ],
            results: [
                "Here's your listing! Feel free to edit any section to match your style",
                "A great title includes your main keywords and stays under 200 characters",
                "Strong bullet points focus on benefits first, then features"
            ]
        };
        
        this.initialize();
    }
    
    initialize() {
        // Only initialize once the DOM is fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        // Create container for the assistant
        this.container = document.createElement('div');
        this.container.className = 'ai-assistant-container';
        
        // Create the assistant mascot element (SVG will be injected here)
        this.assistantElement = document.createElement('div');
        this.assistantElement.className = 'ai-assistant-mascot';
        this.assistantElement.innerHTML = this.getMascotSVG();
        
        // Create the tip speech bubble
        this.tipElement = document.createElement('div');
        this.tipElement.className = 'ai-assistant-tip';
        
        // Add a close button
        const closeButton = document.createElement('button');
        closeButton.className = 'ai-assistant-close';
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', () => this.hide());
        
        // Assemble the elements
        this.container.appendChild(this.assistantElement);
        this.container.appendChild(this.tipElement);
        this.container.appendChild(closeButton);
        
        // Add to the document
        document.body.appendChild(this.container);
        
        // Show welcome message after a short delay
        setTimeout(() => {
            this.showTip('welcome');
        }, 1000);
        
        // Add event listeners for form fields to show contextual tips
        this.setupEventListeners();
        // Toggle assistant button
        const toggleButton = document.getElementById("toggle-assistant");
        if (toggleButton) {
            toggleButton.addEventListener("click", () => this.toggle());
        }
    }
    
    setupEventListeners() {
        // Toggle assistant button
        const toggleButton = document.getElementById("toggle-assistant");
        if (toggleButton) {
            toggleButton.addEventListener("click", () => this.toggle());
        }
        // Product name field
        const productNameField = document.getElementById('product-name');
        if (productNameField) {
            productNameField.addEventListener('focus', () => this.showTip('productName'));
        }
        
        // Category field
        const categoryField = document.getElementById('category');
        if (categoryField) {
            categoryField.addEventListener('focus', () => this.showTip('category'));
        }
        
        // Features container - delegate to parent
        const featuresContainer = document.getElementById('features-container');
        if (featuresContainer) {
            featuresContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('feature-input')) {
                    this.showTip('features');
                }
            });
        }
        
        // Keywords field
        const keywordsField = document.getElementById('keywords');
        if (keywordsField) {
            keywordsField.addEventListener('focus', () => this.showTip('keywords'));
        }
        
        // URL container - delegate to parent
        const urlsContainer = document.getElementById('urls-container');
        if (urlsContainer) {
            urlsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('competitor-url')) {
                    this.showTip('competitorUrls');
                }
            });
        }
        
        // Results section
        const generateButton = document.querySelector('button[type="submit"]');
        if (generateButton) {
            generateButton.addEventListener('click', () => {
                // Wait for results to load
                setTimeout(() => {
                    if (document.getElementById('output-container').style.display !== 'none') {
                        this.showTip('results');
                    }
                }, 5000);
            });
        }
    }
    
    getMascotSVG() {
        // Return a simplified robot/AI assistant SVG
        return `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="28" fill="#5B75E6" stroke="#0D2880" stroke-width="2"/>
            <circle cx="20" cy="25" r="4" fill="white"/>
            <circle cx="40" cy="25" r="4" fill="white"/>
            <circle cx="20" cy="25" r="2" fill="#0D2880"/>
            <circle cx="40" cy="25" r="2" fill="#0D2880"/>
            <path d="M22 38C22 38 26 42 30 42C34 42 38 38 38 38" stroke="#0D2880" stroke-width="2" stroke-linecap="round"/>
            <path d="M10 20C10 20 14 13 22 10" stroke="#0D2880" stroke-width="2" stroke-linecap="round"/>
            <path d="M50 20C50 20 46 13 38 10" stroke="#0D2880" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
    }
    
    showTip(section) {
        // Get a random tip from the specified section
        if (!this.tips[section] || this.tips[section].length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * this.tips[section].length);
        const tip = this.tips[section][randomIndex];
        
        // Don't show the same tip twice in a row
        if (tip === this.currentTip) {
            return this.showTip(section);
        }
        
        this.currentTip = tip;
        this.tipElement.textContent = tip;
        
        // Make the assistant visible
        this.show();
        
        // Animate the tip
        this.tipElement.classList.add('tip-appear');
        setTimeout(() => {
            this.tipElement.classList.remove('tip-appear');
        }, 300);
        
        // Auto-hide the tip after a delay if it's not a welcome message
        if (section !== 'welcome') {
            clearTimeout(this.tipTimeout);
            this.tipTimeout = setTimeout(() => {
                this.hide();
            }, 10000);
        }
    }
    
    show() {
        if (!this.isVisible) {
            this.container.classList.add('visible');
            this.isVisible = true;
        }
    }
    
    hide() {
        if (this.isVisible) {
            this.container.classList.remove('visible');
            this.isVisible = false;
            clearTimeout(this.tipTimeout);
        }
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
            this.showTip('welcome');
        }
    }
}

// Initialize the assistant when the document is ready
const aiAssistant = new AIAssistant();
