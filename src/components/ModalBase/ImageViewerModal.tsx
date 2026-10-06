import React from 'react';
import { Modal, View, Image, TouchableOpacity, Dimensions, Platform, StatusBar, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScaledSheet } from 'react-native-size-matters';
import { getSafeUrl } from '@/utils/helpers';

const { width, height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

const ImageViewerModal: React.FC<Props> = ({ visible, imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.95)" translucent={true} />
      <View style={styles.container}>
        <TouchableOpacity
          style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={onClose}
        >
          <Image
            source={{ uri: getSafeUrl(imageUrl) }}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Ionicons name="close" size={30} color="#FFF" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40),
    right: '20@ms',
    zIndex: 10,
    padding: '8@ms',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: '25@ms',
  },
  image: {
    width: width,
    height: height,
  },
});

export default ImageViewerModal;
