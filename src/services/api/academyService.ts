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
