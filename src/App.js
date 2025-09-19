import React, { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    itemName: '',
    condition: '',
    category: '',
    originalPrice: '',
    shortDescription: '',
    image: null
  });

  const [listing, setListing] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [copySuccess, setCopySuccess] = useState({});

  const conditionOptions = ['New', 'Like New', 'Good', 'Fair'];
  const categoryOptions = ['Electronics', 'Clothes','Shoes', 'Bags', 'Books', 'Other'];

  const depreciationFactors = {
    'New': 0.9,
    'Like New': 0.8,
    'Good': 0.6,
    'Fair': 0.4
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateTags = (itemName, category) => {
    const tags = new Set();

    // Add category tag
    tags.add(category);

    // Extract words from item name and add relevant tags
    const words = itemName.toLowerCase().split(' ');
    words.forEach(word => {
      if (word.length > 2) {
        tags.add(word.charAt(0).toUpperCase() + word.slice(1));
      }
    });

    // Add category-specific tags
    const categoryTags = {
      'Electronics': ['Tech', 'Gadget', 'Device'],
      'Clothes': ['Clothing', 'Fashion', 'Style'],
      'Shoes': ['Footwear', 'Fashion', 'Style'],
      'Bags': ['Accessory', 'Fashion', 'Style'],
      'Books': ['Literature', 'Reading', 'Education'],
      'Other': ['Preloved', 'Secondhand']
    };

    if (categoryTags[category]) {
      categoryTags[category].forEach(tag => tags.add(tag));
    }

    // Add condition-based tags
    if (formData.condition !== 'New') {
      tags.add('Used');
    }

    return Array.from(tags).slice(0, 5);
  };

  const calculateSuggestedPrice = (originalPrice, condition) => {
    const factor = depreciationFactors[condition] || 0.5;
    return Math.round(originalPrice * factor);
  };

  const copyToClipboard = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(prev => ({ ...prev, [section]: true }));
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [section]: false }));
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(prev => ({ ...prev, [section]: true }));
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [section]: false }));
      }, 2000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.itemName || !formData.condition || !formData.category || !formData.originalPrice) {
      alert('Please fill in all required fields');
      return;
    }

    const tags = generateTags(formData.itemName, formData.category);
    const suggestedPrice = calculateSuggestedPrice(parseFloat(formData.originalPrice), formData.condition);

    const newListing = {
      title: `${formData.itemName} – ${formData.condition} Condition`,
      description: `Come get this ${formData.itemName} in ${formData.condition} condition before it's gone!${formData.shortDescription ? ` ${formData.shortDescription}` : ''}`,
      originalPrice: parseFloat(formData.originalPrice),
      suggestedPrice: suggestedPrice,
      tags: tags,
      image: imagePreview,
      condition: formData.condition,
      category: formData.category
    };

    setListing(newListing);
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      condition: '',
      category: '',
      originalPrice: '',
      shortDescription: '',
      image: null
    });
    setImagePreview(null);
    setListing(null);
    setCopySuccess({});
  };

  const copyFullListing = () => {
    if (!listing) return;

    const fullText = `${listing.title}

${listing.description}

Price: $${listing.suggestedPrice} (originally $${listing.originalPrice})

Tags: ${listing.tags.map(tag => '#' + tag).join(' ')}

Condition: ${listing.condition}
Category: ${listing.category}`;

    copyToClipboard(fullText, 'full');
  };

  return (
    <div className="container">
      <div className="max-width">
        <h1 className="title">Second-hand Listing Generator</h1>

        <div className="grid">
          {/* Form Section */}
          <div className="card">
            <h2 className="card-title">Create Your Listing</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  placeholder="e.g., iPhone 12"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Condition *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Select condition</option>
                  {conditionOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Select category</option>
                  {categoryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Original Price ($) *</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  placeholder="800"
                  min="0"
                  step="0.01"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Short Description (Optional)</label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Still works great, selling because I upgraded."
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Upload Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="image-preview"
                  />
                )}
              </div>

              <div className="button-group">
                <button type="submit" className="btn-primary">
                  Generate Listing
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Listing Card Section */}
          <div className="card">
            <div className="card-title">
              Generated Listing
              {listing && (
                <button
                  onClick={copyFullListing}
                  className={`btn-copy-all ${copySuccess.full ? 'copy-success' : ''}`}
                >
                  {copySuccess.full ? '✓ Copied!' : 'Copy All'}
                </button>
              )}
            </div>

            {listing ? (
              <div className="listing-content">
                {/* Image Section */}
                {listing.image && (
                  <div className="listing-section">
                    <div className="section-header">
                      <h4 className="section-title">📷 Photo</h4>
                    </div>
                    <div className="listing-image">
                      <img src={listing.image} alt={listing.title} />
                    </div>
                  </div>
                )}

                {/* Title Section */}
                <div className="listing-section">
                  <div className="section-header">
                    <h4 className="section-title">📝 Listing Title</h4>
                    <button
                      onClick={() => copyToClipboard(listing.title, 'title')}
                      className={`btn-copy ${copySuccess.title ? 'copy-success' : ''}`}
                    >
                      {copySuccess.title ? '✓' : 'Copy'}
                    </button>
                  </div>
                  <div className="section-content">
                    <div className="listing-title-text">{listing.title}</div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="listing-section">
                  <div className="section-header">
                    <h4 className="section-title">📄 Description</h4>
                    <button
                      onClick={() => copyToClipboard(listing.description, 'description')}
                      className={`btn-copy ${copySuccess.description ? 'copy-success' : ''}`}
                    >
                      {copySuccess.description ? '✓' : 'Copy'}
                    </button>
                  </div>
                  <div className="section-content">
                    <p className="listing-description-text">{listing.description}</p>
                  </div>
                </div>

                {/* Price Section */}
                <div className="listing-section">
                  <div className="section-header">
                    <h4 className="section-title">💰 Pricing</h4>
                    <button
                      onClick={() => copyToClipboard(`${listing.suggestedPrice}`, 'price')}
                      className={`btn-copy ${copySuccess.price ? 'copy-success' : ''}`}
                    >
                      {copySuccess.price ? '✓' : 'Copy'}
                    </button>
                  </div>
                  <div className="section-content">
                    <div className="price-section">
                      <div className="price-content">
                        <div className="suggested-price">${listing.suggestedPrice}</div>
                        <div className="original-price">Suggested price based on original price: ${listing.originalPrice} and condition</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags Section */}
                <div className="listing-section">
                  <div className="section-header">
                    <h4 className="section-title">🏷️ Tags</h4>
                    <button
                      onClick={() => copyToClipboard(listing.tags.map(tag => '#' + tag).join(' '), 'tags')}
                      className={`btn-copy ${copySuccess.tags ? 'copy-success' : ''}`}
                    >
                      {copySuccess.tags ? '✓' : 'Copy'}
                    </button>
                  </div>
                  <div className="section-content">
                    <div className="tags-container">
                      {listing.tags.map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="placeholder">
                <div className="placeholder-icon">📝</div>
                <p>Fill out the form to generate your listing card</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;