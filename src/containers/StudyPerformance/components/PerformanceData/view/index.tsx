import { palette } from '@/theme'
import React, { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { ms } from 'react-native-size-matters'
import TimePeriodSelector from '../../TimePeriodSelector'
import { Mode, timeTypeOptions } from '../../../configs/constants'
import { SubTab } from '../../../configs/types'
import useStudyPerformanceData from '../hooks/useStudyPerformanceData'

import { ss } from '../styles/styles'
import SummaryPanel from '../components/SummaryPanel'
import PerformancePanel from '../components/PerformancePanel'
import WeaknessPanel from '../components/WeaknessPanel'


type Props = {
  studentId?: number
  handleReadyPrint: () => void
}

const SummarySkeleton = () => (
  <View style={ss.panel}>
    <View style={[ss.section, { paddingTop: ms(16) }]}>
      <View style={{ backgroundColor: palette.grey[200], height: ms(150), borderRadius: ms(12), padding: ms(16), overflow: 'hidden' }}>
        <View style={{ width: '50%', height: ms(20), backgroundColor: palette.grey[300], borderRadius: ms(4), marginBottom: ms(12) }} />
        <View style={{ width: '30%', height: ms(40), backgroundColor: palette.grey[300], borderRadius: ms(4), marginBottom: ms(12) }} />
        <View style={{ flexDirection: 'row', gap: ms(10), width: '100%', justifyContent: 'space-between', marginTop: ms(10) }}>
          <View style={{ width: '28%', height: ms(30), backgroundColor: palette.grey[300], borderRadius: ms(4) }} />
          <View style={{ width: '28%', height: ms(30), backgroundColor: palette.grey[300], borderRadius: ms(4) }} />
          <View style={{ width: '28%', height: ms(30), backgroundColor: palette.grey[300], borderRadius: ms(4) }} />
        </View>
      </View>
    </View>
    <View style={[ss.section, ss.mt0]}>
      <View style={{ height: ms(20), width: '40%', backgroundColor: palette.grey[200], borderRadius: ms(4), marginBottom: ms(12) }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: ms(10), justifyContent: 'space-between' }}>
        <View style={{ width: '48%', height: ms(70), backgroundColor: palette.grey[200], borderRadius: ms(8) }} />
        <View style={{ width: '48%', height: ms(70), backgroundColor: palette.grey[200], borderRadius: ms(8) }} />
        <View style={{ width: '100%', height: ms(50), backgroundColor: palette.grey[200], borderRadius: ms(8) }} />
        <View style={{ width: '100%', height: ms(50), backgroundColor: palette.grey[200], borderRadius: ms(8) }} />
      </View>
    </View>
  </View>
)

const PerformanceSkeleton = () => (
  <View style={ss.panel}>
    <View style={[ss.section, ss.mt0, { paddingTop: ms(16) }]}>
      <View style={{ height: ms(20), width: '40%', backgroundColor: palette.grey[200], borderRadius: ms(4), marginBottom: ms(12) }} />
      <View style={{ height: ms(180), backgroundColor: palette.grey[200], borderRadius: ms(12), padding: ms(16) }} />
    </View>
    <View style={[ss.section, ss.mt0]}>
      <View style={{ height: ms(20), width: '40%', backgroundColor: palette.grey[200], borderRadius: ms(4), marginBottom: ms(12) }} />
      <View style={{ height: ms(100), backgroundColor: palette.grey[200], borderRadius: ms(12), padding: ms(16) }} />
    </View>
  </View>
)

const WeaknessSkeleton = () => (
  <View style={ss.panel}>
    <View style={[ss.section, ss.mt0, { paddingTop: ms(16) }]}>
      <View style={{ height: ms(20), width: '40%', backgroundColor: palette.grey[200], borderRadius: ms(4), marginBottom: ms(12) }} />
      <View style={{ gap: ms(12) }}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={{ height: ms(80), backgroundColor: palette.grey[200], borderRadius: ms(12) }} />
        ))}
      </View>
    </View>
  </View>
)

