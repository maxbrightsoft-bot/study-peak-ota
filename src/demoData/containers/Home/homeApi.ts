import { getDb } from '../../database';

// --- Home Screen Mock APIs ---

export const getListExamMock = async (query?: any) => {
    const database = await getDb();
    const exams = await database.getAllAsync('SELECT * FROM ExamSessions ORDER BY startTime DESC');
    return (exams as any[]).map((e: any) => ({
        ...e,
        courses: e.coursesJson ? JSON.parse(e.coursesJson) : [],
        isLate: e.isLate === 1,
    }));
};

export const getExamInfoMock = async (code: string) => {
    const database = await getDb();
    const exam = await database.getFirstAsync('SELECT * FROM ExamSessions WHERE code = ?', [code]);
    if (!exam) return null;
    return {
        ...(exam as any),
        courses: (exam as any).coursesJson ? JSON.parse((exam as any).coursesJson) : [],
    };
};

export const joinExamMock = async (_code: string) => {
    return { success: true };
};

export const getLessonsMock = async (_startDate: string, _endDate: string) => {
    const database = await getDb();
    const lessons = await database.getAllAsync('SELECT * FROM Lessons ORDER BY startTime ASC');
    return lessons;
};

export const getCheckInLessonMock = async (_lessonId: number) => {
    return { success: true };
};

export const getListSocialLinkMock = async () => {
    return [];
};

export const getListNotificationMock = async (query?: any) => {
    const database = await getDb();
    const notifications = await database.getAllAsync('SELECT * FROM Notifications ORDER BY createdAt DESC');
    return (notifications as any[]).map((n: any) => ({
        ...n,
        name: n.title,
        isRead: n.isRead === 1,
        data: n.dataJson ? JSON.parse(n.dataJson) : null,
    }));
};

export const getNotificationByIdMock = async (id: number) => {
    const database = await getDb();
    const notification = await database.getFirstAsync('SELECT * FROM Notifications WHERE id = ?', [id]);
    if (!notification) return null;
    return {
        ...(notification as any),
        name: (notification as any).title,
        isRead: (notification as any).isRead === 1,
        data: (notification as any).dataJson ? JSON.parse((notification as any).dataJson) : null,
    };
};

export const getInfoAcademyMock = async () => {
    const database = await getDb();
    const count = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM Lessons');
    return { totalCount: count?.count || 0 };
};

export const getSchedulesMock = async (query?: any) => {
    const database = await getDb();
    const schedules = await database.getAllAsync('SELECT * FROM Schedules ORDER BY startDate ASC');
    
    const startStr = query?.startDate;
    const endStr = query?.endDate;
    
    if (!startStr || !endStr) return { items: [], totalCount: 0 };

    const startRange = new Date(startStr);
    const endRange = new Date(endStr);

    const filtered = (schedules as any[]).filter(s => {
        const sDate = new Date(s.startDate);
        return sDate >= startRange && sDate <= endRange;
    });

    console.log(`[DEMO] 📅 Filtered ${filtered.length}/${schedules.length} schedules for range: ${startStr} -> ${endStr}`);

    const items = filtered.map(s => {
        const start = new Date(s.startDate);
        const end = new Date(s.endDate);
        
        const pad = (n: number) => n.toString().padStart(2, '0');
        // Trả về HH:mm:ss theo giờ máy local (vì UI dùng moment().local() để parse)
        const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}:${pad(start.getSeconds())}`;
        const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}:${pad(end.getSeconds())}`;

        return {
            ...s,
            date: s.startDate,
            startTime,
            endTime,
            type: 0, 
        };
    });

    return { items, totalCount: items.length };
};

export const createScheduleMock = async (values: any) => {
    const database = await getDb();
    const result = await database.runAsync(
        `INSERT INTO Schedules (title, description, startDate, endDate, status, subjectName, color) VALUES (?,?,?,?,?,?,?)`,
        [values.title, values.description, values.startDate, values.endDate, 0, values.subjectName, values.color || '#7C3AED']
    );
    return { id: result.lastInsertRowId };
};

export const updateScheduleMock = async (scheduleId: number, values: any) => {
    const database = await getDb();
    await database.runAsync(
        `UPDATE Schedules SET title=?, description=?, startDate=?, endDate=?, subjectName=?, color=? WHERE id=?`,
        [values.title, values.description, values.startDate, values.endDate, values.subjectName, values.color, scheduleId]
    );
    return { success: true };
};

export const deleteScheduleMock = async (scheduleId: number) => {
    const database = await getDb();
    await database.runAsync(`DELETE FROM Schedules WHERE id = ?`, [scheduleId]);
    return { success: true };
};

export const updateScheduleStatusMock = async (scheduleId: number, status: number) => {
    const database = await getDb();
    await database.runAsync(`UPDATE Schedules SET status = ? WHERE id = ?`, [status, scheduleId]);
    return { success: true };
};

export const getScheduleCountMock = async (_values: any) => {
    const database = await getDb();
    const count = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM Schedules');
    return { totalCount: count?.count || 0 };
};

export const getTextbookListMock = async (query?: any) => {
    const database = await getDb();
    const textbooks = await database.getAllAsync('SELECT * FROM Textbooks');
    let parsed = (textbooks as any[]).map((t: any) => {
        const data = t.dataJson ? JSON.parse(t.dataJson) : {};
        const textbookName = t.name || data.name || "Textbook";
        
        // Bìa sách dùng CSS bên UI, không dùng link ảnh ngoại
        const coverImage = t.coverImage || data.coverImage || "css-placeholder";
        console.log(`[DEMO] 📚 Textbook: ${textbookName}, Style: CSS`);
        return {
            ...data,
            id: t.id,
            name: textbookName,
            subjectName: t.subjectName || data.subjectName,
            coverImage: coverImage,
            totalQuestions: t.totalQuestions,
            completedQuestions: t.completedQuestions,
            isStudying: t.isStudying === 1,
            totalAnswerTime: t.totalAnswerTime,
        };
    });

    const filterType = query?.preparedType || query?.Type;
    if (filterType) {
        parsed = parsed.filter(t => t.preparedType === Number(filterType));
    }

    // Hook useTextbook đọc: const { items = [] } = data
    return { items: parsed, totalCount: parsed.length };
};

export const getTextbookByIdMock = async (textbookId: number) => {
    const database = await getDb();
    const t = await database.getFirstAsync('SELECT * FROM Textbooks WHERE id = ?', [textbookId]);
    if (!t) return null;

    const data = (t as any).dataJson ? JSON.parse((t as any).dataJson) : {};
    const textbookName = (t as any).name || data.name || "Textbook";
    
    let coverImage = (t as any).coverImage || data.coverImage;
    if (!coverImage || coverImage === "css-placeholder") {
        coverImage = "css-placeholder"; // UI handles this
    }

    const result = {
        ...data,
        ...(t as any),
        name: textbookName,
        coverImage,
        isMock: true,
        isStudying: (t as any).isStudying === 1,
    };

    return { data: result }; // Bọc vào data để UI (useTextbookDrawer) map đúng: setTextbook(data.data)
};
