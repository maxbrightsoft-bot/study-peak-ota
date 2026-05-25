/**
 * Faker-based Demo Data Generator
 * Tương đương Bogus (.NET) — tạo dữ liệu ngẫu nhiên nhưng có quan hệ chặt chẽ.
 * Chỉ seed nếu chưa có data, nếu đã có thì load lại.
 */
import * as SQLite from 'expo-sqlite';
import { faker } from './fakeUtils';
import { getLocale, DemoLocale } from './demoLocales';

// Là biến module-level để các hàm seed dùng chung
let LOCALE: DemoLocale = getLocale('ko');

// Setter được gọi trước khi seed
export const setDemoLocale = (lang: string) => {
    LOCALE = getLocale(lang);
};

const EXAM_TYPES = [0, 1, 2, 3]; // Normal, Midterm, Final, Mock
const ANSWER_LABELS = ['A', 'B', 'C', 'D', 'E'];
const EXAM_SESSION_COUNT = 5; // Chỉ tạo 5 bài thi

// ===== Helper Functions =====
const pick = <T>(arr: T[]): T => arr[faker.number.int({ min: 0, max: arr.length - 1 })];
const pickN = <T>(arr: T[], n: number): T[] => faker.helpers.shuffle([...arr]).slice(0, n);
const isoDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
};
const examSessionDate = (daysAgo: number, index: number) => {
    const d = new Date();
    d.setHours(9 + (index % 4) * 2, 0, 0, 0);
    d.setDate(d.getDate() - daysAgo);
    return d;
};

const seedUserAndAcademy = async (db: SQLite.SQLiteDatabase) => {
    const subjects = LOCALE.subjects;
    const fullName = faker.person.fullName();
    const schoolName = faker.location.city() + ' ' + LOCALE.schoolSuffix;
    const grade = faker.number.int({ min: 7, max: 12 });
    const classes = pickN(subjects, 2).map(s => `${s.name} ${LOCALE.courseSuffix} ${pick(['A', 'B', 'C'])}`);

    await db.runAsync(
        `INSERT OR IGNORE INTO DemoUser (id, fullName, email, grade, gradeYear, phoneNumber, schoolName,
         academyDomain, token, avatar, parentName, parentPhoneNumber, major,
         isLearningSpace, superId, loginMethod, classesJson, rolesJson)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            101, fullName, 'demo@touchstudy', grade, 2026,
            faker.phone.number(), schoolName, 'demo-academy', 'demo-token-123',
            ``,
            faker.person.fullName(), faker.phone.number(),
            pick([subjects[0].name, subjects[1].name]), 0, 1, 'demo',
            JSON.stringify(classes),
            JSON.stringify(['Student']),
        ]
    );

    await db.runAsync(
        `INSERT OR IGNORE INTO Academies (id, domain, name, logoUrl) VALUES (?, ?, ?, ?)`,
        [1, 'demo-academy', LOCALE.academyName, '']
    );

    for (let i = 0; i < classes.length; i++) {
        await db.runAsync(
            `INSERT OR IGNORE INTO Courses (id, name, academyId, teacherName) VALUES (?, ?, ?, ?)`,
            [i + 1, classes[i], 1, faker.person.fullName()]
        );
    }
};


const seedSubjectsAndTimers = async (db: SQLite.SQLiteDatabase) => {
    const subjects = LOCALE.subjects;
    for (const subject of subjects) {
        await db.runAsync(
            `INSERT OR IGNORE INTO Subjects (id, name, sortOrder) VALUES (?, ?, ?)`,
            [subject.id, subject.name, subject.id]
        );
        const duration = faker.number.int({ min: 180000, max: 540000 });
        await db.runAsync(
            `INSERT OR IGNORE INTO SubjectTimers (subjectId, timerId, subjectName, status, duration, startTime, rowVersion, audioUrlsJson)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [subject.id, subject.id, subject.name, 0, duration,
            isoDate(faker.number.int({ min: 0, max: 7 })),
            `rv-timer-${subject.id}`, '[]']
        );
    }
};

