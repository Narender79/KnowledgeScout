import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import databaseService from '../services/databaseService';

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await databaseService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await databaseService.createUser({
      name,
      email,
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff`
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return user data (password already excluded by database service)
    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await databaseService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Get user data without password
    const userData = await databaseService.findUserById(user.id);
    res.json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const user = await databaseService.findUserById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Initialize demo user
router.post('/init-demo', async (req, res) => {
  try {
    const demoEmail = 'admin@mail.com';
    
    // Check if demo user already exists
    const existingUser = await databaseService.findUserByEmail(demoEmail);
    if (existingUser) {
      return res.json({ 
        message: 'Demo user already exists',
        user: existingUser 
      });
    }

    // Create demo user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const demoUser = await databaseService.createUser({
      name: 'Demo Admin',
      email: demoEmail,
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=Demo+Admin&background=0ea5e9&color=fff`
    });

    res.status(201).json({
      message: 'Demo user created successfully',
      user: demoUser
    });
  } catch (error) {
    console.error('Demo user creation error:', error);
    res.status(500).json({ error: 'Failed to create demo user' });
  }
});

export default router;
