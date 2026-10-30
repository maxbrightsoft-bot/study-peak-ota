import { AxiosResponse } from "axios";
import { api } from "@/services/api/apiClient";
import { BASE_URL } from "@/utils/constants";
import { LoginResponse } from "@/utils/types";
import { AccountLinkStatus, AccountLinkMethod } from "@/utils/enums";

const ACCOUNT_LINKS_URL = `${BASE_URL}/api/accountlinks`;

const triggerCheckUnsyncedLinks = () => {
  try {
    const useAccountLinkingStore = require("@/store/useAccountLinkingStore").default;
    useAccountLinkingStore?.getState()?.checkUnsyncedLinksApi?.();
  } catch (e) {
    // ignore store call error
  }
};

export interface ResponseModel<T = undefined> {
  status: number;
  message: string;
  data: T;
}

export interface ConfirmLinkRequest {
  code: string;
  email: string;
}

export interface GenerateCodeResponse {
  code: string;
  expiredTime: string;
  image: string;
  key: string;
}

export interface ParentLinkResponse {
  id: number;
  parentId?: number | null;
  parentSuperId?: number | null;
  parentName?: string | null;
  parentEmail?: string | null;
  parentAvatar?: string | null;
  studentAcademyUserId?: number | null;
  studentSuperId?: number | null;
  linkIdAcademy?: number | null;
  studentName?: string | null;
  studentEmail?: string | null;
  studentAvatar?: string | null;
}

export interface AccountLinkResponse {
  id: number;
  parentId: number;
  parentName?: string | null;
  parentEmail?: string | null;
  parentAvatar?: string | null;
  studentId: number;
  studentAcademyUserId?: number | null;
  linkIdAcademy?: number | null;
  studentName?: string | null;
  studentEmail?: string | null;
  studentAvatar?: string | null;
  status?: AccountLinkStatus;
  linkMethod?: AccountLinkMethod | number;
  createdAt?: string;
  expiredTime?: string;
}

export type LinkedAccountResponse = AccountLinkResponse;

export const getLinkedAccountsApi = (
  role?: string,
  signal?: AbortSignal
): Promise<AxiosResponse<ResponseModel<AccountLinkResponse[]>>> =>
  api.get(`${ACCOUNT_LINKS_URL}/my-links`, {
    params: role ? { role } : undefined,
    signal
  });

export const getAccountLinkDetailApi = (
  linkId: number,
  signal?: AbortSignal
): Promise<AxiosResponse<ResponseModel<AccountLinkResponse>>> =>
  api.get(`${ACCOUNT_LINKS_URL}/${linkId}`, { signal });

export const generateLinkCodeApi = (signal?: AbortSignal): Promise<AxiosResponse<ResponseModel<GenerateCodeResponse>>> =>
  api.post(`${ACCOUNT_LINKS_URL}/generate-code`, {}, { signal });

export const verifyCodeLinkAccountApi = (
  code: string,
  email: string,
  signal?: AbortSignal
): Promise<AxiosResponse<ResponseModel<AccountLinkResponse>>> =>
  api.post(`${ACCOUNT_LINKS_URL}/verify-code`, { code, email }, { signal });

export const acceptLinkAccountApi = (
  linkId: number
): Promise<AxiosResponse<ResponseModel<AccountLinkResponse>>> =>
  api.post(`${ACCOUNT_LINKS_URL}/accept/${linkId}`, {});

export const rejectLinkAccountApi = (
  linkId: number
): Promise<AxiosResponse<ResponseModel<AccountLinkResponse>>> =>
  api.post(`${ACCOUNT_LINKS_URL}/reject/${linkId}`, {});

export const deleteLinkApi = async (
  linkId: number
): Promise<AxiosResponse<ResponseModel>> => {
  const response = await api.delete(`${ACCOUNT_LINKS_URL}/${linkId}`);
  triggerCheckUnsyncedLinks();
  return response;
};

const PARENTS_URL = `${BASE_URL}/api/parents`;

export const getLinkedStudentsForParentApi = (signal?: AbortSignal): Promise<AxiosResponse<ResponseModel<ParentLinkResponse[]>>> =>
  api.get(`${PARENTS_URL}/linked-students`, { signal });

export interface AcademySimpleResponse {
  id: number;
  name: string;
  image?: string;
  coverImage?: string;
  domain?: string;
  createdAt?: string;
  isOwned?: boolean | null;
}

export interface ConvertParentRoleAcademiesRequest {
  academyIds: number[];
}

export interface SubmitConvertAcademiesRequest {
  academyIds: number[];
}

export interface ParentPendingAcademiesResponse {
  convertAcademies: AcademySimpleResponse[];
  alreadyParentAcademies: AcademySimpleResponse[];
  autoAddAcademies: AcademySimpleResponse[];
}

export const getParentPendingAcademiesApi = (
  linkId: number,
  signal?: AbortSignal
): Promise<AxiosResponse<ResponseModel<ParentPendingAcademiesResponse>>> =>
  api.get(`${ACCOUNT_LINKS_URL}/parent-pending-academies/${linkId}`, {
    signal
  });

export const convertParentRoleAcademiesApi = (
  linkId: number,
  data: ConvertParentRoleAcademiesRequest
): Promise<AxiosResponse<ResponseModel<LoginResponse | null>>> =>
  api.post(`${ACCOUNT_LINKS_URL}/convert-parent-role-academies/${linkId}`, data);

export const submitConvertAcademiesApi = (
  linkId: number,
  data: SubmitConvertAcademiesRequest
): Promise<AxiosResponse<ResponseModel<LoginResponse | null>>> =>
  api.post(`${ACCOUNT_LINKS_URL}/submit-convert-academies/${linkId}`, data);

export interface SyncAccountLinksRequest {
  userSuperId?: number;
  isAll?: boolean;
}

export const syncAccountLinksApi = async (
  data?: SyncAccountLinksRequest
): Promise<AxiosResponse<ResponseModel>> => {
  const response = await api.post(`${ACCOUNT_LINKS_URL}/sync`, data || {});
  triggerCheckUnsyncedLinks();
  return response;
};

export const requestLinkByStudentIdApi = (studentId: number): Promise<AxiosResponse<ResponseModel<AccountLinkResponse>>> =>
  api.post(`${ACCOUNT_LINKS_URL}/account-link-request/${studentId}`);

export const getWaitingApprovalLinkRequestsApi = (signal?: AbortSignal): Promise<AxiosResponse<ResponseModel<AccountLinkResponse[]>>> =>
  api.get(`${ACCOUNT_LINKS_URL}/waiting-approval-requests`, { signal });

export const checkUnsyncedAccountLinksApi = (
  signal?: AbortSignal
): Promise<AxiosResponse<ResponseModel<boolean>>> =>
  api.get(`${ACCOUNT_LINKS_URL}/check-unsynced`, { signal });
