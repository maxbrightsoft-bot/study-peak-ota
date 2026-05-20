import { getDb } from '../../database';

// --- StudentExamHistory Mock APIs ---

export const getStudentHistoryMock = async (examSessionId: number | string, _query?: any) => {
    const database = await getDb();
    const history = await database.getAllAsync(
        'SELECT * FROM StudentExamHistory WHERE examSessionId = ? ORDER BY attemptNumber DESC',
        [examSessionId]
    );
    return (history as any[]).map((h: any) => ({
        ...h,
        isSelected: h.isSelected === 1,
        isHidden: h.isHidden === 1,
    }));
};

export const deleteStudentExamSessionMock = async (_examSessionId: number | string, studentExamSessionId: number | string) => {
    const database = await getDb();
    await database.runAsync('DELETE FROM StudentExamHistory WHERE studentExamSessionId = ?', [studentExamSessionId]);
    return { success: true };
};

export const hideStudentExamSessionMock = async (_code: string, _payload: any) => {
    return { success: true };
};

export const selectStudentExamSessionMock = async (_code: string, studentExamSessionId: number | string) => {
    const database = await getDb();
    // Bỏ chọn tất cả
    await database.execAsync('UPDATE StudentExamHistory SET isSelected = 0');
    // Chọn cái mới
    await database.runAsync('UPDATE StudentExamHistory SET isSelected = 1 WHERE studentExamSessionId = ?', [studentExamSessionId]);
    return { success: true };
};
