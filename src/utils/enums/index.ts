export enum Role {
  Student = "Student",
  Teacher = "Teacher",
  Admin = "Admin",
  AcademyAdmin = "AcademyAdmin",
  AcademyAdminTeacher = "AcademyAdmin/Teacher"
}

export enum PositionFlex {
  Left = 'flex-start',
  Center = 'center',
  Right = 'flex-end'
}

export enum Language {
    ko = "ko",
    en = "en",
    vi = "vi"
}

export enum OrderBy {
  ASC = "ASC",
  DESC = "DESC"
}

export * from './note'
export * from './exam'
export * from './textbook'
export * from './chat'
export * from './subject'
