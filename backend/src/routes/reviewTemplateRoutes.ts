import express from 'express';
import { authMiddleware } from '../middleware/auth';
import ReviewTemplate from '../models/ReviewTemplate';

const router = express.Router();

function ensureAdmin(req: any, res: any) {
  const role = req.user?.role;
  if (role !== 'research_admin' && role !== 'sys_admin') {
    res.status(403).json({ message: 'Forbidden' });
    return false;
  }
  return true;
}

// List templates (own + shared)
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const adminId = req.user.id;
    const list = await ReviewTemplate.findAll({
      where: {},
      order: [['id', 'DESC']]
    });
    // Filter: shared or created by me
    const result = list.filter((t: any) => t.is_shared || t.admin_id === adminId);
    res.json(result);
  } catch (e) {
    console.error('List templates error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create template
router.post('/', authMiddleware, async (req: any, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const adminId = req.user.id;
    const { title, content, is_shared } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });
    const tpl = await ReviewTemplate.create({ admin_id: adminId, title, content, is_shared: !!is_shared });
    res.status(201).json(tpl);
  } catch (e) {
    console.error('Create template error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update template
router.put('/:id', authMiddleware, async (req: any, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const adminId = req.user.id;
    const tpl = await ReviewTemplate.findByPk(req.params.id);
    if (!tpl) return res.status(404).json({ message: 'Not found' });
    if ((tpl as any).admin_id !== adminId && !req.user?.role?.includes('sys_admin')) {
      return res.status(403).json({ message: 'Only owner can edit template' });
    }
    const { title, content, is_shared } = req.body;
    await tpl.update({ title, content, is_shared: is_shared ?? (tpl as any).is_shared });
    res.json(tpl);
  } catch (e) {
    console.error('Update template error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete template
router.delete('/:id', authMiddleware, async (req: any, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const adminId = req.user.id;
    const tpl = await ReviewTemplate.findByPk(req.params.id);
    if (!tpl) return res.status(404).json({ message: 'Not found' });
    if ((tpl as any).admin_id !== adminId && !req.user?.role?.includes('sys_admin')) {
      return res.status(403).json({ message: 'Only owner can delete template' });
    }
    await tpl.destroy();
    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error('Delete template error:', e);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
