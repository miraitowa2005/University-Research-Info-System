import React from 'react';
import { DynamicForm } from '../DynamicForm';
import { User, ResearchItem } from '../../types';
import { RESEARCH_SUBTYPES } from '../../logic/compiler';

export default function ApplyContainer({
  currentUser,
  onSubmit,
  onCancel,
}: {
  currentUser: User;
  onSubmit: (item: ResearchItem) => void;
  onCancel: () => void;
}) {
  return (
    <DynamicForm
      subtypes={RESEARCH_SUBTYPES}
      currentUser={currentUser}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}

