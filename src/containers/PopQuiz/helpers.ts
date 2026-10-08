import { PopQuizSolveTarget } from '@/utils/enums';

export const getSolveTargetLabel = (
  target?: PopQuizSolveTarget | number | string | null,
  t?: (key: string) => string
): string => {
  if (target === undefined || target === null || !t) return '';
  const numTarget = typeof target === 'string' ? Number(target) : target;
  if (target === PopQuizSolveTarget.Child || target === 'Child' || numTarget === 0) {
    return t('my_child');
  }
  if (target === PopQuizSolveTarget.Friend || target === 'Friend' || numTarget === 1) {
    return t('friend');
  }
  if (target === PopQuizSolveTarget.Group || target === 'Group' || numTarget === 2) {
    return t('study_group');
  }
  if (target === PopQuizSolveTarget.Myself || target === 'Myself' || numTarget === 3) {
    return t('myself');
  }
  return '';
};
