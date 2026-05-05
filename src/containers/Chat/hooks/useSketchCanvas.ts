import { pick } from "@react-native-documents/picker"
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
      const [result] = await pick({
        mode: 'open',
        copyTo: 'cachesDirectory',
        allowVirtualFiles: true
      })

      let path = result.uri
      let base64 = ''

      if (Platform.OS === 'android' && path.startsWith('content://')) {
        base64 = await ReactNativeBlobUtil.fs.readFile(path, 'base64')
      } else {
        if (Platform.OS === 'android' && path.startsWith('file://')) {
          path = path.replace('file://', '')
        }
        if (!path) return
        base64 = await RNFS.readFile(path, 'base64')
      }

      const mime = result.type || 'image/png'
      if (base64) {
        base64 = base64.replace(/\s/g, '')
      }
      if (!base64) {
        console.log('Failed to read file! base64 is empty.')
      }
      setImage(`data:${mime};base64,${base64}`)
    } catch (error) {
      console.log('handleUploadImage error', error)
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