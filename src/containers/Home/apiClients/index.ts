import { api } from "@/services/api/apiClient";
import { BASE_URL } from "@/utils/constants";
import { NoteType } from "@/utils/enums";

const COURSE_EXAM_SESSION_URL = `${BASE_URL}/api/course/exam-sessions`;
const UNATTACHED_EXAM_SESSION_URL = `${BASE_URL}/api/course/unattached-exam-sessions`;
const EXAM_SESSION_URL = `${BASE_URL}/api/examsession`;
const LESSON_URL = `${BASE_URL}/api/lesson`;
const SOCIAL_URL = `${BASE_URL}/api/sociallink`;
const NOTIFICATION_URL = `${BASE_URL}/api/notification`;
const NOTES_URL = `${BASE_URL}/api/notes`;

export const apiJoinExam = (code: any) => api.post(`${EXAM_SESSION_URL}/${code}/join`,)
export const getExamInfoApi = (code: any) => api.get(`${EXAM_SESSION_URL}/${code}/info`,)

export const getLessonsApi = (startDate: string, endDate: string) => api.get(`${LESSON_URL}`, { params: { startDate, endDate } })

export const getCheckInLessonsApi = (lessonId: number) => api.post(`${LESSON_URL}/${lessonId}`)

export const getListSocialLinkApi = () => api.get(`${SOCIAL_URL}`)

export const getListNotificationApi = (query: any) => api.get(`${NOTIFICATION_URL}`, { params: query })

export const getListNotificationByIdApi = (id: number) => api.get(`${NOTIFICATION_URL}/${id}`)

export const getInfoAcademyApi = (startDate: string, endDate: string) => api.get(`${LESSON_URL}/total-count`, { params: { startDate, endDate } })

export const getListNoteApi = (query: any) => api.get(`${NOTES_URL}`, {
    params: {
        ...query,
        type: NoteType.ToStudent
    }
})
export const getNoteByIdApi = (id: number) => api.get(`${NOTES_URL}/${id}`)

export const getListExamApi = (query: any) =>
    api.get(`${COURSE_EXAM_SESSION_URL}`, {
        params: {
            ...query,
        }
    })

export const getUnattachedExamApi = (query?: any) =>
    api.get(`${UNATTACHED_EXAM_SESSION_URL}`, {
        params: {
            ...query,
        }
    })

export const joinExamApi = (examCode: string) => api.post(`${EXAM_SESSION_URL}/${examCode}/join`);

