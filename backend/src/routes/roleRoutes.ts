import express from 'express';
import { Role } from '../models/Role';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all roles - protected
router.get('/', authMiddleware, async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get role by ID - protected
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    res.json(role);
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new role - protected
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, is_active } = req.body;
    
    const role = await Role.create({
      name,
      description,
      is_active: is_active !== undefined ? is_active : true
    });
    
    res.status(201).json(role);
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update role - protected
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, is_active } = req.body;
    const role = await Role.findByPk(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    await role.update({
      name,
      description,
      is_active
    });
    
    res.json(role);
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete role - protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    await role.destroy();
    
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;