// ================================================================
// 3. EXAM SESSIONS & QUESTIONS (quan hệ chặt chẽ)
// ================================================================
const seedExamSessionsAndQuestions = async (db: SQLite.SQLiteDatabase) => {
    const subjects = LOCALE.subjects;
    const examTitles = LOCALE.examTitles;
    const exams: { code: string; subject: typeof subjects[0]; questionCount: number }[] = [];

    // Phân bổ ngày: 2 bài tháng này (2, 5 ngày trước), 3 bài tháng trước (32, 35, 40 ngày trước)
    const daysAgoList = [2, 5, 32, 35, 40];

    for (let i = 0; i < EXAM_SESSION_COUNT; i++) {
        const subject = subjects[i % subjects.length];
        const code = `${subject.name.substring(0, 2).toUpperCase()}-${faker.string.alphanumeric(4).toUpperCase()}`;
        const questionCount = faker.number.int({ min: 5, max: 15 });
        const score = faker.number.float({ min: 40, max: 100, fractionDigits: 1 });
        const daysAgo = daysAgoList[i];
        const duration = faker.number.int({ min: 1200, max: 3600 });
        const type = pick(EXAM_TYPES);
        const examTitle = `${subject.name} ${pick(examTitles)} ${faker.string.alphanumeric(2)}`;

        const start = examSessionDate(daysAgo, i);
        const startTime = start.toISOString();
        const finish = new Date(start.getTime() + duration * 1000);
        const finishTime = finish.toISOString();

        await db.runAsync(
            `INSERT OR IGNORE INTO ExamSessions (id, code, title, subjectName, status, score, totalScore,
             startTime, finishTime, duration, questionCount, type, attemptNumber,
             studentExamSessionId, totalStudentsJoined, teacherName, coursesJson, rowVersion,
             numberOfQuestion, startTimeSession, studentStartTime)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                1001 + i, code,
                examTitle,
                subject.name, 3, score, 100,
                startTime, finishTime,
                String(duration), questionCount, type, 1,
                2001 + i, faker.number.int({ min: 15, max: 40 }),
                faker.person.fullName(),
                JSON.stringify([{ id: 1, name: `${subject.name} ${LOCALE.courseSuffix}` }]),
                `rv-${code}`, questionCount, startTime, startTime
            ]
        );

        exams.push({ code, subject, questionCount });

        // Student Exam History
        await db.runAsync(
            `INSERT OR IGNORE INTO StudentExamHistory (examSessionId, examSessionCode, studentExamSessionId,
             score, totalScore, startTime, finishTime, attemptNumber, isSelected)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [1001 + i, code, 2001 + i, score, 100, startTime, finishTime, 1, 1]
        );
    }

    // Questions cho mỗi exam (quan hệ với subject categories)
    for (const exam of exams) {
        const categories = exam.subject.categories;
        for (let q = 0; q < exam.questionCount; q++) {
            const isCorrect = faker.datatype.boolean({ probability: 0.65 });
            const correctIdx = faker.number.int({ min: 0, max: 4 });
            const selectedIdx = isCorrect ? correctIdx : faker.number.int({ min: 0, max: 4 });
            const catIdx = Math.min(categories.length - 1, Math.floor(q / (exam.questionCount / categories.length)));
            const catName = categories[catIdx];
            const duration = faker.number.float({ min: 10, max: 120, fractionDigits: 1 });

            await db.runAsync(
                `INSERT OR IGNORE INTO ExamQuestions (id, examSessionCode, questionGroupId, questionOrder,
                 isCorrect, score, categoryName, questionGroupIndex,
                 selectedAnswersJson, correctAnswersJson, correctTextualAnswersJson,
                 textualAnswersJson, duration, topDuration, overallCorrectRate, skipRate,
                 questionAnswerType, questionTypeCategoriesJson, answerResponseSignal, answerTime,
                 classAverageTime, parentQuestionId, parentQuestionOrder)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    5000 + exams.indexOf(exam) * 100 + q,
                    exam.code, 0, q,
                    isCorrect ? 1 : 0, isCorrect ? faker.number.int({ min: 5, max: 20 }) : 0,
                    catName, 0,
                    JSON.stringify([{ id: selectedIdx + 1, content: ANSWER_LABELS[selectedIdx], order: selectedIdx, isCorrect: selectedIdx === correctIdx }]),
                    JSON.stringify([{ id: correctIdx + 1, content: ANSWER_LABELS[correctIdx], order: correctIdx, isCorrect: true }]),
                    '[]', '[]',
                    duration, duration * faker.number.float({ min: 0.5, max: 0.9, fractionDigits: 2 }),
                    faker.number.float({ min: 40, max: 95, fractionDigits: 1 }),
                    faker.number.float({ min: 0, max: 15, fractionDigits: 1 }),
                    0,
                    JSON.stringify([{ id: q + 1, name: catName }]),
                    isCorrect ? 1 : 0,
                    `00:${String(Math.floor(duration / 60)).padStart(2, '0')}:${String(Math.floor(duration % 60)).padStart(2, '0')}`,
                    faker.number.float({ min: 15, max: 60, fractionDigits: 1 }),
                    0, 0
                ]
            );
        }
    }

    return exams;
};

// ================================================================
// 4. CHART DATA (quan hệ với exams)
// ================================================================
const seedChartDataForExams = async (db: SQLite.SQLiteDatabase, exams: { code: string; subject: { id: number; name: string; categories: string[] }; questionCount: number }[]) => {
    for (const exam of exams) {
        const qCount = exam.questionCount;
        const cats = exam.subject.categories;

        // OVERALL
        await db.runAsync(`INSERT OR IGNORE INTO ChartData (examSessionCode, chartType, dataJson) VALUES (?, ?, ?)`, [
            exam.code, 'OVERALL', JSON.stringify({
                data: [{
                    correctRate: faker.number.float({ min: 50, max: 95, fractionDigits: 1 }),
                    highLevelQuestions: faker.number.int({ min: 2, max: qCount }),
                    lowLevelQuestions: faker.number.int({ min: 2, max: qCount }),
                    totalAsteriskQuestions: faker.number.int({ min: 0, max: 3 }),
                    problemSolvingTime: faker.number.int({ min: 200, max: 500 }),
                    questionLongestTime: faker.number.int({ min: 40, max: 120 }),
                }],
                maxData: {
                    correctRate: 98, highLevelQuestions: qCount, lowLevelQuestions: qCount,
                    totalAsteriskQuestions: 5, problemSolvingTime: 180, questionLongestTime: 30,
                }
            })
        ]);

        // EFFECT_SIZE
        const effectSizeData = Array.from({ length: qCount }, (_, i) => ({
            questionOrder: i, effectSize: faker.number.float({ min: -1, max: 2, fractionDigits: 2 }),
            isCorrect: faker.datatype.boolean({ probability: 0.65 }),
        }));
        await db.runAsync(`INSERT OR IGNORE INTO ChartData (examSessionCode, chartType, dataJson) VALUES (?, ?, ?)`,
            [exam.code, 'EFFECT_SIZE', JSON.stringify(effectSizeData)]);

        // LONG_TIME_SPEND - id phải match with question id (5000 + examIndex*100 + questionOrder)
        const examIdx = exams.indexOf(exam);
        const longTimeData = Array.from({ length: qCount }, (_, i) => ({
            id: 5000 + examIdx * 100 + i,
            questionOrder: i,
            duration: faker.number.int({ min: 15, max: 120 }),
            topDuration: faker.number.int({ min: 10, max: 40 }),
        }));
        await db.runAsync(`INSERT OR IGNORE INTO ChartData (examSessionCode, chartType, dataJson) VALUES (?, ?, ?)`,
            [exam.code, 'LONG_TIME_SPEND', JSON.stringify(longTimeData)]);

        // TIMELY_ORDER
        const orderData = Array.from({ length: qCount }, (_, i) => ({
            questionOrder: i, answerOrder: faker.number.int({ min: 0, max: qCount - 1 }),
            duration: faker.number.int({ min: 15, max: 120 }),
            isCorrect: faker.datatype.boolean({ probability: 0.65 }),
        }));
        await db.runAsync(`INSERT OR IGNORE INTO ChartData (examSessionCode, chartType, dataJson) VALUES (?, ?, ?)`,
            [exam.code, 'TIMELY_ORDER', JSON.stringify(orderData)]);

        // CATEGORIES
        const catData = pickN(cats, Math.min(cats.length, 3)).map((c, idx) => ({
            categoryId: idx + 1, categoryName: c, path: `${exam.subject.name}/${c}`,
            totalCorrectQuestions: faker.number.int({ min: 1, max: 5 }),
            avgCorrectQuestions: faker.number.int({ min: 1, max: 5 }),
            totalQuestions: faker.number.int({ min: 3, max: 8 }),
        }));
        await db.runAsync(`INSERT OR IGNORE INTO ChartData (examSessionCode, chartType, dataJson) VALUES (?, ?, ?)`,
            [exam.code, 'CATEGORIES', JSON.stringify(catData)]);

        // QUESTION_TIMES
        const qtData = pickN(cats, 2).map((c, idx) => ({
            categoryId: idx + 1, categoryName: c, path: `${exam.subject.name}/${c}`,
            questions: Array.from({ length: faker.number.int({ min: 2, max: 4 }) }, (_, qi) => ({
                questionId: 5000 + qi, questionOrder: qi,
                time: faker.number.int({ min: 15, max: 80 }),
                avgTime: faker.number.int({ min: 10, max: 40 }),
            })),
        }));
        await db.runAsync(`INSERT OR IGNORE INTO ChartData (examSessionCode, chartType, dataJson) VALUES (?, ?, ?)`,
            [exam.code, 'QUESTION_TIMES', JSON.stringify(qtData)]);
    }
};

// ================================================================
// 5. NOTES (quan hệ với subjects, exams)
// ================================================================
const seedNotes = async (db: SQLite.SQLiteDatabase) => {
    const noteContents = LOCALE.noteContents;

    // Lấy một số câu hỏi ngẫu nhiên bị sai từ DB để gán note
    const questions = await db.getAllAsync(`
        SELECT q.id, q.questionOrder, q.categoryName, s.id as examSessionId, s.subjectName, s.title
        FROM ExamQuestions q
        JOIN ExamSessions s ON q.examSessionCode = s.code
        WHERE q.isCorrect = 0 LIMIT 50
    `) as any[];

    const examNoteLimits = new Map<number, number>();
    const examNoteCounts = new Map<number, number>();

    for (const q of questions) {
        let limit = examNoteLimits.get(q.examSessionId);
        if (limit === undefined) {
            limit = faker.number.int({ min: 1, max: 2 }); // Mỗi exam chỉ cần 1 - 2 ghi chú
            examNoteLimits.set(q.examSessionId, limit);
        }

        const currentCount = examNoteCounts.get(q.examSessionId) || 0;
        if (currentCount >= limit) continue;

        examNoteCounts.set(q.examSessionId, currentCount + 1);

        const daysAgo = faker.number.int({ min: 0, max: 14 });

        await db.runAsync(
            `INSERT OR IGNORE INTO Notes (content, title, subjectName, categoryName, createdAt, score,
             isOwned, isStudentNote, hasIncorrectOrImage, imageUrl, senderJson, type,
             examSessionId, questionId, questionOrder, page, questionTypeName)
             VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                pick(noteContents) + ` ${faker.lorem.sentence()}`,
                q.title, q.subjectName, q.categoryName,
                isoDate(daysAgo), faker.number.int({ min: 0, max: 100 }),
                faker.datatype.boolean() ? 1 : 0, null,
                JSON.stringify({ id: 101, fullName: '김민준', email: 'demo@touchstudy.com' }),
                0,
                q.examSessionId, q.id, q.questionOrder,
                faker.number.int({ min: 10, max: 200 }), pick(LOCALE.mockQuestionTypes)
            ]
        );
    }
};

