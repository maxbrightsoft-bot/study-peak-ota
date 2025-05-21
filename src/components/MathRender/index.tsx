import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  content: string;
  isMathML?: boolean;
}

const MathRender = ({ content, isMathML = true }: Props) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        ${
          isMathML
            ? `<style>
                math { font-size: 20px; }
              </style>`
            : `<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
              <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>`
        }
      </head>
      <body>
        ${isMathML ? content : `<div id="math">${content}</div>`}
      </body>
    </html>
  `;

  function simpleMathMLToLatex(mathml: string): string {
  return mathml
    .replace(/<math[^>]*>/g, '')
    .replace(/<\/math>/g, '')
    .replace(/<msqrt><mn>(.*?)<\/mn><\/msqrt>/g, (_, val) => `\\( \\sqrt{${val}} \\)`)
    .replace(/<mfrac><mn>(.*?)<\/mn><mn>(.*?)<\/mn><\/mfrac>/g, (_, top, bottom) => `\\( \\frac{${top}}{${bottom}} \\)`)
    .replace(/<sup>(.*?)<\/sup>/g, (_, val) => `^{${val}}`)
    .replace(/&nbsp;/g, ' ')
    .replace(/<p>(.*?)<\/p>/g, (_, content) => `<p>${content}</p>`);
}

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        javaScriptEnabled
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    width: '100%',
  },
});

export default MathRender;
