import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { palette, TYPO } from '@/theme';
import ModalBase from './ModalBase';
import { Ionicons } from '@expo/vector-icons';
import { ScaledSheet } from 'react-native-size-matters';
import { PositionFlex } from '@/utils/enums';

interface CommonDialogProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode
  positionTitle?: PositionFlex
  isVisibleHeader?: boolean
}

const CommonDialog: React.FC<CommonDialogProps> = ({
  isVisible,
  onClose,
  title = '',
  children,
  positionTitle= PositionFlex.Center,
  isVisibleHeader = true
}) => {

  return (
    <ModalBase 
      isVisible={isVisible} 
      onClose={onClose}
      styleContainer={styles.container}
    >
      {isVisibleHeader && <View style={styles.header}>
        <Text style={[styles.title,{ alignSelf: positionTitle}]}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={30} color={palette.grey[900]} />
        </TouchableOpacity>
      </View>}

      <View style={styles.content}>
        {children}
      </View>

    </ModalBase>
  );
};

const styles = ScaledSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: '12@ms',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '24@ms',
    paddingVertical: '14@ms',
    borderBottomWidth: 1,
    borderBottomColor: palette.grey[200],
  },
  title: {
    ...TYPO.heading3,
    color: palette.grey[900],
  },
  closeButton: {
    padding: '4@ms',
  },
  content: {
    padding: '24@ms',
  },
  input: {
    borderWidth: 1,
    borderColor: palette.grey[300],
    borderRadius: '8@ms',
    padding: '12@ms',
    ...TYPO.body1,
    color: palette.grey[900],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: '16@ms',
    gap: '8@ms',
  },
  button: {
    paddingVertical: '8@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '8@ms',
    minWidth: '80@ms',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: palette.grey[500],
  },
  confirmButton: {
    backgroundColor: palette.primary.main,
  },
  cancelButtonText: {
    ...TYPO.button2,
    color: "#FFF",
  },
  confirmButtonText: {
    ...TYPO.button2,
    color: 'white',
  },
});

export default CommonDialog;