const PerformanceData = ({ studentId, handleReadyPrint }: Props) => {
  const [subTab, setSubTab] = useState<SubTab>(SubTab.SUMMARY)
  const scrollRef = useRef<ScrollView>(null)
  const {
    t,
    timeType,
    handleChangeTimeType,
    selectedSubject,
    handleChangeSubject,
    currentTime,
    handleChangeCurrentTime,
    subjectOptions,
    currentTimeOptions,
    summaryData,
    performanceData,
    weaknessData,
    loadingData,
    subjectDataRequest,
    loadingSummary,
    loadingAnalysis,
    loadingWeakness,
    todayData,
    loadingToday,
    dailyData,
    loadingDaily
  } = useStudyPerformanceData({ mode: Mode.Question, studentId }) as any

  useEffect(() => {
    if (handleReadyPrint) handleReadyPrint()
  }, [subTab])

  const handleSubTabChange = (tab: typeof subTab) => {
    setSubTab(tab)
    scrollRef.current?.scrollTo({ y: 0, animated: true })
  }

  const opt = currentTimeOptions?.find((i: any) => i.value === currentTime)
  const chartTitlePrefix = opt ? `${opt.label} ` : ''

  return (
    <View style={ss.mainContainer}>
      <View style={{ backgroundColor: '#FFFFFF', zIndex: 10, borderBottomWidth: 1, borderColor: palette.grey[200] }}>
        <TimePeriodSelector
          timeType={timeType}
          handleChangeTimeType={handleChangeTimeType}
          timeTypeOptions={timeTypeOptions(t)}
          subjectOptions={subjectOptions}
          selectedSubject={selectedSubject}
          handleChangeSubject={handleChangeSubject}
          currentTime={currentTime}
          handleChangeCurrentTime={handleChangeCurrentTime}
          currentTimeOptions={currentTimeOptions}
        />
      </View>

      <View style={ss.subTabNavigation}>
        {[SubTab.SUMMARY, SubTab.PERFORMANCE, SubTab.WEAKNESS].map((tab) => {
          const isActive = subTab === tab
          let labelText = ''
          switch (tab) {
            case SubTab.SUMMARY:
              labelText = t('summary')
              break
            case SubTab.PERFORMANCE:
              labelText = t('performance')
              break
            case SubTab.WEAKNESS:
              labelText = t('weakness')
              break
          }
          return (
            <TouchableOpacity key={tab} style={[ss.subTabButton]} onPress={() => handleSubTabChange(tab)}>
              <Text style={[ss.subTabText, isActive && ss.subTabTextActive]}>{labelText}</Text>
              {isActive && <View style={ss.subTabButtonActiveLine} />}
            </TouchableOpacity>
          )
        })}
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={ss.scrollContainer}>
        {subTab === SubTab.SUMMARY && (
          loadingDaily && !dailyData ? <SummarySkeleton /> : (summaryData ? (
            <SummaryPanel
              data={summaryData}
              todayData={dailyData?.today ?? todayData}
              dailyWeekActivity={dailyData?.weekActivity}
              t={t}
              timeType={timeType}
              loadingSummary={loadingSummary}
            />
          ) : null)
        )}
        {subTab === SubTab.PERFORMANCE && (
          loadingAnalysis ? <PerformanceSkeleton /> : (performanceData ? <PerformancePanel data={performanceData} t={t} timeType={timeType} periodDelta={summaryData?.period?.delta} dailyPeer={dailyData?.peer} /> : null)
        )}
        {subTab === SubTab.WEAKNESS && (
          loadingWeakness ? <WeaknessSkeleton /> : (weaknessData ? <WeaknessPanel data={weaknessData} t={t} timeType={timeType} /> : null)
        )}

      </ScrollView>
    </View>
  )
}

export default PerformanceData
