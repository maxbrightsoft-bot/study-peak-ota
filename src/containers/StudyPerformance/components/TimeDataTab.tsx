import React, { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, Text } from 'react-native'
import TimePeriodSelector from './TimePeriodSelector'
import StudyTimeChart from './StudyTimeChart'
import SubjectDistribution from './SubjectDistribution'
import ComparisonChart from './ComparisonChart'
import { timeTypeOptions } from '../configs/constants'
import { getCurrentTimeOptions } from '../configs/helper'
import useStudyPerformanceData from '../hooks/useStudyPerformanceData'
import InforPrint from './InforPrint'
import { palette } from '@/theme'
import { StudentInfo } from '@/utils/types'
import TodayStudyTimeCard from './TodayStudyTimeCard'
import TodayStudyDrawer from './TodayStudyDrawer'

type Props = {
  studentId?: number
  contentRef?: React.RefObject<any>
  studentInfo?: StudentInfo
  handleReadyPrint: () => void
}

const TimeData = ({ studentId, contentRef, studentInfo, handleReadyPrint }: Props) => {
  const {
    t,
    data,
    colorSubjects,
    rankingData,
    loadingData,
    visible,
    handleToggle,
    loadingSubjectData,
    loadingRankingData,
    titleTooltipChart,
    loadingSubjectCumulativeData,
    categoryStudyTimeCharts,
    labelStudyTimeChart,
    labelComparisonChart,
    subjectStudyTimeData,
    subjectCumulativeData,
    studyTimeDistributionData,
    timeType,
    currentTime,
    handleChangeCurrentTime,
    handleChangeTimeType
  } = useStudyPerformanceData({ studentId })

  const [isRenderStudyTimeChart, setRenderStudyTimeChart] = useState(false)
  const [isRenderComparisonChart, setRenderComparisonChart] = useState(false)

  useEffect(() => {
    const isReady =
      isRenderStudyTimeChart &&
      isRenderComparisonChart &&
      !loadingSubjectData &&
      !loadingRankingData &&
      !loadingData &&
      !loadingSubjectCumulativeData

    if (!isReady) return

    handleReadyPrint()
  }, [
    isRenderStudyTimeChart,
    isRenderComparisonChart,
    loadingSubjectData,
    loadingRankingData,
    loadingData,
    loadingSubjectCumulativeData
  ])

  const renderMainContent = () => (
    <View style={styles.mainContent}>
      <View style={{ ...styles.section, padding: 24, backgroundColor: '#FFF', zIndex: 10 }}>
        <TimePeriodSelector
          timeType={timeType}
          handleChangeTimeType={handleChangeTimeType}
          timeTypeOptions={timeTypeOptions(t)}
          currentTime={currentTime}
          handleChangeCurrentTime={handleChangeCurrentTime}
          currentTimeOptions={getCurrentTimeOptions(t, timeType)}
        />
      </View>
      <View style={{ padding: 24, gap: 24 }}>
        <View style={styles.section}>
          {data && (
            <StudyTimeChart
              data={data}
              timeType={timeType}
              loading={loadingData}
              label={labelStudyTimeChart}
              categories={categoryStudyTimeCharts}
            />
          )}
        </View>

        <View style={styles.section}>
          <SubjectDistribution
            loading={loadingSubjectData}
            data={studyTimeDistributionData}
            colorSubjects={colorSubjects}
          />
        </View>

        <View style={styles.section}>
          <ComparisonChart
            loading={loadingSubjectData}
            label={labelComparisonChart}
            titleTooltip={titleTooltipChart}
            data={studyTimeDistributionData}
            colorSubjects={colorSubjects}
          />
        </View>
        <TodayStudyTimeCard data={subjectCumulativeData} isTimerTab onOpen={handleToggle} />
      </View>
    </View>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.layout}>
        {renderMainContent()}
        <TodayStudyDrawer
          isOpen={visible}
          onClose={handleToggle}
          loadingRankingData={loadingRankingData}
          loadingSubjectCumulativeData={loadingSubjectCumulativeData}
          subjectCumulativeData={subjectCumulativeData}
          subjectStudyTimeData={subjectStudyTimeData}
          rankingData={rankingData}
        />
      </View>
      <View style={styles.hiddenContent}>
        <View ref={contentRef} style={styles.printContent}>
          <InforPrint studentInfo={studentInfo} />
          <View style={styles.printGrid}>
            <View style={styles.paper}>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.boldText}>{timeTypeOptions(t).find((i) => i.value === timeType)?.label}</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.boldText}>
                    {getCurrentTimeOptions(t, timeType).find((i) => i.value === currentTime)?.label}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              {data && (
                <StudyTimeChart
                  data={data}
                  isPrint
                  timeType={timeType}
                  loading={loadingData}
                  label={labelStudyTimeChart}
                  categories={categoryStudyTimeCharts}
                />
              )}
            </View>

            <View style={styles.section}>
              <SubjectDistribution
                loading={loadingSubjectData}
                data={studyTimeDistributionData}
                colorSubjects={colorSubjects}
              />
            </View>

            <View style={styles.section}>
              <ComparisonChart
                loading={loadingSubjectData}
                isPrint
                renderChart={() => setRenderComparisonChart(true)}
                label={labelComparisonChart}
                titleTooltip={titleTooltipChart}
                data={studyTimeDistributionData}
                colorSubjects={colorSubjects}
              />
            </View>
            <TodayStudyTimeCard data={subjectStudyTimeData} isTimerTab />
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
  layout: {
    display: 'flex',
    flexDirection: 'column'
  },
  mainContent: {
  },
  sidebar: {
    display: 'flex',
  },
  sidebarContainer: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: palette.grey[100]
  },
  section: {},
  divider: {
    height: 1,
    backgroundColor: palette.grey[100]
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
    display: 'flex',
    flexDirection: 'column'
  },
  paper: {
    backgroundColor: '#FFF',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  col: {
    display: 'flex',
    flex: 1,
    paddingHorizontal: 8
  },
  boldText: {
    fontWeight: '700',
    fontSize: 14
  }
})

export default TimeData
