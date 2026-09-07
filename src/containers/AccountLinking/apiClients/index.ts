import { AxiosResponse } from "axios";
import { api } from "@/services/api/apiClient";
import { BASE_URL } from "@/utils/constants";

const ACCOUNT_LINKS_URL = `${BASE_URL}/api/accountlinks`;

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

export enum AccountLinkStatus {
  Pending = 0,
  Accept = 2,
  Reject = 1,
}

export interface ParentLinkResponse {
  id: number;
  parentId?: number | null;
  parentName?: string | null;
  parentEmail?: string | null;
  parentAvatar?: string | null;
  studentAcademyUserId?: number | null;
  linkIdAcademy?: number | null;
  studentName?: string | null;
  studentEmail?: string | null;
  studentAvatar?: string | null;
}

export type LinkedAccountResponse = ParentLinkResponse;

export interface AccountLinkResponse extends ParentLinkResponse {
  status?: AccountLinkStatus;
  createdAt?: string;
  expiredTime?: string;
}

export const getLinkedAccountsApi = (signal?: AbortSignal): Promise<AxiosResponse<ResponseModel<AccountLinkResponse[]>>> =>
  api.get(`${ACCOUNT_LINKS_URL}/my-links`, { signal });

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

export const deleteLinkApi = (
  linkId: number
): Promise<AxiosResponse<ResponseModel>> =>
  api.delete(`${ACCOUNT_LINKS_URL}/${linkId}`);

const PARENTS_URL = `${BASE_URL}/api/parents`;

export const getLinkedStudentsForParentApi = (signal?: AbortSignal): Promise<AxiosResponse<ResponseModel<AccountLinkResponse[]>>> =>
  api.get(`${PARENTS_URL}/linked-students`, { signal });

export const completeParentRoleIfPendingApi = (): Promise<AxiosResponse<ResponseModel<any>>> =>
  api.post(`${ACCOUNT_LINKS_URL}/complete-parent-role-if-pending`, {});

export interface SyncAccountLinksRequest {
  userSuperId?: number;
  isAll?: boolean;
}

export const syncAccountLinksApi = (
  data?: SyncAccountLinksRequest
): Promise<AxiosResponse<ResponseModel>> =>
  api.post(`${ACCOUNT_LINKS_URL}/sync`, data || {});

