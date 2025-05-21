import { palette, TYPO } from '@/theme'
import RenderHtml from 'react-native-render-html'
import { Notification } from '@/utils/types'
import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { Text, TouchableOpacity, useWindowDimensions, View } from 'react-native'
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
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}
          >
            <Text style={{ ...TYPO.heading1, color: palette.grey[900], width: '60%' }}>{notification?.name}</Text>
            <Text style={{ ...TYPO.button3, color: palette.grey[700] }}>
              {notification?.type !== undefined
                ? t(`${TypeNotificationEnum[notification.type].toLocaleLowerCase()}`)
                : notification?.name}
            </Text>
          </View>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
          >
            <Text style={{ ...TYPO.button3, color: palette.grey[500] }}></Text>
            <Text style={{ ...TYPO.button3, color: palette.grey[500] }}>
              {utcToLocalTime(notification?.createdAt, t('date_format'))}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <RenderHtml
              contentWidth={width}
              source={{
                html: `<div style=${{ ...TYPO.button3, color: palette.grey[700] }}>${notification?.content || ''}</div>`
              }}
            />
          </View>
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
    gap: 8
  },
  viewContainer: {
    backgroundColor: '#FFF'
  },
  contentContainer: {
    padding: '24@ms'
  }
})
