import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { palette, TYPO } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import TodayStudyTime from './TodayStudyTime'
import SubjectProgress from './SubjectProgress'
import Achievements from './Achievements'
import { Ionicons } from '@expo/vector-icons'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { useTranslation } from 'react-i18next'

type Props = {
  isOpen: boolean
  onClose?: () => void
  isTimerTab?: boolean
  textbookId?: number
  loadingSubjectCumulativeData: boolean
  loadingRankingData: boolean
  subjectCumulativeData: any
  subjectStudyTimeData: any
  rankingData: any
}

const TodayStudyDrawer = ({
  isOpen,
  loadingSubjectCumulativeData,
  onClose,
  isTimerTab = true,
  loadingRankingData,
  subjectStudyTimeData,
  subjectCumulativeData,
  rankingData
}: Props) => {
  const { t } = useTranslation()
  return (
    <SlideDrawerRoot visible={isOpen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[300]} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#222222' }}>{t('today_net_study_time')}</Text>
        </View>
        <View></View>
      </View>
      <ScrollView>
        <View style={styles.sidebarContainer}>
          <TodayStudyTime loading={loadingSubjectCumulativeData} data={subjectCumulativeData} isTimerTab={isTimerTab} />
          {isTimerTab && (
            <React.Fragment>
              <View style={styles.divider} />
              <SubjectProgress loading={loadingSubjectCumulativeData} data={subjectStudyTimeData} />
            </React.Fragment>
          )}
          <View style={styles.divider} />
          <Achievements loading={loadingRankingData} data={rankingData} isTimerTab={isTimerTab} />
        </View>
      </ScrollView>
    </SlideDrawerRoot>
  )
}

const styles = ScaledSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    borderBottomWidth: 1,
    borderColor: palette.grey[100]
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8
  },
  backText: {
    ...TYPO.button2,
    color: palette.grey[900]
  },
  sidebarContainer: {
    backgroundColor: palette.bg[100],
    borderRadius: 6
  },
  divider: {
    height: 1,
    backgroundColor: palette.grey[100]
  }
})

export default TodayStudyDrawer
