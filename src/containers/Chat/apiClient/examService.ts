import { api } from "@/services/api/apiClient";
import { BASE_URL } from "@/utils/constants";
import { ExamStatus, OrderBy, Role } from "@/utils/enums";
import { getIdLinkAccount } from "@/utils/helpers";

const EXAM_URL = `${BASE_URL}/api/examsession`;
const COURSE_URL = `${BASE_URL}/api/course`;

export const getListExamByCourseApi = ({
  courseId
}: {
  courseId?: string;
}) => {
  const idLinkAccount = getIdLinkAccount();
  return api.get(`${EXAM_URL}`, {
    params: {
      courseId: courseId || undefined,
      currentPage: 1,
      pageSize: -1,
      sortColumnName: "ExamSession.StartTime",
      sortColumnDirection: OrderBy.DESC,
      statuses: [ExamStatus.Completed],
      ...(idLinkAccount ? { idLinkAccount } : {})
    }
  });
};

export const getListQuestionByExamApi = ({ id }: { id: string }) => {
  const idLinkAccount = getIdLinkAccount();
  return api.get(`${EXAM_URL}/${id}/exam-questions`, {
    params: {
      sortColumnName: "QuestionOrder",
      sortColumnDirection: "ASC",
      ...(idLinkAccount ? { idLinkAccount } : {})
    }
  });
};

export const getListCourseByStudentApi = ({
  studentId
}: {
  studentId?: number;
}) => {
  const idLinkAccount = getIdLinkAccount();
  return api.get(`${COURSE_URL}`, {
    params: {
      roles: Role.Student,
      studentId,
      ...(idLinkAccount ? { idLinkAccount } : {})
    }
  });
};

export const createConversationApi = (data: any) =>
  api.post(`${BASE_URL}/api/conversation`, data);
