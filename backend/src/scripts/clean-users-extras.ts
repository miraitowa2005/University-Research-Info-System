import 'dotenv/config';
import { sequelize } from '../config/database';
import { User } from '../models/User';

const USERS = ['123@123.com','234@234.com','345@345.com'];

async function main(){
  console.log('[clean-users-extras] start');
  await sequelize.authenticate();

  let affectedItems=0, affectedTags=0;
  for (const username of USERS){
    const user = await User.findOne({ where: { username } });
    if (!user){
      console.warn(`[clean-users-extras] 用户不存在: ${username}`);
      continue;
    }
    const uid = (user as any).id;
    // 删除该用户的演示项目（仅限本脚本/相关脚本生成的标题前缀）
    const [delItems] = await sequelize.query(
      `DELETE FROM research_items WHERE user_id = ? AND (
         title LIKE '用户演示项目（%' OR
         title LIKE '用户横向项目（%'
       )`,
      { replacements: [uid] }
    );
    // 解除标签绑定（仅解绑，不删除标签字典本身）
    const [delTags] = await sequelize.query(
      `DELETE FROM user_tags WHERE user_id = ?`,
      { replacements: [uid] }
    );
    affectedItems += (delItems as any)?.affectedRows ?? 0;
    affectedTags  += (delTags as any)?.affectedRows ?? 0;
    console.log(`[clean-users-extras] 清理完成: ${username}`);
  }

  console.log(`[clean-users-extras] done. removed_items=${affectedItems}, removed_user_tag_bindings=${affectedTags}`);
  await sequelize.close();
}

main().catch(err=>{ console.error('[clean-users-extras] error:', err); process.exit(1); });

