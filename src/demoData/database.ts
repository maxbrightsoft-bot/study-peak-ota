import * as SQLite from 'expo-sqlite';

const DEFAULT_DEMO_LANGUAGE = 'ko';

const dbByLanguage = new Map<string, SQLite.SQLiteDatabase>();
const dbOpenPromises = new Map<string, Promise<SQLite.SQLiteDatabase>>();
let activeDbLanguage = DEFAULT_DEMO_LANGUAGE;

export const getActiveDbLanguage = () => activeDbLanguage;

const normalizeDemoLanguage = (lang: string = DEFAULT_DEMO_LANGUAGE) =>
    (lang || DEFAULT_DEMO_LANGUAGE).toLowerCase().replace(/[^a-z0-9_-]/g, '_');

const getDemoDatabaseName = (lang: string = DEFAULT_DEMO_LANGUAGE) =>
    `touchstudy_demo_${normalizeDemoLanguage(lang)}.db`;

export const getDb = async (lang?: string): Promise<SQLite.SQLiteDatabase> => {
    const dbLanguage = normalizeDemoLanguage(lang ?? activeDbLanguage);
    activeDbLanguage = dbLanguage;

    const cachedDb = dbByLanguage.get(dbLanguage);
    if (cachedDb) return cachedDb;

    const cachedPromise = dbOpenPromises.get(dbLanguage);
    if (cachedPromise) return cachedPromise;

    const openPromise = SQLite.openDatabaseAsync(getDemoDatabaseName(dbLanguage))
        .then(d => {
            dbByLanguage.set(dbLanguage, d);
            return d;
        })
        .finally(() => {
            dbOpenPromises.delete(dbLanguage);
        });

    dbOpenPromises.set(dbLanguage, openPromise);
    return openPromise;
};

const SCHEMA_VERSION = 11; // v8: Add id to LONG_TIME_SPEND chart data
const DEMO_SEED_VERSION = 'faker-seed-v7-limit-chat';
const DEMO_TABLES = [
    'DemoUser', 'Subjects', 'SubjectTimers', 'ExamSessions', 'ExamQuestionGroups',
    'ExamQuestions', 'ChartData', 'Notes', 'Textbooks', 'TextbookSessions',
    'TextbookQuestions', 'Schedules', 'Notifications', 'Lessons', 'StudyPerformanceData',
    'StudentExamHistory', 'Academies', 'Courses', 'Conversations'
];
const META_SEED_LANGUAGE_KEY = 'seedLanguage';
const META_SEED_VERSION_KEY = 'seedVersion';
const META_SEED_STATUS_KEY = 'seedStatus';
const META_SEED_DATE_KEY = 'seedDate';
const SEED_STATUS_COMPLETE = 'complete';

const quoteIdentifier = (name: string) => `"${name.replace(/"/g, '""')}"`;

export const initDemoDatabase = async (lang: string = 'ko') => {
    try {
        const database = await getDb(lang);

        await prepareDemoSchema(database);

        if (await shouldSeedDemoData(database, lang)) {
            await database.withExclusiveTransactionAsync(async (txn) => {
                await clearDemoTables(txn);
                await seedAllData(txn, lang);
                await setMetaValue(txn, META_SEED_LANGUAGE_KEY, normalizeDemoLanguage(lang));
                await setMetaValue(txn, META_SEED_VERSION_KEY, DEMO_SEED_VERSION);
                await setMetaValue(txn, META_SEED_STATUS_KEY, SEED_STATUS_COMPLETE);
                await setMetaValue(txn, META_SEED_DATE_KEY, new Date().toISOString().split('T')[0]);
            });
        }

        console.log("Demo database ready");
    } catch (error) {
        console.error("Error initializing demo database", error);
        throw error;
    }
};

const prepareDemoSchema = async (database: SQLite.SQLiteDatabase) => {
    const versionRow = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const currentVersion = versionRow?.user_version || 0;

    if (SCHEMA_VERSION !== currentVersion) {
        console.log(`Schema changed (v${currentVersion} -> v${SCHEMA_VERSION}), resetting database...`);
        const tables = await database.getAllAsync<{ name: string }>(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        );

        for (const table of tables) {
            await database.execAsync(`DROP TABLE IF EXISTS ${quoteIdentifier(table.name)};`);
        }

        await database.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
    }

    await createTables(database);
};

const clearDemoTables = async (database: SQLite.SQLiteDatabase) => {
    for (const table of DEMO_TABLES) {
        await database.execAsync(`DELETE FROM ${quoteIdentifier(table)};`);
    }
};

const shouldSeedDemoData = async (database: SQLite.SQLiteDatabase, lang: string) => {
    const seedLanguage = await getMetaValue(database, META_SEED_LANGUAGE_KEY);
    const seedVersion = await getMetaValue(database, META_SEED_VERSION_KEY);
    const seedStatus = await getMetaValue(database, META_SEED_STATUS_KEY);
    const seedDate = await getMetaValue(database, META_SEED_DATE_KEY);
    const currentDate = new Date().toISOString().split('T')[0];

    return seedStatus !== SEED_STATUS_COMPLETE
        || seedVersion !== DEMO_SEED_VERSION
        || seedLanguage !== normalizeDemoLanguage(lang)
        || seedDate !== currentDate;
};

