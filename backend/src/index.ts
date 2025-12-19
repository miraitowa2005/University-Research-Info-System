import express from 'express';
import cors from 'cors';
import path from 'path';
import { sequelize } from './config/database';
import userRoutes from './routes/userRoutes';
import researchRoutes from './routes/researchRoutes';
import authRoutes from './routes/authRoutes';
import logRoutes from './routes/logRoutes';
import departmentRoutes from './routes/departmentRoutes';
import titleRoutes from './routes/titleRoutes';
import roleRoutes from './routes/roleRoutes';
import permissionRoutes from './routes/permissionRoutes';
import categoryRoutes from './routes/categoryRoutes';
import projectRoutes from './routes/projectRoutes';
import reviewTemplateRoutes from './routes/reviewTemplateRoutes';
import logger from './utils/logger';

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
});

// Process-level error handlers
process.on('unhandledRejection', (reason: any) => {
  logger.error(`UnhandledRejection: ${reason?.stack || reason}`);
});
process.on('uncaughtException', (err: any) => {
  logger.error(`UncaughtException: ${err?.stack || err}`);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/titles', titleRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/review-templates', reviewTemplateRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'University Research Info System API',
    version: '1.0.0',
    health: 'http://localhost:5000/api/health',
    api: 'http://localhost:5000/api/'
  });
});

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend service is running' });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'University Research Info System API',
    endpoints: {
      auth: '/api/auth/',
      users: '/api/users/',
      research: '/api/research/',
      departments: '/api/departments/',
      titles: '/api/titles/',
      roles: '/api/roles/',
      permissions: '/api/permissions/',
      categories: '/api/categories/',
      projects: '/api/projects/',
      logs: '/api/logs/'
    }
  });
});

// Import models for initialization
import { User, Role, Permission, Department, Title, ResearchCategory } from './models';
import UserRole from './models/UserRole';
import RolePermission from './models/RolePermission';
import ReviewTemplate from './models/ReviewTemplate';
import bcrypt from 'bcryptjs';

// Initialize database and start server
async function startServer() {
  try {
    // Check database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync(); // Use { force: true } only in development to reset DB
    // await sequelize.sync({ force: true });
    console.log('Database tables synced successfully');
    
    // Create default data
    await createDefaultData();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Create default admin user and initial data
async function createDefaultData() {
  try {
    // Create default roles
    const sysAdminRole = await Role.findOrCreate({
      where: { code: 'sys_admin' },
      defaults: {
        name: '系统管理员',
        code: 'sys_admin',
        description: '系统超级管理员',
        is_system: true
      }
    });

    const researchAdminRole = await Role.findOrCreate({
      where: { code: 'research_admin' },
      defaults: {
        name: '科研管理员',
        code: 'research_admin',
        description: '科研管理与审核',
        is_system: true
      }
    });
    
    const teacherRole = await Role.findOrCreate({
      where: { code: 'teacher' },
      defaults: {
        name: '教师',
        code: 'teacher',
        description: '普通教师用户',
        is_system: true
      }
    });
    
    // Create default permission
    const manageUsersPermission = await Permission.findOrCreate({
      where: { code: 'manage_users' },
      defaults: {
        name: '管理用户',
        code: 'manage_users',
        module: 'user'
      }
    });
    
    // Assign permission to admin role
    await sysAdminRole[0].addPermission(manageUsersPermission[0]);
    
    // Create default department
    const defaultDept = await Department.findOrCreate({
      where: { code: 'default' },
      defaults: {
        code: 'default',
        name: '默认部门',
        level: 1,
        is_active: true
      }
    });
    
    // Create default title
    const defaultTitle = await Title.findOrCreate({
      where: { name: '研究员' },
      defaults: {
        name: '研究员',
        level: 1
      }
    });
    
    // Create default research category
    const defaultCategory = await ResearchCategory.findOrCreate({
      where: { name: '基础研究' },
      defaults: {
        name: '基础研究',
        sort_order: 1,
        is_active: true
      }
    });
    
    // Create default admin user
    const adminUser = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        password_hash: await bcrypt.hash('admin123', 10),
        real_name: '系统管理员',
        dept_id: defaultDept[0].id,
        title_id: defaultTitle[0].id,
        email: 'admin@example.com',
        phone: '13800138000',
        is_active: true
      }
    });
    
    // Assign admin role to admin user
    await adminUser[0].addRole(sysAdminRole[0]);

    // Seed a few review templates for demo
    await ReviewTemplate.findOrCreate({
      where: { title: '缺少合同/立项批文' },
      defaults: {
        admin_id: adminUser[0].id,
        title: '缺少合同/立项批文',
        content: '请补充合同扫描件或立项批文，并确保项目编号、经费金额与系统填写一致。',
        is_shared: 1
      }
    });
    await ReviewTemplate.findOrCreate({
      where: { title: '论文信息不完整' },
      defaults: {
        admin_id: adminUser[0].id,
        title: '论文信息不完整',
        content: '请补全期刊/会议名称、卷(期)、页码、DOI等信息；若为早期接收，请上传正式录用通知。',
        is_shared: 1
      }
    });
    
    console.log('Default data created successfully');
    console.log('Admin user created: username=admin, password=admin123');
  } catch (error) {
    console.error('Create default data error:', error);
    throw error;
  }
}

startServer();