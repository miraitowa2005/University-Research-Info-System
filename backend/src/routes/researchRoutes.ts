import express from 'express';
import { ResearchItem } from '../models/ResearchItem';
import { AuditLog } from '../models/AuditLog';
import { authMiddleware } from '../middleware/auth';
import { User } from '../models/User';
import { ResearchCollaborator } from '../models/ResearchCollaborator';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';

const router = express.Router();

// Get all research items - protected
router.get('/', authMiddleware, async (req, res) => {
  try {
    const researchItems = await ResearchItem.findAll();
    res.json(researchItems);
  } catch (error) {
    console.error('Get research items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get research items by user ID - protected
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const researchItems = await ResearchItem.findAll({
      where: { user_id: req.params.userId }
    });
    res.json(researchItems);
  } catch (error) {
    console.error('Get user research items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending research items for approval - protected
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const researchItems = await ResearchItem.findAll({
      where: { status: 'pending' }
    });
    res.json(researchItems);
  } catch (error) {
    console.error('Get pending research items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create research item - protected
router.post('/', authMiddleware, async (req: any, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { title, subtype_id, content_json, status, file_url, teamMembers } = req.body;
    const { id: user_id } = req.user;

    // 1. Create the main research item
    const researchItem = await ResearchItem.create({
      title,
      user_id,
      subtype_id,
      content_json,
      status: status || 'draft',
      file_url
    }, { transaction });

    // 2. Handle team members if they exist
    if (teamMembers && Array.isArray(teamMembers) && teamMembers.length > 0) {
      // Find users by their real names
      const users = await User.findAll({
        where: {
          real_name: {
            [Op.in]: teamMembers
          }
        },
        transaction
      });

      if (users.length > 0) {
        // Prepare collaborator records
        const collaboratorRecords = users.map(user => ({
          item_id: researchItem.id,
          user_id: user.id,
        }));
        // Bulk create collaborators
        await ResearchCollaborator.bulkCreate(collaboratorRecords, { transaction });
      }
    }

    // 3. Log the action
    await AuditLog.create({
      user_id,
      action: '创建科研项目',
      target_type: 'research_item',
      target_id: researchItem.id,
      old_value: null,
      new_value: researchItem.toJSON(),
      ip: req.ip
    }, { transaction });

    // 4. Commit the transaction
    await transaction.commit();

    res.status(201).json(researchItem);
  } catch (error) {
    // 5. Rollback transaction on error
    await transaction.rollback();
    console.error('Create research item error:', error);
    // Provide more specific error feedback to the frontend
    let userMessage = 'Server error while creating research item.';
    if (error instanceof Error) {
      if (error.name === 'SequelizeValidationError') {
        const messages = (error as any).errors.map((e: any) => e.message).join(', ');
        userMessage = `Validation Error: ${messages}`;
      } else if (error.name === 'SequelizeUniqueConstraintError') {
        const fields = (error as any).fields;
        userMessage = `Error: The following fields must be unique: ${Object.keys(fields).join(', ')}`;
      } else {
        userMessage = error.message;
      }
    }
    res.status(500).json({ message: userMessage });
  }
});

/**
 * IMPORTANT: Define the batch route BEFORE the parameterized ':id' route.
 * Otherwise, '/batch/status' will be captured by '/:id/status' with id='batch'.
 */
// Batch update research items status - protected
router.put('/batch/status', authMiddleware, async (req: any, res) => {
  try {
    const { ids, status, remarks } = req.body;
    const operatorId = req.user?.id;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids is required' });
    }
    if (!status) {
      return res.status(400).json({ message: 'status is required' });
    }

    const newStatus = String(status).toLowerCase();

    const updated = await ResearchItem.update(
      { 
        status: newStatus as any,
        audit_remarks: remarks,
        ...(newStatus === 'approved' && { approve_time: new Date() })
      },
      { where: { id: ids } }
    );

    await AuditLog.create({
      user_id: operatorId,
      action: `批量更新项目状态`,
      target_type: 'research_item',
      target_id: null,
      old_value: null,
      new_value: { ids, status: newStatus, remarks },
      ip: req.ip
    });

    res.json({ message: `Successfully updated ${updated[0]} items` });
  } catch (error) {
    console.error('Batch update research items status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update research item status - protected
router.put('/:id/status', authMiddleware, async (req: any, res) => {
  try {
    const { status, remarks } = req.body;
    const operatorId = req.user?.id;
    const idParam = req.params.id;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Guard: ensure id is numeric to avoid matching '/batch/status' here
    if (!/^\d+$/.test(String(idParam))) {
      return res.status(400).json({ message: 'Invalid id parameter' });
    }

    const researchItem = await ResearchItem.findByPk(idParam);
    if (!researchItem) {
      return res.status(404).json({ message: 'Research item not found' });
    }

    const newStatus = String(status).toLowerCase();
    const oldStatus = researchItem.status;

    const updatedItem = await researchItem.update({
      status: newStatus as any,
      audit_remarks: remarks,
      ...(newStatus === 'approved' && { approve_time: new Date() })
    });

    await AuditLog.create({
      user_id: operatorId,
      action: `更新项目状态`,
      target_type: 'research_item',
      target_id: researchItem.id,
      old_value: { status: oldStatus },
      new_value: { status: newStatus, remarks },
      ip: req.ip
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Update research item status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete research item - protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.body;
    
    const researchItem = await ResearchItem.findByPk(req.params.id);
    if (!researchItem) {
      return res.status(404).json({ message: 'Research item not found' });
    }
    
    await researchItem.destroy();
    
    // Log the action
    await AuditLog.create({
      user_id,
      action: '删除科研项目',
      target_type: 'research_item',
      target_id: req.params.id,
      old_value: researchItem.toJSON(),
      new_value: null,
      ip: req.ip
    });
    
    res.json({ message: 'Research item deleted successfully' });
  } catch (error) {
    console.error('Delete research item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
