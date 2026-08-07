export const ACTION_PLAN_TOP_LIMIT = 3;

export type SubjectRequest = {
  pTimes : number[]
  sTimes: number[]
  retrieveCumulative: boolean
  studentId?: number
  topLimit?: number
  topWeaknesses?: any[]
}

export type RankingRequest = {
  studentId?: number
  startTime : number
  endTime: number
}

export type DataResponse = {
  pData: number[]
  sData: number[]
  totalTime?: number
  correctRate?: number
  sCorrectRate?: number
}
export type SubjectDataNumberResponse = {
  pData: number[];
  sData: number[];
  subjects: Subject[]
  totalTime: number;
};

export type SubjectDataQuestionResponse = {
  pData: QuestionData[];
  sData: QuestionData[];
  totalCorrectRate: number;
  totalAnsweredQuestions: number;
  categories: Category[]
};

export type QuestionData = {
  correctRate: number
  totalAnsweredQuestions : number
  totalCorrectQuestions: number
}

export type Category = {
  id: number
  name: string
  path: string
}

export type Subject = {
  id: number
  color: string
  name: string
}

export type SubjectResponse = {
  id: number
  name: string
  isShowTimer: boolean
  sortOrder: number
  superId: number
  totalCategories: number
  audioUrls: string[]
  color: string | null
}

export type StudyTimeDistribution = {
    hours?: number;
    lastHours?: number;
    correctRate?: number
    totalAnsweredQuestions?: number
    totalCorrectQuestions?: number
    change: number;
    percentage?: number;
    id: number;
    name: string;
    path?: string
    color?: string
}

export type RankingDataResponse = {
  myCumulativeRanking: Ranking
  myRanking: Ranking
  topCumulativeStudents: Ranking[]
  topStudents: Ranking[]
}

export type Ranking = {
  fullName: string
  grade: number
  gradeYear?: number
  rank: number
  schoolName: string
  userId: number
  totalTime?: number
  correctRate?: number
  totalCorrectQuestions?: number
  totalAnsweredQuestions?: number
}


export type QuestionAnswerOverallResponse = {
  myData: QuestionAnswerOverallData
  avgData: QuestionAnswerOverallData
}

type QuestionAnswerOverallData = {
  totalAnsweredQuestions: number
  totalCorrectQuestions: number
  correctRate: number
}

export type Option = {
  label: string
  value: number
}

export enum SubTab {
  SUMMARY,
  PERFORMANCE,
  WEAKNESS,
  PLAN,
}

// ────────────────────────────────────────────────────────────
// PERFORMANCE DATA TAB TYPES
// ────────────────────────────────────────────────────────────

export type PerformanceSummaryResponse = {
  today: {
    accuracy: number;
    delta: number;
    isDeltaUp: boolean;
    solved: number;
    correct: number;
    wrong: number;
    streak: number;
  };
  period: {
    solvedCount: number;
    avgAccuracy: number;
    delta?: number;
    goalAccuracy: number;
    weakestType: PerformanceCategoryLabel & { accuracy: number };
    strongestCategory: PerformanceCategoryLabel & { accuracy: number; sampleSizeWarning: boolean };
  };
  strengths: Array<string | (PerformanceCategoryLabel & { accuracy: number })>;
  weekDaysActive: number;
  weekActivity: { timestamp: number; level: number; today: boolean }[];
  weekTotalProblems: number;
  weekTotalTime: number;
  strengthMessage?: string | null;
};

export type PerformanceCategoryLabel = {
  categoryId?: number;
  parentCategoryId?: number;
  name?: string;
  categoryName?: string;
  subCategoryName?: string;
  questionTypeName?: string;
};

export type PerformanceAnalysisResponse = {
  achievementChart: { timestamp: number; student: number; classAvg: number }[];
  mainCategoryDistribution: Array<PerformanceCategoryLabel & {
    percentage: number;
    accuracy: number;
    solved: number;
  }>;
  subCategoryAccuracy: Array<PerformanceCategoryLabel & {
    accuracy: number;
    solved: number;
    total: number;
    delta: number;
    sampleSizeWarning: boolean;
  }>;
  tipText: string | null;
  peer: { studentAccuracy: number; totalAvgAccuracy: number } | null;
};

export type PerformanceWeaknessResponse = {
  topWeaknesses: Array<PerformanceCategoryLabel & { tags?: string[]; correct: number; total: number; delta: number; accuracy: number }>;
  allTypes: Array<PerformanceCategoryLabel & { tags?: string[]; correct: number; count: number; accuracy: number; timestamp: number }>;
};
