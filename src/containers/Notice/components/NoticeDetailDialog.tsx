import { Text, TouchableOpacity, View, useWindowDimensions, ScrollView, Platform } from 'react-native'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import RenderHTML from 'react-native-render-html'
import { Notification } from '../configs/types'
import { useMemo } from 'react'
import { stripHtml } from '@/utils/helpers'

import NoteComments from './NoteComments'

type Props = {
  open: boolean
  onClose: () => void
  notification: Notification | null
}

const NoticeDetailDialog = ({ open, onClose, notification }: Props) => {
  const { t } = useTranslation()
  const { width } = useWindowDimensions()

  const renderHeaderContent = (item: any) => {
    const isNote = !!item?.isNote
    const titleText = isNote ? (item?.title || '') : stripHtml(item?.name)
    const authorName = isNote ? (item?.name || item?.teacherName) : item?.teacherName

    return (
      <View style={styles.item}>
        <View style={styles.itemContent}>
          {!!titleText && (
            <Text style={styles.title}>
              {titleText}
            </Text>
          )}

          {authorName ? <Text style={styles.teacher}>{authorName}</Text> : null}

          <Text style={styles.date}>{moment(item?.createdAt).format('YY.MM.DD')}</Text>
        </View>
      </View>
    )
  }

  const htmlSource = useMemo(() => {
    const rawContent = notification?.content || ''
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(rawContent)
    const formattedHtml = hasHtmlTags ? rawContent : `<p style="font-size:15px;line-height:22px;color:#222;">${rawContent.replace(/\n/g, '<br/>')}</p>`
    return { html: formattedHtml }
  }, [notification?.content])

  const baseStyle = useMemo(() => ({
    color: palette.grey[800],
    fontSize: 15,
    lineHeight: 22
  }), [])

  const tagsStyles = useMemo(
    () => ({
      body: {
        color: palette.grey[800],
        fontSize: 15,
        lineHeight: 22
      },
      h1: {
        fontSize: 22,
        fontWeight: '700' as const,
        color: palette.grey[900],
        marginTop: 12,
        marginBottom: 6,
        lineHeight: 28
      },
      h2: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: palette.grey[900],
        marginTop: 10,
        marginBottom: 6,
        lineHeight: 24
      },
      h3: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: palette.grey[900],
        marginTop: 8,
        marginBottom: 4,
        lineHeight: 22
      },
      h4: {
        fontSize: 15,
        fontWeight: '700' as const,
        color: palette.grey[900],
        marginTop: 6,
        marginBottom: 4
      },
      h5: {
        fontSize: 14,
        fontWeight: '700' as const,
        color: palette.grey[900],
        marginTop: 6,
        marginBottom: 4
      },
      h6: {
        fontSize: 13,
        fontWeight: '700' as const,
        color: palette.grey[900],
        marginTop: 4,
        marginBottom: 4
      },
      p: {
        fontSize: 15,
        lineHeight: 22,
        color: palette.grey[800],
        marginTop: 0,
        marginBottom: 8
      },
      strong: {
        fontWeight: '700' as const,
        color: palette.grey[900]
      },
      b: {
        fontWeight: '700' as const,
        color: palette.grey[900]
      },
      em: {
        fontStyle: 'italic' as const
      },
      i: {
        fontStyle: 'italic' as const
      },
      u: {
        textDecorationLine: 'underline' as const
      },
      ins: {
        textDecorationLine: 'underline' as const
      },
      s: {
        textDecorationLine: 'line-through' as const
      },
      strike: {
        textDecorationLine: 'line-through' as const
      },
      del: {
        textDecorationLine: 'line-through' as const
      },
      a: {
        color: palette.main[600],
        textDecorationLine: 'underline' as const
      },
      blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: palette.main[400],
        paddingLeft: 12,
        marginVertical: 8,
        fontStyle: 'italic' as const,
        color: palette.grey[600]
      },
      code: {
        backgroundColor: '#F3F4F6',
        color: '#E11D48',
        fontSize: 13,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
      },
      pre: {
        backgroundColor: '#F3F4F6',
        padding: 10,
        borderRadius: 6,
        marginVertical: 8
      },
      ul: {
        marginVertical: 4,
        paddingLeft: 16
      },
      ol: {
        marginVertical: 4,
        paddingLeft: 16
      },
      li: {
        fontSize: 15,
        lineHeight: 22,
        color: palette.grey[800],
        marginBottom: 4
      },
      mark: {
        backgroundColor: '#FEF08A',
        color: palette.grey[900]
      },
      img: {
        maxWidth: '100%',
        borderRadius: 8,
        marginVertical: 8
      },
      hr: {
        backgroundColor: palette.grey[200],
        height: 1,
        marginVertical: 12
      },
      table: {
        borderWidth: 1,
        borderColor: palette.grey[200],
        marginVertical: 8
      },
      th: {
        backgroundColor: palette.grey[50],
        fontWeight: '700' as const,
        padding: 8,
        borderWidth: 1,
        borderColor: palette.grey[200]
      },
      td: {
        padding: 8,
        borderWidth: 1,
        borderColor: palette.grey[200]
      }
    }),
    []
  )

  const classesStyles = useMemo(
    () => ({
      'ql-align-center': { textAlign: 'center' as const },
      'ql-align-right': { textAlign: 'right' as const },
      'ql-align-justify': { textAlign: 'justify' as const },
      'ql-size-small': { fontSize: 12, lineHeight: 18 },
      'ql-size-large': { fontSize: 18, lineHeight: 26 },
      'ql-size-huge': { fontSize: 24, lineHeight: 32 },
      'text-center': { textAlign: 'center' as const },
      'text-right': { textAlign: 'right' as const },
      'text-justify': { textAlign: 'justify' as const }
    }),
    []
  )

  return (
    <SlideDrawerRoot visible={open} onClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[800]} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {notification?.isNote ? t('student_notice_notes') : t('notice_detail')}
        </Text>

        <View style={{ width: 40 }} />
      </View>
      {notification?.isNote ? (
        <NoteComments
          noteId={notification?.id}
          visible={open}
          t={t}
          headerContent={
            <>
              {renderHeaderContent(notification)}
              <View style={styles.htmlWrapper}>
                <RenderHTML
                  contentWidth={width - 40}
                  source={htmlSource}
                  baseStyle={baseStyle}
                  tagsStyles={tagsStyles}
                  classesStyles={classesStyles}
                />
              </View>
            </>
          }
        />
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {renderHeaderContent(notification)}
          <View style={styles.htmlWrapper}>
            <RenderHTML
              contentWidth={width - 40}
              source={htmlSource}
              baseStyle={baseStyle}
              tagsStyles={tagsStyles}
              classesStyles={classesStyles}
            />
          </View>
        </ScrollView>
      )}
    </SlideDrawerRoot>
  )
}

export default NoticeDetailDialog

const styles = ScaledSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#eee',
    backgroundColor: '#fff'
  },
  container: {
    flex: 1,
    backgroundColor: palette.bg[100]
  },
  scrollContent: {
    paddingTop: '20@ms',
    paddingBottom: '40@ms'
  },
  htmlWrapper: {
    padding: '20@ms'
  },

  headerTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#222'
  },

  backButton: {
    width: '40@ms',
    height: '40@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    borderBottomWidth: '1@ms',
    borderColor: palette.grey[100]
  },

  itemContent: {
    flex: 1,
    gap: '8@ms',
    marginRight: '12@ms'
  },

  title: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: palette.grey[900]
  },

  teacher: {
    fontSize: '12@ms',
    fontWeight: '500',
    color: palette.grey[700]
  },

  date: {
    fontSize: '12@ms',
    fontWeight: '400',
    color: palette.grey[500]
  }
})
