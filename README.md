# Product Transparency Website

A full-stack web application that collects detailed information about products through dynamic, intelligent follow-up questions and generates structured Product Transparency Reports. The platform supports ethical, health-first decision-making through comprehensive product information gathering and analysis.

## Project Structure

```
assignment/
├── frontend/          # React + TypeScript frontend application
├── backend/           # Node.js + Express backend API
├── ai-service/        # FastAPI microservice for AI-powered question generation
├── design/            # Design assets and documentation
└── README.md          # This file
```

## Features

### Core Features
- **Dynamic Multi-Step Form**: Intelligent product submission form with conditional logic
- **AI-Powered Question Generation**: Follow-up questions generated using rule-based logic and optional LLM integration
- **PDF Report Generation**: Comprehensive transparency reports in PDF format
- **Product Transparency Scoring**: Automated scoring system based on data completeness
- **Company Authentication**: Secure company registration and login (bonus feature)
- **Responsive UI**: Clean, modern, and mobile-responsive interface

### Technical Features
- **Frontend**: React 19 + TypeScript with React Router
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with comprehensive schema
- **AI Service**: FastAPI microservice with OpenAI integration (optional)
- **PDF Generation**: PDFKit for report generation
- **Authentication**: JWT-based authentication with bcrypt password hashing

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Set up PostgreSQL database:
```bash
# Create database
createdb product_transparency

# Or using psql:
psql -U postgres
CREATE DATABASE product_transparency;
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### AI Service Setup

1. Navigate to the AI service directory:
```bash
cd ai-service
```

2. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables (optional, for OpenAI integration):
```bash
# Create .env file
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

5. Start the AI service:
```bash
python app.py
# Or using uvicorn directly:
uvicorn app:app --reload --port 5000
```

The AI service will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional):
```bash
# Create .env file
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env
echo "REACT_APP_AI_SERVICE_URL=http://localhost:5000" >> .env
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Database Schema

The application uses the following PostgreSQL tables:

### Companies
- `id`: Primary key
- `name`: Company name
- `email`: Company email (unique)
- `password_hash`: Hashed password
- `created_at`: Timestamp

### Products
- `id`: Primary key
- `company_id`: Foreign key to companies
- `name`: Product name
- `category`: Product category
- `description`: Product description
- `submitted_data`: JSONB field containing all product data
- `transparency_score`: Calculated transparency score (0-100)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Reports
- `id`: Primary key
- `product_id`: Foreign key to products
- `report_pdf_path`: Path to generated PDF
- `generated_at`: Timestamp

### Questions
- `id`: Primary key
- `product_id`: Foreign key to products
- `question_text`: Question text
- `answer`: Answer text
- `question_order`: Order of question
- `created_at`: Timestamp

## 🔌 API Endpoints

### Backend API (`http://localhost:3001/api`)

#### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `GET /products/:id/transparency-score` - Get transparency score

#### Reports
- `POST /reports/:productId/generate` - Generate PDF report
- `GET /reports/:productId` - Get all reports for a product

#### Authentication
- `POST /auth/register` - Register new company
- `POST /auth/login` - Login company

### AI Service API (`http://localhost:5000`)

- `GET /health` - Health check
- `POST /generate-questions` - Generate follow-up questions
- `POST /transparency-score` - Calculate transparency score

## AI Service Documentation

### Question Generation

The AI service generates intelligent follow-up questions based on:
1. **Rule-based Logic**: Checks for missing or incomplete information (ingredients, manufacturing location, certifications, etc.)
2. **LLM Integration** (Optional): Uses OpenAI GPT-3.5-turbo for more nuanced questions when API key is provided

#### Request Format:
```json
{
  "productData": {
    "product_name": "Example Product",
    "category": "Food & Beverage",
    "ingredients": "...",
    ...
  },
  "currentAnswers": [
    {
      "question": "Previous question",
      "answer": "Previous answer",
      "order": 1
    }
  ],
  "productId": 1
}
```

#### Response Format:
```json
{
  "questions": [
    {
      "id": 1,
      "question": "Can you provide a detailed list of all ingredients?",
      "type": "text",
      "category": "ingredients"
    }
  ]
}
```

### Transparency Scoring

The transparency score (0-100) is calculated based on:
- Product name (10 points)
- Category (5 points)
- Description (10 points)
- Ingredients detail (20 points)
- Manufacturing location (10 points)
- Certifications (15 points)
- Sustainability information (15 points)
- Allergens information (5 points)
- Labor practices (10 points)

## Sample Product Entry

### Example Product Data:

```json
{
  "product_name": "Organic Green Tea",
  "category": "Food & Beverage",
  "description": "Premium organic green tea sourced from sustainable farms",
  "ingredients": "Organic green tea leaves, water",
  "manufacturing_location": "India, Assam region",
  "certifications": ["Organic", "Fair Trade", "Non-GMO"],
  "allergens": [],
  "sustainability_info": {
    "packaging_material": "Biodegradable paper",
    "recyclable": true,
    "carbon_footprint": "Carbon neutral"
  },
  "labor_practices": "Fair trade certified, workers paid fair wages"
}
```

