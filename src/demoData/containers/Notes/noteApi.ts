import { getDb, getActiveDbLanguage } from '../../database';
import { getLocale } from '../../seedData/demoLocales';

// --- Notes API ---

const ensureNotesForExamSession = async (database: any, examSessionId: number) => {
    try {
        const countRow = await database.getFirstAsync(
            'SELECT COUNT(*) as count FROM Notes WHERE examSessionId = ?',
            [examSessionId]
        ) as any;

        if (countRow && countRow.count > 0) {
            return; // Đã có note cho bài thi này
        }

        // Nếu chưa có note nào, tự động sinh note
        const session = await database.getFirstAsync(
            'SELECT * FROM ExamSessions WHERE id = ?',
            [examSessionId]
        ) as any;

        if (!session) return;

        // Lấy các câu hỏi sai
        let questions = await database.getAllAsync(
            'SELECT * FROM ExamQuestions WHERE examSessionCode = ? AND isCorrect = 0',
            [session.code]
        ) as any[];

        // Nếu không có câu sai nào, lấy tất cả các câu hỏi
        if (questions.length === 0) {
            questions = await database.getAllAsync(
                'SELECT * FROM ExamQuestions WHERE examSessionCode = ?',
                [session.code]
            ) as any[];
        }

        if (questions.length === 0) return;

        // Lấy ngôn ngữ hiện tại và tài liệu note mẫu
        const lang = getActiveDbLanguage ? getActiveDbLanguage() : 'ko';
        const locale = getLocale(lang);
        const noteContents = locale.noteContents || [
            '이 문제에서 공식을 잘못 적용했음.',
            '계산 실수가 있었음. 다시 풀어보기.',
            '풀이 과정은 맞았지만 답을 잘못 적음.'
        ];
        const mockQuestionTypes = locale.mockQuestionTypes || ['개념 이해', '공식 적용'];

        // Chọn ngẫu nhiên 1 hoặc 2 câu hỏi để tạo note
        const countToGenerate = Math.floor(Math.random() * 2) + 1; // 1 hoặc 2 ghi chú
        const selectedQuestions = questions.slice(0, countToGenerate);
        
        for (let i = 0; i < selectedQuestions.length; i++) {
            const q = selectedQuestions[i];
            const content = noteContents[i % noteContents.length];
            const daysAgo = 1;
            const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
            
            await database.runAsync(
                `INSERT INTO Notes (content, title, subjectName, categoryName, createdAt, score,
                 isOwned, isStudentNote, hasIncorrectOrImage, imageUrl, senderJson, type,
                 examSessionId, questionId, questionOrder, page, questionTypeName)
                 VALUES (?, ?, ?, ?, ?, ?, 1, 1, 0, null, ?, 0, ?, ?, ?, ?, ?)`,
                [
                    content,
                    session.title,
                    session.subjectName,
                    q.categoryName || session.subjectName,
                    createdAt,
                    Math.floor(Math.random() * 100),
                    JSON.stringify({ id: 101, fullName: 'Demo Student', email: 'demo@touchstudy.com' }),
                    examSessionId,
                    q.id,
                    q.questionOrder,
                    Math.floor(Math.random() * 190) + 10,
                    mockQuestionTypes[i % mockQuestionTypes.length]
                ]
            );
        }
        console.log(`Auto-generated ${selectedQuestions.length} notes for examSessionId ${examSessionId}`);
    } catch (e) {
        console.error("Error generating notes for exam session:", e);
    }
};

export const getDemoNotes = async (queryParams?: any) => {
    const database = await getDb();

    // Hỗ trợ cả examSessionId (number) và examCode (string)
    let targetExamSessionId: number | null = null;
    if (queryParams?.examSessionId) {
        targetExamSessionId = Number(queryParams.examSessionId);
    } else if (queryParams?.examCode) {
        const session = await database.getFirstAsync(
            'SELECT id FROM ExamSessions WHERE code = ?', [queryParams.examCode]
        ) as any;
        if (session?.id) {
            targetExamSessionId = session.id;
        }
    }

    if (targetExamSessionId) {
        // Đảm bảo luôn có note cho exam session này trước khi query
        await ensureNotesForExamSession(database, targetExamSessionId);
    }

    let query = 'SELECT * FROM Notes WHERE 1=1';
    const params: any[] = [];

    if (queryParams?.subjectNames?.length) {
        const placeholders = queryParams.subjectNames.map(() => '?').join(',');
        query += ` AND subjectName IN (${placeholders})`;
        params.push(...queryParams.subjectNames);
    }
    if (queryParams?.categoryNames?.length) {
        const placeholders = queryParams.categoryNames.map(() => '?').join(',');
        query += ` AND categoryName IN (${placeholders})`;
        params.push(...queryParams.categoryNames);
    }
    
    if (targetExamSessionId) {
        query += ` AND examSessionId = ?`;
        params.push(targetExamSessionId);
    }
    if (queryParams?.hasIncorrectOrImage) {
        query += ` AND hasIncorrectOrImage = 1`;
    }

    query += ' ORDER BY id DESC';

    const allRows = await database.getAllAsync(query, params);

    return allRows.map((row: any) => ({
        ...row,
        sender: row.senderJson ? JSON.parse(row.senderJson) : null,
        receiver: row.receiverJson ? JSON.parse(row.receiverJson) : null,
        receivers: row.receiversJson ? JSON.parse(row.receiversJson) : [],
        mentionUsers: row.mentionUsersJson ? JSON.parse(row.mentionUsersJson) : [],
        isOwned: row.isOwned === 1,
        isStudentNote: row.isStudentNote === 1,
        hasIncorrectOrImage: row.hasIncorrectOrImage === 1,
        isMentionAll: row.isMentionAll === 1,
    }));
};

