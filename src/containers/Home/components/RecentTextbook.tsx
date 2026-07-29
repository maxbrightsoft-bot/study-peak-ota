import { palette, TYPO } from '@/theme'
import React, { useEffect, useState } from 'react'
import { View, ScrollView, TouchableOpacity, Text } from 'react-native'
import useRecentTextbook from '../hooks/useRecentTextbook'
import { utcToLocalTime } from '@/utils/helpers'
import ArrowRight from '@/assets/iconJSX/arrowRight'
import { ScaledSheet } from 'react-native-size-matters'
import AudioGuideModal from '@/layouts/components/AudioGuideModal'
import SelectTimeDialog from '@/layouts/components/SelectTimeDialog'
import TextTooltip from '@/components/Tooltip/TextTooltip'


const styles = ScaledSheet.create({
  container: {
  },
  header: {
    marginBottom: '16@ms',
  },
  headerTitle: {
    fontSize: '11@ms', color: palette.main[600], fontWeight: 500,
  },
  contentContainer: {
    gap: '12@ms',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16@ms',
    padding: '20@ms',
    gap: '12@ms'
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@ms',
  },
  subjectBadge: {
    backgroundColor: palette.grey[100],
    borderRadius: '999@ms',
    paddingVertical: '6@ms',
    paddingHorizontal: '14@ms',
  },
  subjectBadgeDark: {
    backgroundColor: palette.grey[900],
  },
  subjectBadgeText: {
    ...TYPO.body4,
    color: palette.grey[700],
    fontWeight: '600',
  },
  subjectBadgeTextDark: {
    color: '#FFFFFF',
  },
  textbookName: {
    ...TYPO.heading3,
    color: palette.grey[900],
    flex: 1,
  },
  deadline: {
    fontSize: '12@ms',
    fontWeight: 400,
    color: palette.grey[500],
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@ms',
  },
  progressPercent: {
    fontSize: '12@ms',
    fontWeight: 500,
    color: palette.grey[500],
    minWidth: '20@ms',
  },
  progressBarWrapper: {
    flex: 1,
    height: '8@ms',
    backgroundColor: palette.grey[200],
    borderRadius: '999@ms',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: palette.main[600],
    borderRadius: '999@ms',
  },
  startButton: {
    backgroundColor: palette.main[600],
    borderRadius: '999@ms',
    paddingVertical: '8@ms',
    paddingRight: '8@ms',
    paddingLeft: '12@ms',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '2@ms',
  },
  startButtonText: {
    ...TYPO.button3,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyText: {
    marginVertical: '20@ms',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '13@ms',
    lineHeight: '14@ms',
    color: palette.grey[500]
  },
  ctaWrapper: {
    borderRadius: '16@ms',
    paddingVertical: '24@ms',
    paddingHorizontal: '20@ms',
    alignItems: 'center',
    gap: '14@ms',
  },
  ctaText: {
    fontSize: '14@ms',
    color: palette.grey[500],
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: palette.main[600],
    borderRadius: '999@ms',
    paddingVertical: '10@ms',
    paddingHorizontal: '20@ms',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms',
  },
  ctaButtonText: {
    ...TYPO.button3,
    color: '#FFFFFF',
    fontWeight: '700',
  },
})

const RecentTextbook = () => {
  const [enableAudio, setEnableAudio] = useState(true)
  const {
    t,
    isRecentEmpty,
    textbookList,
    handleDoTextbook,
    handleGoToTextbookList,
    isOpenAudioGuide,
    handleCloseAudioGuide,
    selectedTextbook,
    handleStartTextbookFromGuideModal,
    isOpenTimeSelectModal,
    handleCloseTimeSelectModal,
    handleStartTextbook
  } = useRecentTextbook()

  useEffect(() => {
    if (isOpenAudioGuide) setEnableAudio(true)
  }, [isOpenAudioGuide, selectedTextbook?.id])

  const handleStartAudioGuide = (enable: boolean) => {
    setEnableAudio(enable)
    handleStartTextbookFromGuideModal(enable)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isRecentEmpty ? t('suggested_textbooks') : t('continue_solving_textbook')}</Text>
      </View>
      <ScrollView scrollEnabled={false}>
        <View style={styles.contentContainer}>
          {textbookList.map((textbook, index) => {
            const total = textbook?.totalQuestions || 1
            const completed = textbook.completedQuestions || 0
            const percent = Math.round((completed / total) * 100)

            return (
              <View key={textbook.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.subjectBadge, styles.subjectBadgeDark]}>
                    <Text style={[styles.subjectBadgeText, styles.subjectBadgeTextDark]}>
                      {textbook.subject?.name || textbook.subjectName || '—'}
                    </Text>
                  </View>
                  <TextTooltip
                    text={textbook.name}
                    numberOfLines={1}
                    textStyle={styles.textbookName}
                    containerStyle={{ flexShrink: 1}}
                  />
                </View>

                <Text style={styles.deadline}>
                  {utcToLocalTime(textbook.publicationDate, t('date_format'))}
                </Text>

                <View style={styles.progressRow}>
                  <Text style={styles.progressPercent}>{percent}%</Text>
                  <View style={styles.progressBarWrapper}>
                    <View style={[styles.progressBarFill, { width: `${percent}%` as any }]} />
                  </View>
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => handleDoTextbook(textbook)}
                  >
                    <Text style={styles.startButtonText}>{textbook.isStudying ? t('continue') : t('start')}</Text>
                    <ArrowRight color='#FFF' />
                  </TouchableOpacity>
                </View>
              </View>
            )
          })}
          {textbookList?.length === 0 && (
            <View style={styles.ctaWrapper}>
              <TouchableOpacity style={styles.ctaButton} onPress={handleGoToTextbookList}>
                <Text style={styles.ctaButtonText}>{t('start_your_textbook_now')}</Text>
                <ArrowRight color='#FFF' />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      {isOpenAudioGuide && (
        <AudioGuideModal
          open={isOpenAudioGuide}
          audioUrls={selectedTextbook?.subject?.audioUrls ?? []}
          onClose={handleCloseAudioGuide}
          onStart={handleStartAudioGuide}
        />
      )}
      {isOpenTimeSelectModal && (
        <SelectTimeDialog
          open={isOpenTimeSelectModal}
          t={t}
          title={t('select_timer_limit')}
          onClose={handleCloseTimeSelectModal}
          onSubmit={(minutes, skipPreAlarm) => {
            if (selectedTextbook) handleStartTextbook(enableAudio, selectedTextbook, minutes, skipPreAlarm)
          }}
          initialValue={selectedTextbook?.subject?.limitedTimeInMinutes || selectedTextbook?.limitedTimeInMinutes}
        />
      )}
    </View>
  )
}

export default RecentTextbook
