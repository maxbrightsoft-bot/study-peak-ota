export const Routes = {
    Auth: {
        Home: "HOME",
        Textbook: "TEXTBOOK",
        Onboarding: "ONBOARDING",
        SelectAcademy: "SELECT_ACADEMY",
        DoExam: "DO_EXAM",
        DoTextbook: "DO_TEXTBOOK",
        ExamList: "EXAM_LIST",
        ExamResult: "EXAM_RESULT",
        ExamResultList: "EXAM_RESULT_LIST",
        StudyTrend: "STUDY_TREND",
        Profile: "PROFILE"
    },
    UnAuth: {
        Splash: 'SPLASH',
        Login: 'LOGIN',
        LoginParentPhone: 'LOGIN_PARENT_PHONE',
        LoginQRCode: 'LOGIN_QR',
    },

}

export const MainRoutes = {
    UnAuthStack: "UN_AUTH_STACK",
    AuthStack: "AUTH_STACK",
}

export const hiddenTabBar = [
    Routes.Auth.Onboarding,
    Routes.Auth.SelectAcademy,
]
