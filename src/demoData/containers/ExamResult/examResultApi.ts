import { getDb } from '../../database';

// --- Exam Result Mock APIs ---

const getChartData = async (code: string, chartType: string) => {
    const database = await getDb();
    const row = await database.getFirstAsync(
        'SELECT dataJson FROM ChartData WHERE examSessionCode = ? AND chartType = ?', [code, chartType]
    ) as any;
    return row?.dataJson ? JSON.parse(row.dataJson) : null;
};

export const getExamResultMock = async (code: string) => {
    const database = await getDb();
    const session = await database.getFirstAsync('SELECT * FROM ExamSessions WHERE code = ?', [code]) as any;
    if (!session) return null;

    const questions = await database.getAllAsync(
        'SELECT * FROM ExamQuestions WHERE examSessionCode = ? ORDER BY questionOrder ASC', [code]
    ) as any[];

    const user = await database.getFirstAsync('SELECT * FROM DemoUser LIMIT 1') as any;

    return {
        data: {
            id: session.id,
            examSessionId: session.id,
            title: session.title,
            subjectName: session.subjectName,
            description: "",
            image: "",
            score: session.score,
            totalScore: session.totalScore,
            totalCorrectRate: session.score,
            startTime: session.startTime,
            studentStartTime: session.studentStartTime || session.startTime,
            finishTime: session.finishTime,
            totalTime: session.duration,
            duration: session.duration,
            status: session.status,
            type: session.type,
            placeOrder: 1,
            teacherId: 1,
            teacherName: session.teacherName,
            teacherAvatar: session.teacherAvatar || "",
            student: {
                id: user?.id || 1,
                fullName: user?.fullName || 'Demo Student',
                avatar: user?.avatar || '',
            },
            averageScores: session.score * 0.85,
            totalStudent: session.totalStudentsJoined,
            totalStudentsJoined: session.totalStudentsJoined,
            attemptNumber: session.attemptNumber,
            studentAttemptNumber: session.attemptNumber,
            studentExamSessionId: session.studentExamSessionId,
            totalStudentAttemptNumber: 1,
            totalAttemptTime: 1,
            studentTotalAttemptTime: 1,
            isSelected: true,
            totalQuestions: session.questionCount,
            percentageAmongStudents: 75,
            questionSolvingOrderEfficiency: 80,
            courses: session.coursesJson ? JSON.parse(session.coursesJson) : [],
            sessionCourses: session.coursesJson ? JSON.parse(session.coursesJson) : [],
            sessionStudentCourses: session.coursesJson ? JSON.parse(session.coursesJson) : [],
            student: user ? { id: user.id, fullName: user.fullName, email: user.email } : null,
            questions: questions.map((q: any) => ({
                id: q.id,
                questionOrder: q.questionOrder,
                questionGroupIndex: q.questionGroupIndex,
                isCorrect: q.isCorrect === 1,
                isStar: q.isStar === 1,
                score: q.score,
                duration: q.duration,
                topDuration: q.topDuration,
                overallCorrectRate: q.overallCorrectRate,
                skipRate: q.skipRate,
                classAverageTime: q.classAverageTime,
                parentQuestionId: q.parentQuestionId || 0,
                parentQuestionOrder: q.parentQuestionOrder || 0,
                answerResponseSignal: q.answerResponseSignal,
                selectedAnswers: q.selectedAnswersJson 
                    ? JSON.parse(q.selectedAnswersJson).map((a: any) => typeof a === 'object' ? String(a.id) : String(a))
                    : [],
                correctAnswers: q.correctAnswersJson 
                    ? JSON.parse(q.correctAnswersJson).map((a: any) => typeof a === 'object' ? a.id : a)
                    : [],
                correctTextualAnswers: q.correctTextualAnswersJson ? JSON.parse(q.correctTextualAnswersJson) : [],
                textualAnswers: q.textualAnswersJson ? JSON.parse(q.textualAnswersJson) : [],
                questionTypeCategories: q.questionTypeCategoriesJson ? JSON.parse(q.questionTypeCategoriesJson) : [],
                questionAnswerType: q.questionAnswerType || 0,
                answerTime: q.answerTime || "",
                category: { id: 0, name: q.categoryName || "", path: "", numberOfQuestions: 0, numberOfChildren: 0, subjectId: 0, subjectName: "", superId: 0 },
                unit: q.unitText,
            })),
            questionGroups: [],
        }
    };
};

