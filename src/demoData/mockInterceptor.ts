import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { initDemoDatabase, getDb } from './database';

// --- Import tất cả Mock API từ các Container ---
import { getDemoNotes, getDemoGroupedNotes, getDemoNoteFilterOptions, createDemoNote, updateDemoNote, deleteDemoNote } from './containers/Notes/noteApi';
import { loginDemoMock, getInfoMock, getConsentStatusMock, agreeConsentMock, removeAccountMock, getAcademiesMock, getCoursesMock, getTimeMock } from './containers/Login/authApi';
import { getListExamMock, getExamInfoMock, joinExamMock, getLessonsMock, getListNotificationMock, getNotificationByIdMock, getInfoAcademyMock, getSchedulesMock, createScheduleMock, updateScheduleMock, deleteScheduleMock, updateScheduleStatusMock, getScheduleCountMock, getTextbookListMock, getTextbookByIdMock, getListSocialLinkMock } from './containers/Home/homeApi';
import { getQuestionExamMock, answerQuestionExamMock, finishExamMock, pauseAndResumeExamMock, restartExamMock, createConversationMock, getConversationMessagesMock } from './containers/DoExam/examApi';
import { getExamResultMock, getExamResultPercentagesMock, getResultsLongTimeSpendMock, getResultsEffectSizeMock, getResultsTimeOrderQuestionMock, getResultsCategoriesMock, getOverallResultsMock, getOverallQuestionTypesResultsMock, getOverallCategoriesResultsMock, getQuestionTimeCategoriesResultsMock, getChapterResultsMock } from './containers/ExamResult/examResultApi';
import { getListExamMock as getExamResultListMock, uploadImageFileMock } from './containers/ExamResultList/examResultListApi';
import { getStudyPerformanceDataMock, getSubjectDataMock, getRankingDataMock, getSubjectListMock as getStudySubjectListMock, getQuestionDataMock, getQuestionSubjectDataMock, getQuestionRankingDataMock, getQuestionOverallDataMock } from './containers/StudyPerformance/studyPerformanceApi';
import { studyTextbookMock, answerQuestionTextbookMock, getQuestionsTextbookMock, getPreparedTextbookMock, pauseOrFinishedTextbookMock, pauseAndResumeTextbookMock, restartTextbookMock } from './containers/Textbooks/textbookApi';
import { getStudentHistoryMock, deleteStudentExamSessionMock, hideStudentExamSessionMock, selectStudentExamSessionMock } from './containers/StudentExamHistory/studentHistoryApi';
import { getSubjectListMock as getSubjectTimerListMock, startSubjectTimerMock, pauseSubjectTimerMock, stopSubjectTimerMock, getTimersMock } from './containers/SubjectTimers/subjectTimerApi';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from '@/utils/helpers';
import { ACADEMY_DOMAIN, AcademyHeaders } from '@/utils/constants';
import i18n from '@/languages/i18n';

let _dbInitPromise: Promise<void> | null = null;
let _dbInitLanguage: string | null = null;
let _isDemoMode: boolean | null = null;
const DEMO_MODE_STORAGE_KEY = 'DEMO_MODE';

const checkDemoMode = async (): Promise<boolean> => {
    if (_isDemoMode !== null) return _isDemoMode;
    const val = await AsyncStorage.getItem(DEMO_MODE_STORAGE_KEY);
    _isDemoMode = val === 'true';
    return _isDemoMode;
};

// Export để useLanguage có thể check trước khi switch demo DB
export const isDemoMode = async (): Promise<boolean> => checkDemoMode();

// Cho phép bật/tắt demo mode từ bên ngoài
export const setDemoMode = (value: boolean) => {
    _isDemoMode = value;
    AsyncStorage.setItem(DEMO_MODE_STORAGE_KEY, value ? 'true' : 'false');
};

// Reset promise để force re-init (dùng khi đổi ngôn ngữ / switch DB)
export const resetDbInitPromise = () => {
    _dbInitPromise = null;
    _dbInitLanguage = null;
};

const runDemoDatabaseTask = (lang: string, task: () => Promise<void>): Promise<void> => {
    _dbInitLanguage = lang;
    _dbInitPromise = (_dbInitPromise || Promise.resolve())
        .catch(() => { })
        .then(task)
        .catch((error) => {
            _dbInitPromise = null;
            _dbInitLanguage = null;
            throw error;
        });
    return _dbInitPromise;
};

