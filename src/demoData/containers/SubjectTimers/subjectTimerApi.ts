import { getDb } from '../../database';

// --- Subject Timer Mock APIs (global service) ---

export const getSubjectListMock = async () => {
    const database = await getDb();
    const timers = await database.getAllAsync(`
        SELECT st.*, s.name as subjectName
        FROM SubjectTimers st
        LEFT JOIN Subjects s ON st.subjectId = s.id
        ORDER BY s.sortOrder ASC
    `);
    return {
        items: (timers as any[]).map((t: any) => ({
            id: t.subjectId,
            timerId: t.timerId,
            name: t.subjectName,
            startTime: t.startTime,
            lastResumeTime: t.lastResumeTime,
            lastPauseTime: t.lastPauseTime,
            duration: t.duration,
            status: t.status,
            rowVersion: t.rowVersion,
            limitedTime: t.limitedTime,
            limitedTimeReached: t.limitedTimeReached === 1,
            audioUrls: t.audioUrlsJson ? JSON.parse(t.audioUrlsJson) : [],
        })),
        totalCount: (timers as any[]).length,
    };
};

export const startSubjectTimerMock = async (subjectId: number) => {
    const database = await getDb();
    const now = new Date().toISOString();
    await database.runAsync(
        `UPDATE SubjectTimers SET status = 1, startTime = ?, lastResumeTime = ?, rowVersion = ? WHERE subjectId = ?`,
        [now, now, `row-${Date.now()}`, subjectId]
    );
    return { success: true };
};

export const pauseSubjectTimerMock = async (subjectId: number, _data: any) => {
    const database = await getDb();
    const now = new Date().toISOString();
    await database.runAsync(
        `UPDATE SubjectTimers SET status = 2, lastPauseTime = ?, rowVersion = ? WHERE subjectId = ?`,
        [now, `row-${Date.now()}`, subjectId]
    );
    return { success: true };
};

export const stopSubjectTimerMock = async (subjectId: number, _timerId: number, _data: any) => {
    const database = await getDb();
    await database.runAsync(
        `UPDATE SubjectTimers SET status = 0, rowVersion = ? WHERE subjectId = ?`,
        [`row-${Date.now()}`, subjectId]
    );
    return { success: true };
};

export const saveSubjectTimerMock = async (_subjectId: number, _timerId: number, _data: any) => {
    return { success: true };
};

export const getTimerByIdMock = async (subjectId: number, id: number) => {
    const database = await getDb();
    const timer = await database.getFirstAsync(
        'SELECT * FROM SubjectTimers WHERE subjectId = ? AND timerId = ?', [subjectId, id]
    ) as any;
    if (!timer) return null;
    return {
        ...timer,
        limitedTimeReached: timer.limitedTimeReached === 1,
        audioUrls: timer.audioUrlsJson ? JSON.parse(timer.audioUrlsJson) : [],
    };
};

export const updateTimerByIdMock = async (_subjectId: number, _id: number, _data: any) => {
    return { success: true };
};

export const getTimersMock = async (subjectId: number, _searchQuery: any) => {
    const database = await getDb();
    const timers = await database.getAllAsync(
        'SELECT * FROM SubjectTimers WHERE subjectId = ? ORDER BY startTime ASC', [subjectId]
    );
    return {
        items: (timers as any[]).map((t: any) => ({
            ...t,
            limitedTimeReached: t.limitedTimeReached === 1,
            audioUrls: t.audioUrlsJson ? JSON.parse(t.audioUrlsJson) : [],
        })),
        totalCount: (timers as any[]).length,
    };
};

export const updateTimersMock = async (_subjectId: number, _data: any) => {
    return { success: true };
};
