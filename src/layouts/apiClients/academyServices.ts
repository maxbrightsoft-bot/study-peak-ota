import { api } from "@/services/api/apiClient";
import { BASE_URL, NoAcademyHeaders, SUPER_ADMIN_BASE_URL } from "@/utils/constants";
import { Role } from "@/utils/enums";

const ACADEMY_URL = `${BASE_URL}/api/academy`;
const SUPER_ADMIN_ACADEMY_URL = `${SUPER_ADMIN_BASE_URL}/api/academies`;


export const getUserAcademies = (role: string, isLearningSpace: boolean) => api.get(`${ACADEMY_URL}`, {
  params: {
    role
  },
  headers: {
    [NoAcademyHeaders]: isLearningSpace
  }
});

export const getAcademyByDomainApi = (domain: string, role?: string) => api.get(`${SUPER_ADMIN_ACADEMY_URL}/domain/${domain}`, {
  params: {
    role
  }
});

export const getAcademyDetailApi = () => api.get(`${ACADEMY_URL}/detail`)


export const switchAcademy = (academyId: number, role: Role, isLearningSpace: boolean = false) => api.post(`${ACADEMY_URL}/${academyId}/switch-academy/${role}`, undefined, { params: { isLearningSpace } });

export const switchSuperAdminAcademy = (academyId: number, role: Role) => api.post(`${SUPER_ADMIN_ACADEMY_URL}/${academyId}/switch-academy/${role}`);