export const getDemoGroupedNotes = async (queryParams?: any) => {
    const database = await getDb();

    let query = `
        SELECT subjectName, categoryName,
               MAX(score) as latestScore,
               MAX(createdAt) as latestCreatedAt,
               COUNT(*) as totalNotes
        FROM Notes
        WHERE 1=1
    `;
    const params: any[] = [];

    if (queryParams?.subjectNames?.length) {
        const placeholders = queryParams.subjectNames.map(() => '?').join(',');
        query += ` AND subjectName IN (${placeholders})`;
        params.push(...queryParams.subjectNames);
    }

    query += ' GROUP BY subjectName, categoryName ORDER BY latestCreatedAt DESC';

    const groups = await database.getAllAsync(query, params);

    // Cho mỗi group, lấy notes chi tiết
    const result = [];
    for (const group of groups as any[]) {
        const notes = await database.getAllAsync(
            'SELECT * FROM Notes WHERE subjectName = ? AND categoryName = ? ORDER BY createdAt DESC',
            [group.subjectName, group.categoryName]
        );
        result.push({
            ...group,
            notes: notes.map((row: any) => ({
                ...row,
                sender: row.senderJson ? JSON.parse(row.senderJson) : null,
                receiver: row.receiverJson ? JSON.parse(row.receiverJson) : null,
                receivers: row.receiversJson ? JSON.parse(row.receiversJson) : [],
                mentionUsers: row.mentionUsersJson ? JSON.parse(row.mentionUsersJson) : [],
                isOwned: row.isOwned === 1,
                isStudentNote: row.isStudentNote === 1,
                isMentionAll: row.isMentionAll === 1,
            })),
        });
    }
    return result;
};

export const getDemoNoteFilterOptions = async () => {
    const database = await getDb();
    const subjects = await database.getAllAsync('SELECT DISTINCT subjectName FROM Notes');
    const categories = await database.getAllAsync('SELECT DISTINCT categoryName, subjectName FROM Notes');

    // Hook đọc: data.subjects.map(s => ({ label: s.name, value: s.name, id: s.id }))
    // và data.categories.map(c => ({ label: c.name, value: c.name, id: c.id, children: ... }))
    const subjectList = (subjects as any[]).map((s: any, idx: number) => ({
        id: idx + 1,
        name: s.subjectName,
    }));

    // Nhóm categories theo subjectName
    const catMap = new Map<string, any[]>();
    (categories as any[]).forEach((c: any) => {
        if (!catMap.has(c.subjectName)) catMap.set(c.subjectName, []);
        catMap.get(c.subjectName)!.push(c.categoryName);
    });

    const categoryList = Array.from(catMap.entries()).map(([subjectName, cats], idx) => ({
        id: idx + 1,
        name: subjectName,
        children: cats.map((catName, cIdx) => ({
            id: (idx + 1) * 100 + cIdx,
            name: catName,
        })),
    }));

    return {
        subjects: subjectList,
        categories: categoryList,
    };
};

export const createDemoNote = async (body: any) => {
    const database = await getDb();
    const result = await database.runAsync(
        `INSERT INTO Notes (content, title, subjectName, categoryName, createdAt, score, isOwned, isStudentNote, hasIncorrectOrImage, imageUrl, questionId, examSessionId, senderJson, type)
         VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?, ?, ?, ?)`,
        [
            body.content, body.title || null, body.subjectName || null, body.categoryName || null, new Date().toISOString(), 0,
            body.imageUrl ? 1 : 0, body.imageUrl || null,
            body.questionId || null, body.examSessionId || null,
            JSON.stringify({ id: 101, fullName: "Demo Student", email: "demo@touchstudy.com" }),
            body.type || 0
        ]
    );
    return { id: result.lastInsertRowId };
};

export const updateDemoNote = async (id: number, body: any) => {
    const database = await getDb();
    await database.runAsync(`UPDATE Notes SET content = ? WHERE id = ?`, [body.content, id]);
    return { success: true };
};

export const deleteDemoNote = async (id: number) => {
    const database = await getDb();
    await database.runAsync(`DELETE FROM Notes WHERE id = ?`, [id]);
    return { success: true };
};
