import { api } from "./apiClient";
import { BASE_URL, SUPER_ADMIN_BASE_URL, AcademyHeaders } from "@/utils/constants";
import { Role } from "@/utils/enums";

const SUPER_ADMIN_ACADEMY_URL = `${SUPER_ADMIN_BASE_URL}/api/academies`;
const INVITATIONS_URL = `${BASE_URL}/api/academyInvitations`;

export const getAcademyByDomainApi = (domain: string) =>
  api.get(`${SUPER_ADMIN_ACADEMY_URL}/domain/${domain}`, {
    params: {
      role: Role.Student
    }
  });

export const acceptEmailInvitations = (domain: string, token: string) =>
  api.post(
    `${INVITATIONS_URL}/emails/accept`,
    {
      token
    },
    {
      headers: {
        [AcademyHeaders]: domain
      }
    }
  );
const ACADEMY_URL = `${BASE_URL}/api/academy`;

export const createAcademyRequestApi = (
  domain: string,
  request: { role: Role; courseId?: number },
  isSuper: boolean = false
) =>
  api.post(
    `${isSuper ? SUPER_ADMIN_ACADEMY_URL : ACADEMY_URL}/${domain}/requests`,
    request
  );

export const getAcademyRequestApi = (
  domain: string,
  role: Role,
  courseId?: number,
  isSuper: boolean = false
) =>
  api.get(
    `${isSuper ? SUPER_ADMIN_ACADEMY_URL : ACADEMY_URL}/${domain}/requests/${role}`,
    {
      params: {
        courseId
      }
    }
  );

export const switchAcademy = (academyId: number, role: Role, isLearningSpace: boolean = false) => api.post(`${ACADEMY_URL}/${academyId}/switch-academy/${role}`, undefined, { params: { isLearningSpace } });

export const switchSuperAdminAcademy = (academyId: number, role: Role) => api.post(`${SUPER_ADMIN_ACADEMY_URL}/${academyId}/switch-academy/${role}`);
