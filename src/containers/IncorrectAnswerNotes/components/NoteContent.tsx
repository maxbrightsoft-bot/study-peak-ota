import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import React, { FC, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native'
import WebView from 'react-native-webview'

interface Props {
  content: string
  imageUrl?: string
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const NoteContent: FC<Props> = ({ content, imageUrl }) => {
  const [isErrorImage, setErrorImage] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)

  const renderSimpleHtml = (html: string) => {
    const cleanHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            margin: 0;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #414E62;
            line-height: 1.5;
          }
          img { max-width: 100%; height: auto; }
          p { margin: 8px 0; }
          strong { font-weight: bold; }
          em { font-style: italic; }
          ul, ol { margin-left: 20px; }
        </style>
      </head>
      <body>${cleanHtml}</body>
      </html>
    `

    return (
      <View style={styles.webviewWrapper}>
        <WebView
          source={{ html: htmlContent }}
          style={styles.webview}
          javaScriptEnabled={true}
          scalesPageToFit={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {renderSimpleHtml(content)}
      {!isErrorImage && imageUrl && (
        <>
          <TouchableOpacity onPress={() => setShowFullImage(true)} activeOpacity={0.7} style={styles.imageThumbnail}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
              onError={() => setErrorImage(true)}
            />
            {/* <View style={styles.zoomIcon}>
              <Icon name="zoom-in" size={20} color="#FFFFFF" />
            </View> */}
          </TouchableOpacity>

          {showFullImage && (
            <View style={styles.fullImageOverlay}>
              <TouchableOpacity style={styles.closeFullImage} onPress={() => setShowFullImage(false)}>
                <Ionicons name="close-outline" size={15} color={palette.grey[500]} />
              </TouchableOpacity>

              <Image source={{ uri: imageUrl }} style={styles.fullImage} resizeMode="contain" />
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
  webviewWrapper: {
    height: 250,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#FFFFFF'
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  imageThumbnail: {
    width: 200,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'flex-start'
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  },
  zoomIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
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
