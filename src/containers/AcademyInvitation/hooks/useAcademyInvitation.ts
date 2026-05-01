import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Role } from "@/utils/enums";
import { LoginAccessTokenRequest } from "@/utils/types";
import { getErrorMessage, getAccessToken, getAcademyDomain, getLearningSpace } from "@/utils/helpers";
import { Routes } from "@/navigators/RouteName";
import useLogin from "@/containers/Login/hooks/useLogin";
import { acceptEmailInvitations, getAcademyByDomainApi } from "@/services/api/academyService";

const useAcademyInvitation = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = route.params || {};
  
  const domain = params.domain;
  const token = params.token;

  const [academy, setAcademy] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingAcademy, setLoadingAcademy] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { handleLoginAccessToken } = useLogin();

  const acceptInvitation = async () => {
    if (!domain || !token) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await acceptEmailInvitations(domain, token);
      const data = res.data;
      const requestBody: LoginAccessTokenRequest = {
        accessToken: data.accessToken,
        email: data.email,
        role: Role.Student,
        isMobile: true
      };
      await handleLoginAccessToken(requestBody, false, domain, false, Routes.Auth.Home);
    } catch (error) {
      const msg = getErrorMessage(t, error);
      setErrorMessage(msg);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const getAcademyByDomain = async () => {
      if (!domain) return;
      setLoadingAcademy(true);
      try {
        const res = await getAcademyByDomainApi(domain);
        const academyData = res.data?.data || res.data;
        setAcademy(academyData);
      } catch (error) {
        console.log("error", error);
      }
      setLoadingAcademy(false);
    };

    const init = async () => {
      const accessToken = await getAccessToken();
      const academyDomain = await getAcademyDomain();
      const isLearningSpace = await getLearningSpace();

      if (!accessToken || (!academyDomain && !isLearningSpace)) {
        getAcademyByDomain();
      } else {
        alert(t("you_need_to_log_out_of_your_current_academy_to_use_the_invite_link"));
        navigation.navigate(Routes.Auth.Home);
      }
    };

    init();
  }, [domain]);

  useEffect(() => {
    if (academy?.id && token) {
      acceptInvitation();
    }
  }, [token, academy?.id]);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  useEffect(() => {
    getAccessToken().then(setAccessToken);
  }, []);

  return {
    t,
    token,
    academy,
    domain,
    isLoading,
    isLoadingAcademy,
    errorMessage,
    navigation,
    accessToken
  };
};

export default useAcademyInvitation;
