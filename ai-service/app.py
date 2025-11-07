from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = FastAPI(title="Product Transparency AI Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client (optional - can use other LLMs)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
openai_client = None
if OPENAI_API_KEY:
    try:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
    except Exception as e:
        print(f"OpenAI initialization error: {e}")

class QuestionRequest(BaseModel):
    productData: Dict[str, Any]
    currentAnswers: List[Dict[str, Any]] = []
    productId: Optional[int] = None

class ScoreRequest(BaseModel):
    productData: Dict[str, Any]

class QuestionResponse(BaseModel):
    questions: List[Dict[str, str]]

class ScoreResponse(BaseModel):
    score: int
    reasoning: Optional[str] = None

def generate_follow_up_questions(product_data: Dict[str, Any], current_answers: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """
    Generate intelligent follow-up questions based on product data and current answers.
    Uses rule-based logic that can be enhanced with LLM APIs.
    """
    questions = []
    question_id = len(current_answers) + 1

    # Extract key information from product data
    product_name = product_data.get('product_name', '')
    category = product_data.get('category', '')
    ingredients = product_data.get('ingredients', '')
    manufacturing_location = product_data.get('manufacturing_location', '')
    certifications = product_data.get('certifications', [])
    sustainability_info = product_data.get('sustainability_info', {})

    # Rule-based question generation
    # This can be enhanced with OpenAI GPT or other LLMs
    
    # If ingredients are missing or minimal
    if not ingredients or len(ingredients.split(',')) < 3:
        questions.append({
            "id": question_id,
            "question": f"Can you provide a detailed list of all ingredients in {product_name}? Please include any additives, preservatives, or processing aids.",
            "type": "text",
            "category": "ingredients"
        })
        question_id += 1

    # If manufacturing location is missing
    if not manufacturing_location:
        questions.append({
            "id": question_id,
            "question": "Where is this product manufactured? Please provide the country and, if possible, the specific facility location.",
            "type": "text",
            "category": "manufacturing"
        })
        question_id += 1

    # If certifications are missing
    if not certifications or len(certifications) == 0:
        questions.append({
            "id": question_id,
            "question": "Does this product have any third-party certifications (e.g., organic, fair trade, non-GMO, cruelty-free)? If yes, please list them.",
            "type": "checkbox",
            "category": "certifications"
        })
        question_id += 1

    # If sustainability info is missing
    if not sustainability_info or not sustainability_info.get('packaging_material'):
        questions.append({
            "id": question_id,
            "question": "What type of packaging material is used? Is it recyclable, biodegradable, or made from recycled materials?",
            "type": "text",
            "category": "sustainability"
        })
        question_id += 1

    # If allergens are not mentioned
    if 'allergens' not in product_data or not product_data.get('allergens'):
        questions.append({
            "id": question_id,
            "question": "Does this product contain any common allergens (e.g., nuts, dairy, gluten, soy)? If yes, please list them.",
            "type": "checkbox",
            "category": "allergens"
        })
        question_id += 1

    # Labor and ethical sourcing
    if 'labor_practices' not in product_data:
        questions.append({
            "id": question_id,
            "question": "Can you provide information about labor practices in your supply chain? Are workers paid fair wages and working in safe conditions?",
            "type": "text",
            "category": "ethics"
        })
        question_id += 1

    # Use OpenAI API if available for more intelligent questions
    if openai_client and len(questions) < 3:
        try:
            prompt = f"""Based on the following product information, generate 2-3 intelligent follow-up questions that would help assess product transparency, health impact, and ethical sourcing.

Product Name: {product_name}
Category: {category}
Current Data: {product_data}
Questions Already Asked: {[qa.get('question', '') for qa in current_answers]}

Generate questions in the following format:
Q: [question text]
Type: [text/checkbox/radio]
Category: [category name]

Focus on:
1. Health and safety aspects
2. Environmental impact
3. Ethical sourcing and labor practices
4. Product authenticity and quality
"""

            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert in product transparency and ethical sourcing."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )

            # Parse AI-generated questions (simplified parsing)
            ai_text = response.choices[0].message.content
            # In a production system, you'd want more sophisticated parsing
            # For now, we'll rely on rule-based questions primarily

        except Exception as e:
            print(f"OpenAI API error: {e}")
            # Continue with rule-based questions

    # Limit to 5 questions per request
    return questions[:5]

def calculate_transparency_score(product_data: Dict[str, Any]) -> int:
    """
    Calculate a transparency score (0-100) based on product data completeness and quality.
    """
    score = 0
    max_score = 100

    # Product name (10 points)
    if product_data.get('product_name'):
        score += 10

    # Category (5 points)
    if product_data.get('category'):
        score += 5

    # Description (10 points)
    if product_data.get('description') and len(str(product_data.get('description'))) > 20:
        score += 10

    # Ingredients (20 points)
    ingredients = product_data.get('ingredients', '')
    if ingredients:
        ingredient_count = len(ingredients.split(','))
        score += min(20, ingredient_count * 2)  # Up to 20 points for detailed ingredients

    # Manufacturing location (10 points)
    if product_data.get('manufacturing_location'):
        score += 10

    # Certifications (15 points)
    certifications = product_data.get('certifications', [])
    if isinstance(certifications, list) and len(certifications) > 0:
        score += min(15, len(certifications) * 5)

    # Sustainability info (15 points)
    sustainability = product_data.get('sustainability_info', {})
    if sustainability:
        score += min(15, len(sustainability) * 3)

    # Allergens information (5 points)
    if product_data.get('allergens'):
        score += 5

    # Labor practices (10 points)
    if product_data.get('labor_practices'):
        score += 10

    return min(100, score)

@app.get("/")
def read_root():
    return {"message": "Product Transparency AI Service is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/generate-questions", response_model=QuestionResponse)
def generate_questions(request: QuestionRequest):
    """
    Generate follow-up questions based on product data and current answers.
    """
    try:
        questions = generate_follow_up_questions(request.productData, request.currentAnswers)
        return QuestionResponse(questions=questions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

@app.post("/transparency-score", response_model=ScoreResponse)
def calculate_score(request: ScoreRequest):
    """
    Calculate transparency score for a product.
    """
    try:
        score = calculate_transparency_score(request.productData)
        reasoning = f"Score calculated based on completeness of product information. Key factors: product details, ingredients, certifications, sustainability info, and ethical sourcing information."
        return ScoreResponse(score=score, reasoning=reasoning)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating score: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
