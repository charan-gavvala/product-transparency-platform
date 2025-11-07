import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './ReportView.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  submitted_data: any;
  transparency_score: number | null;
  created_at: string;
}

const ReportView: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
      setProduct(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/reports/${productId}/generate`,
        {},
        { responseType: 'blob' }
      );

      // Create blob URL and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `product-report-${productId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading product information...</div>;
  }

  if (error && !product) {
    return (
      <div className="report-container">
        <div className="error">{error}</div>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  if (!product) {
    return <div className="report-container">Product not found</div>;
  }

  const productData = typeof product.submitted_data === 'string' 
    ? JSON.parse(product.submitted_data) 
    : product.submitted_data;

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>Product Transparency Report</h1>
        <p>Generated for: {product.name}</p>
        <p>Date: {new Date(product.created_at).toLocaleDateString()}</p>
        {product.transparency_score !== null && (
          <div className="score-badge">
            Transparency Score: {product.transparency_score}/100
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="report-section">
        <h2>Product Information</h2>
        <p><strong>Name:</strong> {product.name}</p>
        <p><strong>Category:</strong> {product.category}</p>
        <p><strong>Description:</strong> {product.description}</p>
      </div>

      <div className="report-section">
        <h2>Product Details</h2>
        {productData.ingredients && (
          <p><strong>Ingredients:</strong> {productData.ingredients}</p>
        )}
        {productData.manufacturing_location && (
          <p><strong>Manufacturing Location:</strong> {productData.manufacturing_location}</p>
        )}
        {productData.certifications && productData.certifications.length > 0 && (
          <p><strong>Certifications:</strong> {productData.certifications.join(', ')}</p>
        )}
        {productData.allergens && productData.allergens.length > 0 && (
          <p><strong>Allergens:</strong> {productData.allergens.join(', ')}</p>
        )}
      </div>

      {productData.sustainability_info && Object.keys(productData.sustainability_info).length > 0 && (
        <div className="report-section">
          <h2>Sustainability Information</h2>
          {productData.sustainability_info.packaging_material && (
            <p><strong>Packaging Material:</strong> {productData.sustainability_info.packaging_material}</p>
          )}
          {productData.sustainability_info.recyclable !== undefined && (
            <p><strong>Recyclable:</strong> {productData.sustainability_info.recyclable ? 'Yes' : 'No'}</p>
          )}
          {productData.sustainability_info.carbon_footprint && (
            <p><strong>Carbon Footprint:</strong> {productData.sustainability_info.carbon_footprint}</p>
          )}
        </div>
      )}

      {productData.labor_practices && (
        <div className="report-section">
          <h2>Labor Practices</h2>
          <p>{productData.labor_practices}</p>
        </div>
      )}

      <div className="report-actions">
        <button
          className="btn btn-primary download-btn"
          onClick={handleGenerateReport}
          disabled={generating}
        >
          {generating ? 'Generating PDF...' : 'Download PDF Report'}
        </button>
        <Link to="/" className="btn btn-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ReportView;
