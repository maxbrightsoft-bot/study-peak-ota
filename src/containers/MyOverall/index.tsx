import React, { FC, useMemo, useRef, useState } from 'react'
import { View, ScrollView, Text, TouchableOpacity } from 'react-native'
import { OverallChartContainerProps } from './components/OverallChartContainer'
import { CategoriesOverallChartContainerProps } from './components/CategoriesOverallChartContainer'
import { OverallTimeChartContainerProps } from './components/OverallTimeChartContainer'
import { ExamResult } from '@/utils/types'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import { formatNumber, utcToLocalTime } from '@/utils/helpers'
import ChartSlide from './components/ChartSlide'
import { useWindowDimensions } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import TextTooltip from '@/components/Tooltip/TextTooltip'

interface OverallTabProps {
  examCode: string
  resultData: ExamResult | undefined
  overallChartContainerProps: OverallChartContainerProps
  categoriesOverallChartContainerProps: CategoriesOverallChartContainerProps
  subcategoriesOverallChartContainerProps?: CategoriesOverallChartContainerProps
  overallTimeChartContainerProps: OverallTimeChartContainerProps
  questionTypesOverallChartContainerProps?: CategoriesOverallChartContainerProps
  isPrint?: boolean
  onRendered?: () => void
}

const MyOverall: FC<OverallTabProps> = React.memo(({
  examCode,
  resultData,
  categoriesOverallChartContainerProps,
  subcategoriesOverallChartContainerProps,
  questionTypesOverallChartContainerProps,
  overallChartContainerProps,
  overallTimeChartContainerProps,
  isPrint
}) => {
  const { width } = useWindowDimensions()
  const { t } = useTranslation()
  const scrollRef = useRef<ScrollView>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1
      scrollRef.current?.scrollTo({
        x: nextIndex * SLIDE_WIDTH,
        animated: true
      })
      setCurrentIndex(nextIndex)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      scrollRef.current?.scrollTo({
        x: prevIndex * SLIDE_WIDTH,
        animated: true
      })
      setCurrentIndex(prevIndex)
    }
  }

  const SLIDE_WIDTH = width - 20

  const slides = useMemo(() => [
    {
      key: 'overall',
      isTimeChart: false,
      title: t('today_s_data'),
      payload: { ...overallChartContainerProps, id: 'today-s-data', isPrint }
    },
    {
      key: 'categories',
      isTimeChart: false,
      title: t('my_average_data'),
      payload: { ...categoriesOverallChartContainerProps, id: 'my-average-data', isPrint }
    },
    {
      key: 'subcategories',
      isTimeChart: false,
      title: t('subcategories_data'),
      payload: { ...subcategoriesOverallChartContainerProps, id: 'subcategories-data', isPrint }
    },
    {
      key: 'questionTypes',
      isTimeChart: false,
      title: t('question_types_data'),
      payload: { ...questionTypesOverallChartContainerProps, id: 'question-types-data', isPrint }
    },
    ...(overallTimeChartContainerProps?.categories ?? []).map((item, index) => ({
      key: `time-${index}`,
      title: t('problem_solving_speed'),
      isTimeChart: true,
      payload: { ...item, isPrint }
    }))
  ], [
    t,
    overallChartContainerProps,
    categoriesOverallChartContainerProps,
    subcategoriesOverallChartContainerProps,
    questionTypesOverallChartContainerProps,
    overallTimeChartContainerProps,
    isPrint
  ])
  const examTime = useMemo(() => {
    return `${utcToLocalTime(resultData?.startTime, 'HH:mm')} ~ ${utcToLocalTime(resultData?.finishTime, 'HH:mm')}`
  }, [resultData?.startTime, resultData?.finishTime])


  return (
    <ScrollView
      nestedScrollEnabled
      contentContainerStyle={{
        paddingBottom: 200
      }}
      style={[styles.container, isPrint && { marginTop: 230 }]}
    >
      <View
        style={{
          borderRadius: 6,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFF',
          paddingVertical: 8,
          marginBottom: 10
        }}
      >
        <Text style={{ color: palette.main[600], fontSize: 16, fontWeight: 600 }}>{t('my_overall')}</Text>
      </View>
      <View
        style={{
          borderRadius: 14,
          backgroundColor: '#FFFF',
          marginBottom: 22
        }}
      >
        <View
          style={{
            backgroundColor: palette.grey[50],
            borderTopRightRadius: 14,
            borderTopLeftRadius: 14,
            borderBottomWidth: 1,
            borderColor: palette.grey[200],
            paddingVertical: 8,
            width: '100%'
          }}
        >
          <Text style={{ color: '#222222', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
            {t('exam_overview')}
          </Text>
        </View>
        <View style={{ padding: 24, gap: 20 }}>
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-start', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: 500,
                backgroundColor: '#222222',
                color: '#FFF',
                paddingVertical: 2,
                paddingHorizontal: 8,
                borderRadius: 43
              }}
            >
              {resultData?.subjectName}
            </Text>
            <TextTooltip
              text={(resultData?.title || '').trim()}
              numberOfLines={1}
              textStyle={{ fontSize: 14, fontWeight: '500', color: '#222222' }}
              containerStyle={{ flex: 1 }}
            />
            {(resultData?.studentTotalAttemptTime || 0) > 1 && (
              <View
                style={[
                  styles.attemptBadge,
                  {
                    backgroundColor: resultData?.isSelected ? palette.main[100] : palette.red[100]
                  }
                ]}
              >
                <Text
                  style={[
                    styles.attemptText,
                    {
                      color: resultData?.isSelected ? palette.main[700] : palette.red[900]
                    }
                  ]}
                >
                  {`#${(resultData?.studentAttemptNumber || 0) + 1}/${resultData?.studentTotalAttemptTime}`}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.overviewContainer}>
            <View style={styles.columnItem}>
              <Text style={styles.overviewLabel}>{t('exam_score')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ ...TYPO.heading1, color: palette.main[600] }}>
                  {t("score_format", {
                    score: formatNumber(resultData?.score || 0, 2)
                  })}
                </Text>
                <Text style={{ ...TYPO.heading1, color: palette.main[600] }}>
                  /{t("score_format", {
                    score: formatNumber(resultData?.totalScore || 0, 2)
                  })}
                </Text>
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <View style={styles.columnItem}>
                <Text style={styles.overviewLabel}>{t('percentage')}</Text>
                <Text style={styles.overviewValue}>
                  {(resultData?.totalCorrectRate || 0).toFixed(2)}%
                </Text>
              </View>
              <View style={styles.columnItem}>
                <Text style={styles.overviewLabel}>{t('problem_solving_efficiency')}</Text>
                <Text style={styles.overviewValue}>
                  {(
                    ((resultData?.score || 0) / (resultData?.totalScore || 1)) *
                    100
                  ).toFixed(2)}
                  %
                </Text>
              </View>
              <View style={styles.columnItem}>
                <Text style={styles.overviewLabel}>{t('average')}</Text>
                <Text style={styles.overviewValue}>
                  {t("score_format", {
                    score: formatNumber(resultData?.averageScores || 0, 2)
                  })}
                </Text>
              </View>
              <View style={styles.columnItem}>
                <Text style={styles.overviewLabel}>{t('exam_code')}</Text>
                <Text style={styles.overviewValue}>{examCode}</Text>
              </View>
              <View style={styles.columnItem}>
                <Text style={styles.overviewLabel}>{t('exam_date')}</Text>
                <Text style={styles.overviewValue}>{utcToLocalTime(resultData?.startTime, t('date_format'))}</Text>
              </View>
              <View style={styles.columnItem}>
                <Text style={styles.overviewLabel}>{t('exam_time')}</Text>
                <Text style={styles.overviewValue}>{examTime}</Text>
              </View>
              <View style={styles.columnItem}>
                <Text style={styles.overviewLabel}>{t('number_of_applicants')}</Text>
                <Text style={styles.overviewValue}>{t('number_people', { number: resultData?.totalStudent })}</Text>
              </View>
              <View style={styles.columnItem}>
                <Text style={styles.overviewLabel}>{t('total_number_of_problems')}</Text>
                <Text style={styles.overviewValue}>
                  {t('question_count_format', { number: resultData?.questions.length || 0 })}
                </Text>
              </View>

            </View>
          </View>
        </View>
      </View>
      <View>
        <ScrollView
          horizontal
          ref={scrollRef}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={SLIDE_WIDTH}
          snapToAlignment="start"
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / SLIDE_WIDTH)
            setCurrentIndex(index)
          }}
        >
          {slides.map((item, index) => (
            <View
              key={item.key}
              style={{
                width: SLIDE_WIDTH
              }}
            >
              <View style={{
                paddingLeft: index === 0 ? 0 : -20,
                marginRight: index === slides.length - 1 ? 0 : 20
              }}>
                <ChartSlide
                  title={item.title}
                  isTimeChart={item.isTimeChart}
                  payload={item.payload}
                />
              </View>
            </View>
          ))}
        </ScrollView>
        {currentIndex > 0 && <View style={{ position: 'absolute', left: 0, top: '35%' }}>
          <TouchableOpacity onPress={handlePrev}>
            <MaterialIcons name="arrow-back-ios-new" size={24} color={palette.grey[100]} />
          </TouchableOpacity>
        </View>}

        {currentIndex < slides.length - 1 && <View style={{ position: 'absolute', right: 5, top: '35%' }}>
          <TouchableOpacity onPress={handleNext}>
            <MaterialIcons name="arrow-forward-ios" size={24} color={palette.grey[100]} />
          </TouchableOpacity>
        </View>}
      </View>
    </ScrollView>
  )
})

const styles = ScaledSheet.create({
  container: {
    flexDirection: 'column'
  },
  printRow: {
    flexDirection: 'row'
  },
  fullRow: {
    flexDirection: 'column'
  },
  halfWidth: {
    width: '50%'
  },
  fullWidth: {
    width: '100%'
  },
  overviewContainer: {
    gap: '20@ms'
  },
  overviewLabel: {
    fontSize: '12@ms',
    fontWeight: 400,
    color: palette.grey[500]
  },
  overviewValue: {
    fontSize: '14@ms',
    fontWeight: 500,
    color: palette.grey[900]
  },
  columnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  attemptBadge: {
    paddingHorizontal: '8@ms',
    paddingVertical: '4@ms',
    borderRadius: '20@ms'
  },

  attemptText: {
    fontSize: '11@ms',
    fontWeight: '600'
  }
})

export default MyOverall
