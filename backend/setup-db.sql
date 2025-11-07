-- Database setup script for Product Transparency Platform
-- Run this script to initialize the database schema

-- Create database (run this separately if needed)
-- CREATE DATABASE product_transparency;

-- Connect to the database
-- \c product_transparency;

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    submitted_data JSONB NOT NULL,
    transparency_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    report_pdf_path VARCHAR(500),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer TEXT,
    question_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_reports_product_id ON reports(product_id);
CREATE INDEX IF NOT EXISTS idx_questions_product_id ON questions(product_id);

-- Insert sample data (optional)
-- INSERT INTO companies (name, email, password_hash) VALUES 
-- ('Sample Company', 'sample@example.com', '$2a$10$example_hashed_password');

COMMENT ON TABLE companies IS 'Stores company registration information';
COMMENT ON TABLE products IS 'Stores product submissions with JSONB data';
COMMENT ON TABLE reports IS 'Stores generated PDF report metadata';
COMMENT ON TABLE questions IS 'Stores dynamic questions and answers for products';

