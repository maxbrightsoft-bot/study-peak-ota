import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { LoginRequest, LoginResponse } from "@/utils/types";
import { Role } from "@/utils/enums";
import {
  ACADEMY_DOMAIN,
  ACCESS_TOKEN,
  LEARNING_SPACE,
} from "@/utils/constants";
import { removeDataStorage, setDataStorage } from "@/utils/storage";
import useAuthStore from "@/store/useAuthStore";
import { getAcademyDomain, getErrorMessage, getLearningSpace, toast } from "@/utils/helpers";
import {
  apiLoginGoogle,
  apiLoginGoogleSuperAdmin,
} from "../apiClients/accountService";
import { useTranslation } from "react-i18next";
import Routes from "@/navigators/RouteName";
import { navigate } from "@/navigators/NavigationHelpers";

const useLogin = () => {
  const { t } = useTranslation();
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_IOS_GOOGLE_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_GOOGLE_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID,
    responseType: "id_token",
    scopes: ["openid", "profile", "email"],
  });
  const { setLoading, logout, setUser } = useAuthStore();

  WebBrowser.maybeCompleteAuthSession();

  const handleRedirectAfterSuccess = (
    data: any,
    token: string,
    redirectUrl: string
  ) => {
    setDataStorage(ACCESS_TOKEN, token);
    !data.academyDomain && removeDataStorage(ACADEMY_DOMAIN);
    !!data.academyDomain && setDataStorage(ACADEMY_DOMAIN, data.academyDomain);
    if (data.roles.includes(Role.Student))
      data.isLearningSpace
        ? setDataStorage(LEARNING_SPACE, "true")
        : removeDataStorage(LEARNING_SPACE);
    setUser({
      ...data,
    });
    navigate(redirectUrl);
  };

  const handleLogin = async (
    apiLogin: () => Promise<LoginResponse>,
    isStudent: boolean,
    isLogout: boolean = true
  ) => {
    setLoading(true);
    try {
      const loginResponse = await apiLogin();
      const { isFirstLogin, token, user } = loginResponse;
      const isAcademy = !!user?.academyDomain || !!user?.isLearningSpace;
      const needToRegister = isFirstLogin && isAcademy;
      const redirectUrl = needToRegister
        ? Routes.Onboarding
        : isAcademy
        ? Routes.Home
        : Routes.Academies;
      handleRedirectAfterSuccess({ ...user, isFirstLogin }, token, redirectUrl);
    } catch (error) {
      toast.success(getErrorMessage(t, error));
      isLogout && logout();
    }
    setLoading(false);
  };

  const handleLoginGoogle = async (data: LoginRequest, isLogout = true) => {
    const isStudent = data.role === Role.Student;
    const academyDomain = await getAcademyDomain();
    let isLearningSpace =
      (await getLearningSpace()) || (isStudent && !academyDomain);
    if (!isStudent && isLearningSpace) {
      isLearningSpace = false;
      removeDataStorage(LEARNING_SPACE);
    }
    const isAcademy = !!academyDomain || isLearningSpace;
    await handleLogin(
      () =>
        new Promise(async (resolve, reject) => {
          try {
            let loginResponse = isAcademy
              ? await apiLoginGoogle(data, isLearningSpace)
              : await apiLoginGoogleSuperAdmin(data);

            let result: LoginResponse = loginResponse.data;
            if (loginResponse.status === 204 && academyDomain) {
              removeDataStorage(ACADEMY_DOMAIN);
              removeDataStorage(LEARNING_SPACE);
              loginResponse = await apiLoginGoogleSuperAdmin(data);
              result = loginResponse.data;
            }
            resolve(result);
          } catch (error) {
            !!academyDomain && removeDataStorage(ACADEMY_DOMAIN);
            removeDataStorage(LEARNING_SPACE);
            reject(error);
          }
        }),
      isStudent,
      isLogout
    );
  };

  const getUserInfo = async (token?: string) => {
    if (!token) return;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      const user = JSON.parse(jsonPayload);
      const infoLogin = {
        imageUrl: user?.picture,
        fullName: user?.name,
        email: user?.email,
        token,
        googleId: user?.sub,
        role: Role.Student,
      };
      handleLoginGoogle(infoLogin);
      console.log(user);
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
  };
};

export default useLogin;