// ================================================================
// 6. TEXTBOOKS + QUESTIONS + CHART DATA (quan hệ chặt chẽ)
// ================================================================
const seedTextbooks = async (db: SQLite.SQLiteDatabase) => {
    const subjects = LOCALE.subjects;
    const titles = LOCALE.textbookTitles;
    const textbookConfigs = [
        { id: 201, subjectIdx: 0, type: 1, title: titles.type1[0] },
        { id: 202, subjectIdx: 1, type: 1, title: titles.type1[1] || titles.type1[0] },
        { id: 203, subjectIdx: 2, type: 2, title: titles.type2[0] },
        { id: 204, subjectIdx: 3, type: 2, title: titles.type2[1] || titles.type2[0] },
        { id: 205, subjectIdx: 0, type: 3, title: titles.type3[0] },
        { id: 206, subjectIdx: 1, type: 4, title: titles.type4[0] },
        { id: 207, subjectIdx: 2, type: 5, title: titles.type5[0] },
    ];

    const ANSWER_OPTS = ['A', 'B', 'C', 'D', 'E'];
    let questionIdCounter = 7000;

    for (const config of textbookConfigs) {
        const TEXTBOOK_ID = config.id;
        const subject = subjects[config.subjectIdx] ?? subjects[0];
        const categories = subject.categories.slice(0, 3);

        const chapters: any[] = [];
        let totalQuestionsAll = 0;
        let completedQuestionsAll = 0;

        for (let chIdx = 0; chIdx < categories.length; chIdx++) {
            const catName = categories[chIdx];
            const totalQ = faker.number.int({ min: 5, max: 12 });
            const completedQ = faker.number.int({ min: Math.floor(totalQ * 0.4), max: totalQ });
            let correctCount = 0;

            const uniqueChapterId = TEXTBOOK_ID * 100 + chIdx + 1; // Unique ID for chapters across textbooks

            // === Tạo questions cho chapter này ===
            for (let q = 0; q < totalQ; q++) {
                const isCorrect = faker.datatype.boolean({ probability: 0.65 });
                if (isCorrect) correctCount++;
                const correctIdx = faker.number.int({ min: 0, max: 4 });
                const selectedIdx = isCorrect ? correctIdx : faker.number.int({ min: 0, max: 4 });
                const duration = faker.number.float({ min: 15, max: 120, fractionDigits: 1 });
                const topDuration = duration * faker.number.float({ min: 0.4, max: 0.8, fractionDigits: 2 });

                await db.runAsync(
                    `INSERT OR IGNORE INTO TextbookQuestions (
                        textbookId, chapterId, sessionId, questionOrder, isCorrect, score,
                        duration, topDuration, overallCorrectRate, skipRate, classAverageTime,
                        answerResponseSignal, questionAnswerType,
                        selectedAnswersJson, correctAnswersJson, correctTextualAnswersJson, textualAnswersJson,
                        questionTypeCategoriesJson, categoriesJson, categoryName, answerTime, isStar
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        TEXTBOOK_ID, uniqueChapterId, uniqueChapterId, q,
                        isCorrect ? 1 : 0, isCorrect ? faker.number.int({ min: 5, max: 20 }) : 0,
                        duration, topDuration,
                        faker.number.float({ min: 40, max: 95, fractionDigits: 1 }),
                        faker.number.float({ min: 0, max: 15, fractionDigits: 1 }),
                        faker.number.float({ min: 15, max: 60, fractionDigits: 1 }),
                        isCorrect ? 'correct' : 'wrong', 0,
                        JSON.stringify([{ id: selectedIdx + 1, content: ANSWER_OPTS[selectedIdx], order: selectedIdx, isCorrect: selectedIdx === correctIdx }]),
                        JSON.stringify([{ id: correctIdx + 1, content: ANSWER_OPTS[correctIdx], order: correctIdx, isCorrect: true }]),
                        '[]', '[]',
                        JSON.stringify([{ id: chIdx + 1, name: catName }]),
                        JSON.stringify([{ id: chIdx + 1, name: catName, path: `${subject.name}/${catName}` }]),
                        catName,
                        `00:${String(Math.floor(duration / 60)).padStart(2, '0')}:${String(Math.floor(duration % 60)).padStart(2, '0')}`,
                        faker.datatype.boolean({ probability: 0.15 }) ? 1 : 0,
                    ]
                );
                questionIdCounter++;
            }

            const accuracyRate = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

            chapters.push({
                id: uniqueChapterId, name: catName,
                pageFrom: chIdx * 30 + 1, pageTo: (chIdx + 1) * 30,
                createdAt: '2026-01-01T00:00:00Z',
                accuracyRate,
                completedChapterQuestions: completedQ,
                totalChapterQuestions: totalQ,
                subChapters: [], articles: [],
            });

            totalQuestionsAll += totalQ;
            completedQuestionsAll += completedQ;

            // === Chart data cho session này ===
            const sessionId = String(uniqueChapterId);

            await db.runAsync(`INSERT OR IGNORE INTO ChartData (examSessionCode, chartType, dataJson) VALUES (?, ?, ?)`, [
                sessionId, 'EFFECT_SIZE', JSON.stringify(
                    Array.from({ length: totalQ }, (_, i) => ({
                        id: uniqueChapterId * 1000 + i,
                        questionOrder: i,
                        effectSize: faker.number.float({ min: -1, max: 2, fractionDigits: 2 }),
                        isCorrect: faker.datatype.boolean({ probability: 0.65 }),
                    }))
                )
            ]);

            await db.runAsync(`INSERT OR IGNORE INTO ChartData (examSessionCode, chartType, dataJson) VALUES (?, ?, ?)`, [
                sessionId, 'LONG_TIME_SPEND', JSON.stringify(
                    Array.from({ length: totalQ }, (_, i) => ({
                        id: uniqueChapterId * 1000 + i,
                        questionOrder: i,
                        duration: faker.number.int({ min: 15, max: 120 }),
                        topDuration: faker.number.int({ min: 10, max: 40 }),
                    }))
                )
            ]);

            await db.runAsync(`INSERT OR IGNORE INTO ChartData (examSessionCode, chartType, dataJson) VALUES (?, ?, ?)`, [
                sessionId, 'TIMELY_ORDER', JSON.stringify(
                    Array.from({ length: totalQ }, (_, i) => ({
                        id: uniqueChapterId * 1000 + i,
                        questionOrder: i,
                        answerOrder: faker.number.int({ min: 0, max: totalQ - 1 }),
                        duration: faker.number.int({ min: 15, max: 120 }),
                        isCorrect: faker.datatype.boolean({ probability: 0.65 }),
                    }))
                )
            ]);

            await db.runAsync(`INSERT OR IGNORE INTO ChartData (examSessionCode, chartType, dataJson) VALUES (?, ?, ?)`, [
                sessionId, 'CATEGORIES', JSON.stringify([
                    { categoryName: catName, correctRate: accuracyRate, totalQuestions: totalQ },
                ])
            ]);

            await db.runAsync(`INSERT OR IGNORE INTO ChartData (examSessionCode, chartType, dataJson) VALUES (?, ?, ?)`, [
                sessionId, 'OVERALL', JSON.stringify({
                    data: [{
                        correctRate: accuracyRate,
                        highLevelQuestions: faker.number.int({ min: 1, max: Math.ceil(totalQ / 2) }),
                        lowLevelQuestions: faker.number.int({ min: 1, max: Math.ceil(totalQ / 2) }),
                        totalAsteriskQuestions: faker.number.int({ min: 0, max: 3 }),
                        problemSolvingTime: faker.number.int({ min: 200, max: 500 }),
                        questionLongestTime: faker.number.int({ min: 40, max: 120 }),
                    }],
                    maxData: {
                        correctRate: 95, highLevelQuestions: totalQ, lowLevelQuestions: totalQ,
                        totalAsteriskQuestions: 5, problemSolvingTime: 180, questionLongestTime: 30,
                    }
                })
            ]);
        }

        const textbookColors = ['6C63FF', 'FF6B6B', '4ECDC4', 'FFD93D', '95E1D3', '7C3AED'];
        const bgColor = pick(textbookColors);
        const coverImage = `https://placehold.co/400x600/${bgColor}/FFF?text=${encodeURIComponent(config.title)}`;

        // === Textbook record ===
        const totalTimeMs = faker.number.int({ min: 600, max: 3000 }) * 1000;
        const textbookData = JSON.stringify({
            chapters,
            subject: { id: subject.id, name: subject.name, totalCategories: subject.categories.length, createdAt: '2026-01-01T00:00:00Z', superId: 0, audioUrls: [] },
            preparedType: config.type, isbn: faker.commerce.isbn(), publisher: pick(['교학사', '미래엔', '비상교육', '천재교육']),
            progress: totalQuestionsAll > 0 ? Math.round((completedQuestionsAll / totalQuestionsAll) * 100) : 0,
            createdBy: { id: 1, fullName: faker.person.fullName(), email: 'teacher@demo.com' },
            textbookOwners: [], limitedTimeInMinutes: 0, limitedQuestionCount: 0,
            rowVersion: `rv-tb${config.id}`, totalAnswerTime: totalTimeMs,
            status: 1, isMock: false, duration: 0,
            coverImage,
        });

        await db.runAsync(
            `INSERT OR IGNORE INTO Textbooks (id, name, subjectName, coverImage, totalQuestions, completedQuestions, isStudying, totalAnswerTime, dataJson)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [TEXTBOOK_ID, config.title, subject.name, coverImage, totalQuestionsAll, completedQuestionsAll, 1, totalTimeMs, textbookData]
        );

        // TextbookSessions — 1 per chapter
        for (let i = 0; i < chapters.length; i++) {
            await db.runAsync(
                `INSERT OR IGNORE INTO TextbookSessions (textbookId, status, currentPage, dataJson) VALUES (?, ?, ?, ?)`,
                [TEXTBOOK_ID, 1, chapters[i].pageFrom, '{}']
            );
        }
    }
};

// ================================================================
// 7. HOME DATA: Schedules, Notifications, Lessons
// ================================================================
const seedHomeData = async (db: SQLite.SQLiteDatabase) => {
    const subjects = LOCALE.subjects;
    const colors = ['#6C63FF', '#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3'];
    const scheduleTasks = LOCALE.examTitles; // reuse exam titles as schedule names

    // Schedules (30 cái) để đảm bảo lịch luôn có chấm
    const scheduleCount = 30;
    for (let i = 0; i < scheduleCount; i++) {
        // Đảm bảo 3 lịch đầu tiên luôn là ngày hôm nay (daysOffset = 0)
        const daysOffset = i < 3 ? 0 : faker.number.int({ min: -30, max: 30 }); 
        const subject = pick(subjects);
        
        // Randomize the hour to prevent overlapping schedules on the same day
        const startObj = new Date(isoDate(-daysOffset));
        startObj.setHours(faker.number.int({ min: 7, max: 20 }), faker.number.int({ min: 0, max: 59 }), 0, 0);
        const start = startObj.toISOString();
        
        // End date cùng ngày nhưng muộn hơn 1-2 tiếng
        const endDateObj = new Date(startObj);
        endDateObj.setHours(endDateObj.getHours() + faker.number.int({ min: 1, max: 2 }));

        await db.runAsync(
            `INSERT OR IGNORE INTO Schedules (title, description, startDate, endDate, status, subjectName, color)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                `${subject.name} ${pick(scheduleTasks)}`,
                faker.lorem.sentence(),
                start, endDateObj.toISOString(),
                0, subject.name, pick(colors),
            ]
        );
    }

    // Notifications (3-5개)
    const notiCount = faker.number.int({ min: 3, max: 5 });
    for (let i = 0; i < notiCount; i++) {
        await db.runAsync(
            `INSERT OR IGNORE INTO Notifications (title, content, createdAt, isRead, type) VALUES (?, ?, ?, ?, ?)`,
            [
                pick(LOCALE.noteContents),
                faker.lorem.sentence(),
                isoDate(faker.number.int({ min: 0, max: 7 })),
                faker.datatype.boolean() ? 1 : 0, 0,
            ]
        );
    }
};

// ================================================================
// 8. STUDY PERFORMANCE (quan hệ với subjects)
// ================================================================
const seedStudyPerformance = async (db: SQLite.SQLiteDatabase) => {
    const subjects = LOCALE.subjects;

    // 30 điểm = đủ cho tuần (7), tháng (4-5 tuần), năm (12 tháng), ngày (8)
    const randMs = (min: number, max: number) =>
        faker.number.int({ min, max }) * 60000; // đổi phút → ms

    const studyPData = Array.from({ length: 30 }, () => randMs(15, 180));
    const studySData = Array.from({ length: 30 }, () => randMs(10, 120));

    // Study time data
    await db.runAsync(
        `INSERT OR IGNORE INTO StudyPerformanceData (chartType, subjectId, dataJson) VALUES (?, ?, ?)`,
        ['STUDY_TIME', 0, JSON.stringify({
            pData: studyPData,
            sData: studySData,
            totalTime: studyPData.reduce((a, b) => a + b, 0),
        })]
    );

    // Per-subject performance (30 điểm mỗi subject)
    for (const subject of subjects) {
        await db.runAsync(
            `INSERT OR IGNORE INTO StudyPerformanceData (chartType, subjectId, dataJson) VALUES (?, ?, ?)`,
            ['SUBJECT_DATA', subject.id, JSON.stringify({
                pData: Array.from({ length: 30 }, () => randMs(5, 120)),
                sData: Array.from({ length: 30 }, () => randMs(3, 80)),
            })]
        );

        await db.runAsync(
            `INSERT OR IGNORE INTO StudyPerformanceData (chartType, subjectId, dataJson) VALUES (?, ?, ?)`,
            ['RANKING', subject.id, JSON.stringify({
                totalStudents: faker.number.int({ min: 20, max: 50 }),
                myRank: faker.number.int({ min: 1, max: 15 }),
                studyTime: faker.number.int({ min: 3000, max: 15000 }),
            })]
        );
    }

    // Question data (30 điểm)
    await db.runAsync(
        `INSERT OR IGNORE INTO StudyPerformanceData (chartType, subjectId, dataJson) VALUES (?, ?, ?)`,
        ['QUESTION_DATA', 0, JSON.stringify({
            pData: Array.from({ length: 30 }, () => faker.number.int({ min: 5, max: 50 })),
            sData: Array.from({ length: 30 }, () => faker.number.int({ min: 3, max: 30 })),
        })]
    );
};

/**
 * Seed dữ liệu Conversations từ ExamSessions có sẵn.
 * Mỗi ExamSession sẽ có 1-2 conversation (câu hỏi của học sinh với giáo viên).
 */
const seedConversations = async (db: SQLite.SQLiteDatabase) => {
    const QUESTION_TITLES = LOCALE.questionTitles;

    const exams = await db.getAllAsync(
        'SELECT id, title, subjectName, teacherName, startTime, finishTime, duration, score FROM ExamSessions ORDER BY startTime DESC'
    ) as any[];

    const incorrectQs = await db.getAllAsync(
        'SELECT id, questionOrder, categoryName, examSessionCode FROM ExamQuestions WHERE isCorrect = 0 ORDER BY RANDOM() LIMIT 20'
    ) as any[];

    const qMap: Record<string, any[]> = {};
    for (const q of incorrectQs) {
        if (!qMap[q.examSessionCode]) qMap[q.examSessionCode] = [];
        qMap[q.examSessionCode].push(q);
    }

    let convId = 1;
    const MAX_CONVERSATIONS = 2;

    for (const exam of exams) {
        if (convId > MAX_CONVERSATIONS) break;

        const sessionQs = qMap[exam.code] || []; // Sử dụng code để match
        const count = 1; // Mỗi exam lấy 1 câu thôi để đảm bảo tổng là 2

        for (let i = 0; i < count; i++) {
            if (convId > MAX_CONVERSATIONS) break;

            const q = sessionQs[i];
            const questionTitle = QUESTION_TITLES[convId % QUESTION_TITLES.length];
            const questionOrder = q?.questionOrder ?? i;
            const questionId = q?.id ?? (convId + 1000);
            const daysAgo = Math.floor(Math.random() * 14);
            const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString();

            // Seed messages for this conversation
            const msgTime1 = new Date(new Date(createdAt).getTime() + 1000 * 60).toISOString();
            const msgTime2 = new Date(new Date(createdAt).getTime() + 1000 * 60 * 30).toISOString();
            
            const lastMessage = LOCALE.demoMessages.teacherAnswer;

            await db.runAsync(
                `INSERT OR IGNORE INTO Conversations (
                    id, examSessionId, examTitle, subjectName, studentId,
                    teacherId, teacherName, teacherAvatar, courseId, courseName,
                    questionId, questionTitle, questionOrder, isCompleted, completedAt,
                    totalUnReadMessage, lastMessage, examId, duration, startTime,
                    examCreatedAt, createdAt, score, totalScore, attemptNumber
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    convId,
                    exam.id, exam.title, exam.subjectName, 101,
                    1, exam.teacherName || LOCALE.demoTeacherSuffix, '',
                    1, LOCALE.demoCourse,
                    questionId, questionTitle, questionOrder,
                    0, null,
                    1, lastMessage, exam.id, // Set 1 tin nhắn chưa đọc và hiện nội dung cuối
                    exam.duration, exam.startTime,
                    exam.startTime, createdAt,
                    exam.score, 100, 1
                ]
            );

            // Student question
            await db.runAsync(
                `INSERT INTO Messages (conversationId, senderId, senderName, content, createdAt, isMe) VALUES (?, ?, ?, ?, ?, ?)`,
                [convId, 101, 'Demo Student', LOCALE.demoMessages.studentQuestion, msgTime1, 1]
            );
            // Teacher response
            await db.runAsync(
                `INSERT INTO Messages (conversationId, senderId, senderName, content, createdAt, isMe) VALUES (?, ?, ?, ?, ?, ?)`,
                [convId, 1, exam.teacherName || LOCALE.demoTeacherSuffix, lastMessage, msgTime2, 0]
            );

            convId++;
        }
    }

    console.log(`✅ Seeded ${convId - 1} conversations`);
};

// ================================================================
// MAIN EXPORT: Chỉ seed nếu chưa có data
// ================================================================
export const fakerSeedAll = async (db: SQLite.SQLiteDatabase, lang: string = 'ko') => {
    // Set locale trước khi seed
    setDemoLocale(lang);
    console.log(`🌐 Seeding demo data in language: ${lang}`);

    await seedUserAndAcademy(db);
    await seedSubjectsAndTimers(db);
    const exams = await seedExamSessionsAndQuestions(db);
    await seedChartDataForExams(db, exams);
    await seedNotes(db);
    await seedConversations(db); // Đã gộp logic vào đây
    await seedTextbooks(db);
    await seedHomeData(db);
    await seedStudyPerformance(db);

    console.log('✅ All fake data generated successfully!');
};
