import express from 'express';
import { Department } from '../models/Department';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all departments - protected
router.get('/', authMiddleware, async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department by ID - protected
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.json(department);
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new department - protected
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { code, name, parent_id, level, is_active } = req.body;
    
    const department = await Department.create({
      code,
      name,
      parent_id,
      level,
      is_active: is_active !== undefined ? is_active : true
    });
    
    res.status(201).json(department);
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update department - protected
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { code, name, parent_id, level, is_active } = req.body;
    const department = await Department.findByPk(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    await department.update({
      code,
      name,
      parent_id,
      level,
      is_active
    });
    
    res.json(department);
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete department - protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    await department.destroy();
    
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;