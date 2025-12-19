import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Role } from '../models/Role';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Find user by username
    const user = await User.findOne({ 
      where: { 
        username, 
        is_active: true 
      } 
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Load roles (many-to-many)
    const roles = typeof (user as any).getRoles === 'function' ? await (user as any).getRoles() : [];
    const roleCode = roles && roles.length > 0 ? roles[0].code : 'teacher';
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: roleCode },
      'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Return user info and token
    res.json({
      user: {
        id: user.id,
        name: user.real_name,
        username: user.username,
        role: roleCode,
        dept_id: user.dept_id,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, real_name, email, phone, dept_id, title_id, role, role_code } = req.body;
    
    // Validate input
    if (!username || !password || !real_name) {
      return res.status(400).json({ message: 'Username, password, and real name are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = await User.create({
      username,
      password_hash: hashedPassword,
      real_name,
      email,
      phone,
      dept_id,
      title_id,
      is_active: true
    });

    // Bind role (default teacher)
    const desiredRoleCode = role_code || role || 'teacher';
    try {
      const roleModel = await Role.findOne({ where: { code: desiredRoleCode } });
      if (roleModel && typeof (user as any).addRole === 'function') {
        await (user as any).addRole(roleModel);
      }
    } catch (e) {
      console.warn('Role binding skipped:', e);
    }

    // Resolve user's primary role for response
    const roles = typeof (user as any).getRoles === 'function' ? await (user as any).getRoles() : [];
    const roleCode = roles && roles.length > 0 ? roles[0].code : 'teacher';
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: roleCode },
      'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      user: {
        id: user.id,
        name: user.real_name,
        username: user.username,
        role: roleCode,
        dept_id: user.dept_id,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;