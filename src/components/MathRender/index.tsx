import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { WebView } from 'react-native-webview'

interface Props {
  content?: string
  isMathML?: boolean
  style?: ViewStyle
  textColor?: string
  fontSize?: number
}

const MathRender = ({ content, fontSize, style, textColor }: Props) => {
  const mathHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
      <script id="MathJax-script" async
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
      <style>
        body {
          font-size: ${fontSize ? `${fontSize}px` : '48px'};
          line-height: 1;
          color: ${textColor ?? '#000'};
          margin: 0;
          padding: 0;
        }
        p {
          font-weight: 500,
          width: fit-content
        }
      </style>
    </head>
    <body>
      <div id="math-content">
        ${content}
      </div>
    </body>
    </html>
  `

  return (
    <View style={styles.wrapper}>
      <WebView style={[styles.container, style]} originWhitelist={['*']} source={{ html: mathHTML }} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 30,
    minWidth: 40,
  },
  container: {
  }
})

export default MathRender
