import React from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import useGuestResult from '../hooks/useGuestResult'
import { formatGuestElapsed } from '../configs/helpers'

const GuestResult = () => {
  const { t, result, error, isReady, secondsLeft, handleLeave } = useGuestResult()

  const rows = result
    ? [
        { label: t('exam'), value: result.examTitle },
        { label: t('guest_answered'), value: `${result.answeredCount} / ${result.totalQuestions}` },
        { label: t('guest_time_taken'), value: formatGuestElapsed(t, result.elapsedSeconds) }
      ]
    : []

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {!isReady ? (
          <ActivityIndicator size="large" color={palette.main[600]} />
        ) : (
          <>
            <View style={[styles.icon, !!error && styles.iconError]}>
              <Ionicons
                name={error ? 'alert' : 'checkmark'}
                size={40}
                color={error ? palette.red[900] : palette.success.main}
              />
            </View>
            <Text style={styles.title}>{t('guest_result_title')}</Text>
            {!!error && <Text style={styles.error}>{error}</Text>}

            {result && (
              <>
                <View style={styles.score}>
                  <Text style={styles.scoreLabel}>{t('score')}</Text>
                  <Text style={styles.scoreValue}>{`${result.earned} / ${result.total}`}</Text>
                  {result.isProvisional && (
                    <View style={styles.provisional}>
                      <Text style={styles.provisionalText}>{t('score_provisional')}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.card}>
                  {rows.map(row => (
                    <View key={row.label} style={styles.row}>
                      <Text style={styles.rowLabel}>{row.label}</Text>
                      <Text style={styles.rowValue} numberOfLines={2}>
                        {row.value}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>{t('parent_phone')}</Text>
                    <Text style={styles.rowValue}>{result.maskedParentPhone}</Text>
                  </View>
                </View>
              </>
            )}

            <Text style={styles.share}>{t('guest_result_share_note')}</Text>
            <View style={styles.paper}>
              <Ionicons name="document-text-outline" size={18} color={palette.main[600]} />
              <Text style={styles.paperText}>{t('guest_paper_return_note')}</Text>
            </View>

            <TouchableOpacity style={styles.next} onPress={handleLeave}>
              <Text style={styles.nextText}>{t('next_student_countdown', { seconds: Math.max(0, secondsLeft) })}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default GuestResult

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.grey[0]
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: '24@ms',
    paddingVertical: '32@ms',
    gap: '16@ms'
  },
  icon: {
    alignSelf: 'center',
    width: '76@ms',
    height: '76@ms',
    borderRadius: '38@ms',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.success.lighter
  },
  iconError: {
    backgroundColor: palette.red[300]
  },
  title: {
    textAlign: 'center',
    fontSize: '22@ms',
    fontWeight: '700',
    color: palette.grey[900]
  },
  error: {
    textAlign: 'center',
    fontSize: '14@ms',
    color: palette.red[900]
  },
  score: {
    alignItems: 'center',
    gap: '4@ms'
  },
  scoreLabel: {
    fontSize: '14@ms',
    color: palette.grey[500]
  },
  scoreValue: {
    fontSize: '34@ms',
    fontWeight: '700',
    color: palette.main[600]
  },
  provisional: {
    paddingHorizontal: '10@ms',
    paddingVertical: '3@ms',
    borderRadius: '10@ms',
    backgroundColor: palette.main[50]
  },
  provisionalText: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: palette.main[600]
  },
  card: {
    padding: '16@ms',
    borderRadius: '14@ms',
    backgroundColor: palette.grey[50],
    gap: '10@ms'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '12@ms'
  },
  rowLabel: {
    fontSize: '14@ms',
    color: palette.grey[500]
  },
  rowValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.grey[900]
  },
  share: {
    textAlign: 'center',
    fontSize: '14@ms',
    color: palette.grey[700]
  },
  paper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6@ms'
  },
  paperText: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.main[600]
  },
  next: {
    height: '52@ms',
    borderRadius: '14@ms',
    borderWidth: 1.5,
    borderColor: palette.main[600],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '12@ms'
  },
  nextText: {
    textAlign: 'center',
    fontSize: '15@ms',
    fontWeight: '600',
    color: palette.main[600]
  }
})
