import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import NavigationHelpers from "@/navigators/NavigationHelpers";
import RouteName from "@/navigators/RouteName";
import { useEffect, useState } from "react";
import { login } from "@/services/api/login";
import useAuthStore from "@/store/useAuthStore";
import ModalBase from "@/components/ModalBase";
import { ActiveTabEstimates } from "@/assets/icons";
import styles from "./styles";
import HeaderBar from "@/components/HeaderBar";
import TextField from "@/components/TextField";

const HomePage = () => {
  const { count, setCount } = useAuthStore();
  const [isModal, setIsModal] = useState(false);
  const { t } = useTranslation();
  const [data, setData] = useState({
    currentPass: "",
    newPass: "",
    confirmPass: "",
  });
  useEffect(() => {
    getInfor();
  }, []);
  const getInfor = async () => {
    const res = await login();
    console.log("res", res);
  };
  const renderBodyModalVerification = () => {
    return (
      <View>
        <Text> SplashScreen</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        back
        title={"props?.title"}
        containerStyle={styles.containerHeader}
      />
      <TouchableOpacity
        onPress={() => {
          NavigationHelpers.navigate(RouteName.Login);
        }}
      >
        <Text>{t("welcome")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setIsModal(true);
        }}
      >
        <Text>count{count}</Text>
      </TouchableOpacity>
      <TextField
        containerInputStyle={styles.containerInputStyle}
        textInputStyle={styles.textInput}
        placeholder={"changePassword.passCurrent"}
        value={data.currentPass}
        onChangeText={(txt: string) => setData({ ...data, currentPass: txt })}
        labelStyle={styles.labelInput}
      />
      <ActiveTabEstimates />
      <ModalBase
        isVisible={isModal}
        onClose={() => setIsModal(false)}
        RenderBodyModal={renderBodyModalVerification}
      />
    </View>
  );
};
export default HomePage;
