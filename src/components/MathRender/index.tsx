import React, { useState } from 'react'
import { View, Text, ViewStyle, Dimensions } from 'react-native'
import { WebView } from 'react-native-webview'
import { ScaledSheet } from 'react-native-size-matters'

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

const containsMathOrHtml = (str?: string): boolean => {
  if (!str) return false;
  return (
    str.includes('$') ||
    str.includes('\\') ||
    str.includes('<') ||
    str.includes('>') ||
    str.includes('{') ||
    str.includes('}')
  );
};

const buildHTML = (
  content: string,
  fontSize: number,
  textColor: string,
  isChat?: boolean,
  maxLines?: number
) => `
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
  color: ${textColor};
  -webkit-text-size-adjust: 100%;
}

#content {
  display: block;
  width: 100%;
  word-break: break-word;
  white-space: pre-wrap;
  overflow: hidden;
}

${isChat ? `
#content {
  display: inline-block;
  width: auto;
  max-width: ${Math.floor(SCREEN_W * 0.65)}px;
  white-space: pre;
}
#content.wrap {
  display: block;
  width: ${Math.floor(SCREEN_W * 0.65)}px;
  white-space: pre-wrap;
  word-break: break-word;
}
` : ''}

#content.clamped {
  display: -webkit-box !important;
  -webkit-line-clamp: ${maxLines ?? 1};
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  white-space: pre-wrap;
}

.katex { font-size: 1em; }
.katex-display { margin: 0; }
</style>
</head>

<body>
<div id="content">${content}</div>

<script>
const IS_CHAT = ${isChat ? 'true' : 'false'};
const MAX_LINES = ${maxLines ?? 'null'};
const CHAT_MAX_W = ${isChat ? Math.floor(SCREEN_W * 0.65) : 0};

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

function sendSize(w, h, isClamped) {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'size',
    width: Math.ceil(w),
    height: Math.ceil(h),
    isClamped: !!isClamped
  }));
}

function applyClampIfNeeded(el, finalW, fullH) {
  if (!MAX_LINES) {
    sendSize(finalW, fullH, false);
    return;
  }

  const lineH = parseFloat(getComputedStyle(el).lineHeight) || ${fontSize} * 1.4;
  const maxH = Math.ceil(MAX_LINES * lineH);

  if (fullH > maxH) {
    el.classList.add('clamped');
    requestAnimationFrame(() => {
      const clampedH = el.getBoundingClientRect().height;
      sendSize(finalW, clampedH, true);
    });
  } else {
    sendSize(finalW, fullH, false);
  }
}

function measure() {
  const el = document.getElementById('content');

  if (IS_CHAT) {
    const naturalW = el.scrollWidth;
    const needsWrap = naturalW > CHAT_MAX_W;

    if (needsWrap) {
      el.classList.add('wrap');
    }

    requestAnimationFrame(() => {
      const finalW = needsWrap ? CHAT_MAX_W : naturalW;
      const fullH = el.getBoundingClientRect().height;
      applyClampIfNeeded(el, finalW, fullH);
    });
  } else {
    const fullH = el.getBoundingClientRect().height;
    applyClampIfNeeded(el, window.innerWidth, fullH);
  }
}

function init() {
  renderMath();
  requestAnimationFrame(() => requestAnimationFrame(measure));
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

  if (!containsMathOrHtml(content)) {
    return (
      <View style={[styles.wrapper, style]}>
        <Text
          style={{
            fontSize,
            color: textColor,
            lineHeight: Math.round(fontSize * 1.4)
          }}
          numberOfLines={maxLines}
        >
          {content}
        </Text>
      </View>
    );
  }

  const handleMessage = (e: any) => {
    try {
      const data = JSON.parse(e.nativeEvent.data)

      if (data.type === 'size') {
        setSize({
          width: data.width,
          height: data.height
        })

        onClamp?.(data.isClamped)
      }
    } catch {}
  }

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: isChat ? size.width : '100%',
          height: size.height
        },
        style
      ]}
    >
      <WebView
        originWhitelist={['*']}
        source={{
          html: buildHTML(content, fontSize, textColor, isChat, maxLines)
        }}
        onMessage={handleMessage}
        scrollEnabled={false}
        style={styles.webview}
      />
    </View>
  )
}

const styles = ScaledSheet.create({
  wrapper: {
    overflow: 'hidden'
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent'
  },
})

export default MathRender