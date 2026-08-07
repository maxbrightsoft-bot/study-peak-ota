import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { ms } from 'react-native-size-matters'
import moment from 'moment'
import { ss } from '../styles/styles'
import { EmptyState, getCategoryLabel } from '../configs/utils'

const HIGH_GRADES = [
  { label: 'advanced_mathematics_1', value: 1 },
  { label: 'advanced_mathematics_2', value: 2 },
  { label: 'algebra', value: 3 },
  { label: 'calculus_1', value: 4 },
  { label: 'calculus_2', value: 5 },
  { label: 'probability_and_statistics', value: 6 },
  { label: 'geometry', value: 7 },
]

const getGradeLabel = (item: any, t: any) => {
  if (item.schoolType === 3 && item.categoryName) {
    const gradeVal = Number(item.subCategoryName?.split(".")?.[0]);
    if (!isNaN(gradeVal)) {
      const val = gradeVal >= 10 ? gradeVal - 9 : gradeVal
      const g = HIGH_GRADES.find((x) => x.value === val)
      if (g) return t(g.label)
    }
  }
  return item.categoryName
}

type WeaknessPanelProps = {
  data: any
  t: any
  timeType: number
}

const WeaknessPanel = ({ data, t, timeType }: WeaknessPanelProps) => {
  const [sortBy, setSortBy] = useState<'accuracy' | 'count' | 'recent'>('accuracy')
  const [showAll, setShowAll] = useState(false)
  const sortedTypes = useMemo(() => {
    const rows = [...(data?.allTypes || [])]
    if (sortBy === 'count') return rows.sort((a: any, b: any) => (b.count || 0) - (a.count || 0))
    if (sortBy === 'recent') return rows.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))
    return rows.sort((a: any, b: any) => (a.accuracy || 0) - (b.accuracy || 0))
  }, [data?.allTypes, sortBy])

  if (!data?.topWeaknesses?.length && !data?.allTypes?.length) {
    return (
      <EmptyState
        title={t('weak.emptyTitle', 'No weaknesses found')}
        description={t('weak.emptyDesc', 'Weaknesses will appear after more answered questions.')}
      />
    )
  }

  return (
    <View style={ss.panel}>
      <View style={[ss.section, { paddingTop: ms(16) }]}>
        <View style={ss.sectionHead}>
          <View style={ss.sectionTitleWrap}>
            <View style={ss.sectionTitleLine} />
            <Text style={ss.sectionTitle}>{t('weak.topWeaknesses')}</Text>
          </View>
        </View>
        <View style={ss.weakList}>
          {!data?.topWeaknesses?.length ? (
            <EmptyState
              title={t('no_data', 'No data')}
              description=""
            />
          ) : (
            (data.topWeaknesses || []).map((item: any, idx: number) => {
              let itemStyle = ss.weakItemR1
              let rColor = '#991B1B'
              let pctColor = '#7F1D1D'
              if (idx === 1) {
                itemStyle = ss.weakItemR2
                rColor = '#DC2626'
                pctColor = '#DC2626'
              }
              if (idx === 2) {
                itemStyle = ss.weakItemR3
                rColor = '#EA580C'
                pctColor = '#EA580C'
              }
              if (idx >= 3) {
                itemStyle = ss.weakItemR4
                rColor = '#D97706'
                pctColor = '#D97706'
              }

              return (
                <View key={idx} style={[ss.weakItem, itemStyle]}>
                  <View style={ss.weakRankBadge}>
                    <Text style={[ss.weakRankNum, { color: rColor }]}>{idx + 1}</Text>
                    <Text style={ss.weakRankLabel}>{t(`weak.rank${idx + 1}`, ['st', 'nd', 'rd', 'th', 'th'][idx])}</Text>
                  </View>
                  <View style={ss.weakBody}>
                    <Text style={ss.weakName}>{getCategoryLabel(item)}</Text>
                    <View style={ss.weakTags}>
                      {item.schoolType === 3 && !!item.categoryName && (
                        <View style={ss.weakTag}>
                          <Text style={ss.weakTagText}>{getGradeLabel(item, t)}</Text>
                        </View>
                      )}
                      {!!item.questionTypeName && (!!item.subCategoryName || !!item.categoryName) && (
                        <View style={ss.weakTag}>
                          <Text style={ss.weakTagText}>{item.subCategoryName || item.categoryName}</Text>
                        </View>
                      )}
                    </View>
                    <View style={ss.weakMeta}>
                      <Text style={ss.weakFrac}>
                        {t('correct_out_of_total_problems', { total: item.total, correct: item.correct, defaultValue: '{{total}}문제 중 {{correct}}문제 정답' })}
                      </Text>
                      <Text
                        style={[
                          ss.weakTrend,
                          item.delta < 0 ? ss.weakTrendDown : item.delta > 0 ? ss.weakTrendUp : ss.weakTrendNew
                        ]}
                      >
                        {item.delta < 0
                          ? `▼ ${Math.abs(item.delta)}%p ${t('vs_last_month', 'vs 지난 달')}`
                          : item.delta > 0
                            ? `▲ ${item.delta}%p ${t('vs_last_month', 'vs 지난 달')}`
                            : t('weak.newType')}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[ss.weakPctBig, { color: pctColor }]}>
                      {item.accuracy}
                      <Text style={ss.weakPctBigP}>%</Text>
                    </Text>
                  </View>
                </View>
              )
            })
          )}
        </View>
      </View>

      <View style={[ss.section, ss.mt0]}>
        <View style={ss.sectionHead}>
          <View style={ss.sectionTitleWrap}>
            <View style={ss.sectionTitleLine} />
            <Text style={ss.sectionTitle}>{t('weak.typeList')}</Text>
          </View>
          <Text style={ss.sectionHint}>
            {sortedTypes.length} {t('weak.types')}
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={ss.tblFilters}
          contentContainerStyle={{ gap: ms(6), paddingRight: ms(16) }}
        >
          <TouchableOpacity
            style={[ss.tblFilter, sortBy === 'accuracy' && ss.tblFilterActive]}
            onPress={() => setSortBy('accuracy')}
          >
            <Text style={[ss.tblFilterText, sortBy === 'accuracy' && ss.tblFilterTextActive]}>
              {t('weak.lowestAcc')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[ss.tblFilter, sortBy === 'count' && ss.tblFilterActive]}
            onPress={() => setSortBy('count')}
          >
            <Text style={[ss.tblFilterText, sortBy === 'count' && ss.tblFilterTextActive]}>{t('weak.mostSolved')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[ss.tblFilter, sortBy === 'recent' && ss.tblFilterActive]}
            onPress={() => setSortBy('recent')}
          >
            <Text style={[ss.tblFilterText, sortBy === 'recent' && ss.tblFilterTextActive]}>
              {t('weak.mostRecent')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={ss.typesList}>
          {sortedTypes.length === 0 ? (
            <EmptyState
              title={t('no_data', 'No data')}
              description={t('weak.emptyTypesDesc', 'There is no question type data available.')}
            />
          ) : (
            sortedTypes.slice(0, showAll ? undefined : 10).map((row: any, idx: number) => {
              let rowStyle: any = null
              let pctStyle = ss.pctPillGreen
              if (row.accuracy < 40) {
                rowStyle = ss.typeRowRRed
                pctStyle = ss.pctPillRed
              } else if (row.accuracy < 50) {
                rowStyle = ss.typeRowRAmber
                pctStyle = ss.pctPillOrange
              } else if (row.accuracy < 60) {
                rowStyle = ss.typeRowRYellow
                pctStyle = ss.pctPillAmber
              }

              return (
                <View key={idx} style={[ss.typeRow, rowStyle]}>
                  <View style={ss.typeRowHead}>
                    <Text style={ss.typeName}>{getCategoryLabel(row)}</Text>
                    <View style={[ss.pctPill, pctStyle]}>
                      <Text style={ss.pctPillText}>{row.accuracy}%</Text>
                    </View>
                  </View>
                  <View style={ss.typeMeta}>
                    <View style={ss.typeTags}>
                      {row.schoolType === 3 && !!row.categoryName && (
                        <View style={ss.typeTag}>
                          <Text style={ss.typeTagText}>{getGradeLabel(row, t)}</Text>
                        </View>
                      )}
                      {!!row?.questionTypeName && (!!row?.subCategoryName || !!row?.categoryName) && (
                        <View style={ss.typeTag}>
                          <Text style={ss.typeTagText}>{row.subCategoryName || row.categoryName}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={ss.fracLast}>
                      <Text style={ss.fracDone}>{row.correct}</Text>/{row.count} · {moment(row.timestamp).format('MM/DD')}
                    </Text>
                  </View>
                </View>
              )
            })
          )}
        </View>
        {sortedTypes.length > 10 && (
          <TouchableOpacity onPress={() => setShowAll(!showAll)}>
            <Text style={ss.typesMore}>
              {showAll
                ? t('weak.collapse', '접기 ▲')
                : t('weak.viewMoreRemaining', '나머지 {{count}}개 유형 더보기 ↓', { count: sortedTypes.length - 10 })}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default WeaknessPanel
