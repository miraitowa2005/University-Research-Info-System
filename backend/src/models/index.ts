import { User } from './User';
import { UserRole } from './UserRole';
import { RolePermission } from './RolePermission';
import { Department } from './Department';
import { Title } from './Title';
import { Role } from './Role';
import { Permission } from './Permission';
import { ResearchCategory } from './ResearchCategory';
import { ResearchSubtype } from './ResearchSubtype';
import { ResearchItem } from './ResearchItem';
import { ResearchCollaborator } from './ResearchCollaborator';
import { ProjectNotice } from './ProjectNotice';
import { ProjectPhase } from './ProjectPhase';
import { PhaseSubmission } from './PhaseSubmission';
import { AuditLog } from './AuditLog';
import { SystemSetting } from './SystemSetting';
import { UserProfileSetting } from './UserProfileSetting';
import { ResearchTag } from './ResearchTag';
import ReviewTemplate from './ReviewTemplate';

// 评审意见模板归属用户（科研管理员）
ReviewTemplate.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

// 定义模型之间的关联关系

// 用户与部门、职称的关联
User.belongsTo(Department, { foreignKey: 'dept_id', as: 'department' });
User.belongsTo(Title, { foreignKey: 'title_id', as: 'title' });

// 用户与角色的多对多关联
User.belongsToMany(Role, {
  through: UserRole,
  timestamps: false,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles'
});

Role.belongsToMany(User, {
  through: { model: 'user_roles', timestamps: false },
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users'
});

// 角色与权限的多对多关联
Role.belongsToMany(Permission, {
  through: { model: RolePermission, timestamps: false, attributes: [] },
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions'
});

Permission.belongsToMany(Role, {
  through: { model: RolePermission, timestamps: false },
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles'
});

// 科研类别与子类的关联
ResearchCategory.hasMany(ResearchSubtype, { foreignKey: 'category_id', as: 'subtypes' });
ResearchSubtype.belongsTo(ResearchCategory, { foreignKey: 'category_id', as: 'category' });

// 科研项目与用户、子类的关联
ResearchItem.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ResearchItem.belongsTo(ResearchSubtype, { foreignKey: 'subtype_id', as: 'subtype' });

// 科研项目与合作者的关联
ResearchItem.hasMany(ResearchCollaborator, { foreignKey: 'item_id', as: 'collaborators' });
ResearchCollaborator.belongsTo(ResearchItem, { foreignKey: 'item_id', as: 'research_item' });
ResearchCollaborator.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 项目申报通知与阶段的关联
ProjectNotice.hasMany(ProjectPhase, { foreignKey: 'notice_id', as: 'phases' });
ProjectPhase.belongsTo(ProjectNotice, { foreignKey: 'notice_id', as: 'notice' });

// 项目阶段与提交记录的关联
ProjectPhase.hasMany(PhaseSubmission, { foreignKey: 'phase_id', as: 'submissions' });
PhaseSubmission.belongsTo(ProjectPhase, { foreignKey: 'phase_id', as: 'phase' });
PhaseSubmission.belongsTo(User, { foreignKey: 'applicant_id', as: 'applicant' });

// 审计日志与用户的关联
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 用户与个人配置的关联
User.hasOne(UserProfileSetting, { foreignKey: 'user_id', as: 'profile_setting' });
UserProfileSetting.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 用户与标签的多对多关联
User.belongsToMany(ResearchTag, {
  through: { model: 'user_tags', timestamps: false },
  foreignKey: 'user_id',
  otherKey: 'tag_id',
  as: 'tags'
});

ResearchTag.belongsToMany(User, {
  through: { model: 'user_tags', timestamps: false },
  foreignKey: 'tag_id',
  otherKey: 'user_id',
  as: 'users'
});

// 导出所有模型
export {
  User,
  Department,
  Title,
  Role,
  Permission,
  ResearchCategory,
  ResearchSubtype,
  ResearchItem,
  ResearchCollaborator,
  ProjectNotice,
  ProjectPhase,
  PhaseSubmission,
  AuditLog,
  SystemSetting,
  UserProfileSetting,
  ResearchTag
};