import React from 'react'
import { View, ViewStyle, StyleProp } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import useAuthStore from '@/store/useAuthStore'
import useStudyTimerStore from '@/store/useStudyTimerStore'
import { FEATURE_STUDYTIMER } from '@/utils/constants'
import { Role } from '@/utils/enums'

type Props = { style?: StyleProp<ViewStyle> }

/** Red dot while the student has unread teacher messages. Renders nothing for other roles or with the flag off. */
const StudyTimerUnreadDot = ({ style }: Props) => {
  const isStudent = useAuthStore((s) => !!s.user?.roles?.includes(Role.Student))
  const unread = useStudyTimerStore((s) => s.badge?.unreadMessages ?? 0)
  if (!FEATURE_STUDYTIMER || !isStudent || unread <= 0) return null
  return <View style={[styles.dot, style]} testID="studytimer-unread-dot" pointerEvents="none" />
}

export default StudyTimerUnreadDot

const styles = ScaledSheet.create({
  dot: {
    width: '8@ms',
    height: '8@ms',
    borderRadius: '4@ms',
    backgroundColor: palette.error.main
  }
})
