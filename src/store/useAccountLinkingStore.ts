import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Role, AccountLinkMethod, AccountLinkStatus } from "@/utils/enums";
import {
  AccountLinkResponse,
  getWaitingApprovalLinkRequestsApi,
  checkUnsyncedAccountLinksApi,
} from "@/containers/AccountLinking/apiClients";
import { toast, getMessageFromError, checkIsStudent } from "@/utils/helpers";
import i18n from "@/languages/i18n";
import useAuthStore from "@/store/useAuthStore";
import { PusherMember } from "@pusher/pusher-websocket-react-native";

export interface ParentRequestLink {
  id: number;
  linkId?: number;
  parentName: string;
  parentEmail?: string;
  parentAvatar?: string;
  createdAt?: string;
  expiredTime?: string;
  status?: AccountLinkStatus;
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
  subscribedChannel: string | null;
  isCancelledByStudent: boolean;
  requestByLinkId: boolean;
  isFromShareLink: boolean;
  hasUnsyncedLinks: boolean;
  isStudentAccepted: boolean;
  targetDomain: string | null;
}

interface AccountLinkingActions {
  setLinkKey: (key: string | null) => void;
  setStudentEmail: (email: string | null, methodLink?: AccountLinkMethod) => void;
  setSelectedRole: (role: Role | null) => void;
  setParentRequestLink: (request: ParentRequestLink | null) => void;
  setAcceptedLinkData: (data: AccountLinkResponse | null) => void;
  setAcceptedLinkId: (id: number | null) => void;
  setLinkedAccounts: (accounts: AccountLinkResponse[]) => void;
  fetchWaitingApprovalRequestsApi: () => Promise<AccountLinkResponse[]>;
  setSubscribedChannel: (channelName: string | null) => void;
  setRequestByLinkId: (val: boolean) => void;
  setLinkData: (data: { key: string; code: string; image: string; expiredTime: string }, studentEmail?: string) => void;
  clearLinkData: () => void;
  setIsCancelledByStudent: (val: boolean) => void;
  setIsStudentAccepted: (val: boolean) => void;
  setIsFromShareLink: (val: boolean) => void;
  setTargetDomain: (domain: string | null) => void;
  setHasUnsyncedLinks: (val: boolean) => void;
  checkUnsyncedLinksApi: () => Promise<boolean>;
}

type AccountLinkingStore = AccountLinkingState & AccountLinkingActions;

let pendingRequestsAbortController: AbortController | null = null;

export const buildAccountLinkingChannelName = (
  email: string,
  method: AccountLinkMethod,
  isParent: boolean,
  superId?: string | number | null,
) => {
  let channelName = `presence-account-linking-${email.trim()}-${method}`;
  if (method === AccountLinkMethod.ShareLink && isParent && superId) {
    channelName += `-${superId}`;
  }
  return channelName;
};

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
    subscribedChannel: null,
    isFromShareLink: false,
    hasUnsyncedLinks: false,
    isStudentAccepted: false,
    targetDomain: null,

    setTargetDomain: (domain) => {
      set((state) => {
        state.targetDomain = domain;
      });
    },

    setIsStudentAccepted: (val) => {
      set((state) => {
        state.isStudentAccepted = val;
      });
    },

    setHasUnsyncedLinks: (val) => {
      set((state) => {
        state.hasUnsyncedLinks = val;
      });
    },

    checkUnsyncedLinksApi: async () => {
      try {
        const res = await checkUnsyncedAccountLinksApi();
        const hasUnsynced = Boolean(res?.data?.data);
        set((state) => {
          state.hasUnsyncedLinks = hasUnsynced;
        });
        return hasUnsynced;
      } catch {
        return false;
      }
    },

    setIsFromShareLink: (val) => {
      set((state) => {
        state.isFromShareLink = val;
      });
    },

    setSubscribedChannel: (channelName) => {
      set((state) => {
        state.subscribedChannel = channelName;
      });
    },
    requestByLinkId: true,

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

    setRequestByLinkId: (val) => {
      set((state) => {
        state.requestByLinkId = val;
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

    fetchWaitingApprovalRequestsApi: async () => {
      if (!checkIsStudent()) {
        return [];
      }

      if (pendingRequestsAbortController) {
        pendingRequestsAbortController.abort();
      }
      pendingRequestsAbortController = new AbortController();
      const currentController = pendingRequestsAbortController;

      try {
        const response = await getWaitingApprovalLinkRequestsApi(currentController.signal);
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
        state.isStudentAccepted = false;
        state.targetDomain = null;
        state.requestByLinkId = true;
      });
    },
  }))
);

/**
 * Resolves true once the given presence channel is subscribed, false on timeout.
 */
export const waitForPusherSubscribed = (channelName: string, timeoutMs = 8000): Promise<boolean> =>
  new Promise((resolve) => {
    const target = channelName.toLowerCase();
    const isMatch = (name: string | null) => name?.toLowerCase() === target;
    if (isMatch(useAccountLinkingStore.getState().subscribedChannel)) {
      resolve(true);
      return;
    }
    const timer = setTimeout(() => {
      stopListening();
      resolve(false);
    }, timeoutMs);
    // Zustand store listener (not the Pusher channel); stopListening() only removes this listener
    const stopListening = useAccountLinkingStore.subscribe((state) => {
      if (isMatch(state.subscribedChannel)) {
        clearTimeout(timer);
        stopListening();
        resolve(true);
      }
    });
  });

/**
 * Checks if the presence channel currently has a student subscribed with studentEmail.
 * Returns false if the channel has no members, or only has the current user (Parent).
 */
export const isStudentSubscribedToChannel = (
  channelName: string,
  studentEmail: string
): boolean => {
  const pusher = useAuthStore.getState().pusher;
  if (!pusher) return false;

  const channel = pusher.getChannel?.(channelName);
  if (!channel || !channel.members) return false;

  const targetEmail = studentEmail.trim().toLowerCase();
  const currentUser = useAuthStore.getState().user;
  const currentUserId = currentUser?.id != null ? String(currentUser.id) : null;
  const currentUserEmail = currentUser?.email?.trim().toLowerCase();

  const membersList: PusherMember[] = channel.members instanceof Map
    ? Array.from(channel.members.values())
    : [];

  if (__DEV__) {
    console.log('[Pusher] Channel members count:', channel.members instanceof Map ? channel.members.size : 0);
    console.log('[Pusher] Members list:', membersList.map((m) => ({ userId: m.userId, userInfo: m.userInfo })));
  }

  // Filter out the current user (Parent)
  const otherMembers = membersList.filter((m: PusherMember) => {
    if (channel.me && m.userId === channel.me.userId) return false;
    if (currentUserId && m.userId === currentUserId) return false;
    const memberEmail = (m.userInfo?.email || m.userInfo?.Email || '').trim().toLowerCase();
    if (currentUserEmail && memberEmail === currentUserEmail) return false;
    return true;
  });

  if (otherMembers.length === 0) {
    return false;
  }

  // Check if any other member has student's email
  return otherMembers.some((m: PusherMember) => {
    const memberEmail = (m.userInfo?.email || m.userInfo?.Email || '').trim().toLowerCase();
    return memberEmail === targetEmail;
  });
};

export default useAccountLinkingStore;
