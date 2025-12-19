import express from 'express';
import { Permission } from '../models/Permission';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all permissions - protected
router.get('/', authMiddleware, async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.json(permissions);
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get permission by ID - protected
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    res.json(permission);
  } catch (error) {
    console.error('Get permission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new permission - protected
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, code, description, resource_type, action } = req.body;
    
    const permission = await Permission.create({
      name,
      code,
      description,
      resource_type,
      action
    });
    
    res.status(201).json(permission);
  } catch (error) {
    console.error('Create permission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update permission - protected
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, code, description, resource_type, action } = req.body;
    const permission = await Permission.findByPk(req.params.id);
    
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    await permission.update({
      name,
      code,
      description,
      resource_type,
      action
    });
    
    res.json(permission);
  } catch (error) {
    console.error('Update permission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete permission - protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    await permission.destroy();
    
    res.json({ message: 'Permission deleted successfully' });
  } catch (error) {
    console.error('Delete permission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;