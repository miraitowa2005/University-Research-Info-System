import express from 'express';
import { ResearchCategory } from '../models/ResearchCategory';
import { ResearchSubtype } from '../models/ResearchSubtype';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all research categories - protected
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await ResearchCategory.findAll({
      include: [{ model: ResearchSubtype, as: 'subtypes' }]
    });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category by ID - protected
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await ResearchCategory.findByPk(req.params.id, {
      include: [{ model: ResearchSubtype, as: 'subtypes' }]
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new category - protected
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, sort_order, is_active } = req.body;
    
    const category = await ResearchCategory.create({
      name,
      sort_order: sort_order || 0,
      is_active: is_active !== undefined ? is_active : true
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category - protected
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, sort_order, is_active } = req.body;
    const category = await ResearchCategory.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await category.update({
      name,
      sort_order,
      is_active
    });
    
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category - protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await ResearchCategory.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await category.destroy();
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Subtype routes

// Get all subtypes - protected
router.get('/subtypes', authMiddleware, async (req, res) => {
  try {
    const subtypes = await ResearchSubtype.findAll({
      include: [{ model: ResearchCategory, as: 'category' }]
    });
    res.json(subtypes);
  } catch (error) {
    console.error('Get subtypes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subtype by ID - protected
router.get('/subtypes/:id', authMiddleware, async (req, res) => {
  try {
    const subtype = await ResearchSubtype.findByPk(req.params.id, {
      include: [{ model: ResearchCategory, as: 'category' }]
    });
    
    if (!subtype) {
      return res.status(404).json({ message: 'Subtype not found' });
    }
    
    res.json(subtype);
  } catch (error) {
    console.error('Get subtype error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new subtype - protected
router.post('/subtypes', authMiddleware, async (req, res) => {
  try {
    const { category_id, name, required_fields_json } = req.body;
    
    const subtype = await ResearchSubtype.create({
      category_id,
      name,
      required_fields_json: required_fields_json || '{}'
    });
    
    res.status(201).json(subtype);
  } catch (error) {
    console.error('Create subtype error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update subtype - protected
router.put('/subtypes/:id', authMiddleware, async (req, res) => {
  try {
    const { category_id, name, required_fields_json } = req.body;
    const subtype = await ResearchSubtype.findByPk(req.params.id);
    
    if (!subtype) {
      return res.status(404).json({ message: 'Subtype not found' });
    }
    
    await subtype.update({
      category_id,
      name,
      required_fields_json
    });
    
    res.json(subtype);
  } catch (error) {
    console.error('Update subtype error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete subtype - protected
router.delete('/subtypes/:id', authMiddleware, async (req, res) => {
  try {
    const subtype = await ResearchSubtype.findByPk(req.params.id);
    
    if (!subtype) {
      return res.status(404).json({ message: 'Subtype not found' });
    }
    
    await subtype.destroy();
    
    res.json({ message: 'Subtype deleted successfully' });
  } catch (error) {
    console.error('Delete subtype error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;