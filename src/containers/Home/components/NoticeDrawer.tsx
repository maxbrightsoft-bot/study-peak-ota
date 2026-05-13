import { palette, TYPO } from '@/theme'
import RenderHtml from 'react-native-render-html'
import { Notification } from '@/utils/types'
import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import { Divider } from 'react-native-paper'
import { ScaledSheet } from 'react-native-size-matters'
import { utcToLocalTime } from '@/utils/helpers'
import { TypeNotificationEnum } from '../configs/constants'
import SlideDrawer from '@/components/ModalBase/SlideDrawer'

type Props = {
  t: any
  open: boolean
  onClose: () => void
  notification: Notification | null
}

const NoticeDrawer = ({ t, open, onClose, notification }: Props) => {
  const { width } = useWindowDimensions()

  const htmlSource = React.useMemo(() => {
    return {
      html: `<div style="color: ${palette.grey[700]}; font-size: 14px;">
      ${notification?.content || ''}
    </div>`
    }
  }, [notification?.content])

  const renderBodyModal = () => {
    return (
      <View style={style.viewContainer}>
        <TouchableOpacity style={style.navigate} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.main[500]} />
          <Text style={{ ...TYPO.button2, color: palette.main[500] }}>{t('back')}</Text>
        </TouchableOpacity>
        <Divider />
        <View style={style.contentContainer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
              gap: 8
            }}
          >
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{ ...TYPO.heading1, color: palette.grey[900], width: '60%' }}
            >
              {notification?.name}
            </Text>
            <Text style={{ ...TYPO.button3, color: palette.grey[700] }}>
              {t(`${TypeNotificationEnum[notification?.type || 0]?.toLocaleLowerCase()}`)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              gap: 8
            }}
          >
            <Text style={{ ...TYPO.button3, color: palette.grey[500] }}></Text>
            <Text numberOfLines={2} ellipsizeMode="tail" style={{ ...TYPO.button3, color: palette.grey[500] }}>
              {utcToLocalTime(notification?.createdAt, t('date_format'))}
            </Text>
          </View>
          <ScrollView>
            <RenderHtml
              contentWidth={width}
              source={htmlSource}
            />
          </ScrollView>
        </View>
      </View>
    )
  }

  return <SlideDrawer visible={open}>{renderBodyModal()}</SlideDrawer>
}

export default NoticeDrawer

export const style = ScaledSheet.create({
  navigate: {
    paddingVertical: '16@ms',
    paddingHorizontal: '24@ms',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  viewContainer: {
    backgroundColor: '#FFF'
  },
  contentContainer: {
    padding: '24@ms'
  }
})