export const getExamResultPercentagesMock = async (_code: string) => {
    return { data: 75 };
};

export const getResultsLongTimeSpendMock = async (code: string) => {
    const data = await getChartData(code, "LONG_TIME_SPEND");
    return { data: data || [] };
};

export const getResultsEffectSizeMock = async (code: string) => {
    const raw = await getChartData(code, "EFFECT_SIZE");
    if (!raw || !Array.isArray(raw)) return { data: [] };

    const database = await getDb();
    let questions = await database.getAllAsync(
        'SELECT * FROM ExamQuestions WHERE examSessionCode = ? ORDER BY questionOrder ASC', [code]
    ) as any[];

    if (questions.length === 0) {
        questions = await database.getAllAsync(
            'SELECT * FROM TextbookQuestions WHERE sessionId = ? OR chapterId = ? ORDER BY questionOrder ASC', [code, code]
        ) as any[];
    }

    console.log(`[DEMO] EffectSize raw for ${code}:`, raw?.length, 'questions:', questions?.length);

    let completedCount = questions.length;
    if (!isNaN(Number(code))) {
        const chapterId = Number(code);
        const textbooks = await database.getAllAsync('SELECT dataJson FROM Textbooks') as any[];
        for (const tb of textbooks) {
            if (tb?.dataJson) {
                try {
                    const tbData = JSON.parse(tb.dataJson);
                    const ch = tbData.chapters?.find((c: any) => c.id === chapterId);
                    if (ch) {
                        completedCount = ch.completedChapterQuestions || 0;
                        break;
                    }
                } catch (_) {}
            }
        }
    }

    // Join chart data với question data để có đầy đủ field EffectSize
    const enriched = raw.map((item: any, index: number) => {
        const q = questions.find((q: any) => q.questionOrder === item.questionOrder);
        const isAnswered = index < completedCount;
        const correctAnswers = q?.correctAnswersJson ? JSON.parse(q.correctAnswersJson) : item.correctAnswers || [1];
        // Chuyển đổi correctAnswers từ object array sang number array nếu cần
        const correctNums: number[] = Array.isArray(correctAnswers)
            ? correctAnswers.map((a: any) => typeof a === 'object' ? a.id : a)
            : [1];
        const selectedRaw = q?.selectedAnswersJson ? JSON.parse(q.selectedAnswersJson) : item.selectedAnswers || [];
        const selectedNums: any[] = Array.isArray(selectedRaw)
            ? selectedRaw.map((a: any) => typeof a === 'object' ? String(a.id) : String(a))
            : [];
        const answersCount = q?.answerCount || 5;
        // averageAnswers: % chọn từng đáp án (đồng bộ với overallCorrectRate từ DB)
        const overallCorrectRate = q?.overallCorrectRate || 60;
        const remainingRate = 100 - overallCorrectRate;
        const averageAnswers = Array.from({ length: answersCount }, (_, i) => {
            if (correctNums.includes(i + 1)) return overallCorrectRate;
            return remainingRate / (answersCount - correctNums.length); // chia đều phần % còn lại cho các đáp án sai
        });

        return {
            id: q?.id || item.id || (5000 + item.questionOrder),
            questionOrder: item.questionOrder,
            isCorrect: isAnswered ? (q ? (q.isCorrect === 1) : !!item.isCorrect) : false,
            correctRate: item.correctRate || item.effectSize || 60,
            selectedAnswers: isAnswered ? selectedNums : [],
            correctAnswers: correctNums,
            parentQuestionId: q?.parentQuestionId || 0,
            parentQuestionOrder: q?.parentQuestionOrder || 0,
            correctTextualAnswers: [],
            textualAnswers: [],
            answerResponseSignal: null,
            problemCategories: [],
            mostSelectedAnswers: String(correctNums[0] || 1),
            answersCount,
            averageAnswers,
        };
    });

    return { data: enriched };
};


