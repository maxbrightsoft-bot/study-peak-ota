import { PopQuizSolveTarget } from '@/utils/enums';
import useAuthStore from '@/store/useAuthStore';
import { navigate } from '@/navigators/NavigationHelpers';
import { Routes } from '@/navigators/RouteName';
import { TEXTBOOK_TABS } from '@/containers/Textbook/configs/constants';

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

export const navigateToPopQuizList = () => {
  const { user, selectedAcademy } = useAuthStore.getState();
  const hasAcademy = Boolean(selectedAcademy?.domain || user?.academyDomain);
  if (hasAcademy) {
    navigate(Routes.Auth.Textbook as any, { tab: TEXTBOOK_TABS.POP_QUIZ });
  } else {
    navigate(Routes.Auth.PopQuiz as any);
  }
};

