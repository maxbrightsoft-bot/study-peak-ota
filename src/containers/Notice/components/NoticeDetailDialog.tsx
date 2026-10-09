import { Text, TouchableOpacity, View, useWindowDimensions, ScrollView } from 'react-native'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import RenderHTML from 'react-native-render-html'
import { Notification } from '../configs/types'
import { useMemo } from 'react'

import NoteComments from './NoteComments'

type Props = {
  open: boolean
  onClose: () => void
  notification: Notification | null
}

const NoticeDetailDialog = ({ open, onClose, notification }: Props) => {
  const { t } = useTranslation()
  const { width } = useWindowDimensions()
  const stripHtml = (html?: string) => {
    if (!html) return ''
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
  }

  const renderHeaderContent = (item: any) => {
    const isNote = !!item?.isNote
    const titleText = isNote ? (stripHtml(item?.content) || item?.name) : item?.name
    const authorName = isNote ? (item?.name || item?.teacherName) : item?.teacherName

    return (
      <View style={styles.item}>
        <View style={styles.itemContent}>
          <Text style={styles.title}>
            {titleText}
          </Text>

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
    color: "#222222"
  }), [])

  return (
    <SlideDrawerRoot visible={open} onClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[800]} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {notification?.isNote ? t('student_notice_notes') : t('notice_detail')}
        </Text>

        <View style={{ width: 24 }} />
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
                <RenderHTML contentWidth={width - 40} source={htmlSource} baseStyle={baseStyle} />
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
            <RenderHTML contentWidth={width - 40} source={htmlSource} baseStyle={baseStyle} />
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
    width: '24@ms'
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
