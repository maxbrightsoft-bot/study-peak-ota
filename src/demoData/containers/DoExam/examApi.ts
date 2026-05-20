import { getDb } from '../../database';

// --- DoExam Mock APIs ---
// getQuestionExam trả về ExamSessionResponse với questionGroups chứa questions

export const getQuestionExamMock = async (code: string) => {
    const database = await getDb();

    // Lấy exam session
    const exam = await database.getFirstAsync('SELECT * FROM ExamSessions WHERE code = ?', [code]) as any;
    if (!exam) return null;

    // Lấy question groups
    const groups = await database.getAllAsync(
        'SELECT * FROM ExamQuestionGroups WHERE examSessionCode = ?', [code]
    ) as any[];

    // Lấy questions theo group
    const questionGroups = [];
    for (const g of groups) {
        const questions = await database.getAllAsync(
            'SELECT * FROM ExamQuestions WHERE examSessionCode = ? AND questionGroupId = ? ORDER BY questionOrder ASC',
            [code, g.id]
        ) as any[];

        questionGroups.push({
            id: g.id,
            articles: g.articlesJson ? JSON.parse(g.articlesJson) : [],
            questions: questions.map((q: any) => ({
                id: q.id,
                answerCount: q.answerCount || 5,
                selectedAnswers: q.selectedAnswersJson ? JSON.parse(q.selectedAnswersJson).map(Number) : [],
                textualAnswers: q.textualAnswersJson ? JSON.parse(q.textualAnswersJson) : [],
                isStar: q.isStar === 1,
                duration: q.duration || 0,
                score: q.score,
                answerTime: q.answerTime || "",
                questionOrder: q.questionOrder,
                questionAnswerType: q.questionAnswerType || 0,
                questionGroupId: g.id,
            })),
        });
    }

    return {
        data: {
            ...exam,
            isLate: exam.isLate === 1,
            courses: exam.coursesJson ? JSON.parse(exam.coursesJson) : [],
            questionGroups,
        }
    };
};

export const answerQuestionExamMock = async (examCode: string, body: any) => {
    const database = await getDb();
    if (body?.questions?.length) {
        for (const q of body.questions) {
            if (q.selectedAnswers) {
                await database.runAsync(
                    `UPDATE ExamQuestions SET selectedAnswersJson = ?, duration = ?, isStar = ? WHERE id = ? AND examSessionCode = ?`,
                    [JSON.stringify(q.selectedAnswers), q.duration || 0, q.isStar ? 1 : 0, q.questionId, examCode]
                );
            }
            if (q.textualAnswers) {
                await database.runAsync(
                    `UPDATE ExamQuestions SET textualAnswersJson = ?, duration = ?, isStar = ? WHERE id = ? AND examSessionCode = ?`,
                    [JSON.stringify(q.textualAnswers), q.duration || 0, q.isStar ? 1 : 0, q.questionId, examCode]
                );
            }
        }
    }
    return { success: true };
};

export const finishExamMock = async (code: string) => {
    const database = await getDb();
    await database.runAsync(
        `UPDATE ExamSessions SET status = 2, finishTime = ? WHERE code = ?`,
        [new Date().toISOString(), code]
    );
    return { success: true };
};

export const joinExamMock = async (code: string) => {
    return { success: true, code };
};

export const pauseAndResumeExamMock = async (_examCode: string, body: any) => {
    return {
        status: body.status,
        totalPausedTime: 0,
        duration: "00:45:00",
        startTime: new Date().toISOString(),
        lastPausedAt: new Date().toISOString(),
        lastResumedAt: new Date().toISOString(),
        rowVersion: `rv-${Date.now()}`,
    };
};

export const restartExamMock = async (_examCode: string) => {
    return { success: true };
};

export const createConversationMock = async (_data: any) => {
    return { success: true, id: Date.now() };
};

export const getConversationMessagesMock = async (conversationId: number) => {
    const database = await getDb();
    const rows = await database.getAllAsync(
        'SELECT * FROM Messages WHERE conversationId = ? ORDER BY createdAt DESC',
        [conversationId]
    );
    const messages = rows.map((row: any) => ({
        ...row,
        sender: {
            id: row.senderId,
            fullName: row.senderName,
            email: row.senderEmail,
        },
        receiver: {
            id: row.receiverId,
            fullName: row.receiverName,
            email: row.receiverEmail,
        },
        isMe: row.isMe === 1, // Chuyển đổi integer 0/1 từ SQLite sang boolean cho UI
    }));
    return { items: messages, totalCount: messages.length, totalPages: 1 };
};
