import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ProductForm.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const AI_SERVICE_URL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:5000';

interface FormData {
  product_name: string;
  category: string;
  description: string;
  ingredients: string;
  manufacturing_location: string;
  certifications: string[];
  allergens: string[];
  sustainability_info: {
    packaging_material?: string;
    recyclable?: boolean;
    carbon_footprint?: string;
  };
  labor_practices?: string;
}

interface Question {
  id: number;
  question: string;
  type: 'text' | 'checkbox' | 'radio';
  category: string;
}

interface Answer {
  question: string;
  answer: string;
  order: number;
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    product_name: '',
    category: '',
    description: '',
    ingredients: '',
    manufacturing_location: '',
    certifications: [],
    allergens: [],
    sustainability_info: {},
    labor_practices: '',
  });
  const [followUpQuestions, setFollowUpQuestions] = useState<Question[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productId, setProductId] = useState<number | null>(null);

  const totalSteps = 4;

  const categories = [
    'Food & Beverage',
    'Personal Care',
    'Clothing & Apparel',
    'Electronics',
    'Household Products',
    'Other'
  ];

  const commonCertifications = [
    'Organic',
    'Fair Trade',
    'Non-GMO',
    'Cruelty-Free',
    'Vegan',
    'B-Corp',
    'Carbon Neutral',
    'Rainforest Alliance'
  ];

  const commonAllergens = [
    'Nuts',
    'Dairy',
    'Gluten',
    'Soy',
    'Eggs',
    'Shellfish',
    'Fish',
    'Sesame'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = (prev[name as keyof FormData] as string[]) || [];
      if (checked) {
        return { ...prev, [name]: [...currentArray, value] };
      } else {
        return { ...prev, [name]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleQuestionAnswer = (questionId: number, answer: string) => {
    const question = followUpQuestions.find(q => q.id === questionId);
    if (!question) return;

    setCurrentAnswers(prev => {
      const existing = prev.findIndex(a => a.question === question.question);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], answer };
        return updated;
      }
      return [...prev, { question: question.question, answer, order: questionId }];
    });
  };

  const fetchFollowUpQuestions = async () => {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/generate-questions`, {
        productData: formData,
        currentAnswers: currentAnswers,
        productId: productId
      });
      setFollowUpQuestions(response.data.questions || []);
    } catch (err) {
      console.error('Error fetching follow-up questions:', err);
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      
      // Fetch follow-up questions after step 2 (basic info)
      if (currentStep === 2) {
        await fetchFollowUpQuestions();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Update form data with question answers
      const updatedFormData = { ...formData };
      currentAnswers.forEach(qa => {
        if (qa.question.includes('ingredients')) {
          updatedFormData.ingredients = qa.answer;
        } else if (qa.question.includes('manufacturing')) {
          updatedFormData.manufacturing_location = qa.answer;
        } else if (qa.question.includes('packaging')) {
          updatedFormData.sustainability_info.packaging_material = qa.answer;
        } else if (qa.question.includes('labor')) {
          updatedFormData.labor_practices = qa.answer;
        }
      });

      const response = await axios.post(`${API_BASE_URL}/products`, {
        companyId: null, // Can be set from auth context
        name: updatedFormData.product_name,
        category: updatedFormData.category,
        description: updatedFormData.description,
        submittedData: updatedFormData,
        currentAnswers: currentAnswers
      });

      const newProductId = response.data.product.id;
      setProductId(newProductId);

      // Fetch transparency score
      try {
        await axios.get(`${API_BASE_URL}/products/${newProductId}/transparency-score`);
      } catch (err) {
        console.error('Error calculating score:', err);
      }

      // Navigate to report view
      navigate(`/report/${newProductId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit product. Please try again.');
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h2>Basic Information</h2>
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                required
                placeholder="Enter product name"
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Describe your product"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h2>Product Details</h2>
            <div className="form-group">
              <label>Ingredients</label>
              <textarea
                name="ingredients"
                value={formData.ingredients}
                onChange={handleInputChange}
                placeholder="List all ingredients, separated by commas"
              />
            </div>
            <div className="form-group">
              <label>Manufacturing Location</label>
              <input
                type="text"
                name="manufacturing_location"
                value={formData.manufacturing_location}
                onChange={handleInputChange}
                placeholder="Country and facility location"
              />
            </div>
            <div className="form-group">
              <label>Certifications</label>
              <div className="checkbox-group">
                {commonCertifications.map(cert => (
                  <div key={cert} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={cert}
                      checked={formData.certifications.includes(cert)}
                      onChange={(e) => handleCheckboxChange('certifications', cert, e.target.checked)}
                    />
                    <label htmlFor={cert}>{cert}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Allergens</label>
              <div className="checkbox-group">
                {commonAllergens.map(allergen => (
                  <div key={allergen} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={allergen}
                      checked={formData.allergens.includes(allergen)}
                      onChange={(e) => handleCheckboxChange('allergens', allergen, e.target.checked)}
                    />
                    <label htmlFor={allergen}>{allergen}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h2>Sustainability & Ethics</h2>
            <div className="form-group">
              <label>Packaging Material</label>
              <input
                type="text"
                name="packaging_material"
                value={formData.sustainability_info.packaging_material || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  sustainability_info: { ...prev.sustainability_info, packaging_material: e.target.value }
                }))}
                placeholder="e.g., Recyclable plastic, Biodegradable cardboard"
              />
            </div>
            <div className="form-group">
              <label>Is packaging recyclable?</label>
              <select
                value={formData.sustainability_info.recyclable ? 'yes' : 'no'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  sustainability_info: { ...prev.sustainability_info, recyclable: e.target.value === 'yes' }
                }))}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Carbon Footprint</label>
              <input
                type="text"
                name="carbon_footprint"
                value={formData.sustainability_info.carbon_footprint || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  sustainability_info: { ...prev.sustainability_info, carbon_footprint: e.target.value }
                }))}
                placeholder="e.g., Carbon neutral, 2.5 kg CO2 per unit"
              />
            </div>
            <div className="form-group">
              <label>Labor Practices</label>
              <textarea
                name="labor_practices"
                value={formData.labor_practices}
                onChange={handleInputChange}
                placeholder="Information about labor practices, fair wages, working conditions"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-step">
            <h2>Additional Questions</h2>
            {followUpQuestions.length > 0 ? (
              <div className="dynamic-questions">
                {followUpQuestions.map(question => (
                  <div key={question.id} className="question-card">
                    <label>{question.question}</label>
                    {question.type === 'text' && (
                      <textarea
                        value={currentAnswers.find(a => a.question === question.question)?.answer || ''}
                        onChange={(e) => handleQuestionAnswer(question.id, e.target.value)}
                        placeholder="Your answer"
                        rows={3}
                      />
                    )}
                    {question.type === 'checkbox' && (
                      <div className="checkbox-group">
                        {commonCertifications.map(opt => (
                          <div key={opt} className="checkbox-item">
                            <input
                              type="checkbox"
                              checked={currentAnswers.find(a => a.question === question.question)?.answer.includes(opt) || false}
                              onChange={(e) => {
                                const current = currentAnswers.find(a => a.question === question.question)?.answer || '';
                                const options = current ? current.split(',').filter(o => o.trim()) : [];
                                if (e.target.checked) {
                                  handleQuestionAnswer(question.id, [...options, opt].join(', '));
                                } else {
                                  handleQuestionAnswer(question.id, options.filter(o => o !== opt).join(', '));
                                }
                              }}
                            />
                            <label>{opt}</label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No additional questions at this time. You can proceed to submit.</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Product Submission Form</h1>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p>Step {currentStep} of {totalSteps}</p>
      </div>

      {error && <div className="error">{error}</div>}

      {renderStepContent()}

      <div className="button-group">
        <button
          className="btn btn-secondary"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </button>
        {currentStep < totalSteps ? (
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={
              (currentStep === 1 && (!formData.product_name || !formData.category || !formData.description))
            }
          >
            Next
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Product'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductForm;
