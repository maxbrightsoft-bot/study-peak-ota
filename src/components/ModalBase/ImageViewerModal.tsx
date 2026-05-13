import React from 'react';
import { Modal, View, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScaledSheet } from 'react-native-size-matters'

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
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={32} color="#FFF" />
        </TouchableOpacity>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
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
    top: Platform.OS === 'ios' ? 60 : 40,
    right: '20@ms',
    zIndex: 10,
    padding: '8@ms',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: '25@ms',
  },
  image: {
    width: width,
    height: height,
  },
});

export default ImageViewerModal;