const getMetaValue = async (database: SQLite.SQLiteDatabase, key: string) => {
    const row = await database.getFirstAsync<{ value: string }>(
        'SELECT value FROM DemoMeta WHERE key = ?',
        [key]
    );
    return row?.value ?? null;
};

const setMetaValue = async (database: SQLite.SQLiteDatabase, key: string, value: string) => {
    await database.runAsync(
        'INSERT OR REPLACE INTO DemoMeta (key, value) VALUES (?, ?)',
        [key, value]
    );
};

const createTables = async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS DemoMeta (
            key TEXT PRIMARY KEY, value TEXT
        );
        CREATE TABLE IF NOT EXISTS DemoUser (
            id INTEGER PRIMARY KEY, fullName TEXT, email TEXT, grade INTEGER, gradeYear INTEGER,
            phoneNumber TEXT, schoolName TEXT, academyDomain TEXT, token TEXT,
            avatar TEXT, parentName TEXT, parentPhoneNumber TEXT, major TEXT,
            isLearningSpace INTEGER DEFAULT 0, superId INTEGER DEFAULT 0,
            loginMethod TEXT DEFAULT 'demo', classesJson TEXT, rolesJson TEXT
        );
        CREATE TABLE IF NOT EXISTS Subjects (
            id INTEGER PRIMARY KEY, name TEXT, sortOrder INTEGER
        );
        CREATE TABLE IF NOT EXISTS SubjectTimers (
            id INTEGER PRIMARY KEY AUTOINCREMENT, subjectId INTEGER, timerId INTEGER, subjectName TEXT,
            status INTEGER DEFAULT 0, duration INTEGER DEFAULT 0, startTime TEXT, lastResumeTime TEXT,
            lastPauseTime TEXT, rowVersion TEXT, limitedTime INTEGER DEFAULT 0,
            limitedTimeReached INTEGER DEFAULT 0, audioUrlsJson TEXT
        );
        CREATE TABLE IF NOT EXISTS ExamSessions (
            id INTEGER PRIMARY KEY, code TEXT UNIQUE, title TEXT, subjectName TEXT, status INTEGER,
            score REAL, totalScore REAL, startTime TEXT, finishTime TEXT, duration TEXT,
            questionCount INTEGER, type INTEGER, isLate INTEGER DEFAULT 0, attemptNumber INTEGER DEFAULT 1,
            studentExamSessionId INTEGER, totalStudentsJoined INTEGER DEFAULT 1, teacherName TEXT,
            teacherAvatar TEXT, coursesJson TEXT, rowVersion TEXT, numberOfQuestion INTEGER,
            startTimeSession TEXT, studentStartTime TEXT, lastAnswerTime TEXT, lastPausedAt TEXT,
            lastResumedAt TEXT, totalPausedTime INTEGER DEFAULT 0, runningTime INTEGER DEFAULT 0,
            totalAnsweredTime INTEGER DEFAULT 0, studentName TEXT
        );
        CREATE TABLE IF NOT EXISTS ExamQuestionGroups (
            id INTEGER PRIMARY KEY, examSessionCode TEXT, articlesJson TEXT
        );
        CREATE TABLE IF NOT EXISTS ExamQuestions (
            id INTEGER PRIMARY KEY, examSessionCode TEXT, questionGroupId INTEGER, questionOrder INTEGER,
            answerCount INTEGER DEFAULT 5, isCorrect INTEGER, score REAL, isStar INTEGER DEFAULT 0,
            categoryName TEXT, parentQuestionId INTEGER, parentQuestionOrder INTEGER,
            questionGroupIndex INTEGER, selectedAnswersJson TEXT, correctAnswersJson TEXT,
            correctTextualAnswersJson TEXT, textualAnswersJson TEXT, duration REAL, topDuration REAL,
            overallCorrectRate REAL, skipRate REAL, questionAnswerType INTEGER DEFAULT 0,
            questionTypeCategoriesJson TEXT, answerResponseSignal INTEGER, answerTime TEXT,
            classAverageTime REAL, problemCategoriesJson TEXT, unitText TEXT
        );
        CREATE TABLE IF NOT EXISTS ChartData (
            id INTEGER PRIMARY KEY AUTOINCREMENT, examSessionCode TEXT, chartType TEXT, dataJson TEXT
        );
        CREATE TABLE IF NOT EXISTS Notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT, title TEXT, subjectName TEXT,
            categoryName TEXT, questionTypeName TEXT, examType INTEGER, createdAt TEXT, score INTEGER,
            isOwned INTEGER DEFAULT 1, isStudentNote INTEGER DEFAULT 1, hasIncorrectOrImage INTEGER DEFAULT 0,
            imageUrl TEXT, questionId INTEGER, parentQuestionId INTEGER, questionOrder INTEGER,
            parentQuestionOrder INTEGER, questionGroupIndex INTEGER, examSessionId INTEGER,
            senderJson TEXT, receiverJson TEXT, receiversJson TEXT, mentionUsersJson TEXT,
            totalUsers INTEGER DEFAULT 0, isMentionAll INTEGER DEFAULT 0, type INTEGER DEFAULT 0, page INTEGER
        );
        CREATE TABLE IF NOT EXISTS Textbooks (
            id INTEGER PRIMARY KEY, name TEXT, subjectName TEXT, coverImage TEXT, totalQuestions INTEGER,
            completedQuestions INTEGER DEFAULT 0, isStudying INTEGER DEFAULT 0, totalAnswerTime INTEGER DEFAULT 0,
            dataJson TEXT
        );
        CREATE TABLE IF NOT EXISTS TextbookSessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT, textbookId INTEGER, status INTEGER DEFAULT 0,
            currentPage INTEGER DEFAULT 1, dataJson TEXT
        );
        CREATE TABLE IF NOT EXISTS TextbookQuestions (
            id INTEGER PRIMARY KEY AUTOINCREMENT, textbookId INTEGER, chapterId INTEGER,
            sessionId INTEGER, questionOrder INTEGER, questionGroupIndex INTEGER DEFAULT 0,
            isCorrect INTEGER, score REAL, duration REAL, topDuration REAL,
            overallCorrectRate REAL, skipRate REAL, classAverageTime REAL,
            answerResponseSignal TEXT, questionAnswerType INTEGER DEFAULT 0,
            selectedAnswersJson TEXT, correctAnswersJson TEXT,
            correctTextualAnswersJson TEXT, textualAnswersJson TEXT,
            questionTypeCategoriesJson TEXT, categoriesJson TEXT,
            categoryName TEXT, answerTime TEXT,
            parentQuestionId INTEGER DEFAULT 0, parentQuestionOrder INTEGER DEFAULT 0,
            questionGroupId INTEGER DEFAULT 0, isStar INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS Schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, startDate TEXT,
            endDate TEXT, status INTEGER DEFAULT 0, subjectName TEXT, color TEXT
        );
        CREATE TABLE IF NOT EXISTS Notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, createdAt TEXT,
            isRead INTEGER DEFAULT 0, type INTEGER DEFAULT 0, dataJson TEXT
        );
        CREATE TABLE IF NOT EXISTS Lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, startTime TEXT, endTime TEXT,
            subjectName TEXT, status INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS StudyPerformanceData (
            id INTEGER PRIMARY KEY AUTOINCREMENT, chartType TEXT, subjectId INTEGER, dataJson TEXT
        );
        CREATE TABLE IF NOT EXISTS StudentExamHistory (
            id INTEGER PRIMARY KEY AUTOINCREMENT, examSessionId INTEGER, examSessionCode TEXT,
            studentExamSessionId INTEGER, score REAL, totalScore REAL, startTime TEXT, finishTime TEXT,
            attemptNumber INTEGER, isSelected INTEGER DEFAULT 0, isHidden INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS Academies (
            id INTEGER PRIMARY KEY AUTOINCREMENT, domain TEXT, name TEXT, logoUrl TEXT
        );
        CREATE TABLE IF NOT EXISTS Courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, academyId INTEGER, teacherName TEXT
        );
        CREATE TABLE IF NOT EXISTS Conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            examSessionId INTEGER, examTitle TEXT, subjectName TEXT, studentId INTEGER DEFAULT 101,
            teacherId INTEGER DEFAULT 1, teacherName TEXT, teacherAvatar TEXT,
            courseId INTEGER DEFAULT 1, courseName TEXT DEFAULT '데모 과정',
            questionId INTEGER, questionTitle TEXT, questionOrder INTEGER DEFAULT 0,
            isCompleted INTEGER DEFAULT 0, completedAt TEXT,
            totalUnReadMessage INTEGER DEFAULT 0, lastMessage TEXT,
            examId INTEGER, duration TEXT, startTime TEXT, examCreatedAt TEXT, createdAt TEXT,
            score REAL, totalScore REAL, attemptNumber INTEGER DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS Messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversationId INTEGER,
            senderId INTEGER,
            senderName TEXT,
            content TEXT,
            createdAt TEXT,
            isMe INTEGER DEFAULT 0
        );
    `);
};

// ===== Faker-based unified seed =====
import { fakerSeedAll } from './seedData/fakerSeed';

const seedAllData = async (db: SQLite.SQLiteDatabase, lang: string = 'ko') => {
    await fakerSeedAll(db, lang);
};

export const resetDemoDatabase = async (lang: string = 'ko') => {
    const database = await getDb(lang);
    await prepareDemoSchema(database);

    await database.withExclusiveTransactionAsync(async (txn) => {
        await clearDemoTables(txn);
        await seedAllData(txn, lang);
        await setMetaValue(txn, META_SEED_LANGUAGE_KEY, normalizeDemoLanguage(lang));
        await setMetaValue(txn, META_SEED_VERSION_KEY, DEMO_SEED_VERSION);
        await setMetaValue(txn, META_SEED_STATUS_KEY, SEED_STATUS_COMPLETE);
        await setMetaValue(txn, META_SEED_DATE_KEY, new Date().toISOString().split('T')[0]);
    });

    console.log(`Demo database reset (lang: ${lang})`);
};
