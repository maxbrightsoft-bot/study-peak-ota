import { api } from "@/services/api/apiClient";
import { BASE_URL } from "@/utils/constants";
import { Role } from "@/utils/enums";

const EXAM_URL = `${BASE_URL}/api/examsession`;
const COURSE_URL = `${BASE_URL}/api/course`;

export const getListExamByCourseApi = ({
  courseId
}: {
  courseId: string;
}) =>
  api.get(`${EXAM_URL}`, {
    params: {
      roles: Role.Student,
      courseId,
      currentPage: 1,
      pageSize: 10
    }
  });

export const getListQuestionByExamApi = ({ id }: { id: string }) =>
  api.get(`${EXAM_URL}/${id}/exam-questions`, {
    params: {
      sortColumnName: "QuestionOrder",
      sortColumnDirection: "ASC"
    }
  });

export const getListCourseByStudentApi = ({
  studentId
}: {
  studentId: number;
}) => api.get(`${COURSE_URL}`, { params: { roles: Role.Student, studentId } });

export const createConversationApi = (data: any) =>
  api.post(`${BASE_URL}/api/conversation`, data);
