require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ssl: {
      rejectUnauthorized: false
    },
    // Add these authentication parameters
    connectionTimeoutMillis: 5000,
    options: '-c search_path=public',
    authentication: {
      type: 'md5' // Force MD5 authentication instead of SCRAM
    }
  });
  
  // Test the connection
  async function testConnection() {
    try {
      const client = await pool.connect();
      console.log('Connected to Supabase successfully');
      await client.query('CREATE TABLE IF NOT EXISTS users (...)'); // Your table creation query
      client.release();
    } catch (err) {
      console.error('Connection error:', err);
      process.exit(1);
    }
  }
  
  testConnection();

// Create users table with additional fields for ApexTrades
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',
    balance DECIMAL(15, 2) DEFAULT 0,
    phone VARCHAR(20),
    joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createTableQuery)
  .then(() => console.log('Users table created or already exists'))
  .catch(err => console.error('Error creating users table', err));

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    
    // Validate password
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters with at least one uppercase letter, one number, and one special character' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user into database
    const result = await pool.query(
      'INSERT INTO users (fullname, email, password) VALUES ($1, $2, $3) RETURNING id, fullname, email, plan, balance, joined',
      [fullname, email, hashedPassword]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: result.rows[0].id, email: result.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0],
      token
    });
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare passwords
    const isValidPassword = await bcrypt.compare(password, user.rows[0].password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.rows[0].id,
        fullname: user.rows[0].fullname,
        email: user.rows[0].email,
        plan: user.rows[0].plan,
        balance: user.rows[0].balance,
        joined: user.rows[0].joined
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get user data
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query('SELECT id, fullname, email, plan, balance, joined FROM users WHERE id = $1', [req.user.userId]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Update user profile
app.put('/api/user', authenticateToken, async (req, res) => {
  try {
    const { fullname, email, phone } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET fullname = $1, email = $2, phone = $3 WHERE id = $4 RETURNING id, fullname, email, phone',
      [fullname, email, phone, req.user.userId]
    );
    
    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Update password
app.put('/api/user/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user current password
    const user = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.userId]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.rows[0].password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Validate new password
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters with at least one uppercase letter, one number, and one special character' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.user.userId]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating password' });
  }
});

// Update plan (for payment)
app.put('/api/user/plan', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;
    
    await pool.query('UPDATE users SET plan = $1 WHERE id = $2', [plan, req.user.userId]);
    
    res.json({ message: 'Plan updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating plan' });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});