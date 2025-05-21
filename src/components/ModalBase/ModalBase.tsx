import { StyleProp, View, ViewStyle } from "react-native";
import Modal from "react-native-modal/dist/modal";
import { ReactNode } from "react";
import { ScaledSheet } from "react-native-size-matters";
import Toast from "react-native-toast-message";

interface PropsModalClose {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
  styleContainer?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}
function ModalBase(props: PropsModalClose) {
  const { isVisible, onClose, children, styleContainer, style } = props;

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.3}
      onBackdropPress={onClose}
      style={[styles.modalContainer, style]}
      avoidKeyboard
    >
      <View style={[styles.viewContainer, styleContainer]}>
        {children}
      </View>
      <Toast position="top" topOffset={10} />
    </Modal>
  );
}

export default ModalBase;

const styles =  ScaledSheet.create({
  modalContainer: {
  },
  container: {
    paddingHorizontal: "15@ms",
  },
  viewContainer: {
    borderRadius: "10@ms",
  },
});
