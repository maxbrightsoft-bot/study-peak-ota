
export type UserResponse = {
  id: number
  phoneNumber: string
  email: string
  avatar: string
  fullName: string
  classes: string[]
  parentPhoneNumber: string
  parentName: string
  major: string
  grade: number
  schoolName: string
  academyDomain: string
  isLearningSpace: boolean
  isNotEnoughStatements?: boolean
  roles: string[]
  superId: number
  loginMethod: string
}

export type Student = {
  avatar: string;
  className: string;
  email: string;
  id: number;
  major: string;
  parentName: string;
  parentPhoneNumber: string;
  phoneNumber: string;
  roles: string[];
  schoolName: string;
  fullName: string
};

export type StudentInfo = {
  id: number
  email: string
  fullName: string
  grade?: number
  gradeYear?: number
  phoneNumber?: string
  parentPhoneNumber?: string
  schoolName?: string
}