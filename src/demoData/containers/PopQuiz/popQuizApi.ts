import { getDb } from '../../database';
import { getLocale } from '../../seedData/demoLocales';
import i18n from '@/languages/i18n';

// Helper to get locale
const getDemoLocale = () => {
    const lang = i18n.language || 'ko';
    return getLocale(lang);
};

export const getCategoryListMock = async (query?: any) => {
    const subjectId = Number(query?.subjectId || 1);
    const isRootCategory = query?.isRootCategory === true || query?.isRootCategory === 'true';
    const parentCategoryId = query?.parentCategoryId ? Number(query.parentCategoryId) : null;
    
    const LOCALE = getDemoLocale();
    const subjects = LOCALE.subjects;
    
    if (isRootCategory) {
        const subject = subjects.find(s => s.id === subjectId) || subjects[0];
        const categories = subject.categories || [];
        const items = categories.map((cat, idx) => ({
            id: subjectId * 100 + idx + 1,
            name: cat,
            title: cat,
            subjectId: subjectId
        }));
        return { items, totalCount: items.length };
    } else {
        const subject = subjects.find(s => s.id === subjectId) || subjects[0];
        const categories = subject.categories || [];
        const parentCat = categories.find((cat, idx) => (subjectId * 100 + idx + 1) === parentCategoryId) || categories[0] || 'General';
        
        const items = [1, 2, 3].map(i => ({
            id: parentCategoryId * 10 + i,
            name: `${parentCat} Sub-${i}`,
            title: `${parentCat} Sub-${i}`,
            parentCategoryId: parentCategoryId,
            subjectId: subjectId
        }));
        return { items, totalCount: items.length };
    }
};

export const getQuestionTypeListMock = async (query?: any) => {
    const parentCategoryId = query?.parentCategoryId ? Number(query.parentCategoryId) : 1;
    const categoryId = query?.categoryId ? Number(query.categoryId) : 1;
    
    const LOCALE = getDemoLocale();
    const mockQuestionTypes = LOCALE.mockQuestionTypes || ['Concept Understanding', 'Formula Application', 'Applied Problem'];
    
    const items = mockQuestionTypes.map((type, idx) => ({
        id: idx + 1,
        name: type,
        title: type,
        categoryPairs: [
            {
                parentCategory: { id: parentCategoryId, name: 'Parent' },
                category: { id: categoryId, name: 'Category' }
            }
        ]
    }));
    
    return {
        items,
        totalItems: items.length,
        totalPages: 1
    };
};

export const getRecentPopQuizzesMock = async (lang: string, pageSize?: number) => {
    const database = await getDb(lang);
    const limit = pageSize ? ` LIMIT ${pageSize}` : '';
    const rows = await database.getAllAsync(`SELECT * FROM ExamSessions WHERE isPopQuiz = 1 ORDER BY startTime DESC${limit}`) as any[];
    const items = rows.map(r => ({
        ...r,
        id: r.id,
        title: r.title,
        name: r.title,
        questionCount: r.questionCount,
        totalQuestions: r.questionCount,
        authorName: r.authorName,
        popQuizStatus: r.popQuizStatus,
        code: r.code,
        createdBy: { fullName: r.authorName || 'Teacher' }
    }));
    return { items, totalCount: items.length };
};

export const getReceivedPopQuizzesMock = async (lang: string) => {
    const database = await getDb(lang);
    const rows = await database.getAllAsync('SELECT * FROM ExamSessions WHERE isPopQuiz = 1 AND popQuizStatus = 2 ORDER BY startTime DESC') as any[];
    const items = rows.map(r => ({
        ...r,
        id: r.id,
        title: r.title,
        name: r.title,
        questionCount: r.questionCount,
        totalQuestions: r.questionCount,
        authorName: r.authorName,
        popQuizStatus: r.popQuizStatus,
        code: r.code,
        createdBy: { fullName: r.authorName || 'Teacher' }
    }));
    return { items, totalCount: items.length };
};

export const getPopQuizLiveStatusMock = async (_lang: string) => {
    return null;
};

export const getMyPopQuizzesMock = async (lang: string) => {
    return await getRecentPopQuizzesMock(lang);
};

