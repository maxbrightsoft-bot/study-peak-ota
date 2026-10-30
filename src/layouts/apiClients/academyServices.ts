import { api } from "@/services/api/apiClient";
import { BASE_URL, NoAcademyHeaders, SUPER_ADMIN_BASE_URL } from "@/utils/constants";
import { Role } from "@/utils/enums";
import useAuthStore from "@/store/useAuthStore";
import { getDataStorage } from "@/utils/storage";

const ACADEMY_URL = `${BASE_URL}/api/academy`;
const SUPER_ADMIN_ACADEMY_URL = `${SUPER_ADMIN_BASE_URL}/api/academies`;

export interface PagedRequest {
  currentPage?: number;
  pageSize?: number;
  textSearch?: string;
}

export const getUserAcademies = async (requestOrRole?: PagedRequest | string, isLearningSpace: boolean = false) => {
  const isDemo = useAuthStore.getState().isDemoMode || (await getDataStorage('DEMO_MODE')) === 'true';
  const url = isDemo ? ACADEMY_URL : `${ACADEMY_URL}/student-parent`;
  const role = typeof requestOrRole === 'string' && requestOrRole ? requestOrRole : Role.Student;
  const pagedParams = typeof requestOrRole === 'object' && requestOrRole !== null ? requestOrRole : {};

  return api.get(url, {
    params: isDemo
      ? { role }
      : pagedParams,
    headers: isDemo ? { [NoAcademyHeaders]: isLearningSpace } : undefined
  });
};

export const getAcademyByDomainApi = (domain: string, role?: string) => api.get(`${SUPER_ADMIN_ACADEMY_URL}/domain/${domain}`, {
  params: {
    role
  }
});

export const getAcademyDetailApi = () => api.get(`${ACADEMY_URL}/detail`)

export const switchAcademy = (academyId: number, role: Role, isLearningSpace: boolean = false) =>
  api.post(`${ACADEMY_URL}/${academyId}/switch-academy/${role}`, undefined, { params: { isLearningSpace } });

export const switchSuperAdminAcademy = (academyId: number, role: Role) =>
  api.post(`${SUPER_ADMIN_ACADEMY_URL}/${academyId}/switch-academy/${role}`);