import express from 'express';
import { AuditLog } from '../models/AuditLog';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all audit logs - protected
router.get('/', authMiddleware, async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      order: [['created_at', 'DESC']]
    });
    
    res.json(logs);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get logs by target ID - protected
router.get('/target/:targetId', authMiddleware, async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      where: { target_id: req.params.targetId },
      order: [['created_at', 'DESC']]
    });
    
    res.json(logs);
  } catch (error) {
    console.error('Get audit logs by target error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get logs by target type - protected
router.get('/type/:targetType', authMiddleware, async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      where: { target_type: req.params.targetType },
      order: [['created_at', 'DESC']]
    });
    
    res.json(logs);
  } catch (error) {
    console.error('Get audit logs by target type error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get logs by action - protected
router.get('/action/:action', authMiddleware, async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      where: { action: req.params.action },
      order: [['created_at', 'DESC']]
    });
    
    res.json(logs);
  } catch (error) {
    console.error('Get audit logs by action error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;