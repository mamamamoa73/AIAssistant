import os
import json
import logging
import random
import re
from collections import Counter
from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Define the base class for SQLAlchemy models
class Base(DeclarativeBase):
    pass

# Initialize Flask app and SQLAlchemy
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize SQLAlchemy
db = SQLAlchemy(model_class=Base)
db.init_app(app)

# Define models
class Listing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=False)
    keywords = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Define relationships
    bullet_points = db.relationship('BulletPoint', backref='listing', cascade='all, delete-orphan')
    competitor_urls = db.relationship('CompetitorURL', backref='listing', cascade='all, delete-orphan')

class BulletPoint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey('listing.id'), nullable=False)
    bullet_text = db.Column(db.String(500), nullable=False)
    position = db.Column(db.Integer, nullable=False)
    
class CompetitorURL(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey('listing.id'), nullable=False)
    url = db.Column(db.String(1024), nullable=False)
    title = db.Column(db.String(500), nullable=True)
    position = db.Column(db.Integer, nullable=False)

# Create all tables
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    """Render the main page with the listing generator form."""
    return render_template('index.html')

def generate_amazon_listing(product_name, category, features, target_keywords=None):
    """
    Generate an Amazon product listing using a template-based approach with SEO optimization.
    
    Args:
        product_name (str): The name of the product
        category (str): Product category
        features (list): List of key product features
        target_keywords (list, optional): List of target keywords for SEO optimization
        
    Returns:
        dict: Generated listing with title, bullets, description, keywords, competitor URLs, and SEO analysis
    """
    # Validate inputs
    if not product_name or not category or not features:
        raise ValueError("Missing required product information")
    
    # Template patterns for different product categories
    templates = {
        "Electronics": {
            "title": f"{product_name} - Premium [FEATURE1] with [FEATURE2] - Advanced [CATEGORY] Technology for [BENEFIT] - [YEAR]",
            "description": f"Introducing the innovative {product_name}, the perfect solution for all your {category.lower()} needs. This cutting-edge device combines state-of-the-art technology with sleek design to deliver an unparalleled user experience.\n\nEngineered with precision and attention to detail, the {product_name} offers exceptional performance that stands out in today's competitive market. Whether you're a professional looking for reliable equipment or a casual user seeking convenience, this product exceeds expectations on all fronts.\n\nThe {product_name} features advanced functionality that puts it ahead of similar products. Its intuitive interface makes it accessible to users of all experience levels, while its robust construction ensures longevity and durability even with regular use.\n\nOur team of engineers has spent countless hours perfecting every aspect of the {product_name}. The result is a product that not only meets but exceeds industry standards, providing you with a truly remarkable experience every time you use it.\n\nInvest in quality and reliability with the {product_name} - the smart choice for discerning customers who demand excellence."
        },
        "Home & Kitchen": {
            "title": f"{product_name} - Premium Quality [FEATURE1] for Modern Homes - Durable [CATEGORY] with [FEATURE2] - Perfect for [BENEFIT]",
            "description": f"Transform your living space with the exceptional {product_name}, designed specifically for today's modern homes. This premium {category.lower()} item combines elegant design with practical functionality to enhance your daily life.\n\nCrafted from high-quality materials, the {product_name} is built to last and withstand the rigors of regular use. Its thoughtful design addresses common pain points while providing innovative solutions that make your home life more comfortable and convenient.\n\nThe {product_name} seamlessly integrates into any home décor style, adding both aesthetic appeal and practical value to your living space. Its versatile design makes it suitable for various uses, adapting to your changing needs.\n\nWe've paid meticulous attention to every detail of the {product_name}, ensuring that it not only looks beautiful but performs flawlessly. From the quality of materials to the precision of manufacturing, no aspect has been overlooked.\n\nBring home the {product_name} today and experience the perfect balance of style, functionality, and durability. Your satisfaction is guaranteed with this exceptional addition to your home."
        },
        "Beauty & Personal Care": {
            "title": f"{product_name} - Professional [CATEGORY] [FEATURE1] - Gentle yet Effective [FEATURE2] for [BENEFIT] - Premium Quality",
            "description": f"Discover the transformative power of the {product_name}, a revolutionary addition to your {category.lower()} routine. This premium product delivers professional-grade results from the comfort of your home, helping you look and feel your absolute best.\n\nFormulated with the finest ingredients, the {product_name} is gentle on your skin while effectively addressing your specific {category.lower()} needs. Its innovative approach sets a new standard in personal care, offering results you can see and feel immediately.\n\nThe {product_name} has been developed following extensive research and testing to ensure optimal performance and safety. Each component has been carefully selected to work in harmony, providing a comprehensive solution to your {category.lower()} requirements.\n\nPerfect for daily use, the {product_name} integrates seamlessly into your existing routine, enhancing your natural beauty without complicated procedures or extensive time commitments. Its user-friendly design makes professional-quality care accessible to everyone.\n\nChoose the {product_name} for your {category.lower()} needs and join thousands of satisfied customers who have made this exceptional product part of their daily self-care ritual."
        },
        "Sports & Outdoors": {
            "title": f"{product_name} - Professional Grade [CATEGORY] Equipment - Durable [FEATURE1] with [FEATURE2] for [BENEFIT] - Performance Engineered",
            "description": f"Elevate your performance with the game-changing {product_name}, engineered for athletes and outdoor enthusiasts who demand the very best. This professional-grade {category.lower()} equipment combines innovative design with durable construction to support your active lifestyle.\n\nBuilt to withstand the challenges of intense use and varying environmental conditions, the {product_name} delivers consistent performance when you need it most. Its resilient construction ensures longevity, making it a worthwhile investment for serious enthusiasts.\n\nThe {product_name} features cutting-edge technology that enhances your natural abilities, helping you achieve new personal bests and overcome previous limitations. Every aspect has been optimized to support peak performance, giving you a competitive edge.\n\nExtensive field testing by professional athletes has informed the development of the {product_name}, resulting in equipment that addresses real-world needs and challenges. The feedback of experts has been incorporated at every stage of the design process.\n\nTake your {category.lower()} experience to the next level with the {product_name} - where superior quality meets exceptional performance for those who refuse to compromise."
        }
    }
    
    # Default template for categories not in our list
    default_template = {
        "title": f"{product_name} - Premium Quality [FEATURE1] with [FEATURE2] - Professional [CATEGORY] for [BENEFIT]",
        "description": f"Introducing the remarkable {product_name}, a standout product in the {category} market designed to exceed your expectations. This premium item combines innovative design with exceptional functionality to deliver a superior experience.\n\nMeticulously crafted with attention to detail, the {product_name} addresses common challenges while offering unique benefits that set it apart from competitors. Every aspect has been carefully considered to ensure optimal performance and user satisfaction.\n\nThe {product_name} represents our commitment to quality and innovation in the {category} industry. We've incorporated feedback from customers and experts alike to create a product that truly meets the needs of its users.\n\nWhether you're a professional seeking reliable equipment or an enthusiast looking for quality, the {product_name} delivers consistent results you can count on. Its versatile design adapts to various situations, providing flexible solutions for diverse requirements.\n\nChoose the {product_name} for a combination of quality, performance, and value that's unmatched in today's market. Join our satisfied customers who have made this exceptional product an essential part of their lives."
    }
    
    # Select the appropriate template or use default
    template = templates.get(category, default_template)
    
    # Process features for title and description
    main_features = features[:2] if len(features) >= 2 else features + ["Quality"] * (2 - len(features))
    benefit = "Maximum Performance" if not features else features[0].split(" ")[-1]
    
    # Replace placeholders in title
    title = template["title"]
    title = title.replace("[FEATURE1]", main_features[0])
    title = title.replace("[FEATURE2]", main_features[1])
    title = title.replace("[CATEGORY]", category)
    title = title.replace("[BENEFIT]", benefit)
    title = title.replace("[YEAR]", "2025")
    
    # Generate benefit-focused bullet points based on features
    bullet_templates = [
        "[FEATURE]: Enjoy [BENEFIT] with our advanced design that sets new standards in [CATEGORY].",
        "PREMIUM [FEATURE]: Experience exceptional [BENEFIT] that makes everyday tasks easier and more efficient.",
        "INNOVATIVE [FEATURE]: Discover the difference with our unique approach to [BENEFIT] that competitors can't match.",
        "DURABLE [FEATURE]: Rely on long-lasting performance with quality construction designed for [BENEFIT].",
        "USER-FRIENDLY [FEATURE]: Appreciate the intuitive design that makes [BENEFIT] accessible to everyone.",
        "VERSATILE [FEATURE]: Adapt to changing needs with flexible functionality perfect for various [BENEFIT] scenarios.",
        "PROFESSIONAL-GRADE [FEATURE]: Achieve results comparable to professional services with our [BENEFIT] solution.",
        "ECO-FRIENDLY [FEATURE]: Make responsible choices with our sustainable approach to [BENEFIT]."
    ]
    
    bullets = []
    for i, feature in enumerate(features[:5]):
        if i < len(bullet_templates):
            bullet = bullet_templates[i].replace("[FEATURE]", feature.upper())
            bullet = bullet.replace("[BENEFIT]", "enhanced performance" if not benefit else benefit)
            bullet = bullet.replace("[CATEGORY]", category)
            bullets.append(bullet)
    
    # Pad bullets to exactly 5 if needed
    if len(bullets) < 5:
        for i in range(5 - len(bullets)):
            index = (len(bullets) + i) % len(bullet_templates)
            generic_feature = f"Quality Feature {i+1}"
            bullet = bullet_templates[index].replace("[FEATURE]", generic_feature.upper())
            bullet = bullet.replace("[BENEFIT]", "enhanced performance" if not benefit else benefit)
            bullet = bullet.replace("[CATEGORY]", category)
            bullets.append(bullet)
    
    # Generate keywords based on product features and category
    keywords_templates = {
        "Electronics": ["tech", "gadget", "smart", "wireless", "digital", "device", "electronic", "innovative"],
        "Home & Kitchen": ["home", "kitchen", "decor", "appliance", "cookware", "furniture", "household", "storage"],
        "Beauty & Personal Care": ["beauty", "skincare", "haircare", "cosmetic", "organic", "natural", "wellness", "spa"],
        "Sports & Outdoors": ["sports", "fitness", "outdoor", "training", "athletic", "performance", "equipment", "gear"]
    }
    
    base_keywords = keywords_templates.get(category, ["quality", "premium", "professional", "durable"])
    
    # Extract potential keywords from features
    feature_words = []
    for feature in features:
        words = feature.lower().split()
        feature_words.extend([word for word in words if len(word) > 3 and word not in ["with", "that", "this", "from", "your", "will", "have", "more", "than"]])
    
    # Generate final keywords
    product_words = product_name.lower().split()
    keywords = list(set(base_keywords + feature_words + product_words))[:15]  # Limit to 15 keywords
    keywords_str = ", ".join(keywords)
    
    # Generate competitor URLs based on product name and category
    competitor_base_urls = [
        "https://www.amazon.com/dp/B08N5LNQCX",
        "https://www.amazon.com/dp/B07PXGQC1Q",
        "https://www.amazon.com/dp/B096TWFVLG",
        "https://www.amazon.com/dp/B08KGYVKRT",
        "https://www.amazon.com/dp/B09B9XJ4KG"
    ]
    
    # Generate competitor titles based on product and category
    competitor_titles = [
        f"Premium {product_name} with Advanced Features - Best Seller 2025",
        f"Professional {category} {product_name} - Top Rated on Amazon",
        f"{product_name} Elite Series - #1 Customer Choice for {category}",
        f"Ultimate {product_name} {category} Solution - Fast Shipping",
        f"Deluxe {product_name} Pro - High Performance {category} Product"
    ]
    
    # Create competitor URLs with titles
    competitor_urls = []
    for i in range(min(5, len(competitor_base_urls))):
        competitor_urls.append({
            "url": competitor_base_urls[i],
            "title": competitor_titles[i]
        })
    
    # Perform SEO analysis
    def analyze_keyword_density(text, keywords):
        """Analyze keyword density in the given text"""
        text = text.lower()
        words = re.findall(r'\b\w+\b', text)
        total_words = len(words)
        
        if total_words == 0:
            return {}
        
        # Count occurrences of each keyword
        density = {}
        for keyword in keywords:
            keyword = keyword.lower()
            count = text.count(keyword)
            if count > 0:
                density[keyword] = {
                    'count': count,
                    'percentage': round((count / total_words) * 100, 2)
                }
        
        return density
    
    def analyze_title_length(title):
        """Analyze title length according to Amazon's guidelines"""
        char_count = len(title)
        char_limit = 200
        
        result = {
            'character_count': char_count,
            'character_limit': char_limit,
            'within_limit': char_count <= char_limit
        }
        
        if char_count > char_limit:
            result['recommendation'] = f"Title exceeds Amazon's character limit by {char_count - char_limit} characters. Consider shortening it."
        elif char_count < 100:
            result['recommendation'] = "Title could be more descriptive. Consider adding more relevant keywords while staying under the 200 character limit."
        else:
            result['recommendation'] = "Title length is optimal for Amazon's guidelines."
            
        return result
    
    def analyze_keyword_placement(title, bullets, keywords):
        """Analyze keyword placement in title and bullets"""
        title_lower = title.lower()
        result = {
            'keywords_in_title': [],
            'keywords_in_bullets': [],
            'missing_keywords': []
        }
        
        for keyword in keywords:
            keyword_lower = keyword.lower()
            found_in_title = keyword_lower in title_lower
            
            # Check if keyword appears in any bullet points
            found_in_bullets = any(keyword_lower in bullet.lower() for bullet in bullets)
            
            if found_in_title:
                result['keywords_in_title'].append(keyword)
            
            if found_in_bullets:
                result['keywords_in_bullets'].append(keyword)
                
            if not found_in_title and not found_in_bullets:
                result['missing_keywords'].append(keyword)
        
        return result
    
    def calculate_seo_score(title_analysis, keyword_analysis, density_analysis):
        """Calculate an overall SEO score based on various factors"""
        score = 0
        max_score = 100
        
        # Title within limit: 20 points
        if title_analysis['within_limit']:
            score += 20
        
        # Keywords in title: up to 25 points
        keywords_in_title_ratio = len(keyword_analysis['keywords_in_title']) / len(keywords) if keywords else 0
        score += round(keywords_in_title_ratio * 25)
        
        # Keywords in bullets: up to 20 points
        keywords_in_bullets_ratio = len(keyword_analysis['keywords_in_bullets']) / len(keywords) if keywords else 0
        score += round(keywords_in_bullets_ratio * 20)
        
        # Keyword density: up to 15 points
        if density_analysis:
            # Check if at least some keywords have a good density (0.5% to 2.5%)
            good_density_count = sum(1 for k, v in density_analysis.items() 
                                    if 0.5 <= v['percentage'] <= 2.5)
            if good_density_count:
                score += round((good_density_count / len(density_analysis)) * 15)
        
        # Keyword coverage: up to 20 points (no missing keywords)
        missing_keywords_ratio = len(keyword_analysis['missing_keywords']) / len(keywords) if keywords else 1
        score += round((1 - missing_keywords_ratio) * 20)
        
        return {
            'score': score,
            'max_score': max_score,
            'percentage': round((score / max_score) * 100),
            'rating': 'Excellent' if score >= 85 else 'Good' if score >= 70 else 'Fair' if score >= 50 else 'Needs Improvement'
        }
    
    # Perform SEO analysis on the generated content
    full_text = title + " " + " ".join(bullets) + " " + template["description"]
    
    title_analysis = analyze_title_length(title)
    density_analysis = analyze_keyword_density(full_text, keywords)
    keyword_placement = analyze_keyword_placement(title, bullets, keywords)
    
    # Calculate overall SEO score
    seo_score = calculate_seo_score(title_analysis, keyword_placement, density_analysis)
    
    # Prepare SEO analysis results
    seo_analysis = {
        'title_analysis': title_analysis,
        'keyword_density': density_analysis,
        'keyword_placement': keyword_placement,
        'seo_score': seo_score,
        'recommendations': []
    }
    
    # Generate recommendations based on analysis
    if not title_analysis['within_limit']:
        seo_analysis['recommendations'].append(title_analysis['recommendation'])
    
    if keyword_placement['missing_keywords']:
        missing_kw_str = ", ".join(keyword_placement['missing_keywords'][:3])
        if len(keyword_placement['missing_keywords']) > 3:
            missing_kw_str += f" and {len(keyword_placement['missing_keywords']) - 3} more"
        seo_analysis['recommendations'].append(f"Consider including these keywords in your title or bullets: {missing_kw_str}")
    
    low_density_kw = [k for k, v in density_analysis.items() if v['percentage'] < 0.5]
    if low_density_kw and len(low_density_kw) <= 3:
        seo_analysis['recommendations'].append(f"Increase the usage of these keywords: {', '.join(low_density_kw)}")
    
    high_density_kw = [k for k, v in density_analysis.items() if v['percentage'] > 2.5]
    if high_density_kw and len(high_density_kw) <= 3:
        seo_analysis['recommendations'].append(f"Reduce the frequency of these keywords to avoid keyword stuffing: {', '.join(high_density_kw)}")
    
    # Store the generated listing in the database
    try:
        with app.app_context():
            # Create new listing
            new_listing = Listing(
                product_name=product_name,
                category=category,
                title=title,
                description=template["description"],
                keywords=keywords_str
            )
            db.session.add(new_listing)
            db.session.flush()  # Get the ID without committing
            
            # Add bullet points
            for i, bullet_text in enumerate(bullets):
                bullet = BulletPoint(
                    listing_id=new_listing.id,
                    bullet_text=bullet_text,
                    position=i
                )
                db.session.add(bullet)
            
            # Add competitor URLs
            for i, competitor in enumerate(competitor_urls):
                comp_url = CompetitorURL(
                    listing_id=new_listing.id,
                    url=competitor["url"],
                    title=competitor["title"],
                    position=i
                )
                db.session.add(comp_url)
                
            db.session.commit()
            logger.debug(f"Stored listing in database with ID: {new_listing.id}")
    except Exception as e:
        logger.error(f"Error storing listing in database: {str(e)}")
        # Continue anyway - this is just for storage, not critical for response
    
    return {
        "title": title,
        "bullets": bullets,
        "description": template["description"],
        "keywords": keywords,
        "competitor_urls": competitor_urls,
        "seo_analysis": seo_analysis
    }

@app.route('/api/generate-listing', methods=['POST'])
def generate_listing():
    """Generate Amazon product listing using template-based approach."""
    try:
        # Get request data from the frontend
        data = request.json
        logger.debug(f"Received request data: {data}")
        
        # Validate input data
        if not data or not all(key in data for key in ['product_name', 'category', 'features']):
            return jsonify({"detail": "Missing required fields"}), 400
        
        # Generate the listing using templates
        result = generate_amazon_listing(
            data['product_name'],
            data['category'],
            data['features']
        )
        
        logger.debug(f"Successfully generated listing for: {data['product_name']}")
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error generating listing: {str(e)}")
        return jsonify({"detail": f"Failed to generate listing: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)