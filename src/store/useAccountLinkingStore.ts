import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Role } from "@/utils/enums";
import { AccountLinkResponse } from "@/containers/AccountLinking/apiClients";

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
  selectedRole: Role | null;
  parentRequestLink: ParentRequestLink | null;
  acceptedLinkData: AccountLinkResponse | null;
  acceptedLinkId: number | null;
  linkedAccounts: AccountLinkResponse[];
}

interface AccountLinkingActions {
  setLinkKey: (key: string | null) => void;
  setStudentEmail: (email: string | null) => void;
  setSelectedRole: (role: Role | null) => void;
  setParentRequestLink: (request: ParentRequestLink | null) => void;
  setAcceptedLinkData: (data: AccountLinkResponse | null) => void;
  setAcceptedLinkId: (id: number | null) => void;
  setLinkedAccounts: (accounts: AccountLinkResponse[]) => void;
  setLinkData: (data: { key: string; code: string; image: string; expiredTime: string }, studentEmail?: string) => void;
  clearLinkData: () => void;
}

type AccountLinkingStore = AccountLinkingState & AccountLinkingActions;

const useAccountLinkingStore = create<AccountLinkingStore>()(
  immer((set) => ({
    linkKey: null,
    linkCode: null,
    qrImage: null,
    expiredTime: null,
    studentEmail: null,
    selectedRole: null,
    parentRequestLink: null,
    acceptedLinkData: null,
    acceptedLinkId: null,
    linkedAccounts: [],

    setLinkKey: (key) => {
      set((state) => {
        state.linkKey = key;
      });
    },

    setStudentEmail: (email) => {
      set((state) => {
        state.studentEmail = email ? email.trim() : null;
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

    setLinkData: (data, studentEmail) => {
      set((state) => {
        state.linkKey = data.key;
        state.linkCode = data.code;
        state.qrImage = data.image;
        state.expiredTime = data.expiredTime;
        if (studentEmail) {
          state.studentEmail = studentEmail.trim();
        }
      });
    },

    clearLinkData: () => {
      set((state) => {
        state.linkKey = null;
        state.linkCode = null;
        state.qrImage = null;
        state.expiredTime = null;
        state.studentEmail = null;
        state.parentRequestLink = null;
        state.acceptedLinkData = null;
        state.acceptedLinkId = null;
        state.linkedAccounts = [];
      });
    },
  }))
);

export default useAccountLinkingStore;
