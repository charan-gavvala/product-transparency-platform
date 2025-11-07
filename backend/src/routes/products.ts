import express, { Request, Response } from 'express';
import { pool } from '../db';
import axios from 'axios';

const router = express.Router();

// Get all products (with optional company filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.query;
    let query = 'SELECT * FROM products';
    const params: any[] = [];

    if (companyId) {
      query += ' WHERE company_id = $1';
      params.push(companyId);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create new product
router.post('/', async (req: Request, res: Response) => {
  try {
    const { companyId, name, category, description, submittedData, currentAnswers } = req.body;

    // Insert product
    const productResult = await pool.query(
      `INSERT INTO products (company_id, name, category, description, submitted_data) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [companyId, name, category, description, JSON.stringify(submittedData)]
    );

    const product = productResult.rows[0];

    // Save questions and answers if provided
    if (currentAnswers && Array.isArray(currentAnswers)) {
      for (const qa of currentAnswers) {
        await pool.query(
          `INSERT INTO questions (product_id, question_text, answer, question_order) 
           VALUES ($1, $2, $3, $4)`,
          [product.id, qa.question, qa.answer, qa.order]
        );
      }
    }

    // Request follow-up questions from AI service
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';
      const aiResponse = await axios.post(`${aiServiceUrl}/generate-questions`, {
        productData: submittedData,
        currentAnswers: currentAnswers || [],
        productId: product.id
      });

      res.json({
        product,
        followUpQuestions: aiResponse.data.questions || []
      });
    } catch (aiError) {
      // If AI service fails, still return the product
      console.error('AI service error:', aiError);
      res.json({
        product,
        followUpQuestions: []
      });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, description, submittedData, transparencyScore } = req.body;

    const result = await pool.query(
      `UPDATE products 
       SET name = $1, category = $2, description = $3, 
           submitted_data = $4, transparency_score = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING *`,
      [name, category, description, JSON.stringify(submittedData), transparencyScore, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Get transparency score (optional)
router.get('/:id/transparency-score', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productResult = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];

    // Request score from AI service
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';
      const aiResponse = await axios.post(`${aiServiceUrl}/transparency-score`, {
        productData: product.submitted_data
      });

      // Update product with score
      await pool.query(
        'UPDATE products SET transparency_score = $1 WHERE id = $2',
        [aiResponse.data.score, id]
      );

      res.json({ score: aiResponse.data.score });
    } catch (aiError) {
      console.error('AI service error:', aiError);
      res.status(500).json({ error: 'Failed to calculate transparency score' });
    }
  } catch (error) {
    console.error('Error fetching transparency score:', error);
    res.status(500).json({ error: 'Failed to fetch transparency score' });
  }
});

export default router;

