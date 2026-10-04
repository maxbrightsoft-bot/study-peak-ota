import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import React, { FC, useState, useEffect } from 'react'
import { View, TouchableOpacity, Image, Dimensions } from 'react-native'
import MathRender from '@/components/MathRender'
import { ScaledSheet } from 'react-native-size-matters'
import { getSafeUrl } from '@/utils/helpers'

interface Props {
  content: string
  imageUrl?: string
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

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

          {showFullImage && (
            <View style={styles.fullImageOverlay}>
              <TouchableOpacity
                style={styles.closeFullImage}
                onPress={() => setShowFullImage(false)}
              >
                <Ionicons name="close-outline" size={15} color={palette.grey[500]} />
              </TouchableOpacity>

              <Image
                source={{ uri: getSafeUrl(imageUrl) }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </View>
          )}
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
  },
  fullImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeFullImage: {
    position: 'absolute',
    top: '40@ms',
    right: '20@ms',
    zIndex: 1001,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '20@ms',
    width: '40@ms',
    height: '40@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullImage: {
    width: screenWidth,
    height: screenHeight * 0.8
  }
})

export default NoteContent