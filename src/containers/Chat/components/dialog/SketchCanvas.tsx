import CommonDialog from '@/components/ModalBase/CommonDialog'
import { palette, TYPO } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import SignatureCanvas from 'react-native-signature-canvas'
import { ScaledSheet } from 'react-native-size-matters'
import ColorPicker from 'react-native-wheel-color-picker'
import Tooltip from 'react-native-walkthrough-tooltip'
import useSketchCanvas from '../../hooks/useSketchCanvas'

type Props = {
  t: any
  open: boolean
  onSubmit: (data: string, callback: any) => void
  onClose: () => void
}
const SketchCanvas = ({ t, open, onClose, onSubmit }: Props) => {
  const {
    ref,
    WIDTH_IMAGE,
    HEIGHT_IMAGE,
    signature,
    handleClear,
    handleClosePenColor,
    handleOpenPenColor,
    webStyle,
    handleOK,
    setPenColor,
    handleEnd,
    handleUndo,
    handleRedo,
    handleClearImage,
    handleChangePenColor,
    image,
    penColor,
    visible,
    handleUploadImage
  } = useSketchCanvas()

  return (
    <CommonDialog isVisible={open} onClose={onClose} title={t('update_message')} disableInnerTouchable={true}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity style={styles.iconButton} onPress={handleUndo}>
          <Ionicons name="arrow-undo" size={15} color={palette.grey[500]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleRedo}>
          <Ionicons name="arrow-redo" size={15} color={palette.grey[500]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleClear}>
          <Ionicons name="close-outline" size={15} color={palette.grey[500]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleUploadImage}>
          <Ionicons name="image-outline" size={15} color={palette.grey[500]} />
        </TouchableOpacity>
        {image && (
          <TouchableOpacity style={styles.iconButton} onPress={handleClearImage}>
            <Ionicons name="ban-outline" size={15} color={palette.grey[500]} />
          </TouchableOpacity>
        )}
        <Tooltip
          isVisible={visible}
          onClose={handleClosePenColor}
          content={
            <ColorPicker
              color={penColor}
              thumbSize={40}
              sliderSize={40}
              onColorChange={(selectedColor) => {
                setPenColor(selectedColor)
                handleChangePenColor(selectedColor)
              }}
              useNativeDriver={false}
              useNativeLayout={false}
            />
          }
          placement="left"
        >
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: penColor }]}
            onPress={handleOpenPenColor}
          ></TouchableOpacity>
        </Tooltip>
      </View>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <View
          style={{
            height: HEIGHT_IMAGE,
            width: WIDTH_IMAGE,
            margin: 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: palette.grey[100]
          }}
        >
          <SignatureCanvas
            key={image || 'empty'}
            penColor={penColor}
            ref={ref}
            dataURL={image}
            style={styles.signature}
            onOK={handleOK}
            webStyle={webStyle}
            onEnd={handleEnd}
            clearText="Clear"
            confirmText="Save"
            androidHardwareAccelerationDisabled={true}
            backgroundColor={image ? "rgba(255,255,255,0)" : "rgba(255,255,255,1)"}
          />
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
          <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={() => onSubmit(signature, onClose)}>
          <Text style={styles.confirmButtonText}>{t('registration')}</Text>
        </TouchableOpacity>
      </View>
    </CommonDialog>
  )
}

const styles = ScaledSheet.create({
  container: {
    paddingVertical: '16@ms',
    paddingHorizontal: '24@ms'
  },
  titleText: {
    fontSize: '14@ms',
    fontWeight: 700,
    color: palette.main[700]
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: '16@ms',
  },
  iconButton: {
    width: '36@ms',
    height: '36@ms',
    borderRadius: '24@ms',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    paddingVertical: '12@ms',
    paddingHorizontal: '24@ms',
    borderRadius: '12@ms',
    minWidth: '120@ms',
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: palette.grey[100]
  },
  confirmButton: {
    backgroundColor: palette.main[600]
  },
  cancelButtonText: {
    ...TYPO.button2,
    color: palette.grey[700]
  },
  confirmButtonText: {
    ...TYPO.button2,
    color: 'white'
  },
  signature: {
    width: '100%',
    height: '100%'
  }
})

export default SketchCanvas