export const getExamByIdMock = async (id: number) => {
    const database = await getDb();
    const exam = await database.getFirstAsync('SELECT * FROM ExamSessions WHERE id = ?', [id]) as any;
    if (!exam) return null;
    return {
        ...exam,
        courses: exam.coursesJson ? JSON.parse(exam.coursesJson) : [],
        isPopQuiz: exam.isPopQuiz === 1,
    };
};

export const updatePopQuizStatusMock = async (id: number, body: any) => {
    const database = await getDb();
    const exam = await database.getFirstAsync('SELECT code FROM ExamSessions WHERE id = ?', [id]) as any;
    const code = exam?.code || 'LV101';
    
    await database.runAsync(
        'UPDATE ExamSessions SET popQuizStatus = ? WHERE id = ?',
        [body.status, id]
    );

    return {
        data: code
    };
};

export const createPopQuizMock = async (body: any) => {
    const database = await getDb();
    const newId = Math.floor(10000 + Math.random() * 90000);
    const newCode = Math.random().toString(36).substring(2, 7).toUpperCase();

    // Insert into ExamSessions
    await database.runAsync(
        `INSERT OR IGNORE INTO ExamSessions (id, code, title, subjectName, status, score, totalScore,
         startTime, finishTime, duration, questionCount, type, attemptNumber,
         studentExamSessionId, totalStudentsJoined, teacherName, coursesJson, rowVersion,
         numberOfQuestion, startTimeSession, studentStartTime, isPopQuiz, popQuizStatus, authorName)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            newId, newCode, body.title || 'Pop Quiz', 'Toán', 1, 0, 100,
            new Date().toISOString(), new Date().toISOString(), '1800', body.questionGroups?.[0]?.questions?.length || 5, 0, 1,
            9000 + newId, 1, 'Me', '[]', `rv-${newCode}`,
            body.questionGroups?.[0]?.questions?.length || 5, new Date().toISOString(), new Date().toISOString(), 1, 1, 'Me'
        ]
    );

    // Insert questions
    const questions = body.questionGroups?.[0]?.questions || [];
    const ANSWER_LABELS = ['A', 'B', 'C', 'D', 'E'];
    for (let idx = 0; idx < questions.length; idx++) {
        const q = questions[idx];
        const correctAnswers = q.correctAnswers || [1];
        const correctAnswersJson = JSON.stringify(correctAnswers.map((ans: number) => ({ id: ans, content: ANSWER_LABELS[ans-1] || 'A', order: ans-1, isCorrect: true })));
        const correctTextualAnswersJson = JSON.stringify(q.correctTextualAnswers || []);

        await database.runAsync(
            `INSERT OR IGNORE INTO ExamQuestions (id, examSessionCode, questionGroupId, questionOrder,
             isCorrect, score, categoryName, questionGroupIndex,
             selectedAnswersJson, correctAnswersJson, correctTextualAnswersJson,
             textualAnswersJson, duration, topDuration, overallCorrectRate, skipRate,
             questionAnswerType, questionTypeCategoriesJson, answerResponseSignal, answerTime,
             classAverageTime, parentQuestionId, parentQuestionOrder)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                70000 + newId * 10 + idx,
                newCode, 0, idx,
                0, q.score || 1, 'General', 0,
                '[]',
                correctAnswersJson,
                correctTextualAnswersJson,
                '[]',
                0, 0, 70, 5,
                q.questionAnswerType || 0, '[]',
                0, '00:00:00', 30, 0, 0
            ]
        );
    }

    // Insert ExamQuestionGroups
    await database.runAsync(
        `INSERT OR IGNORE INTO ExamQuestionGroups (id, examSessionCode, articlesJson) VALUES (?, ?, ?)`,
        [
            newId,
            newCode,
            JSON.stringify([{
                title: "",
                author: "",
                tag: "",
                categoryId: 1,
                subcategoryId: 1,
                questionTypeId: 1,
                categoryOptions: [],
                questionGroupId: 0
            }])
        ]
    );

    return {
        data: {
            id: newId,
            code: newCode,
            examCode: newCode,
            title: body.title,
            isPopQuiz: true,
        }
    };
};
