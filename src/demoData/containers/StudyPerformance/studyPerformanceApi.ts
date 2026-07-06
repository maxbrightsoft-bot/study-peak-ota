import { getDb } from '../../database';

// --- StudyPerformance Mock APIs ---

/**
 * getDataApi → DataResponse { pData: number[], sData: number[], totalTime?: number }
 * pData/sData là mảng giá trị thời gian (ms) hoặc số câu, mỗi phần tử tương ứng 1 khoảng thời gian
 * (7 phần tử cho tuần, 4-5 cho tháng, 12 cho năm, 8 cho ngày)
 */
// Hash một timestamp thành giá trị ổn định trong [min, max]
const hashToRange = (ts: number, salt: number, min: number, max: number): number => {
    const h = ((ts ^ (ts >> 16)) * 0x45d9f3b + salt) & 0xffffffff;
    return min + (Math.abs(h) % (max - min + 1));
};

// Màu sắc cố định cho các subject
const SUBJECT_COLORS = ['#6C63FF', '#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];

export const getStudyPerformanceDataMock = async (_isSuperAdmin: boolean, data: any) => {
    // pTimes[0..n-2] = start timestamps, pTimes[n-1] = end timestamp
    const pTimes: number[] = data?.pTimes ?? [];
    const buckets = pTimes.length > 1 ? pTimes.slice(0, -1) : pTimes;

    const pData = buckets.map((ts, i) => {
        const duration = pTimes.length > 1 ? pTimes[i+1] - ts : 86400000;
        return hashToRange(ts, 1, duration * 0.02, duration * 0.10);
    });
    const sData = buckets.map((ts, i) => {
        const duration = pTimes.length > 1 ? pTimes[i+1] - ts : 86400000;
        return hashToRange(ts, 2, duration * 0.015, duration * 0.08);
    });

    return { pData, sData, totalTime: pData.reduce((a, b) => a + b, 0) };
};

export const getSubjectDataMock = async (_isSuperAdmin: boolean, data: any) => {
    const database = await getDb();
    const subjects = await database.getAllAsync('SELECT * FROM Subjects ORDER BY sortOrder ASC') as any[];
    const pTimes: number[] = data?.pTimes ?? [];
    const sTimes: number[] = data?.sTimes ?? [];
    const pBuckets = pTimes.length > 1 ? pTimes.slice(0, -1) : pTimes;
    const sBuckets = sTimes.length > 1 ? sTimes.slice(0, -1) : sTimes;

    // Dùng subject index * 1000003 (số nguyên tố) để tạo phân tán lớn
    const subjectSeed = (si: number) => (si + 1) * 1000003;

    const pData = subjects.map((s, si) => {
        const seed = subjectSeed(si);
        if (pBuckets.length === 0) return hashToRange(seed, s.id, 1800000, 7200000);
        return pBuckets.reduce((sum, ts, i) => {
            const duration = pTimes[i+1] - ts;
            return sum + hashToRange(Math.floor(ts / 86400000) * 1000 + seed, s.id + 7, duration * 0.02, duration * 0.10);
        }, 0);
    });
    const sData = subjects.map((s, si) => {
        const seed = subjectSeed(si) + 500000;
        if (sBuckets.length === 0) return hashToRange(seed, s.id + 13, 900000, 4800000);
        return sBuckets.reduce((sum, ts, i) => {
            const duration = sTimes[i+1] - ts;
            return sum + hashToRange(Math.floor(ts / 86400000) * 1000 + seed, s.id + 19, duration * 0.015, duration * 0.08);
        }, 0);
    });

    return {
        pData,
        sData,
        subjects: subjects.map((s, idx) => ({ id: s.id, name: s.name, color: SUBJECT_COLORS[idx % SUBJECT_COLORS.length] })),
        totalTime: pData.reduce((a, b) => a + b, 0),
    };
};

export const getQuestionDataMock = async (_id: number, data: any) => {
    const pTimes: number[] = data?.pTimes ?? [];
    const buckets = pTimes.length > 1 ? pTimes.slice(0, -1) : pTimes;

    const pData = buckets.map((ts, i) => {
        const duration = pTimes.length > 1 ? pTimes[i+1] - ts : 86400000;
        const qRate = duration / 86400000;
        return hashToRange(ts, 3, Math.max(1, 5 * qRate), Math.max(2, 30 * qRate));
    });
    const sData = buckets.map((ts, i) => {
        const duration = pTimes.length > 1 ? pTimes[i+1] - ts : 86400000;
        const qRate = duration / 86400000;
        return hashToRange(ts, 4, Math.max(1, 3 * qRate), Math.max(2, 20 * qRate));
    });

    return { pData, sData, correctRate: 74.7, sCorrectRate: 70.2 };
};

export const getSubjectListMock = async (_isSuperAdmin: boolean) => {
    const database = await getDb();
    const subjects = await database.getAllAsync('SELECT * FROM Subjects ORDER BY sortOrder ASC') as any[];
    return {
        items: subjects.map((s, idx) => ({
            id: s.id,
            name: s.name,
            isShowTimer: true,
            sortOrder: s.sortOrder,
            superId: 0,
            totalCategories: 3,
            audioUrls: [],
            color: SUBJECT_COLORS[idx % SUBJECT_COLORS.length],
        })),
        totalCount: subjects.length,
    };
};

export const getRankingDataMock = async (_isSuperAdmin: boolean, _data: any) => {
    return {
        myRanking: { fullName: "김민준", grade: 10, gradeYear: 2026, rank: 3, schoolName: "서울고등학교", userId: 101, totalTime: 19200000 },
        myCumulativeRanking: { fullName: "김민준", grade: 10, gradeYear: 2026, rank: 3, schoolName: "서울고등학교", userId: 101, totalTime: 86400000 },
        topStudents: [
            { fullName: "이서준", grade: 10, rank: 1, schoolName: "강남고", userId: 1, totalTime: 28800000 },
            { fullName: "박지민", grade: 10, rank: 2, schoolName: "서초고", userId: 2, totalTime: 25200000 },
            { fullName: "김민준", grade: 10, rank: 3, schoolName: "서울고등학교", userId: 101, totalTime: 19200000 },
            { fullName: "최예은", grade: 10, rank: 4, schoolName: "송파고", userId: 3, totalTime: 18000000 },
            { fullName: "정하늘", grade: 10, rank: 5, schoolName: "관악고", userId: 4, totalTime: 14400000 },
        ],
        topCumulativeStudents: [
            { fullName: "이서준", grade: 10, rank: 1, schoolName: "강남고", userId: 1, totalTime: 108000000 },
            { fullName: "박지민", grade: 10, rank: 2, schoolName: "서초고", userId: 2, totalTime: 97200000 },
            { fullName: "김민준", grade: 10, rank: 3, schoolName: "서울고등학교", userId: 101, totalTime: 86400000 },
        ],
    };
};

/**
 * getQuestionSubjectDataApi → SubjectDataQuestionResponse
 */
export const getQuestionSubjectDataMock = async (subjectId: number, data: any) => {
    const database = await getDb();
    const pTimes: number[] = data?.pTimes ?? [];
    const sTimes: number[] = data?.sTimes ?? [];
    // Seed = timestamp đầu tiên của period, đổi về đơn vị ngày để tránh overflow
    const pSeed = pTimes.length > 0 ? Math.floor(pTimes[0] / 86400000) : 1;
    const sSeed = sTimes.length > 0 ? Math.floor(sTimes[0] / 86400000) : 0;

    // Đọc categories từ DB theo subject (join qua subjectName)
    const rows = await database.getAllAsync(
        `SELECT DISTINCT q.categoryName FROM ExamQuestions q
         JOIN ExamSessions s ON q.examSessionCode = s.code
         JOIN Subjects sub ON sub.name = s.subjectName
         WHERE sub.id = ?
         LIMIT 5`,
        [subjectId]
    ) as any[];

    // Fallback nếu không có data trong DB
    const categories = rows.length > 0
        ? rows.map((r, i) => ({ id: i + 1, name: r.categoryName, path: `subject/${r.categoryName}` }))
        : [
            { id: 1, name: 'Category A', path: 'subject/A' },
            { id: 2, name: 'Category B', path: 'subject/B' },
            { id: 3, name: 'Category C', path: 'subject/C' },
        ];

    const makeQuestionData = (seed: number, catIdx: number) => {
        const total = hashToRange(seed * 1000 + catIdx * 97 + 1, catIdx + 3, 10, 40);
        const correct = hashToRange(seed * 1000 + catIdx * 97 + 2, catIdx + 7, Math.floor(total * 0.4), total);
        return {
            correctRate: Math.round((correct / total) * 1000) / 10,
            totalAnsweredQuestions: total,
            totalCorrectQuestions: correct,
        };
    };

    const pData = categories.map((_, i) => makeQuestionData(pSeed, i));
    const sData = categories.map((_, i) => makeQuestionData(sSeed, i + 50));
    const totalAnswered = pData.reduce((s, d) => s + d.totalAnsweredQuestions, 0);
    const totalCorrect = pData.reduce((s, d) => s + d.totalCorrectQuestions, 0);

    return {
        pData,
        sData,
        categories,
        totalCorrectRate: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 1000) / 10 : 0,
        totalAnsweredQuestions: totalAnswered,
    };
};

