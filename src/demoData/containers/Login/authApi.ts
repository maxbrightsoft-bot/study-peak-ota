import { getDb } from '../../database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACADEMY_DOMAIN, LEARNING_SPACE } from '@/utils/constants';

// --- Login / Auth Mock APIs ---

const parseUser = (row: any) => {
    if (!row) return null;
    return {
        id: row.id,
        fullName: row.fullName,
        email: row.email,
        grade: row.grade,
        gradeYear: row.gradeYear,
        phoneNumber: row.phoneNumber || "",
        schoolName: row.schoolName || "",
        academyDomain: row.academyDomain || "",
        avatar: row.avatar || "",
        parentName: row.parentName || "",
        parentPhoneNumber: row.parentPhoneNumber || "",
        major: row.major || "",
        isLearningSpace: row.isLearningSpace === 1,
        isNotEnoughStatements: false,
        superId: row.superId || 0,
        loginMethod: row.loginMethod || "demo",
        classes: row.classesJson ? JSON.parse(row.classesJson) : [],
        roles: row.rolesJson ? JSON.parse(row.rolesJson) : ["Student"],
    };
};

const applyCurrentSpace = async (user: ReturnType<typeof parseUser>) => {
    if (!user) return user;

    const academyDomain = await AsyncStorage.getItem(ACADEMY_DOMAIN);
    const isLearningSpace = !!(await AsyncStorage.getItem(LEARNING_SPACE));

    return {
        ...user,
        academyDomain: academyDomain || '',
        isLearningSpace,
    };
};

export const loginDemoMock = async () => {
    const database = await getDb();
    const row = await database.getFirstAsync('SELECT * FROM DemoUser LIMIT 1');
    const user = await applyCurrentSpace(parseUser(row));
    return {
        token: (row as any)?.token || "demo-token-123",
        ...(user || {}),
    };
};

export const getInfoMock = async () => {
    const database = await getDb();
    const row = await database.getFirstAsync('SELECT * FROM DemoUser LIMIT 1');
    return applyCurrentSpace(parseUser(row));
};

export const getAcademiesMock = async () => {
    const database = await getDb();
    const academies = await database.getAllAsync('SELECT * FROM Academies');
    return (academies as any[]).map(a => ({
        id: a.id,
        domain: a.domain,
        name: a.name,
        logoUrl: a.logoUrl || "",
    }));
};

export const getCoursesMock = async () => {
    const database = await getDb();
    const courses = await database.getAllAsync('SELECT * FROM Courses');
    return {
        items: (courses as any[]).map(c => ({
            id: c.id,
            name: c.name,
            academyId: c.academyId,
            teacherName: c.teacherName,
        })),
        totalCount: (courses as any[]).length,
    };
};

export const updateInfoLoginMock = async (_body: any) => {
    return { success: true };
};

export const checkInfoApiMock = async (_body: any, _step: number) => {
    return { success: true, isValid: true };
};

export const forgotPasswordMock = async (_email: string) => {
    return { success: true, message: "Demo mode: password reset email sent" };
};

export const removeAccountMock = async () => {
    return { success: true };
};

export const getConsentStatusMock = async () => {
    return { privacyPolicyAgreed: true, termsOfServiceAgreed: true, version: "1.0" };
};

export const agreeConsentMock = async (_version: string) => {
    return { success: true };
};

export const getTimeMock = async () => {
    return { serverTime: Date.now() };
};
