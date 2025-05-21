import { decode as atob } from 'base-64';
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { LoginAccessTokenRequest, LoginRequest, LoginResponse } from "@/utils/types";
import { Role } from "@/utils/enums";
import {
  ACADEMY_DOMAIN,
  ACCESS_TOKEN,
  LEARNING_SPACE,
  REDIRECT_URL,
} from "@/utils/constants";
import { removeDataStorage, setDataStorage } from "@/utils/storage";
import useAuthStore from "@/store/useAuthStore";
import { getAcademyDomain, getErrorMessage, toast } from "@/utils/helpers";
import {
  apiLoginGoogle,
  apiLoginGoogleSuperAdmin,
  apiLoginWithAccessToken,
} from "../apiClients/accountService";
import { useTranslation } from "react-i18next";
import { Routes } from '@/navigators/RouteName';

const useLogin = () => {
  const { t } = useTranslation();
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_IOS_GOOGLE_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_GOOGLE_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID,
    clientId: process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID,
    scopes: ["profile", "email"],
  });
  const { setLoading, logout, setUser } = useAuthStore();

  WebBrowser.maybeCompleteAuthSession();

  const handleRedirectAfterSuccess = async (
    data: any,
    token: string,
    redirectUrl: string
  ) => {
    setUser({
      ...data,
    });
    await setDataStorage(ACCESS_TOKEN, token);
    !data.academyDomain && await removeDataStorage(ACADEMY_DOMAIN);
    !!data.academyDomain && await setDataStorage(ACADEMY_DOMAIN, data.academyDomain);
    data.isLearningSpace
      ? await setDataStorage(LEARNING_SPACE, "true")
      : await removeDataStorage(LEARNING_SPACE);
    await setDataStorage(REDIRECT_URL, redirectUrl)
  };

  const handleLogin = async (
    apiLogin: () => Promise<LoginResponse>,
    isLogout: boolean = true,
    redirectUrlProp?: string
  ) => {
    setLoading(true);
    const academyDomain = await getAcademyDomain();
    try {
      const loginResponse = await apiLogin();
      const { isFirstLogin, token, user } = loginResponse;
      const isAcademy = !!user?.academyDomain || !!user?.isLearningSpace;
      const needToRegister = isFirstLogin && isAcademy;
      let redirectUrl;
      
      if (needToRegister) {
        redirectUrl = Routes.Auth.Onboarding;
      } else if (redirectUrlProp != null) {
        redirectUrl = redirectUrlProp;
      } else if (isAcademy) {
        redirectUrl = Routes.Auth.Home;
      } else {
        redirectUrl = Routes.Auth.SelectAcademy;
      }

      await handleRedirectAfterSuccess({ ...user, isNotEnoughStatements: isFirstLogin }, token, redirectUrl);
    } catch (error) {
      !!academyDomain && await removeDataStorage(ACADEMY_DOMAIN);
      await removeDataStorage(LEARNING_SPACE);
      toast.error(getErrorMessage(t, error));
      isLogout && await logout();
    }
    setLoading(false);
  };

  const handleAuthGoogle = async (data: LoginRequest) => {
    const academyDomain = await getAcademyDomain();
    let loginResponse = await apiLoginGoogle(data, true)

    let result: LoginResponse = loginResponse.data;
    if (loginResponse.status === 204 && academyDomain) {
      await removeDataStorage(ACADEMY_DOMAIN);
      await removeDataStorage(LEARNING_SPACE);
      loginResponse = await apiLoginGoogleSuperAdmin(data);
      result = loginResponse.data;
    }
    return result
  }

  const handleLoginGoogle = async (data: LoginRequest, isLogout = true) => {
    await handleLogin(
      () => handleAuthGoogle(data),
      isLogout,
    );
  };

  const handleAuthToken = async (data: LoginAccessTokenRequest,
    isLearningSpace?: boolean,
    domain?: string,) => {
    const loginResponse =
      await apiLoginWithAccessToken(
        data,
        isLearningSpace,
        domain
      );
    const result: LoginResponse = loginResponse.data
    return result
  }

  const handleLoginAccessToken = async (
    data: LoginAccessTokenRequest,
    isLearningSpace?: boolean,
    domain?: string,
    isLogout: boolean = true,
    redirectUrlProps?: string
  ) => {
    await handleLogin(
      () => handleAuthToken(data, isLearningSpace, domain),
      isLogout,
      redirectUrlProps
    )
  }

  const getUserInfo = async (token?: string) => {
    if (!token) return;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = atob(base64);
      const user = JSON.parse(jsonPayload);

      const infoLogin = {
        imageUrl: user?.picture,
        fullName: user?.name,
        email: user?.email,
        token,
        googleId: user?.sub,
        role: Role.Student,
      };

      await handleLoginGoogle(infoLogin);
    } catch (err: any) {
      toast.error(getErrorMessage(t, err?.message || ""));
    }
  };

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response?.params;

      getUserInfo(id_token);
    } else if (response?.type === "error") {
      toast.error(getErrorMessage(t, response.error?.message || ""));
    }
  }, [response]);

  return {
    request,
    promptAsync,
    handleLoginAccessToken,
  };
};

export default useLogin;
