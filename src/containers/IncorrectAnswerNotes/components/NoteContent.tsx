import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import React, { FC, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native'
import MathRender from '@/components/MathRender'

interface Props {
  content: string
  imageUrl?: string
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const NoteContent: FC<Props> = ({ content, imageUrl }) => {
  const [isErrorImage, setErrorImage] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)

  return (
    <View style={styles.container}>
      <MathRender
        content={content}
        fontSize={14}
        textColor="#414E62"
      />

      {!isErrorImage && imageUrl && (
        <>
          <TouchableOpacity
            onPress={() => setShowFullImage(true)}
            activeOpacity={0.7}
            style={styles.imageThumbnail}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
              onError={() => setErrorImage(true)}
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
                source={{ uri: imageUrl }}
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

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  imageThumbnail: {
    width: 200,
    height: 150,
    borderRadius: 8,
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
    top: 40,
    right: 20,
    zIndex: 1001,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullImage: {
    width: screenWidth,
    height: screenHeight * 0.8
  }
})

export default NoteContent