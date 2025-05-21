
export type UserResponse = {
  id: number
  phoneNumber: string
  email: string
  avatar: string
  fullName: string
  className: string
  parentPhoneNumber: string
  parentName: string
  major: string
  schoolName: string
  academyDomain: string
  isLearningSpace: boolean
  isNotEnoughStatements?: boolean
  roles: string[]
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