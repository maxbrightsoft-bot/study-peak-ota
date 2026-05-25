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
    }));
};

export const uploadImageFileMock = async (_file: any) => {
    return { data: "https://example.com/demo-uploaded-image.png" };
};
