import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import DoExam from '@/containers/DoExam'
import { Routes } from '@/navigators/RouteName'
import { startGuestPusher } from '../utils/guestPusher'
import { resetToGuestStart } from '../utils/guestNavigation'
import { GuestSession, loadGuestSession } from '../utils/guestSession'

/** The existing student exam screen, running on the guest token. */
const GuestExam = () => {
  const navigation = useNavigation<any>()
  const [session, setSession] = useState<GuestSession | null>()

  useEffect(() => {
    loadGuestSession().then(value => {
      if (!value) {
        setSession(null)
        resetToGuestStart()
        return
      }
      setSession(value)
      // Live events (teacher pause/resume, extra time, end) come over the exam channel.
      startGuestPusher(value)
    })
  }, [])

  // The result replaces the exam: Back can't reopen a finished attempt.
  const handleExamEnded = useCallback(() => navigation.replace(Routes.UnAuth.GuestResult), [navigation])

  // "Solve it later", cancelled or not-found exam: reset to [Login, GuestCode] so the exam unmounts and
  // Back can't return to it (the code screen drops the guest token on focus).
  const handleExit = useCallback(() => resetToGuestStart(), [])

  if (!session) return <View style={styles.container} />

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DoExam examCode={session.code} guest={session} onGuestExamEnded={handleExamEnded} onGuestExit={handleExit} />
    </SafeAreaView>
  )
}

export default GuestExam

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.grey[0]
  }
})
