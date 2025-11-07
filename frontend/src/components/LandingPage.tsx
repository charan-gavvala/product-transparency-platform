import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>Product Transparency Platform</h1>
        <p>Empowering ethical, health-first decision making through transparent product information</p>
      </header>

      <div className="landing-content">
        <div className="features">
          <div className="feature-card">
            <h3>Intelligent Questioning</h3>
            <p>Our AI-powered system asks intelligent follow-up questions to gather comprehensive product information, ensuring nothing important is missed.</p>
          </div>

          <div className="feature-card">
            <h3>Transparency Reports</h3>
            <p>Generate detailed PDF reports that summarize all product information in a clear, structured format for easy sharing and review.</p>
          </div>

          <div className="feature-card">
            <h3>Ethical Sourcing</h3>
            <p>Track and verify product certifications, labor practices, and sustainability information to make informed purchasing decisions.</p>
          </div>
        </div>

        <div className="cta-section">
          <h2>Ready to Get Started?</h2>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            Submit your product information and receive a comprehensive transparency report.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/submit" className="btn btn-primary">
              Submit Product
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Company Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

