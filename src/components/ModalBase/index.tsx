import { StyleProp, TouchableOpacity, View, ViewStyle } from "react-native";
import styles from "./styles";
import Modal from "react-native-modal/dist/modal";

interface PropsModalClose {
  isVisible: boolean;
  onClose: () => void;
  RenderBodyModal: JSX.Element | React.FC | any;
  styleContainer?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}
function ModalBase(props: PropsModalClose) {
  const { isVisible, onClose, RenderBodyModal, styleContainer, style } = props;

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.3}
      coverScreen
      onBackdropPress={onClose}
      style={style}
    >
      <View style={[styles.viewContainer, styleContainer]}>
        {RenderBodyModal && RenderBodyModal()}
      </View>
    </Modal>
  );
}

export default ModalBase;
