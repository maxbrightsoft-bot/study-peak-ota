import { Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import RenderHTML from 'react-native-render-html'
import { Notification } from '../configs/types'
import { useMemo } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  notification: Notification | null
}

const NoticeDetailDialog = ({ open, onClose, notification }: Props) => {
  const { t } = useTranslation()
  const { width } = useWindowDimensions()

  const renderHeaderContent = (item: any) => {
    return (
      <View style={styles.item}>
        <View style={styles.itemContent}>
          <Text style={styles.title}>
            {item?.name}
          </Text>

          <Text style={styles.teacher}>{item?.teacherName}</Text>

          <Text style={styles.date}>{moment(item?.createdAt).format('YY.MM.DD')}</Text>
        </View>
      </View>
    )
  }

  const htmlSource = useMemo(() => ({
    html: notification?.content || ''
  }), [notification?.content])

  const baseStyle = useMemo(() => ({
    color: "#222222"
  }), [])

  return (
    <SlideDrawerRoot visible={open} onClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[800] || '#222'} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t('notice_detail')}</Text>

        <View style={{ width: 40 }} />
      </View>
      <View style={styles.container}>
        {renderHeaderContent(notification)}
        <View style={{ padding: 20 }}>
          <View>
            <RenderHTML contentWidth={width - 40} source={htmlSource} baseStyle={baseStyle} />
          </View>
        </View>
      </View>
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
    borderBottomColor: '#eee'
  },
  container: {
    paddingTop: '20@ms',
    backgroundColor: palette.bg[100]
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
