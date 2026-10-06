import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Role } from "@/utils/enums";
import {
  AccountLinkMethod,
  AccountLinkResponse,
  getPendingLinkRequestsApi,
} from "@/containers/AccountLinking/apiClients";
import { toast, getMessageFromError, checkIsStudent } from "@/utils/helpers";
import i18n from "@/languages/i18n";

export interface ParentRequestLink {
  linkId: number;
  parentName: string;
  parentEmail?: string;
  parentAvatar?: string;
  createdAt?: string;
  expiredTime?: string;
}

interface AccountLinkingState {
  linkKey: string | null;
  linkCode: string | null;
  qrImage: string | null;
  expiredTime: string | null;
  studentEmail: string | null;
  methodLink: AccountLinkMethod | null;
  selectedRole: Role | null;
  parentRequestLink: ParentRequestLink | null;
  acceptedLinkData: AccountLinkResponse | null;
  acceptedLinkId: number | null;
  linkedAccounts: AccountLinkResponse[];
  pendingRequests: AccountLinkResponse[];
  isCancelledByStudent: boolean;
}

interface AccountLinkingActions {
  setLinkKey: (key: string | null) => void;
  setStudentEmail: (email: string | null, methodLink?: AccountLinkMethod) => void;
  setSelectedRole: (role: Role | null) => void;
  setParentRequestLink: (request: ParentRequestLink | null) => void;
  setAcceptedLinkData: (data: AccountLinkResponse | null) => void;
  setAcceptedLinkId: (id: number | null) => void;
  setLinkedAccounts: (accounts: AccountLinkResponse[]) => void;
  fetchPendingRequestsApi: () => Promise<AccountLinkResponse[]>;
  clearPendingRequests: () => void;
  setIsCancelledByStudent: (val: boolean) => void;
  setLinkData: (data: { key: string; code: string; image: string; expiredTime: string }, studentEmail?: string) => void;
  clearLinkData: () => void;
}

type AccountLinkingStore = AccountLinkingState & AccountLinkingActions;

let pendingRequestsAbortController: AbortController | null = null;

const useAccountLinkingStore = create<AccountLinkingStore>()(
  immer((set, get) => ({
    linkKey: null,
    linkCode: null,
    qrImage: null,
    expiredTime: null,
    studentEmail: null,
    methodLink: null,
    selectedRole: null,
    parentRequestLink: null,
    acceptedLinkData: null,
    acceptedLinkId: null,
    linkedAccounts: [],
    pendingRequests: [],
    isCancelledByStudent: false,

    setLinkKey: (key) => {
      set((state) => {
        state.linkKey = key;
      });
    },

    setStudentEmail: (email, methodLink = AccountLinkMethod.Code) => {
      set((state) => {
        state.studentEmail = email ? email.trim() : null;
        if (email) {
          state.methodLink = methodLink;
        } else {
          state.methodLink = null;
        }
      });
    },

    setSelectedRole: (role) => {
      set((state) => {
        state.selectedRole = role;
      });
    },

    setParentRequestLink: (request) => {
      set((state) => {
        state.parentRequestLink = request;
      });
    },

    setAcceptedLinkData: (data) => {
      set((state) => {
        state.acceptedLinkData = data;
      });
    },

    setLinkedAccounts: (accounts) => {
      set((state) => {
        state.linkedAccounts = accounts;
      });
    },

    setAcceptedLinkId: (id) => {
      set((state) => {
        state.acceptedLinkId = id;
      });
    },

    setIsCancelledByStudent: (val) => {
      set((state) => {
        state.isCancelledByStudent = val;
      });
    },

    setLinkData: (data, studentEmail) => {
      set((state) => {
        state.linkKey = data.key;
        state.linkCode = data.code;
        state.qrImage = data.image;
        state.expiredTime = data.expiredTime;
        if (studentEmail) {
          state.studentEmail = studentEmail.trim();
          state.methodLink = AccountLinkMethod.Code;
        }
      });
    },

    fetchPendingRequestsApi: async () => {
      if (!checkIsStudent()) {
        return [];
      }

      if (pendingRequestsAbortController) {
        pendingRequestsAbortController.abort();
      }
      pendingRequestsAbortController = new AbortController();
      const currentController = pendingRequestsAbortController;

      try {
        const response = await getPendingLinkRequestsApi(currentController.signal);
        const data = response.data?.data || [];
        set((state) => {
          state.pendingRequests = data;
        });
        return data;
      } catch (error: any) {
        if (error?.name !== 'CanceledError' && error?.message !== 'canceled') {
          toast.error(getMessageFromError(i18n.t, error));
        }
        return [];
      } finally {
        if (pendingRequestsAbortController === currentController) {
          pendingRequestsAbortController = null;
        }
      }
    },

    clearPendingRequests: () => {
      set((state) => {
        state.pendingRequests = [];
      });
    },

    clearLinkData: () => {
      set((state) => {
        state.linkKey = null;
        state.linkCode = null;
        state.qrImage = null;
        state.expiredTime = null;
        state.studentEmail = null;
        state.methodLink = null;
        state.parentRequestLink = null;
        state.acceptedLinkData = null;
        state.acceptedLinkId = null;
        state.linkedAccounts = [];
        state.isCancelledByStudent = false;
      });
    },
  }))
);

export default useAccountLinkingStore;
