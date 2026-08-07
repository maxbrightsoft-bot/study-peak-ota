import Login from "@/containers/Login/views/Login";
import React, { useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import { setDataStorage } from "@/utils/storage";
import { ACADEMY_DOMAIN } from "@/utils/constants";
import useAuthStore from "@/store/useAuthStore";

const LoginScreen = () => {
  const route = useRoute<any>();
  const domain = route.params?.domain;
  const redirectUrl = route.params?.redirectUrl;
  const redirectParams = route.params?.params;
  const setRedirectUrl = useAuthStore(state => state.setRedirectUrl);

  useEffect(() => {
    if (domain) {
      setDataStorage(ACADEMY_DOMAIN, domain);
    }
    if (redirectUrl) {
      setRedirectUrl(redirectUrl, redirectParams);
    }
  }, [domain, redirectUrl, redirectParams]);

  return <Login />;
};

export default LoginScreen;
