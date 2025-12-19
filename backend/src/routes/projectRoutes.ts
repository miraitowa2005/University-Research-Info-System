import express from 'express';
import { ProjectNotice } from '../models/ProjectNotice';
import { ProjectPhase } from '../models/ProjectPhase';
import { PhaseSubmission } from '../models/PhaseSubmission';
import { User } from '../models/User';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all project notices - protected
router.get('/notices', authMiddleware, async (req, res) => {
  try {
    const notices = await ProjectNotice.findAll({
      include: [{ model: ProjectPhase, as: 'phases' }]
    });
    res.json(notices);
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notice by ID - protected
router.get('/notices/:id', authMiddleware, async (req, res) => {
  try {
    const notice = await ProjectNotice.findByPk(req.params.id, {
      include: [{ model: ProjectPhase, as: 'phases' }]
    });
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    res.json(notice);
  } catch (error) {
    console.error('Get notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new notice - protected
router.post('/notices', authMiddleware, async (req, res) => {
  try {
    const { title, content, publish_by } = req.body;
    
    const notice = await ProjectNotice.create({
      title,
      content,
      publish_by
    });
    
    res.status(201).json(notice);
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notice - protected
router.put('/notices/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content, publish_by } = req.body;
    const notice = await ProjectNotice.findByPk(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    await notice.update({
      title,
      content,
      publish_by
    });
    
    res.json(notice);
  } catch (error) {
    console.error('Update notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notice - protected
router.delete('/notices/:id', authMiddleware, async (req, res) => {
  try {
    const notice = await ProjectNotice.findByPk(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    await notice.destroy();
    
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Project phase routes

// Get all phases - protected
router.get('/phases', authMiddleware, async (req, res) => {
  try {
    const phases = await ProjectPhase.findAll({
      include: [
        { model: ProjectNotice, as: 'notice' },
        { model: PhaseSubmission, as: 'submissions' }
      ]
    });
    res.json(phases);
  } catch (error) {
    console.error('Get phases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get phase by ID - protected
router.get('/phases/:id', authMiddleware, async (req, res) => {
  try {
    const phase = await ProjectPhase.findByPk(req.params.id, {
      include: [
        { model: ProjectNotice, as: 'notice' },
        { model: PhaseSubmission, as: 'submissions' }
      ]
    });
    
    if (!phase) {
      return res.status(404).json({ message: 'Phase not found' });
    }
    
    res.json(phase);
  } catch (error) {
    console.error('Get phase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get phases for a specific notice - protected
router.get('/notices/:noticeId/phases', authMiddleware, async (req, res) => {
  try {
    const { noticeId } = req.params;
    
    const phases = await ProjectPhase.findAll({
      where: { notice_id: noticeId },
      include: [{ model: ProjectNotice, as: 'notice' }]
    });
    
    res.json(phases);
  } catch (error) {
    console.error('Get notice phases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new phase - protected
router.post('/phases', authMiddleware, async (req, res) => {
  try {
    const { notice_id, name, deadline, description } = req.body;
    
    const phase = await ProjectPhase.create({
      notice_id,
      name,
      deadline,
      description
    });
    
    res.status(201).json(phase);
  } catch (error) {
    console.error('Create phase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update phase - protected
router.put('/phases/:id', authMiddleware, async (req, res) => {
  try {
    const { notice_id, name, deadline, description } = req.body;
    const phase = await ProjectPhase.findByPk(req.params.id);
    
    if (!phase) {
      return res.status(404).json({ message: 'Phase not found' });
    }
    
    await phase.update({
      notice_id,
      name,
      deadline,
      description
    });
    
    res.json(phase);
  } catch (error) {
    console.error('Update phase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete phase - protected
router.delete('/phases/:id', authMiddleware, async (req, res) => {
  try {
    const phase = await ProjectPhase.findByPk(req.params.id);
    
    if (!phase) {
      return res.status(404).json({ message: 'Phase not found' });
    }
    
    await phase.destroy();
    
    res.json({ message: 'Phase deleted successfully' });
  } catch (error) {
    console.error('Delete phase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Phase submission routes

// Get all submissions - protected
router.get('/submissions', authMiddleware, async (req, res) => {
  try {
    const submissions = await PhaseSubmission.findAll({
      include: [
        { model: ProjectPhase, as: 'phase' },
        { model: User, as: 'applicant' }
      ]
    });
    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new submission - protected
router.post('/submissions', authMiddleware, async (req, res) => {
  try {
    const { phase_id, applicant_id, status, file_url, remarks } = req.body;
    
    const submission = await PhaseSubmission.create({
      phase_id,
      applicant_id,
      status,
      file_url,
      remarks,
      submitted_at: status === 'submitted' ? new Date() : null
    });
    
    res.status(201).json(submission);
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher's submissions - protected
router.get('/my-submissions', authMiddleware, async (req, res) => {
  try {
    const user_id = parseInt(req.query.user_id as string);
    
    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({ message: 'User ID is required and must be a number' });
    }
    
    const submissions = await PhaseSubmission.findAll({
      where: { applicant_id: user_id },
      include: [
        { 
          model: ProjectPhase, 
          as: 'phase',
          include: [{ model: ProjectNotice, as: 'notice' }]
        }
      ]
    });
    
    res.json(submissions);
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get submissions for a specific notice - protected
router.get('/notices/:noticeId/submissions', authMiddleware, async (req, res) => {
  try {
    const { noticeId } = req.params;
    const { user_id } = req.body; // Assuming user_id is passed in request body or from auth middleware
    
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // First get all phases for this notice
    const phases = await ProjectPhase.findAll({ where: { notice_id: noticeId } });
    const phaseIds = phases.map(phase => phase.id);
    
    // Then get submissions for these phases by the user
    const submissions = await PhaseSubmission.findAll({
      where: {
        phase_id: phaseIds,
        applicant_id: user_id
      },
      include: [{ model: ProjectPhase, as: 'phase' }]
    });
    
    res.json(submissions);
  } catch (error) {
    console.error('Get notice submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get submissions for a phase (for admin real-time updates) - protected
router.get('/phases/:phaseId/submissions', authMiddleware, async (req, res) => {
  try {
    const { phaseId } = req.params;
    
    const submissions = await PhaseSubmission.findAll({
      where: { phase_id: phaseId },
      include: [
        { 
          model: User, 
          as: 'applicant',
          attributes: ['id', 'real_name', 'email', 'dept_id']
        },
        { model: ProjectPhase, as: 'phase' }
      ]
    });
    
    res.json(submissions);
  } catch (error) {
    console.error('Get phase submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get latest submissions (for admin real-time updates) - protected
router.get('/submissions/latest', authMiddleware, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const submissions = await PhaseSubmission.findAll({
      limit: Number(limit),
      order: [['submitted_at', 'DESC']],
      include: [
        { 
          model: User, 
          as: 'applicant',
          attributes: ['id', 'real_name', 'email', 'dept_id']
        },
        { 
          model: ProjectPhase, 
          as: 'phase',
          include: [{ model: ProjectNotice, as: 'notice' }]
        }
      ]
    });
    
    res.json(submissions);
  } catch (error) {
    console.error('Get latest submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;