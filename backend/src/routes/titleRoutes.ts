import express from 'express';
import { Title } from '../models/Title';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all titles - protected
router.get('/', authMiddleware, async (req, res) => {
  try {
    const titles = await Title.findAll();
    res.json(titles);
  } catch (error) {
    console.error('Get titles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get title by ID - protected
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const title = await Title.findByPk(req.params.id);
    
    if (!title) {
      return res.status(404).json({ message: 'Title not found' });
    }
    
    res.json(title);
  } catch (error) {
    console.error('Get title error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new title - protected
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, level } = req.body;
    
    const title = await Title.create({
      name,
      level
    });
    
    res.status(201).json(title);
  } catch (error) {
    console.error('Create title error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update title - protected
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, level } = req.body;
    const title = await Title.findByPk(req.params.id);
    
    if (!title) {
      return res.status(404).json({ message: 'Title not found' });
    }
    
    await title.update({
      name,
      level
    });
    
    res.json(title);
  } catch (error) {
    console.error('Update title error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete title - protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const title = await Title.findByPk(req.params.id);
    
    if (!title) {
      return res.status(404).json({ message: 'Title not found' });
    }
    
    await title.destroy();
    
    res.json({ message: 'Title deleted successfully' });
  } catch (error) {
    console.error('Delete title error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;