/**
 * getQuestionRankingDataApi → RankingDataResponse
 */
export const getQuestionRankingDataMock = async (_data: any) => {
    return {
        myRanking: { fullName: "김민준", grade: 10, rank: 3, schoolName: "서울고등학교", userId: 101, correctRate: 74.7, totalAnsweredQuestions: 150, totalCorrectQuestions: 112 },
        myCumulativeRanking: { fullName: "김민준", grade: 10, rank: 2, schoolName: "서울고등학교", userId: 101, correctRate: 78.5, totalAnsweredQuestions: 450, totalCorrectQuestions: 353 },
        topStudents: [
            { fullName: "이서준", grade: 10, rank: 1, schoolName: "강남고", userId: 1, correctRate: 88.0, totalAnsweredQuestions: 200, totalCorrectQuestions: 176 },
            { fullName: "박지민", grade: 10, rank: 2, schoolName: "서초고", userId: 2, correctRate: 82.5, totalAnsweredQuestions: 180, totalCorrectQuestions: 149 },
            { fullName: "김민준", grade: 10, rank: 3, schoolName: "서울고등학교", userId: 101, correctRate: 74.7, totalAnsweredQuestions: 150, totalCorrectQuestions: 112 },
        ],
        topCumulativeStudents: [
            { fullName: "이서준", grade: 10, rank: 1, schoolName: "강남고", userId: 1, correctRate: 90.0, totalAnsweredQuestions: 500, totalCorrectQuestions: 450 },
            { fullName: "김민준", grade: 10, rank: 2, schoolName: "서울고등학교", userId: 101, correctRate: 78.5, totalAnsweredQuestions: 450, totalCorrectQuestions: 353 },
        ],
    };
};

