import { decode as atob } from 'base-64';
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { LoginAccessTokenRequest, LoginRequest, LoginResponse } from '@/utils/types';
import { Role } from '@/utils/enums';
import {
  APPLE_USER_KEY,
  ACADEMY_DOMAIN,
  ACCESS_TOKEN,
  LEARNING_SPACE,
  KEEP_LOGIN,
} from '@/utils/constants';
import { getDataStorage, removeDataStorage, setDataStorage } from '@/utils/storage';
import useAuthStore from '@/store/useAuthStore';
import { getAcademyDomain, getErrorMessage, toast } from '@/utils/helpers';
import {
  apiLoginApple,
  apiLoginGoogle,
  apiLoginGoogleSuperAdmin,
  apiLoginWithAccessToken,
} from '../apiClients/accountService';
import { useTranslation } from 'react-i18next';
import { Routes } from '@/navigators/RouteName';
import appleAuth from '@invertase/react-native-apple-authentication';
import { useState } from 'react';
import { Platform } from 'react-native';

const useLogin = () => {
  const { t } = useTranslation();
  const {
    setLoading,
    logout,
    setUser,
    setHasEnteredSelectAcademy,
    setRedirectUrl,
  } = useAuthStore();
  const [openLoginAccountDialog, setOpenLoginAccountDialog] = useState(false)

  const handleOpenLoginAccountDialog = () => {
    setOpenLoginAccountDialog(true)
  }
  const handleCloseLoginAccountDialog = () => {
    setOpenLoginAccountDialog(false)
  }

  const handleRedirectAfterSuccess = async (
    data: any,
    token: string,
    redirectUrl: string
  ) => {
    await setDataStorage(ACCESS_TOKEN, token);

    data.academyDomain
      ? await setDataStorage(ACADEMY_DOMAIN, data.academyDomain)
      : await removeDataStorage(ACADEMY_DOMAIN);

    data.isLearningSpace
      ? await setDataStorage(LEARNING_SPACE, 'true')
      : await removeDataStorage(LEARNING_SPACE);

    setRedirectUrl(redirectUrl);
    setUser(data);
  };
  const handleLogin = async (
    apiLogin: () => Promise<LoginResponse>,
    isLogout = true,
    redirectUrlProp?: string
  ) => {
    setLoading(true);
    const academyDomain = await getAcademyDomain();

    try {
      const { isFirstLogin, token, user, loginMethod } = await apiLogin();
      const isAcademy = !!user?.academyDomain || !!user?.isLearningSpace;

      let redirectUrl: string;
      if (isFirstLogin && isAcademy) {
        redirectUrl = Platform.OS === 'ios' ? Routes.Auth.Home : Routes.Auth.Onboarding;
      } else if (redirectUrlProp) {
        redirectUrl = redirectUrlProp;
      } else if (isAcademy) {
        redirectUrl = Routes.Auth.Home;
      } else {
        setHasEnteredSelectAcademy(false);
        redirectUrl = Routes.Auth.SelectAcademy;
      }

      await handleRedirectAfterSuccess(
        { ...user, isNotEnoughStatements: isFirstLogin, loginMethod },
        token,
        redirectUrl
      );
    } catch (error) {
      toast.error(getErrorMessage(t, error));
      academyDomain && (await removeDataStorage(ACADEMY_DOMAIN));
      await removeDataStorage(LEARNING_SPACE);
      isLogout && setTimeout(() => logout(), 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthGoogle = async (data: LoginRequest) => {
    const academyDomain = await getAcademyDomain();
    let loginResponse = await apiLoginGoogle(data, true);

    if (loginResponse.status === 204 && academyDomain) {
      await removeDataStorage(ACADEMY_DOMAIN);
      await removeDataStorage(LEARNING_SPACE);
      loginResponse = await apiLoginGoogleSuperAdmin(data);
    }

    return loginResponse.data;
  };

  const handleAuthApple = async (data: LoginRequest) => {
    let loginResponse = await apiLoginApple(data, true);

    return loginResponse.data;
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const userInfo = response.data
        const idToken = userInfo.idToken;
        console.log('idToken', idToken);
        if (!idToken) {
          throw new Error('NO_ID_TOKEN');
        }

        const base64Url = idToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        const keepLogin = await getDataStorage(KEEP_LOGIN);

        const infoLogin: LoginRequest = {
          imageUrl: payload.picture,
          fullName: payload.name,
          email: payload.email,
          token: idToken,
          googleId: payload.sub,
          role: Role.Student,
          isMobile: true,
          isKeepMeLoggedIn: keepLogin === 'true'
        };

        await handleLogin(() => handleAuthGoogle(infoLogin));
        setHasEnteredSelectAcademy(false);
      }
    } catch (error) {
      console.log('Google Sign-In Error Details:', error);
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log('Google sign-in already in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('Play services not available');
            break;
          default:
            console.log('Google sign-in error code:', error.code);
        }
      } else {
        console.log('Google sign-in error:', error);
        toast.error(getErrorMessage(t, error || ''));
      }
    }
    setLoading(false);
  };

  const onAppleButtonPress = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const { identityToken, email, fullName, user } = appleAuthRequestResponse;

      if (!identityToken) {
        throw new Error('Apple Sign-In failed - no identity token returned');
      }

      const base64Url = identityToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64));

      const finalEmail = email || decoded?.email || '';

      const nameFromResponse =
        fullName?.givenName || fullName?.familyName
          ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
          : '';

      await setDataStorage(APPLE_USER_KEY, user);
      const keepLogin = await getDataStorage(KEEP_LOGIN);

      const infoLogin: LoginRequest = {
        fullName: nameFromResponse,
        email: finalEmail,
        token: identityToken,
        role: Role.Student,
        isMobile: true,
        isKeepMeLoggedIn: keepLogin === 'true'
      };

      await handleLogin(() => handleAuthApple(infoLogin));
      setHasEnteredSelectAcademy(false);

    } catch (error) {
      console.log('Apple login error:', error);
      toast.error(getErrorMessage(t, error || ''));
    }
  };

  const handleLoginAccessToken = async (
    data: LoginAccessTokenRequest,
    isLearningSpace?: boolean,
    domain?: string,
    isLogout = true,
    redirectUrlProps?: string
  ) => {
    await handleLogin(
      async () => {
        const res = await apiLoginWithAccessToken(
          data,
          isLearningSpace,
          domain
        );
        return res.data;
      },
      isLogout,
      redirectUrlProps
    );
  };

  return {
    openLoginAccountDialog,
    handleOpenLoginAccountDialog,
    handleCloseLoginAccountDialog,
    onAppleButtonPress,
    loginWithGoogle,
    handleLoginAccessToken,
    handleLogin,
  };
};


export default useLogin;
