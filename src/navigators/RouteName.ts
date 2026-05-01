export const Routes = {
    Auth: {
        MainTabs: 'MainTabs',
        Home: "HOME",
        Textbook: "TEXTBOOK",
        Onboarding: "ONBOARDING",
        SelectAcademy: "SELECT_ACADEMY",
        DoExam: "DO_EXAM",
        DoTextbook: "DO_TEXTBOOK",
        ExamList: "EXAM_LIST",
        ExamResult: "EXAM_RESULT",
        ExamResultList: "EXAM_RESULT_LIST",
        StudyPerformance: "STUDY_PERFORMANCE",
        Profile: "PROFILE",
        Question: "QUESTION",
        StudentExamHistory: "STUDENT_EXAM_HISTORY",
        AcademyInvitation: "AUTH_ACADEMY_INVITATION",
    },
    UnAuth: {
        Splash: 'SPLASH',
        Login: 'LOGIN',
        LoginParentPhone: 'LOGIN_PARENT_PHONE',
        LoginQRCode: 'LOGIN_QR',
        AcademyInvitation: 'ACADEMY_INVITATION',
    },

}

export const MainRoutes = {
    UnAuthStack: "UN_AUTH_STACK",
    AuthStack: "AUTH_STACK",
}

export const hiddenTabBar = [
    Routes.Auth.Onboarding,
    Routes.Auth.SelectAcademy,
    Routes.Auth.DoExam,
    Routes.Auth.DoTextbook,
    Routes.Auth.AcademyInvitation,
]

export const noLayoutScreens = [
    Routes.Auth.DoExam,
    Routes.Auth.DoTextbook,
    Routes.Auth.Textbook,
    Routes.Auth.ExamResultList,
    Routes.Auth.Question,
    Routes.Auth.StudyPerformance,
    Routes.Auth.StudentExamHistory,
    Routes.Auth.AcademyInvitation,
];