export const getResultsTimeOrderQuestionMock = async (code: string) => {
    const raw = await getChartData(code, "TIMELY_ORDER");
    if (!raw) return { data: [] };

    // Nếu raw đã là grouped format [{questions:[],...}] (từ seedChartData.ts), giữ nguyên
    if (Array.isArray(raw) && raw.length > 0 && Array.isArray(raw[0]?.questions)) {
        return { data: raw };
    }

    // Nếu raw là flat format [{questionOrder, answerOrder, ...}] (từ fakerSeed.ts)
    // Wrap vào 1 group duy nhất mà SolutionOrderChart cần
    const flat = Array.isArray(raw) ? raw : [];
    const questions = flat.map((q: any) => ({
        questionOrder: q.questionOrder ?? 0,
        answerOrder: q.answerOrder ?? 0,
        topAnswerOrder: q.topAnswerOrder ?? Math.floor(q.questionOrder / 2), // fallback
        parentQuestionId: q.parentQuestionId ?? 0,
        parentQuestionOrder: q.parentQuestionOrder ?? 0,
    }));

    return { data: [{ questions }] };
};


export const getResultsCategoriesMock = async (code: string) => {
    const database = await getDb();

    // Lấy raw chart data (có thể là examSession code hoặc textbookSession id)
    const chartRow = await database.getFirstAsync(
        'SELECT dataJson FROM ChartData WHERE examSessionCode = ? AND chartType = ?',
        [code, 'CATEGORIES']
    ) as any;
    const rawCats: any[] = chartRow?.dataJson ? JSON.parse(chartRow.dataJson) : [];

    // Lấy danh sách câu hỏi để build questionIds
    let questions = await database.getAllAsync(
        'SELECT id, categoryName, questionOrder FROM ExamQuestions WHERE examSessionCode = ? ORDER BY questionOrder ASC',
        [code]
    ) as any[];
    if (questions.length === 0) {
        questions = await database.getAllAsync(
            'SELECT id, categoryName, questionOrder FROM TextbookQuestions WHERE sessionId = ? OR chapterId = ? ORDER BY questionOrder ASC',
            [code, code]
        ) as any[];
    }

    // Nhóm trực tiếp từ danh sách câu hỏi để không bỏ sót bất kỳ câu nào
    const catMap = new Map<string, any>();
    questions.forEach((q: any) => {
        const catName = q.categoryName || '분류 없음';
        if (!catMap.has(catName)) {
            // Tìm trong rawCats để lấy thông tin giả lập nếu có
            const rawCat = rawCats.find(c => (c.categoryName || c.name) === catName);
            catMap.set(catName, {
                id: catMap.size + 1,
                name: catName,
                questionIds: [],
                totalCorrectQuestions: rawCat?.totalCorrectQuestions || 0,
                percentageAmongStudents: rawCat?.percentageAmongStudents || 60,
                totalSolvedTime: rawCat?.totalSolvedTime || 300
            });
        }
        catMap.get(catName).questionIds.push(q.id);
    });

    const categoryResponses = Array.from(catMap.values()).map(cat => ({
        ...cat,
        totalQuestions: cat.questionIds.length,
        totalAnsweredQuestions: cat.questionIds.length,
    }));

    return { data: categoryResponses };
};


export const getOverallResultsMock = async (code: string) => {
    const data = await getChartData(code, "OVERALL");
    return { data: data?.data || [], maxData: data?.maxData || {} };
};

export const getOverallQuestionTypesResultsMock = async (_code: string) => {
    return { data: [], maxData: {} };
};

export const getOverallCategoriesResultsMock = async (code: string) => {
    const data = await getChartData(code, "CATEGORIES");
    return { data: data || [] };
};

