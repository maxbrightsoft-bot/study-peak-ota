import React, { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, ActivityIndicator, Text } from 'react-native'
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

type Props = {
  studentId?: number
  contentRef?: React.RefObject<any>
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

  const colors = {
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    white: '#ffffff'
  }

  if (loadingSubjects || loadingData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  const renderMainContent = () => (
    <View style={{ ...styles.mainContent, padding: 24, gap: 24 }}>
      <View style={{ ...styles.section, backgroundColor: '#FFF', zIndex: 10 }}>
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
            renderChart={() => setRenderStudyTimeChart(true)}
            overallData={overallData}
            timeType={timeType}
            label={labelStudyTimeChart}
            categories={categoryStudyTimeCharts}
          />
        )}
      </View>

      <View style={styles.section}>
        <SubjectDistribution
          loading={loadingSubjects || loadingSubjectData}
          isTimerTab={false}
          data={studyTimeDistributionData}
          colorSubjects={colorSubjects}
        />
      </View>

      <View style={styles.section}>
        <SubjectStatics loading={loadingSubjects || loadingSubjectData} data={studyTimeDistributionData} />
      </View>
      <TodayStudyTimeCard data={subjectCumulativeData} onOpen={handleToggle} />
    </View>
  )

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.gray50 }]}>
      <View style={styles.layout}>
        {renderMainContent()}
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
      </View>
      {/* <View style={styles.sidebar}>
        <View style={[styles.sidebarContainer, { borderColor: colors.gray100 }]}>
          <TodayStudyTime
            loading={loadingSubjects || loadingSubjectCumulativeData}
            isTimerTab={false}
            data={subjectCumulativeData}
          />
          <View style={styles.divider} />
          <Achievements loading={loadingSubjects || loadingRankingData} isTimerTab={false} data={rankingData} />
        </View>
      </View> */}

      <View style={styles.hiddenContent}>
        <View ref={contentRef} style={styles.printContent}>
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
                renderChart={() => setRenderStudyTimeChart(true)}
                overallData={overallData}
                timeType={timeType}
                label={labelStudyTimeChart}
                categories={categoryStudyTimeCharts}
              />
            </View>

            <View style={styles.section}>
              <SubjectDistribution
                loading={loadingSubjects || loadingSubjectData}
                isTimerTab={false}
                data={studyTimeDistributionData}
                colorSubjects={colorSubjects}
              />
            </View>

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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.grey[50]
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  layout: {
    display: 'flex',
    flexDirection: 'column'
  },
  mainContent: {
    width: '100%',
    gap: '24@ms'
  },
  sidebar: {
    width: '100%'
  },
  sidebarContainer: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    borderWidth: 1
  },
  section: {},
  paper: {
    backgroundColor: '#FFF',
    borderRadius: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 16
  },
  hiddenContent: {
    position: 'absolute',
    top: -1000,
    left: 0,
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
    paddingHorizontal: 8
  },
  boldText: {
    fontWeight: '700',
    fontSize: 14
  }
})

export default PerformanceData
