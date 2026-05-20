import { getDb } from '../../database';

// --- DoTextbook Mock APIs ---

export const studyTextbookMock = async (_textbookId: number) => {
    return { success: true };
};

export const answerQuestionTextbookMock = async (_textbookId: number, _body: any) => {
    return { success: true };
};

export const getQuestionsTextbookMock = async (textbookId: number) => {
    const database = await getDb();

    // Lấy textbook info
    const textbook = await database.getFirstAsync(
        'SELECT * FROM Textbooks WHERE id = ?', [textbookId]
    ) as any;
    if (!textbook) return { data: null };

    const tbData = textbook.dataJson ? JSON.parse(textbook.dataJson) : {};

    // Lấy questions theo textbookId
    const rows = await database.getAllAsync(
        'SELECT * FROM TextbookQuestions WHERE textbookId = ? ORDER BY chapterId, questionOrder',
        [textbookId]
    ) as any[];

    // Group questions by chapterId để tạo questionGroups (chapters)
    const groupMap: Record<number, any[]> = {};
    for (const row of rows) {
        if (!groupMap[row.chapterId]) groupMap[row.chapterId] = [];
        groupMap[row.chapterId].push({
            id: row.id,
            superId: row.id,
            questionOrder: row.questionOrder,
            questionGroupIndex: row.questionGroupIndex ?? 0,
            isCorrect: row.isCorrect === 1,
            isStar: row.isStar === 1,
            score: row.score,
            duration: row.duration,
            questionAnswerType: row.questionAnswerType ?? 0,
            selectedAnswers: row.selectedAnswersJson ? JSON.parse(row.selectedAnswersJson) : [],
            correctAnswers: row.correctAnswersJson ? JSON.parse(row.correctAnswersJson) : [],
            textualAnswers: row.textualAnswersJson ? JSON.parse(row.textualAnswersJson) : [],
            correctTextualAnswers: row.correctTextualAnswersJson ? JSON.parse(row.correctTextualAnswersJson) : [],
            questionTypeCategories: row.questionTypeCategoriesJson ? JSON.parse(row.questionTypeCategoriesJson) : [],
            categories: row.categoriesJson ? JSON.parse(row.categoriesJson) : [],
            categoryName: row.categoryName,
            answerTime: row.answerTime,
            parentQuestionId: row.parentQuestionId ?? 0,
            parentQuestionOrder: row.parentQuestionOrder ?? 0,
        });
    }

    // Dùng chapters từ textbook dataJson để build questionGroups
    const chapters: any[] = tbData.chapters ?? [];
    const questionGroups = chapters.map((chapter: any, idx: number) => ({
        id: chapter.id,
        chapterId: chapter.id,
        name: chapter.name,
        pageFrom: chapter.pageFrom,
        pageTo: chapter.pageTo,
        chapterPageFrom: chapter.pageFrom,
        chapterPageTo: chapter.pageTo,
        parentChapterPageFrom: null,
        parentChapterPageTo: null,
        questions: groupMap[chapter.id] ?? [],
    }));

    const now = new Date().toISOString();
    return {
        data: {
            id: textbookId,
            studentTextbookId: textbookId,
            name: textbook.name,
            status: 2,  // ExamStatus.InProgress = 2
            rowVersion: tbData.rowVersion ?? `rv-tb${textbookId}`,
            subject: tbData.subject ?? null,
            duration: tbData.duration ?? 0,
            isMock: tbData.isMock ?? false,
            totalAnswerTime: textbook.totalAnswerTime ?? 0,
            startTime: now,
            lastAnswerTime: now,
            lastPausedAt: now,
            lastResumedAt: now,
            LastPausedTime: now,
            LastResumedTime: now,
            totalPausedTime: 0,
            stopTime: now,
            questionGroups,
        }
    };
};

export const getPreparedTextbookMock = async (textbookId: number) => {
    const database = await getDb();
    const textbook = await database.getFirstAsync('SELECT * FROM Textbooks WHERE id = ?', [textbookId]) as any;
    if (!textbook) return null;
    return {
        ...textbook,
        data: textbook.dataJson ? JSON.parse(textbook.dataJson) : null,
    };
};

export const pauseOrFinishedTextbookMock = async (_textbookId: number, _body: any) => {
    return { success: true };
};

export const pauseAndResumeTextbookMock = async (_textbookId: number, _body: any) => {
    return { success: true };
};

export const restartTextbookMock = async (_textbookId: number, _data: any) => {
    return { success: true };
};
