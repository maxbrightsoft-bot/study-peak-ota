import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { palette, TYPO } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import TodayStudyTime from './TodayStudyTime'
import SubjectProgress from './SubjectProgress'
import Achievements from './Achievements'
import { Ionicons } from '@expo/vector-icons'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'

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
  return (
    <SlideDrawerRoot visible={isOpen}>
      <ScrollView>
        <View style={styles.sidebarContainer}>
          <View style={{ paddingVertical: 8, paddingHorizontal: 24 }}>
            <Text style={{ ...TYPO.heading3, textAlign: 'center' }}>생각의 지도 학원</Text>
          </View>
          <View
            style={{
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: palette.grey[100]
            }}
          >
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Ionicons name="chevron-back-outline" size={20} color={palette.grey[900]} />
              <Text style={[styles.backText]}>티로 가기</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#FFF',
    borderRadius: 6
  },
  divider: {
    height: 1,
    backgroundColor: palette.grey[100]
  }
})

export default TodayStudyDrawer
