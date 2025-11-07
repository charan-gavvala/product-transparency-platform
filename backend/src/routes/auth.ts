import express, { Request, Response } from 'express';
import { pool } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register company
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if company already exists
    const existingCompany = await pool.query(
      'SELECT id FROM companies WHERE email = $1',
      [email]
    );

    if (existingCompany.rows.length > 0) {
      return res.status(400).json({ error: 'Company with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert company
    const result = await pool.query(
      'INSERT INTO companies (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, passwordHash]
    );

    res.status(201).json({
      message: 'Company registered successfully',
      company: result.rows[0]
    });
  } catch (error) {
    console.error('Error registering company:', error);
    res.status(500).json({ error: 'Failed to register company' });
  }
});

// Login company
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find company
    const result = await pool.query(
      'SELECT id, name, email, password_hash FROM companies WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const company = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, company.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { companyId: company.id, email: company.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      company: {
        id: company.id,
        name: company.name,
        email: company.email
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Middleware to verify JWT token
export const verifyToken = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    (req as any).companyId = decoded.companyId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default router;

