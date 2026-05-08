import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from "@react-navigation/native"
import { useCallback, useRef, useState } from "react"
import { Platform } from "react-native"
import RNFS from 'react-native-fs'
import ReactNativeBlobUtil from 'react-native-blob-util'


const useSketchCanvas = () => {
  const [image, setImage] = useState('')
  const ref = useRef<any>()
  const [penColor, setPenColor] = useState('#000000')
  const [visible, setVisible] = useState(false)
  const [signature, setSignature] = useState('')
  const WIDTH_IMAGE = 300
  const HEIGHT_IMAGE = 300

  const handleOpenPenColor = () => {
    setVisible(true)
  }

  const handleClosePenColor = () => {
    setVisible(false)
  }

  const handleClear = () => {
    ref?.current?.clearSignature()
  }

  const handleUndo = () => {
    ref.current?.undo()
  }

  const handleRedo = () => {
    ref.current?.redo()
  }

  const handleEnd = () => {
    ref?.current?.readSignature()
  }

  const handleUploadImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets.length) return;

      const asset = result.assets[0];
      const mime = asset.mimeType || 'image/png';
      setImage(`data:${mime};base64,${asset.base64}`);
    } catch (error) {
      console.log('handleUploadImage error', error);
    }
  }

  const handleClearImage = () => {
    setImage('')
  }

  const handleChangePenColor = (selectedColor: string) => {
    ref?.current?.changePenColor(selectedColor)
  }

  const webStyle = `
  .m-signature-pad--footer {
    display: none;
    margin: 0px;
  }
    .m-signature-pad {
    box-sizing: border-box;
    width: ${WIDTH_IMAGE};
    height: ${HEIGHT_IMAGE};
  }
  .m-signature-pad--body {
    width: ${WIDTH_IMAGE};
    height: ${HEIGHT_IMAGE};
  }
  canvas {
    width: ${WIDTH_IMAGE};
    height: ${HEIGHT_IMAGE};
  }
`

  useFocusEffect(
    useCallback(() => {
      return () => {
        handleClear()
      }
    }, [])
  )

  const handleOK = async (signature: string) => {
    setSignature(signature)
  }

  return {
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
    handleChangePenColor,
    image,
    penColor,
    visible,
    handleClearImage,
    handleUploadImage
  }
}

export default useSketchCanvas