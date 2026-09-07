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
        Tutorial: "TUTORIAL",
        ParentAccountLinking: "PARENT_ACCOUNT_LINKING",
        StudentAccountLinking: "STUDENT_ACCOUNT_LINKING",
        ParentLinkRequest: "PARENT_LINK_REQUEST",
        StudentLinkShare: "STUDENT_LINK_SHARE",
        ParentQrScan: "PARENT_QR_SCAN",
        ParentWaitingApproval: "PARENT_WAITING_APPROVAL",
        StudentLinkApproval: "STUDENT_LINK_APPROVAL",
        AccountLinkRoleSelection: "ACCOUNT_LINK_ROLE_SELECTION",
        AccountLinkingGroup: "ACCOUNT_LINKING_GROUP",
    },
    UnAuth: {
        Splash: 'SPLASH',
        Tutorial: 'TUTORIAL',
        Login: 'LOGIN',
        LoginParentPhone: 'LOGIN_PARENT_PHONE',
        LoginQRCode: 'LOGIN_QR',
    },
    AcademyRequest: "ACADEMY_REQUEST",
    AcademyInvitation: "ACADEMY_INVITATION",
    AcademyLogin: "ACADEMY_LOGIN",
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
    Routes.Auth.ExamResult,
    Routes.AcademyInvitation,
    Routes.AcademyRequest,
]

export const noLayoutScreens = [
    Routes.Auth.DoExam,
    Routes.Auth.DoTextbook,
    Routes.Auth.Textbook,
    Routes.Auth.ExamResult,
    Routes.Auth.ExamResultList,
    Routes.Auth.Question,
    Routes.Auth.StudyPerformance,
    Routes.Auth.StudentExamHistory,
    Routes.AcademyInvitation,
    Routes.AcademyRequest,
];