export const switchDemoDatabase = (lang: string): Promise<void> =>
    runDemoDatabaseTask(lang, () => initDemoDatabase(lang));

export const reinitDemoDatabase = switchDemoDatabase;

export const ensureDemoDatabase = async (lang: string = 'ko'): Promise<void> => {
    if (_dbInitPromise && _dbInitLanguage === lang) return _dbInitPromise;

    return runDemoDatabaseTask(lang, () => initDemoDatabase(lang));
};

/**
 * Hàm Interceptor chính: Kiểm tra Demo Mode và định tuyến API sang SQLite.
 * Được gọi từ apiClient.ts trước khi mỗi request gửi đi.
 */
export const applyMockAdapter = async (config: InternalAxiosRequestConfig) => {
    const isDemoMode = await checkDemoMode();

    if (isDemoMode) {
        const lang = await AsyncStorage.getItem('LANGUAGE') ?? 'ko';
        // Promise singleton theo ngôn ngữ: mọi request đều chờ seed/switch DB xong
        await ensureDemoDatabase(lang);

        const method = config.method?.toUpperCase() || 'GET';
        const url = config.url || '';
        const params = config.params;
        const body = config.data;

        console.log(`\n🔵 [DEMO] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`🔵 [DEMO] ${method} ${url}`);
        if (params) {
            console.log(`🔵 [DEMO] Params:`, JSON.stringify(params, null, 2));
        }
        if (body) {
            const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
            console.log(`🔵 [DEMO] Body:`, bodyStr.length > 200 ? bodyStr.substring(0, 200) + '...' : bodyStr);
        }

        const startTime = Date.now();

        config.adapter = async (adapterConfig) => {
            try {
                const data = await routeToMock(adapterConfig, lang);
                const elapsed = Date.now() - startTime;

                // Log response summary
                const dataStr = JSON.stringify(data);
                const preview = dataStr.length > 300 ? dataStr.substring(0, 300) + '...' : dataStr;
                console.log(`🟢 [DEMO] ✅ ${method} ${url} (${elapsed}ms)`);
                console.log(`🟢 [DEMO] Response:`, preview);
                console.log(`🔵 [DEMO] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

                const response: AxiosResponse = {
                    data: data,
                    status: 200,
                    statusText: 'OK',
                    headers: adapterConfig.headers as any,
                    config: adapterConfig,
                    request: {},
                };
                return response;
            } catch (error) {
                const elapsed = Date.now() - startTime;
                console.error(`🔴 [DEMO] ❌ ${method} ${url} (${elapsed}ms)`);
                console.error(`🔴 [DEMO] Error:`, error);
                console.log(`🔵 [DEMO] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
                throw error;
            }
        };
    }

    return config;
};

const getCourseExamSessionsMock = async (lang: string): Promise<any[]> => {
    const database = await getDb(lang);
    
    // 1. Lấy tất cả các bài thi
    const exams = await database.getAllAsync('SELECT * FROM ExamSessions ORDER BY startTime DESC') as any[];
    
    // 2. Lấy tất cả các khóa học
    const courses = await database.getAllAsync('SELECT * FROM Courses') as any[];
    
    // Tạo Map để nhóm bài thi theo courseId
    const courseMap = new Map<number, any>();
    
    for (const course of courses) {
        courseMap.set(course.id, {
            id: course.id,
            name: course.name,
            examSessions: []
        });
    }
    
    // Nhóm các bài thi vào các khóa học tương ứng
    for (const exam of exams) {
        const examCourses = exam.coursesJson ? JSON.parse(exam.coursesJson) : [];
        const formattedExam = {
            ...exam,
            courses: examCourses,
            isLate: exam.isLate === 1,
            examCode: exam.code, // UI yêu cầu item.examCode
        };
        
        if (examCourses && examCourses.length > 0) {
            for (const c of examCourses) {
                const cId = c.id;
                if (courseMap.has(cId)) {
                    courseMap.get(cId).examSessions.push(formattedExam);
                } else {
                    courseMap.set(cId, {
                        id: cId,
                        name: c.name || `Khóa học ${cId}`,
                        examSessions: [formattedExam]
                    });
                }
            }
        } else {
            // Nếu bài thi không có khóa học nào chỉ định, ta gán tạm vào khóa học đầu tiên (nếu có)
            if (courses.length > 0) {
                const firstCourseId = courses[0].id;
                courseMap.get(firstCourseId).examSessions.push(formattedExam);
            }
        }
    }
    
    return Array.from(courseMap.values());
};

/**
 * Bộ định tuyến URL -> Mock Function.
 * Mỗi khi thêm API mới, chỉ cần thêm một dòng vào đây.
 */
const routeToMock = async (config: any, lang: string = 'ko'): Promise<any> => {
    const url: string = config.url || '';
    const method: string = (config.method || 'get').toLowerCase();
    const params = config.params || {};
    const body = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};

    // ===== Trích xuất code/id từ URL =====
    const extractCode = (pattern: RegExp): string => {
        const match = url.match(pattern);
        return match ? match[1] : '';
    };
    const extractId = (pattern: RegExp): number => {
        const match = url.match(pattern);
        return match ? parseInt(match[1]) : 0;
    };

    // ===================================================================
    // DEMO MODE: Chặn POST/PUT/DELETE/PATCH (trừ auth whitelist)
    // ===================================================================
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
        const MUTATION_WHITELIST = [
            '/api/auth/login',
            '/api/Auth/login',
            '/api/auth/login/access-token',
            '/api/consent',
            '/api/auth/pusher',
            '/switch-academy/',
            '/api/auth',          // delete account — mock trả success
            '/api/notes',         // CRUD notes được hỗ trợ
            '/api/schedules',     // CRUD schedules được hỗ trợ
            '/api/file/images',   // upload ảnh được hỗ trợ
            '/api/conversation',  // Chat conversation
        ];
        const isWhitelisted = MUTATION_WHITELIST.some(pattern => url.includes(pattern));
        if (!isWhitelisted) {
            console.warn(`🚫 [DEMO] Blocked: ${method.toUpperCase()} ${url}`);
            toast.demoBlocked();
            const error: any = new Error('DEMO_BLOCKED');
            error.isDemoBlocked = true;
            throw error;
        }
    }

    // ===================================================================
    // AUTH / LOGIN
    // ===================================================================
    if (url.includes('/api/Auth/login') || url.includes('/api/auth/login')) {
        return await loginDemoMock();
    }
    if (url.includes('/api/auth/info') || url.includes('/api/Auth/info')) {
        return await getInfoMock();
    }
    if (url.includes('/api/consent/status')) {
        return await getConsentStatusMock();
    }
    if (url.includes('/api/consent') && method === 'post') {
        return await agreeConsentMock(body.version);
    }
    if (url.includes('/api/auth') && method === 'delete') {
        return await removeAccountMock();
    }
    if (url.includes('/api/auth/pusher') && method === 'post') {
        return { auth: 'demo-auth', channel_data: '' };
    }
    if (url.includes('/api/auth/time')) {
        return await getTimeMock();
    }

    // ===================================================================
    // ACADEMY / COURSE
    // ===================================================================
    // getUserAcademies
    if (url.match(/\/api\/academy\/?$/) && method === 'GET') {
        const list = await getAcademiesMock();
        return { items: list, totalCount: list.length };
    }
    // getAcademyDetail
    if (url.includes('/api/academy/detail')) {
        const academyDomain = config.headers?.[AcademyHeaders] ?? await AsyncStorage.getItem(ACADEMY_DOMAIN);
        if (!academyDomain) return null;
        const { getLocale } = require('./seedData/demoLocales');
        const locale = getLocale(i18n.language);
        return { id: 1, domain: 'demo-academy', name: locale.academyName, image: '' };
    }
    // switchAcademy
    if (url.includes('/switch-academy/') && method === 'POST') {
        return { accessToken: 'demo-token-123' };
    }
    // login with access token (dùng khi switch academy)
    if (url.includes('/api/auth/login/access-token') && method === 'POST') {
        return await loginDemoMock();
    }
    if (url.includes('/api/academy/list') || url.includes('/api/auth/academies')) {
        return await getAcademiesMock();
    }
    if (url.includes('/api/course/by-student') || url.includes('/api/course/list-course-by-student')) {
        return await getCoursesMock();
    }
    if (url.includes('/api/course/exam-sessions-by-student') || url.includes('/api/course/exam-sessions')) {
        const courseExams = await getCourseExamSessionsMock(lang);
        return { items: courseExams, totalCount: courseExams.length };
    }
    if (url.includes('/api/conversation/questions')) {
        return { items: [], totalCount: 0 };
    }
    if (url.match(/\/api\/conversation\/(\d+)\/messages/) && method === 'get') {
        const id = extractId(/\/api\/conversation\/(\d+)\/messages/);
        return await getConversationMessagesMock(id);
    }
    // GET /api/conversation/users/{id}
    if (url.match(/\/api\/conversation\/users\/(\d+)/) && method === 'get') {
        return null;
    }
    // GET /api/conversation (danh sách hội thoại)
    if (url.includes('/api/conversation') && method === 'get') {
        const db = await getDb(lang);
        let query = 'SELECT * FROM Conversations WHERE 1=1';
        const queryParams: any[] = [];

        if (params?.textSearch) {
            query += ' AND (examTitle LIKE ? OR questionTitle LIKE ?)';
            queryParams.push(`%${params.textSearch}%`, `%${params.textSearch}%`);
        }
        if (params?.hasConversation === true || params?.hasConversation === 'true') {
            query += ' AND totalUnReadMessage > 0';
        }
        query += ' ORDER BY createdAt DESC';

        const rows = await db.getAllAsync(query, queryParams) as any[];
        const conversations = rows.map((row: any) => ({
            id: row.id,
            studentExamSessionId: row.examSessionId,
            courseId: row.courseId,
            courseName: row.courseName,
            score: row.score,
            totalScore: row.totalScore,
            studentId: row.studentId,
            category: row.subjectName,
            question: {
                id: row.questionId,
                superId: row.questionId,
                title: row.questionTitle,
                questionOrder: row.questionOrder,
            },
            isCompleted: row.isCompleted === 1,
            completedAt: row.completedAt || '',
            totalUnReadMessage: row.totalUnReadMessage,
            lastMessage: row.lastMessage,
            examTitle: row.examTitle,
            examId: row.examId,
            examSessionId: row.examSessionId,
            duration: row.duration,
            startTime: row.startTime,
            examCreatedAt: row.examCreatedAt,
            createdAt: row.createdAt,
            teacherId: row.teacherId,
            teacherName: row.teacherName,
            teacherAvatar: row.teacherAvatar || '',
            textbookId: 0,
            textbookName: '',
            isSelected: false,
            attemptNumber: row.attemptNumber,
            studentAttemptNumber: row.attemptNumber,
            studentTotalAttemptTime: 1,
            totalAttemptTime: 1,
        }));
        return { items: conversations, totalCount: conversations.length, totalPages: 1 };
    }

    // ===================================================================
    // NOTES
    // ===================================================================
    if (url.includes('/api/notes/filter-options')) {
        return await getDemoNoteFilterOptions();
    }
    if (url.includes('/api/notes/grouped')) {
        const groups = await getDemoGroupedNotes(params);
        return { items: groups, totalPages: 1, totalCount: groups.length };
    }
    if (url.includes('/api/notes/group-notes')) {
        return { data: await getDemoNotes(params) };
    }
    if (url.includes('/api/notes') && method === 'get') {
        const notes = await getDemoNotes(params);
        return { items: notes, totalCount: notes.length, totalPages: 1, pageIndex: 1, pageCount: 1 };
    }
    if (url.includes('/api/notes') && method === 'post') {
        return await createDemoNote(body);
    }
    if (url.match(/\/api\/notes\/\d+/) && method === 'put') {
        const id = extractId(/\/api\/notes\/(\d+)/);
        return await updateDemoNote(id, body);
    }
    if (url.match(/\/api\/notes\/\d+/) && method === 'delete') {
        const id = extractId(/\/api\/notes\/(\d+)/);
        return await deleteDemoNote(id);
    }

    // ===================================================================
    // EXAM SESSION
    // ===================================================================
    // Join exam
    if (url.match(/\/api\/exam[Ss]ession\/(.+)\/join/) && method === 'post') {
        const code = extractCode(/\/api\/exam[Ss]ession\/(.+)\/join/);
        return await joinExamMock(code);
    }
    // Finish exam
    if (url.match(/\/api\/examSession\/(.+)\/finish/) && method === 'post') {
        const code = extractCode(/\/api\/examSession\/(.+)\/finish/);
        return await finishExamMock(code);
    }
    // Answer question
    if (url.match(/\/api\/examSession\/(.+)\/answer/) && method === 'post') {
        const code = extractCode(/\/api\/examSession\/(.+)\/answer/);
        return await answerQuestionExamMock(code, body);
    }
    // Pause/Resume
    if (url.includes('/student-pause-resume') && method === 'post') {
        const code = extractCode(/\/api\/examSession\/(.+)\/student-pause-resume/);
        return await pauseAndResumeExamMock(code, body);
    }
    // Restart exam
    if (url.includes('/student-restart') && method === 'post') {
        const code = extractCode(/\/api\/examSession\/(.+)\/student-restart/);
        return await restartExamMock(code);
    }
    // Exam info
    if (url.match(/\/api\/examsession\/(.+)\/info/)) {
        const code = extractCode(/\/api\/examsession\/(.+)\/info/);
        return await getExamInfoMock(code);
    }

    // --- Exam Results (Charts) - Match cả examSession và textbooksession ---
    if (url.includes('/results/percentages')) {
        const code = extractCode(/\/api\/(?:exam[Ss]ession|textbook[Ss]ession)\/(.+)\/results\/percentages/);
        return await getExamResultPercentagesMock(code);
    }
    if (url.includes('/results/longTimeSpend')) {
        const code = extractCode(/\/api\/(?:exam[Ss]ession|textbook[Ss]ession)\/(.+)\/results\/longTimeSpend/);
        return await getResultsLongTimeSpendMock(code);
    }
    if (url.includes('/results/effectSize')) {
        const code = extractCode(/\/api\/(?:exam[Ss]ession|textbook[Ss]ession)\/(.+)\/results\/effectSize/);
        return await getResultsEffectSizeMock(code);
    }
    if (url.includes('/results/timelyOrderQuestion')) {
        const code = extractCode(/\/api\/(?:exam[Ss]ession|textbook[Ss]ession)\/(.+)\/results\/timelyOrderQuestion/);
        return await getResultsTimeOrderQuestionMock(code);
    }
    if (url.includes('/results/overall-questionTypes')) {
        const code = extractCode(/\/api\/(?:exam[Ss]ession|textbook[Ss]ession)\/(.+)\/results\/overall-questionTypes/);
        return await getOverallQuestionTypesResultsMock(code);
    }
    if (url.includes('/results/overall-categories')) {
        const code = extractCode(/\/api\/(?:exam[Ss]ession|textbook[Ss]ession)\/(.+)\/results\/overall-categories/);
        return await getOverallCategoriesResultsMock(code);
    }
    if (url.includes('/results/overall')) {
        const code = extractCode(/\/api\/(?:exam[Ss]ession|textbook[Ss]ession)\/(.+)\/results\/overall/);
        return await getOverallResultsMock(code);
    }
    if (url.includes('/results/question-times')) {
        const code = extractCode(/\/api\/(?:exam[Ss]ession|textbook[Ss]ession)\/(.+)\/results\/question-times/);
        return await getQuestionTimeCategoriesResultsMock(code);
    }
    if (url.includes('/results/categories')) {
        const code = extractCode(/\/api\/(?:exam[Ss]ession|textbook[Ss]ession)\/(.+)\/results\/categories/);
        return await getResultsCategoriesMock(code);
    }
    // Get exam questions
    if (url.match(/\/api\/examSession\/(.+)\/questions/)) {
        const code = extractCode(/\/api\/examSession\/(.+)\/questions/);
        return await getQuestionExamMock(code);
    }
    // Get textbook chapter results
    if (url.match(/\/api\/textbook[Ss]ession\/(\d+)\/results\/?$/) && method === 'get') {
        const id = extractId(/\/api\/textbook[Ss]ession\/(\d+)\/results/);
        return await getChapterResultsMock(id);
    }
    // Get exam results (catch-all for /results without specific suffix)
    if (url.match(/\/api\/(?:exam[Ss]ession|textbook[Ss]ession)\/(.+)\/results/) && method === 'get') {
        const code = extractCode(/\/api\/(?:exam[Ss]ession|textbook[Ss]ession)\/(.+)\/results/);
        return await getExamResultMock(code);
    }
    // Student sessions (history)
    if (url.match(/\/api\/examSession\/(.+)\/student-sessions\/(\d+)\/select/) && method === 'post') {
        const code = extractCode(/\/api\/examSession\/(.+)\/student-sessions/);
        const sesId = extractId(/\/student-sessions\/(\d+)\/select/);
        return await selectStudentExamSessionMock(code, sesId);
    }
    if (url.match(/\/api\/examSession\/(.+)\/student-sessions/) && method === 'get') {
        const idOrCode = extractCode(/\/api\/examSession\/(.+)\/student-sessions/);
        return await getStudentHistoryMock(idOrCode, params);
    }
    if (url.includes('/hide') && method === 'post') {
        const code = extractCode(/\/api\/examSession\/(.+)\/hide/);
        return await hideStudentExamSessionMock(code, body);
    }
    // List exam sessions
    if (url.match(/\/api\/exam[Ss]ession\/?$/) && method === 'get') {
        const exams = await getExamResultListMock(params);
        return { items: exams, totalCount: exams.length };
    }
    // Course exam sessions
    if (url.includes('/api/course/exam-sessions') && method === 'get') {
        const courseExams = await getCourseExamSessionsMock(lang);
        return { items: courseExams, totalCount: courseExams.length };
    }

    // ===================================================================
    // TEXTBOOK
    // ===================================================================
    if (url.includes('/study-textbook') && method === 'post') {
        return await studyTextbookMock(body.textbookId);
    }
    if (url.match(/\/api\/textbookSession\/(\d+)\/answer/) && method === 'post') {
        const id = extractId(/\/api\/textbookSession\/(\d+)\/answer/);
        return await answerQuestionTextbookMock(id, body);
    }
    if (url.match(/\/api\/textbookSession\/(\d+)\/textbook-questions/)) {
        const id = extractId(/\/api\/textbookSession\/(\d+)\/textbook-questions/);
        return await getQuestionsTextbookMock(id);
    }
    if (url.match(/\/api\/textbookSession\/(\d+)\/pause-or-terminate/) && method === 'post') {
        const id = extractId(/\/api\/textbookSession\/(\d+)\/pause-or-terminate/);
        return await pauseOrFinishedTextbookMock(id, body);
    }
    if (url.match(/\/api\/textbookSession\/(\d+)\/pause-resume/) && method === 'post') {
        const id = extractId(/\/api\/textbookSession\/(\d+)\/pause-resume/);
        return await pauseAndResumeTextbookMock(id, body);
    }
    if (url.match(/\/api\/textbookSession\/(\d+)\/restart/) && method === 'post') {
        const id = extractId(/\/api\/textbookSession\/(\d+)\/restart/);
        return await restartTextbookMock(id, body);
    }
    if (url.match(/\/api\/textbookSession\/(\d+)\/start/) && method === 'post') {
        return { success: true };
    }

    if (url.match(/\/api\/textbooksession\/(\d+)\/results/)) {
        const id = extractId(/\/api\/textbooksession\/(\d+)\/results/);
        return await getChapterResultsMock(id);
    }
    if (url.match(/\/api\/textbookSession\/(\d+)\/student-textbook-detail/) || url.match(/\/api\/textbooksession\/(\d+)\/student-textbook-detail/)) {
        const id = extractId(/\/api\/textbook[Ss]ession\/(\d+)\/student-textbook-detail/);
        return await getTextbookByIdMock(id);
    }
    if (url.includes('/api/textbooks/prepared-textbooks') && method === 'get') {
        return await getTextbookListMock(params);
    }
    if (url.match(/\/api\/textbook\/(\d+)\//)) {
        const id = extractId(/\/api\/textbook\/(\d+)\//);
        return await getPreparedTextbookMock(id);
    }

    // ===================================================================
    // SUBJECT TIMERS
    // ===================================================================
    if (url.includes('/api/subject/timers/data')) {
        return await getStudyPerformanceDataMock(false, params);
    }
    if (url.includes('/api/subject/timers/subject-data')) {
        return await getSubjectDataMock(false, params);
    }
    if (url.includes('/api/subject/timers/ranking-data')) {
        return await getRankingDataMock(false, params);
    }
    if (url.includes('/api/subject/timers') && method === 'get' && !url.match(/\/api\/subject\/\d+\/timers/)) {
        return await getSubjectTimerListMock();
    }
    if (url.match(/\/api\/subject\/(\d+)\/timers/) && method === 'post' && !url.match(/\/timers\/\d+/)) {
        const id = extractId(/\/api\/subject\/(\d+)\/timers/);
        return await startSubjectTimerMock(id);
    }
    if (url.match(/\/api\/subject\/(\d+)\/timers/) && method === 'put' && !url.match(/\/timers\/\d+/)) {
        const id = extractId(/\/api\/subject\/(\d+)\/timers/);
        return await pauseSubjectTimerMock(id, body);
    }
    if (url.match(/\/api\/subject\/(\d+)\/timers\/(\d+)/) && method === 'post') {
        const subId = extractId(/\/api\/subject\/(\d+)\/timers/);
        const timerId = extractId(/\/timers\/(\d+)/);
        return await stopSubjectTimerMock(subId, timerId, body);
    }
    if (url.match(/\/api\/subject\/(\d+)\/timers/) && method === 'get') {
        const id = extractId(/\/api\/subject\/(\d+)\/timers/);
        return await getTimersMock(id, params);
    }
    // Subject questions data
    if (url.includes('/questions/overall')) {
        return await getQuestionOverallDataMock(params);
    }
    if (url.includes('/questions/ranking-data')) {
        return await getQuestionRankingDataMock(params);
    }
    if (url.includes('/questions/subject-data')) {
        const id = extractId(/\/api\/subject\/(\d+)\/questions\/subject-data/);
        return await getQuestionSubjectDataMock(id, params);
    }
    if (url.includes('/questions/data')) {
        const id = extractId(/\/api\/subject\/(\d+)\/questions\/data/);
        return await getQuestionDataMock(id, params);
    }
    // Subject list (for StudyPerformance dropdown)
    if (url.includes('/api/subject') && !url.includes('/questions') && !url.includes('/timers') && !url.match(/\/api\/subject\/\d+/) && method === 'get') {
        return await getStudySubjectListMock(false);
    }

    // ===================================================================
    // LESSONS / SCHEDULES / NOTIFICATIONS / SOCIAL LINKS
    // ===================================================================
    if (url.includes('/api/lesson/total-count')) {
        return await getInfoAcademyMock();
    }
    if (url.match(/\/api\/lesson\/(\d+)/) && method === 'post') {
        return { success: true };
    }
    if (url.includes('/api/lesson') && method === 'get') {
        return await getLessonsMock(params.startDate, params.endDate);
    }
    if (url.includes('/api/sociallink')) {
        return await getListSocialLinkMock();
    }
    if (url.match(/\/api\/notification\/(\d+)/)) {
        const id = extractId(/\/api\/notification\/(\d+)/);
        return await getNotificationByIdMock(id);
    }
    if (url.includes('/api/notification') && method === 'get') {
        const notifs = await getListNotificationMock(params);
        return { items: notifs, totalCount: notifs.length };
    }
    if (url.includes('/api/schedules/count')) {
        return await getScheduleCountMock(params);
    }
    if (url.match(/\/api\/schedules\/(\d+)\/status/) && method === 'put') {
        const id = extractId(/\/api\/schedules\/(\d+)\/status/);
        return await updateScheduleStatusMock(id, params.status);
    }
    if (url.match(/\/api\/schedules\/(\d+)/) && method === 'put') {
        const id = extractId(/\/api\/schedules\/(\d+)/);
        return await updateScheduleMock(id, body);
    }
    if (url.match(/\/api\/schedules\/(\d+)/) && method === 'delete') {
        const id = extractId(/\/api\/schedules\/(\d+)/);
        return await deleteScheduleMock(id);
    }
    if (url.includes('/api/schedules') && method === 'post') {
        return await createScheduleMock(body);
    }
    if (url.includes('/api/schedules') && method === 'get') {
        return await getSchedulesMock(params);
    }

    // ===================================================================
    // FILE UPLOAD
    // ===================================================================
    if (url.includes('/api/file/images') && method === 'post') {
        return await uploadImageFileMock(body);
    }

    // ===================================================================
    // CONVERSATION
    // ===================================================================
    if (url.includes('/api/conversation') && method === 'post') {
        return await createConversationMock(body);
    }

    // ===================================================================
    // FALLBACK - API chưa được mock
    // ===================================================================
    console.warn(`[DEMO MODE] ⚠️ Unmocked API: ${method.toUpperCase()} ${url}`);
    return { data: [], message: "This API is not yet mocked in demo mode" };
};
