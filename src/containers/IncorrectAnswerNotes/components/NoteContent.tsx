import React, { FC, useState, useEffect } from 'react'
import { View, TouchableOpacity, Image } from 'react-native'
import MathRender from '@/components/MathRender'
import { ScaledSheet } from 'react-native-size-matters'
import { getSafeUrl } from '@/utils/helpers'
import ImageViewerModal from '@/components/ModalBase/ImageViewerModal'

interface Props {
  content: string
  imageUrl?: string
}

const NoteContent: FC<Props> = ({ content, imageUrl }) => {
  const [isErrorImage, setErrorImage] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)

  useEffect(() => {
    setErrorImage(false)
  }, [imageUrl])

  return (
    <View style={styles.container}>
      <MathRender
        content={content}
        fontSize={14}
        textColor="#414E62"
      />

      {!isErrorImage && !!imageUrl && (
        <>
          <TouchableOpacity
            onPress={() => setShowFullImage(true)}
            activeOpacity={0.7}
            style={styles.imageThumbnail}
          >
            <Image
              source={{ uri: getSafeUrl(imageUrl) }}
              style={styles.thumbnail}
              resizeMode="cover"
              onError={(e) => {
                console.log('[NoteContent] Failed to load image:', imageUrl, 'safeUrl:', getSafeUrl(imageUrl), e.nativeEvent);
                setErrorImage(true);
              }}
            />
          </TouchableOpacity>

          <ImageViewerModal
            visible={showFullImage}
            imageUrl={imageUrl}
            onClose={() => setShowFullImage(false)}
          />
        </>
      )}
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    gap: '12@ms'
  },
  imageThumbnail: {
    width: '200@ms',
    height: '150@ms',
    borderRadius: '8@ms',
    overflow: 'hidden',
    alignSelf: 'flex-start'
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  }
})

export default NoteContent