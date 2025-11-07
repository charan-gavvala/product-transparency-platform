# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- Node.js (v16+) installed
- Python 3.8+ installed
- PostgreSQL installed and running
- npm or yarn installed

## Quick Setup (5 minutes)

### 1. Database Setup

```bash
# Create database
createdb product_transparency

# Or using psql
psql -U postgres
CREATE DATABASE product_transparency;
\q
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

The backend runs on `http://localhost:3001`

### 3. AI Service Setup

```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The AI service runs on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000`

## Using the Application

1. **Visit the Landing Page**: Open `http://localhost:3000`
2. **Submit a Product**: Click "Submit Product" and fill out the form
3. **Answer Follow-up Questions**: The AI service will generate intelligent follow-up questions
4. **Generate Report**: After submission, view and download the PDF report

## Sample Product Entry

Try submitting this sample product:

- **Name**: Organic Green Tea
- **Category**: Food & Beverage
- **Description**: Premium organic green tea sourced from sustainable farms
- **Ingredients**: Organic green tea leaves, water
- **Manufacturing Location**: India, Assam region
- **Certifications**: Organic, Fair Trade, Non-GMO
- **Packaging**: Biodegradable paper, Recyclable

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Verify database credentials in `.env`
- Check port 3001 is available

### AI Service won't start
- Ensure Python virtual environment is activated
- Check all dependencies are installed: `pip list`
- Verify port 5000 is available

### Frontend won't start
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check port 3000 is available
- Verify API URLs in environment variables

### Database connection errors
- Verify PostgreSQL is running
- Check database name matches in `.env`
- Ensure user has proper permissions

## Environment Variables

### Backend (.env)
```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=product_transparency
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-change-in-production
AI_SERVICE_URL=http://localhost:5000
```

### AI Service (.env) - Optional
```
OPENAI_API_KEY=your-openai-api-key-here
```

### Frontend (.env) - Optional
```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_AI_SERVICE_URL=http://localhost:5000
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Review the [API Documentation](README.md#api-endpoints)
- Check out the [AI Service Documentation](README.md#ai-service-documentation)

## Support

For issues or questions, refer to the main README.md or contact the development team.

