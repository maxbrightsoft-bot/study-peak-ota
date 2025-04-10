import BaseHeader from "@/components/HeaderBar/BaseHeader";
import {
  getInfo,
  getSuperAdminInfoFromWeb,
} from "@/containers/Login/apiClients/accountService";
import { navigate } from "@/navigators/NavigationHelpers";
import Routes from "@/navigators/RouteName";
import useAuthStore from "@/store/useAuthStore";
import { ACADEMY_DOMAIN } from "@/utils/constants";
import { Role } from "@/utils/enums";
import {
  getAcademyDomain,
  getAccessToken,
  getLearningSpace,
} from "@/utils/helpers";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  children?: React.ReactNode;
}

const LayoutApp = ({ children }: Props) => {
  const { user, setUser, setLoading, logout } = useAuthStore();

  const isNotEnoughStatements = useMemo(
    () => user?.email && user?.isFirstLogin,
    [user?.email, user?.isFirstLogin]
  );

  const loadInfo = async () => {
    const token = getAccessToken();
    if (!token) {
      logout();
      return;
    }
    setLoading(true);
    try {
      const isLearningSpace = await getLearningSpace();
      const isAcademy = !!(await getAcademyDomain());

      const info =
        isAcademy || isLearningSpace
          ? await getInfo(Role.Student, isLearningSpace)
          : await getSuperAdminInfoFromWeb();
      if (!info.data) logout();

      setUser(info.data);
    } catch (err) {
      console.log({ err });
      logout();
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id && user.isFirstLogin) navigate(Routes.Onboarding);
    else navigate(Routes.Home);
  }, [isNotEnoughStatements]);

  useEffect(() => {
    !user?.id && loadInfo();
  }, [user?.id]);

  return (
    <SafeAreaView>
      <BaseHeader />
      <View style={{ marginTop: 85, paddingHorizontal: 24 }}>{children}</View>
    </SafeAreaView>
  );
};

export default LayoutApp;
