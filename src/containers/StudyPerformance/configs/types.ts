export type SubjectRequest = {
  pTimes : number[]
  sTimes: number[]
  retrieveCumulative: boolean
  studentId?: number
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