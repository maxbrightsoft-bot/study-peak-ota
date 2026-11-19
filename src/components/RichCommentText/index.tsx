import React from 'react'
import { StyleProp, Text, TextStyle } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

type RichCommentTextProps = {
  content?: string | null
  textStyle?: StyleProp<TextStyle>
}

// Mention badge colours shared with the web comment editor (not in the app palette).
const MENTION_BG = '#e0f7fa'
const MENTION_TEXT = '#00796b'

// <span class="mention">…</span> | <span class="question-tag">…</span> | plain @name | any other tag
const TOKEN_REGEX =
  /(<span[^>]*class=["'][^"']*mention[^"']*["'][^>]*>(.*?)<\/span>)|(<span[^>]*class=["'][^"']*question-tag[^"']*["'][^>]*>(.*?)<\/span>)|(@(?:(?:Ẩn\s+danh|Anonymous|익명)\s*#\d+|[^\s@.,!?;:<>()]+))|(<[^>]+>)/gi

const decodeEntities = (text: string) =>
  text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")

/** Comment body from the web editor (HTML with mention spans) as text with mention badges. */
const RichCommentText = ({ content, textStyle }: RichCommentTextProps) => {
  if (!content) return null

  const text = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')

  const elements: React.ReactNode[] = []
  const regex = new RegExp(TOKEN_REGEX.source, TOKEN_REGEX.flags)
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(decodeEntities(text.substring(lastIndex, match.index)))
    }

    const [, htmlMention, htmlMentionContent, , , plainMention] = match
    const mention = htmlMention
      ? (() => {
          const clean = decodeEntities((htmlMentionContent || '').replace(/<[^>]+>/g, '').trim())
          return clean.startsWith('@') ? clean : `@${clean}`
        })()
      : plainMention

    if (mention) {
      // Nested Text (not a View) so the badge sits on the text baseline on Android.
      elements.push(
        <Text key={`m-${match.index}`} style={styles.mention}>
          {` ${mention} `}
        </Text>
      )
    }
    // question-tag spans and other tags are dropped

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    elements.push(decodeEntities(text.substring(lastIndex)))
  }

  return (
    <Text style={textStyle}>
      {elements.map((el, i) => (typeof el === 'string' ? <Text key={i}>{el}</Text> : el))}
    </Text>
  )
}

export default RichCommentText

const styles = ScaledSheet.create({
  mention: {
    backgroundColor: MENTION_BG,
    color: MENTION_TEXT,
    fontWeight: '700'
  }
})