### Example Report

The generated PDF report includes:
1. Product Information (name, category, description)
2. Product Details (ingredients, manufacturing location, certifications, allergens)
3. Sustainability Information (packaging, recyclability, carbon footprint)
4. Labor Practices
5. Transparency Score
6. Question & Answer Summary

## Development

### Running All Services

1. Start PostgreSQL database
2. Start backend: `cd backend && npm run dev`
3. Start AI service: `cd ai-service && python app.py`
4. Start frontend: `cd frontend && npm start`

### Building for Production

#### Backend:
```bash
cd backend
npm run build
npm start
```

#### Frontend:
```bash
cd frontend
npm run build
# Serve the build folder using a static server
```

#### AI Service:
```bash
cd ai-service
# Use production WSGI server like gunicorn
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Feature List

### Completed Features
- Dynamic multi-step form with conditional logic
- Secure APIs to store and fetch product data
- PDF report generation
- Robust database schema
- Basic authentication (company registration/login)
- AI-powered question generation (rule-based + optional LLM)
- Transparency scoring system
- Responsive UI design
- Error handling and validation

### Bonus Features
- Company authentication with JWT
- Transparency scoring algorithm
- Dynamic question generation with multiple question types

## Collaboration

This project demonstrates cross-role collaboration:
- **Full Stack Developer**: Built React frontend, Express backend, database schema, and PDF generation
- **AI/ML Developer**: Implemented question generation logic and transparency scoring
- **UI/UX Designer**: Created clean, accessible, and responsive interface design

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Environment variables for sensitive configuration
- SQL injection protection through parameterized queries
- CORS configuration for API security

## Deployment

### Backend Deployment
- Deploy to platforms like Heroku, Railway, or AWS
- Set up PostgreSQL database (e.g., Heroku Postgres, AWS RDS)
- Configure environment variables

### Frontend Deployment
- Deploy to Vercel, Netlify, or AWS S3 + CloudFront
- Configure API URLs in environment variables

### AI Service Deployment
- Deploy to platforms like Railway, Render, or AWS ECS
- Configure OpenAI API key if using LLM features

## 🎓 Reflection: AI Tools in Development

### How AI Tools Were Used

During the development of this Product Transparency Platform, AI-powered tools were extensively utilized to enhance productivity and code quality:

1. **Code Generation & Completion**: AI tools like GitHub Copilot and Cursor helped generate boilerplate code, API endpoints, and React components, significantly reducing development time.

2. **Code Review & Optimization**: AI assistance was used to review code for best practices, identify potential bugs, and suggest optimizations for database queries and API responses.

3. **Documentation**: AI tools helped generate comprehensive documentation, including API documentation, README files, and inline code comments.

4. **Problem Solving**: When encountering errors or architectural challenges, AI tools provided quick solutions and alternative approaches, especially for complex integrations between frontend, backend, and AI service.

5. **Testing**: AI-assisted in generating test cases and validating edge cases for form inputs and API endpoints.

### Architecture Principles

1. **Separation of Concerns**: Clear separation between frontend (React), backend (Express), and AI service (FastAPI) allows independent scaling and development.

2. **Microservices Architecture**: The AI service is a separate microservice, enabling easy replacement or enhancement of AI logic without affecting the main application.

3. **RESTful API Design**: Standard REST endpoints make the API intuitive and easy to integrate with.

4. **Database Normalization**: Proper database schema design ensures data integrity and efficient queries.

5. **Security First**: Authentication, password hashing, and JWT tokens ensure secure access to company-specific data.

### Design Principles

1. **User-Centered Design**: The multi-step form guides users through product submission with clear progress indicators and helpful tooltips.

2. **Transparency**: The platform itself embodies transparency by clearly showing what information is collected and how it's used.

3. **Accessibility**: Semantic HTML, proper labels, and keyboard navigation ensure the platform is accessible to all users.

4. **Mobile-First**: Responsive design ensures the platform works seamlessly on all device sizes.

### Product Transparency Logic

1. **Progressive Disclosure**: Start with basic information and progressively ask for more details based on what's missing.

2. **Intelligent Questioning**: Questions are generated based on product category, existing data, and industry best practices.

3. **Scoring Transparency**: The transparency score calculation is transparent and based on objective criteria (data completeness).

4. **Comprehensive Reporting**: Reports include all collected information in a structured, easy-to-understand format.

## License

This project is created for the Altibbe | Hedamo assignment.

## Contact

For questions or issues, please contact: people@altibbe.com

---

**Note**: This project was built using AI-powered development tools to demonstrate productivity and accuracy in modern software development workflows.
