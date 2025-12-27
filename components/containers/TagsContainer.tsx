import React from 'react';
import { TagManager } from '../EnhancedAdminTools';
import { User } from '../../types';

export default function TagsContainer({
  users,
  onUpdateUserTags,
}: {
  users: User[];
  onUpdateUserTags: (userId: string, tags: string[]) => void;
}) {
  return <TagManager users={users} onUpdateUserTags={onUpdateUserTags} />;
}

