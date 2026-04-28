import React, { useEffect, useState, useRef } from 'react'
import { View, FlatList, StyleSheet, Text } from 'react-native'
import TimePeriodSelector from './TimePeriodSelector'
import StudyTimeChart from './StudyTimeChart'
import SubjectDistribution from './SubjectDistribution'
import ComparisonChart from './ComparisonChart'
import { SectionKey, timeTypeOptions } from '../configs/constants'
import { getCurrentTimeOptions } from '../configs/helper'
import useStudyPerformanceData from '../hooks/useStudyPerformanceData'
import InforPrint from './InforPrint'
import { palette } from '@/theme'
import { StudentInfo } from '@/utils/types'
import TodayStudyTimeCard from './TodayStudyTimeCard'
import TodayStudyDrawer from './TodayStudyDrawer'

type Props = {
  studentId?: number
  contentRef?: React.RefObject<FlatList>
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
    handlePrevious,
    handleNext,
    isDisableNavigation,
    loadingSubjectData,
    loadingRankingData,
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



  const sections = [
    { key: SectionKey.StudyTimeChart },
    ...(studyTimeDistributionData.length ? [{ key: SectionKey.SubjectDistribution }] : []),
    { key: SectionKey.ComparisonChart }
  ]

  const renderItem = ({ item }: { item: { key: SectionKey } }) => {
    switch (item.key) {
      case SectionKey.StudyTimeChart:
        return data ? (
          <View style={styles.section}>
            <StudyTimeChart
              data={data}
              timeType={timeType}
              onPrevious={handlePrevious}
              onNext={handleNext}
              currentTime={currentTime}
              isDisableNavigation={isDisableNavigation}
              loading={loadingData}
              label={labelStudyTimeChart}
              categories={categoryStudyTimeCharts}
            />
          </View>
        ) : null

      case SectionKey.SubjectDistribution:
        return (
          <View style={styles.section}>
            <SubjectDistribution
              loading={loadingSubjectData}
              data={studyTimeDistributionData}
              colorSubjects={colorSubjects}
            />
          </View>
        )

      case SectionKey.ComparisonChart:
        return (
          <View style={styles.section}>
            <ComparisonChart
              loading={loadingSubjectData}
              label={labelComparisonChart}
              data={studyTimeDistributionData}
              colorSubjects={colorSubjects}
            />
          </View>
        )

      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      <TodayStudyTimeCard data={subjectCumulativeData} isTimerTab onOpen={() => handleToggle()} />
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
      <FlatList
        ref={contentRef}
        data={sections}
        keyExtractor={(item) => item.key.toString()}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: 600,
          gap: 10,
          backgroundColor: palette.bg[100],
          paddingHorizontal: 24,
          paddingTop: 24
        }}
        ListFooterComponent={
          <TodayStudyDrawer
            isOpen={visible}
            onClose={handleToggle}
            loadingRankingData={loadingRankingData}
            loadingSubjectCumulativeData={loadingSubjectCumulativeData}
            subjectCumulativeData={subjectCumulativeData}
            subjectStudyTimeData={subjectStudyTimeData}
            rankingData={rankingData}
          />
        }
      />
      <View style={styles.hiddenContent}>
        <View style={styles.printContent}>
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
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  currentTime={currentTime}
                  isDisableNavigation={isDisableNavigation}
                  timeType={timeType}
                  loading={loadingData}
                  label={labelStudyTimeChart}
                  categories={categoryStudyTimeCharts}
                />
              )}
            </View>

            {!!studyTimeDistributionData.length && (
              <View style={styles.section}>
                <SubjectDistribution
                  loading={loadingSubjectData}
                  data={studyTimeDistributionData}
                  colorSubjects={colorSubjects}
                />
              </View>
            )}

            <View style={styles.section}>
              <ComparisonChart
                loading={loadingSubjectData}
                isPrint
                renderChart={() => setRenderComparisonChart(true)}
                label={labelComparisonChart}
                data={studyTimeDistributionData}
                colorSubjects={colorSubjects}
              />
            </View>
            <TodayStudyTimeCard data={subjectStudyTimeData} isTimerTab />
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.grey[50]
  },
  section: {},
  hiddenContent: {
    position: 'absolute',
    left: 0,
    opacity: 0,
    pointerEvents: 'none'
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
    flex: 1,
    paddingHorizontal: 8
  },
  boldText: {
    fontWeight: '700',
    fontSize: 14
  }
})

export default TimeData
