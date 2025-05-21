import { Alert } from "react-native";

export const dialogConfirm = (t: any, message: string, onCancel: any, onOk: any) => {
  Alert.alert(
    '',
    t(message),
    [
      {
        text: t('cancel'),
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: t('yes'),
        onPress: onOk,
      },
    ],
    { cancelable: false }
  );
};