/**
 * getQuestionOverallDataApi → QuestionAnswerOverallResponse
 */
export const getQuestionOverallDataMock = async (_data: any) => {
    return {
        myData: { totalAnsweredQuestions: 150, totalCorrectQuestions: 112, correctRate: 74.7 },
        avgData: { totalAnsweredQuestions: 130, totalCorrectQuestions: 91, correctRate: 70.0 },
    };
};

const getDemoCategoryLabels = async (subjectId: number) => {
    const database = await getDb();
    const rows = await database.getAllAsync(
        `SELECT DISTINCT q.categoryName FROM ExamQuestions q
         JOIN ExamSessions s ON q.examSessionCode = s.code
         JOIN Subjects sub ON sub.name = s.subjectName
         WHERE sub.id = ?
         LIMIT 8`,
        [subjectId]
    ) as any[];

    const names = rows.length > 0
        ? rows.map((r) => r.categoryName)
        : ['Core concept', 'Application', 'Calculation', 'Graph reading', 'Word problem'];

    return names.map((name, idx) => ({
        categoryId: idx + 1,
        categoryName: name,
        subCategoryName: `${name} ${idx + 1}`,
        questionTypeName: `${name} type`,
    }));
};

export const getPerformanceSummaryMock = async (subjectId: number, data: any) => {
    const labels = await getDemoCategoryLabels(subjectId);
    const todayAccuracy = hashToRange(subjectId * 101, 1, 62, 91);
    const solved = hashToRange(subjectId * 101, 2, 8, 34);
    const correct = Math.round(solved * todayAccuracy / 100);
    const weekStart = Date.now() - 6 * 86400000;

    return {
        today: {
            accuracy: todayAccuracy,
            delta: hashToRange(subjectId * 101, 3, 1, 9),
            isDeltaUp: subjectId % 2 === 0,
            solved,
            correct,
            wrong: solved - correct,
            streak: hashToRange(subjectId * 101, 4, 2, 11),
        },
        period: {
            solvedCount: hashToRange(subjectId * 103, 1, 120, 320),
            avgAccuracy: hashToRange(subjectId * 103, 2, 58, 86),
            delta: hashToRange(subjectId * 105, 3, -15, 12),
            goalAccuracy: 80,
            weakestType: { ...labels[0], accuracy: hashToRange(subjectId, 3, 32, 55) },
            strongestCategory: { ...labels[1], accuracy: hashToRange(subjectId, 4, 78, 96), sampleSizeWarning: false },
        },
        strengths: labels.slice(1, 4).map((label, idx) => ({ ...label, accuracy: 80 + idx * 4 })),
        weekDaysActive: 5,
        weekActivity: Array.from({ length: 7 }, (_, idx) => ({
            timestamp: weekStart + idx * 86400000,
            level: idx === 1 ? 0 : ((idx % 3) + 1),
            today: idx === 6,
        })),
        weekTotalProblems: hashToRange(subjectId * 107, 1, 45, 120),
        weekTotalTime: hashToRange(subjectId * 107, 2, 3600000, 10800000),
    };
};

