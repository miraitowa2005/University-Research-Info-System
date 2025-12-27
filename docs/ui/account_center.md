标题：个人中心页面前端设计说明

概述
- 目标：将基本信息、学术信息、教育与工作经历、隐私与安全四个资料块合并为一个资料卡，通过标签切换展示
- 路由视图：activeView === 'account'
- 文件路径：d:/competition/University Research Info System/App.tsx

结构
- 顶部标签栏：基本信息、学术信息、教育与工作经历、隐私与安全；右侧“保存档案”按钮
- 主体区域：根据当前标签 accountTab 显示相应内容
- 状态：accountTab（'basic'|'academic'|'experience'|'security'）、experiences、expForm

交互
- 保存档案：统一调用 usersAPI.updateMe 提交当前用户档案字段
- 经历管理：同步服务器、新增经历、编辑、删除，调用 /users/me/experiences 系列接口
- 修改密码：调用 /users/me/password，校验旧密码后更新
- 公开开关：profile_public 切换，保存时一起提交

接口
- usersAPI.updateMe, getMyExperiences, addMyExperience, updateMyExperience, deleteMyExperience, changeMyPassword
- departmentAPI.normalize 用于部门编码规范化

样式
- 外层卡片：rounded-xl border shadow-sm
- 标签按钮：选中态 bg-indigo-600 text-white；未选中态 text-gray-700 hover:bg-gray-50