export const getQuestionTimeCategoriesResultsMock = async (code: string) => {
    const data = await getChartData(code, "QUESTION_TIMES");
    return { data: data || [] };
};
// --- Textbook Chapter Results (query từ DB) ---
export const getChapterResultsMock = async (chapterId: number) => {
    const database = await getDb();

    // Query questions từ TextbookQuestions table (quan hệ với chapterId)
    const questions = await database.getAllAsync(
        'SELECT * FROM TextbookQuestions WHERE chapterId = ? ORDER BY questionOrder ASC',
        [chapterId]
    ) as any[];

    // Lấy thông tin chapter từ textbook dataJson để biết số câu đã làm
    let chapterName = `Chapter ${chapterId}`;
    let completedCount = 0;
    const textbooks = await database.getAllAsync('SELECT dataJson FROM Textbooks') as any[];
    for (const tb of textbooks) {
        if (tb?.dataJson) {
            try {
                const tbData = JSON.parse(tb.dataJson);
                const ch = tbData.chapters?.find((c: any) => c.id === chapterId);
                if (ch) {
                    chapterName = ch.name;
                    completedCount = ch.completedChapterQuestions || 0;
                    break;
                }
            } catch (_) {}
        }
    }

    // Map questions sang format UI cần
    const questionResults = questions.map((q: any, index: number) => {
        const cats = q.categoriesJson ? JSON.parse(q.categoriesJson) : [];
        const firstCat = cats[0] || { id: 0, name: '', path: '' };
        
        // Giả lập trạng thái đã làm hoặc chưa làm dựa trên completedCount
        const isAnswered = index < completedCount;
        
        return {
            id: q.id,
            questionOrder: q.questionOrder,
            questionGroupIndex: q.questionGroupIndex || 0,
            isCorrect: isAnswered ? (q.isCorrect === 1) : false,
            isStar: q.isStar === 1,
            score: isAnswered ? q.score : 0,
            duration: isAnswered ? q.duration : 0,
            topDuration: q.topDuration,
            overallCorrectRate: q.overallCorrectRate,
            skipRate: q.skipRate,
            classAverageTime: q.classAverageTime,
            parentQuestionId: q.parentQuestionId || 0,
            parentQuestionOrder: q.parentQuestionOrder || 0,
            answerResponseSignal: isAnswered ? q.answerResponseSignal : null, // null hoặc giá trị chưa trả lời
            questionGroupId: q.questionGroupId || 0,
            selectedAnswers: isAnswered ? (q.selectedAnswersJson ? JSON.parse(q.selectedAnswersJson).map((a: any) => typeof a === 'object' ? String(a.id) : String(a)) : []) : [],
            correctAnswers: q.correctAnswersJson ? JSON.parse(q.correctAnswersJson).map((a: any) => typeof a === 'object' ? a.id : a) : [],
            correctTextualAnswers: q.correctTextualAnswersJson ? JSON.parse(q.correctTextualAnswersJson) : [],
            textualAnswers: isAnswered ? (q.textualAnswersJson ? JSON.parse(q.textualAnswersJson) : []) : [],
            questionTypeCategories: q.questionTypeCategoriesJson ? JSON.parse(q.questionTypeCategoriesJson) : [],
            questionAnswerType: q.questionAnswerType || 0,
            answerTime: isAnswered ? (q.answerTime || '') : '',
            categories: cats,
            category: { ...firstCat, numberOfQuestions: questions.length, numberOfChildren: 0, subjectId: 1, subjectName: '수학', superId: 0 },
        };
    });

    const totalScore = questions.length * 20; // mỗi câu tối đa 20 điểm
    const score = questionResults.reduce((s: number, q: any) => s + q.score, 0);
    const totalTime = questionResults.reduce((s: number, q: any) => s + q.duration, 0);

    return {
        data: {
            id: chapterId,
            chapterName,
            parentChapterName: null,
            className: '',
            startTime: '2026-05-10T09:00:00Z',
            totalTime: Math.round(totalTime),
            totalQuestions: questions.length,
            score,
            totalScore,
            studentTextbookSessionId: chapterId,
            studentQuestionResults: questionResults,
            questionGroups: [],
            title: chapterName,
            student: {
                id: 1,
                fullName: 'Demo Student',
                avatar: ''
            },
            type: 1,
        }
    };
};