export const getPerformanceAnalysisMock = async (subjectId: number, data: any) => {
    const labels = await getDemoCategoryLabels(subjectId);
    const pTimes: number[] = data?.pTimes ?? [];
    const buckets = pTimes.length > 1 ? pTimes.slice(0, -1) : Array.from({ length: 4 }, (_, i) => Date.now() - (3 - i) * 7 * 86400000);

    return {
        achievementChart: buckets.slice(0, 6).map((timestamp, idx) => ({
            timestamp,
            student: hashToRange(Math.floor(timestamp / 86400000), subjectId + idx, 12, 58),
            classAvg: hashToRange(Math.floor(timestamp / 86400000), subjectId + idx + 20, 18, 52),
        })),
        mainCategoryDistribution: labels.slice(0, 5).map((label, idx) => ({
            ...label,
            percentage: [32, 24, 18, 15, 11][idx] || 10,
            accuracy: hashToRange(subjectId * 113, idx, 48, 92),
            solved: hashToRange(subjectId * 117, idx, 10, 50),
        })),
        subCategoryAccuracy: labels.slice(0, 6).map((label, idx) => {
            const accuracy = hashToRange(subjectId * 127, idx, 35, 94);
            return {
                ...label,
                accuracy,
                solved: hashToRange(subjectId * 131, idx, 5, 28),
                total: hashToRange(subjectId * 137, idx, 18, 46),
                status: accuracy < 50 ? 'red' : accuracy < 70 ? 'orange' : 'green',
                delta: hashToRange(subjectId * 139, idx, -8, 11),
                sampleSizeWarning: idx === 4,
            };
        }),
        tipText: labels[0]?.subCategoryName,
        peer: {
            studentAccuracy: hashToRange(subjectId * 149, 1, 55, 88),
            totalAvgAccuracy: hashToRange(subjectId * 149, 2, 58, 82),
        },
    };
};

export const getPerformanceWeaknessMock = async (subjectId: number, _data: any) => {
    const labels = await getDemoCategoryLabels(subjectId);
    const rows = labels.map((label, idx) => {
        const count = hashToRange(subjectId * 151, idx, 8, 36);
        const accuracy = hashToRange(subjectId * 157, idx, 24, 72);
        return {
            ...label,
            tags: [label.categoryName, label.subCategoryName].filter(Boolean),
            correct: Math.round(count * accuracy / 100),
            total: count,
            count,
            accuracy,
            delta: hashToRange(subjectId * 163, idx, -12, 8),
            timestamp: Date.now() - idx * 86400000,
        };
    }).sort((a, b) => a.accuracy - b.accuracy);

    return {
        topWeaknesses: rows.slice(0, 5),
        allTypes: rows,
    };
};
