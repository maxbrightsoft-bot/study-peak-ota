import React, { useState } from 'react'
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native'
import { WebView } from 'react-native-webview'

interface Props {
  content?: string
  style?: ViewStyle
  textColor?: string
  fontSize?: number
  isChat?: boolean
  maxLines?: number
  onClamp?: (v: boolean) => void
}

const { width: SCREEN_W } = Dimensions.get('window')

const buildHTML = (content: string, fontSize: number, textColor: string, isChat?: boolean, maxLines?: number) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: ${fontSize}px;
  font-weight: 400;
  color: ${textColor};
  -webkit-text-size-adjust: 100%;
}

#content {
  display: inline-block;
  white-space: nowrap;
}

${maxLines ? `
#content.clamped {
  display: -webkit-box;
  -webkit-line-clamp: ${maxLines};
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
  word-break: break-word;
}
` : ''}

.katex { font-size: 1em; }
.katex-display { margin: 0; }
</style>
</head>
<body>

<div id="content">${content}</div>

<script>
const MAX_WIDTH = ${isChat ? Math.floor(SCREEN_W * 0.5) : "100%"};
const MAX_LINES = ${maxLines ?? 'null'};
const LINE_HEIGHT = ${fontSize} * 1.5;

function renderMath() {
  try {
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\\\(", right: "\\\\)", display: false },
        { left: "\\\\[", right: "\\\\]", display: true }
      ],
      throwOnError: false
    });
  } catch(e) {}
}

function measure() {
  const el = document.getElementById('content');
  const maxW = typeof MAX_WIDTH === 'number' ? MAX_WIDTH : window.innerWidth;
  const fullWidth = el.scrollWidth;
  const needsWrap = fullWidth > maxW;

  if (needsWrap) {
    el.style.whiteSpace = 'pre-wrap';
    el.style.wordBreak = 'break-word';
    el.style.width = maxW + 'px';
    el.style.display = 'block';
  }

  requestAnimationFrame(() => {
    const fullHeight = el.scrollHeight;
    const maxHeight = MAX_LINES ? Math.ceil(MAX_LINES * LINE_HEIGHT) : null;
    const isClamped = maxHeight && fullHeight > maxHeight;

    if (isClamped) {
      el.classList.add('clamped');
      if (needsWrap) el.style.display = '';
      requestAnimationFrame(() => {
        sendSize(
          needsWrap ? maxW : Math.ceil(el.scrollWidth),
          Math.ceil(el.scrollHeight),
          true
        );
      });
    } else {
      sendSize(
        needsWrap ? maxW : Math.ceil(fullWidth),
        Math.ceil(fullHeight),
        false
      );
    }
  });
}

function sendSize(w, h, isClamped) {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'size',
    width: Math.ceil(w),
    height: Math.ceil(h),
    isClamped: !!isClamped
  }));
}

function init() {
  renderMath();
  requestAnimationFrame(measure);
}

window.onload = init;
</script>

</body>
</html>
`

const MathRender = ({
  content = '',
  fontSize = 14,
  style,
  textColor = '#000',
  isChat,
  maxLines,
  onClamp,
}: Props) => {
  const [size, setSize] = useState({ width: 40, height: 20 })

  const handleMessage = (e: any) => {
    try {
      const data = JSON.parse(e.nativeEvent.data)
      if (data.type === 'size') {
        setSize({ width: data.width, height: data.height })
        onClamp?.(data.isClamped)
      }
    } catch { }
  }

  return (
    <View style={[styles.wrapper, { width: size.width, height: size.height }, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: buildHTML(content, fontSize, textColor, isChat, maxLines) }}
        onMessage={handleMessage}
        scrollEnabled={false}
        style={styles.webview}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { overflow: 'hidden' },
  webview: { flex: 1, backgroundColor: 'transparent' },
})

export default MathRender