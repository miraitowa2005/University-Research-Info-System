import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { authMiddleware } from '../middleware/auth';
import '../models'; // Ensure all models and associations are loaded

const router = express.Router();

// Middleware to check for System Admin role
const sysAdminOnly = (req: any, res: any, next: any) => {
  // Assuming authMiddleware attaches user with a roles array
  if (req.user && req.user.roles && req.user.roles.some((r: any) => r.code === 'sys_admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: Requires system administrator role' });
};

// Get all users - protected for sys admins
router.get('/', authMiddleware, sysAdminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Role, as: 'roles', through: { attributes: [] } }], // Include roles
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID - protected for sys admins
router.get('/:id', authMiddleware, sysAdminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Role, as: 'roles' }],
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new user - sys admin only
router.post('/', authMiddleware, sysAdminOnly, async (req, res) => {
  try {
    const { username, password, real_name, email, phone, dept_id, title_id, role_code = 'teacher' } = req.body;

    if (!username || !password || !real_name) {
      return res.status(400).json({ message: 'Username, password, and real_name are required' });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password_hash,
      real_name,
      email,
      phone,
      dept_id,
      title_id,
      is_active: true,
    } as any);

    const role = await Role.findOne({ where: { code: role_code } });
    if (role) {
      await (newUser as any).addRole(role);
    }

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile - allows self-update or admin update
router.put('/:id', authMiddleware, async (req: any, res) => {
  try {
    const userToUpdate = await User.findByPk(req.params.id);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isSysAdmin = req.user.roles.some((r: any) => r.code === 'sys_admin');
    const isSelf = String(req.user.id) === String(req.params.id);

    if (!isSysAdmin && !isSelf) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own profile' });
    }

    const { real_name, email, phone, avatar_url, dept_id, title_id } = req.body;
    const profileData = { real_name, email, phone, avatar_url, dept_id, title_id };

    await userToUpdate.update(profileData);

    // Admin-only fields
    if (isSysAdmin) {
      const { username, is_active, role_code } = req.body;
      const adminData: any = {};
      if (username !== undefined) adminData.username = username;
      if (is_active !== undefined) adminData.is_active = is_active;

      await userToUpdate.update(adminData);

      if (role_code) {
        const role = await Role.findOne({ where: { code: role_code } });
        if (role) {
          await (userToUpdate as any).setRoles([role]);
        }
      }
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user - sys admin only
router.delete('/:id', authMiddleware, sysAdminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
