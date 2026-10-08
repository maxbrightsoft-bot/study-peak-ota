import { getDb } from '../../database';

// --- ExamResultList Mock APIs ---

export const getListExamMock = async (query?: any) => {
    const database = await getDb();
    const exams = await database.getAllAsync('SELECT * FROM ExamSessions ORDER BY startTime DESC');
    return (exams as any[]).map((e: any) => ({
        ...e,
        courses: e.coursesJson ? JSON.parse(e.coursesJson) : [],
        isLate: e.isLate === 1,
        isSelected: e.isSelected === 1 || false,
        isPopQuiz: e.isPopQuiz === 1,
    }));
};

export const getLiveHistoryGroupsMock = async (query?: any) => {
    const details = await getLiveHistoryDetailsMock(query);
    const groupsMap = new Map<string, any>();
    for (const item of details) {
        const d = new Date(item.studentStartTime || item.startTime || Date.now());
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const key = `${year}-${month}`;
        if (!groupsMap.has(key)) {
            groupsMap.set(key, { year, month, totalCount: 0, totalExamCount: 0, totalTextbookCount: 0 });
        }
        const g = groupsMap.get(key);
        g.totalCount++;
        if (item.historyType === 'Textbook') g.totalTextbookCount++;
        else g.totalExamCount++;
    }
    return Array.from(groupsMap.values());
};

export const getLiveHistoryDetailsMock = async (query?: any) => {
    const database = await getDb();
    const textSearch = (query?.textSearch || '').trim().toLowerCase();

    // 1. Exam sessions
    const examRows = await database.getAllAsync('SELECT * FROM ExamSessions ORDER BY startTime DESC') as any[];
    const exams = (examRows || []).map((e: any) => ({
        ...e,
        historyType: 'Exam',
        examCode: e.code,
        studentExamSessionId: e.studentExamSessionId || e.id,
        studentStartTime: e.startTime,
        courses: e.coursesJson ? JSON.parse(e.coursesJson) : [],
        isLate: e.isLate === 1,
        isSelected: e.isSelected === 1,
        isPopQuiz: e.isPopQuiz === 1,
    }));

    // 2. Textbooks
    const textbookRows = await database.getAllAsync('SELECT * FROM Textbooks') as any[];
    const textbookSessions = await database.getAllAsync('SELECT * FROM TextbookSessions') as any[];
    const textbookSessionMap = new Map<number, any>();
    for (const s of (textbookSessions || [])) {
        textbookSessionMap.set(s.textbookId, s);
    }

    const textbooks: any[] = [];
    for (const tb of (textbookRows || [])) {
        const s = textbookSessionMap.get(tb.id);
        const qStats = await database.getFirstAsync(
            'SELECT COUNT(*) as totalAttempted, SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) as totalCorrect, MAX(answerTime) as lastAnswerTime FROM TextbookQuestions WHERE textbookId = ?',
            [tb.id]
        ) as any;

        const totalAttempted = qStats?.totalAttempted || tb.completedQuestions || 0;
        const totalCorrect = qStats?.totalCorrect || Math.round(totalAttempted * 0.8);
        const startTime = qStats?.lastAnswerTime || new Date().toISOString();

        if (totalAttempted > 0 || tb.isStudying === 1) {
            textbooks.push({
                historyType: 'Textbook',
                id: tb.id,
                title: tb.name,
                code: '',
                examCode: '',
                studentTextbookSessionId: s?.id || tb.id,
                startTime: startTime,
                studentStartTime: startTime,
                score: 0,
                totalQuestionsAttempted: totalAttempted,
                totalCorrectAnswers: totalCorrect,
                isSelected: true,
                isLate: false,
            });
        }
    }

    let combined = [...exams, ...textbooks];

    if (textSearch) {
        combined = combined.filter((item: any) => (item.title || '').toLowerCase().includes(textSearch));
    }

    combined.sort((a: any, b: any) => {
        const timeA = new Date(a.studentStartTime || a.startTime || 0).getTime();
        const timeB = new Date(b.studentStartTime || b.startTime || 0).getTime();
        return timeB - timeA;
    });

    return combined;
};

export const uploadImageFileMock = async (_file: any) => {
    const demoUrl = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800";
    return { data: { url: demoUrl }, url: demoUrl };
};
