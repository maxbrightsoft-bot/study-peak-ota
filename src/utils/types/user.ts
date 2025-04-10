
export type UserResponse = {
  id: number
  phoneNumber?: string
  email: string
  avatar: string
  fulName: string
  className: string
  parentPhoneNumber: string
  parentName: string
  major: string
  schoolName: string
  academyDomain?: string
  isLearningSpace?: boolean
  isFirstLogin?: boolean
  roles: string[]
}