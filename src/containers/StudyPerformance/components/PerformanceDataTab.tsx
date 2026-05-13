import React, { useEffect, useState } from 'react'
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native'
import TimePeriodSelector from './TimePeriodSelector'
import { Mode, timeTypeOptions } from '../configs/constants'
import StudyTimeChart from './StudyTimeChart'
import Achievements from './Achievements'
import TodayStudyTime from './TodayStudyTime'
import useStudyPerformanceData from '../hooks/useStudyPerformanceData'
import SubjectDistribution from './SubjectDistribution'
import SubjectStatics from './SubjectStatics'
import { StudentInfo } from '@/utils/types'
import InforPrint from './InforPrint'
import TodayStudyDrawer from './TodayStudyDrawer'
import { palette } from '@/theme'
import TodayStudyTimeCard from './TodayStudyTimeCard'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  studentId?: number
  contentRef?: React.RefObject<FlatList>
  studentInfo?: StudentInfo
  handleReadyPrint: () => void
}

const PerformanceData = ({ studentId, contentRef, studentInfo, handleReadyPrint }: Props) => {
  const {
    t,
    data,
    colorSubjects,
    rankingData,
    loadingData,
    overallData,
    visible,
    handleToggle,
    loadingSubjectData,
    loadingRankingData,
    loadingSubjectCumulativeData,
    subjectOptions,
    handlePrevious,
    handleNext,
    isDisableNavigation,
    currentTimeOptions,
    selectedSubject,
    handleChangeSubject,
    categoryStudyTimeCharts,
    labelStudyTimeChart,
    subjectCumulativeData,
    studyTimeDistributionData,
    timeType,
    currentTime,
    handleChangeCurrentTime,
    handleChangeTimeType,
    loadingSubjects
  } = useStudyPerformanceData({ mode: Mode.Question, studentId }) as any

  const [isRenderStudyTimeChart, setRenderStudyTimeChart] = useState(false)

  useEffect(() => {
    const isReady =
      isRenderStudyTimeChart &&
      !loadingSubjectData &&
      !loadingData &&
      !loadingRankingData &&
      !loadingSubjectCumulativeData &&
      !loadingSubjects

    if (!isReady) return
    handleReadyPrint()
  }, [
    isRenderStudyTimeChart,
    loadingSubjectData,
    loadingData,
    loadingRankingData,
    loadingSubjectCumulativeData,
    loadingSubjects
  ])

  const sections = [
    { key: 'study_time_chart' },
    ...(studyTimeDistributionData.length ? [{ key: 'subject_distribution' }] : []),
    { key: 'subject_statics' }
  ]

  const renderItem = ({ item }: { item: { key: string } }) => {
    switch (item.key) {
      case 'study_time_chart':
        return (
          <View style={styles.section}>
            {!data || loadingSubjects || loadingData ? (
              <View style={[styles.paper, styles.chartPlaceholder]}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : (
              <StudyTimeChart
                data={data}
                loading={loadingSubjects || loadingData}
                isTimerTab={false}
                currentTime={currentTime}
                isDisableNavigation={isDisableNavigation}
                onNext={handleNext}
                onPrevious={handlePrevious}
                renderChart={() => setRenderStudyTimeChart(true)}
                overallData={overallData}
                timeType={timeType}
                label={labelStudyTimeChart}
                categories={categoryStudyTimeCharts}
              />
            )}
          </View>
        )

      case 'subject_distribution':
        return (
          <View style={styles.section}>
            <SubjectDistribution
              loading={loadingSubjects || loadingSubjectData}
              isTimerTab={false}
              data={studyTimeDistributionData}
              colorSubjects={colorSubjects}
            />
          </View>
        )

      case 'subject_statics':
        return (
          <View style={styles.section}>
            <SubjectStatics loading={loadingSubjects || loadingSubjectData} data={studyTimeDistributionData} />
          </View>
        )

      default:
        return null
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: '#f9fafb' }]}>
      <TodayStudyTimeCard data={subjectCumulativeData} onOpen={handleToggle} />
      <View style={{ ...styles.section, padding: 24, backgroundColor: '#FFF', zIndex: 10 }}>
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
      <FlatList
        ref={contentRef}
        data={sections}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 800, gap: 10, backgroundColor: palette.main[50], paddingHorizontal: 24, paddingTop: 24 }}
        ListFooterComponent={
          visible ? (
            <TodayStudyDrawer
              isOpen={visible}
              isTimerTab={false}
              onClose={handleToggle}
              loadingRankingData={loadingRankingData}
              loadingSubjectCumulativeData={loadingSubjectCumulativeData}
              subjectCumulativeData={subjectCumulativeData}
              subjectStudyTimeData={subjectCumulativeData}
              rankingData={rankingData}
            />
          ) : null
        }
      />

      <View style={styles.hiddenContent}>
        <View style={styles.printContent}>
          <InforPrint studentInfo={studentInfo} />
          <View style={styles.printGrid}>
            <View style={styles.paper}>
              <View style={styles.row}>
                <View style={[styles.col, { flex: 1 }]}>
                  <Text style={styles.boldText}>{timeTypeOptions(t).find((i) => i.value === timeType)?.label}</Text>
                </View>
                <View style={[styles.col, { flex: 1 }]}>
                  <Text style={styles.boldText}>
                    {currentTimeOptions.find((i: any) => i.value === currentTime)?.label}
                  </Text>
                </View>
                <View style={[styles.col, { flex: 1 }]}>
                  <Text style={styles.boldText}>
                    {subjectOptions.find((i: any) => i.value === selectedSubject)?.label}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <StudyTimeChart
                data={data}
                loading={loadingSubjects || loadingData}
                isTimerTab={false}
                isPrint
                onPrevious={handlePrevious}
                onNext={handleNext}
                currentTime={currentTime}
                isDisableNavigation={isDisableNavigation}
                renderChart={() => setRenderStudyTimeChart(true)}
                overallData={overallData}
                timeType={timeType}
                label={labelStudyTimeChart}
                categories={categoryStudyTimeCharts}
              />
            </View>

            {!!studyTimeDistributionData.length && (
              <View style={styles.section}>
                <SubjectDistribution
                  loading={loadingSubjects || loadingSubjectData}
                  isTimerTab={false}
                  data={studyTimeDistributionData}
                  colorSubjects={colorSubjects}
                />
              </View>
            )}

            <View style={styles.section}>
              <SubjectStatics loading={loadingSubjects || loadingSubjectData} data={studyTimeDistributionData} />
            </View>

            <View style={styles.sidebarContainer}>
              <TodayStudyTime
                loading={loadingSubjects || loadingSubjectCumulativeData}
                isTimerTab={false}
                isPrint
                data={subjectCumulativeData}
              />
              <View style={styles.divider} />
              <Achievements loading={loadingSubjects || loadingRankingData} isTimerTab={false} data={rankingData} />
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    backgroundColor: palette.grey[50]
  },
  section: {},
  mainContent: {
    width: '100%'
  },
  sidebarContainer: {
    backgroundColor: '#FFF',
    borderRadius: '6@ms',
    borderWidth: '1@ms'
  },
  paper: {
    backgroundColor: '#FFF',
    borderRadius: '4@ms',
    padding: '16@ms',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: '1@ms' },
    shadowOpacity: 0.05,
    shadowRadius: '2@ms',
    elevation: '2@ms'
  },
  chartPlaceholder: {
    height: '200@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  divider: {
    height: '1@ms',
    backgroundColor: '#f3f4f6',
    marginVertical: '16@ms'
  },
  hiddenContent: {
    position: 'absolute',
    left: 0,
    pointerEvents: 'none',
    opacity: 0
  },
  printContent: {
    width: '100%'
  },
  printGrid: {
    flexDirection: 'column'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  col: {
    paddingHorizontal: '8@ms'
  },
  boldText: {
    fontWeight: '700',
    fontSize: '14@ms'
  }
})

export default PerformanceData
