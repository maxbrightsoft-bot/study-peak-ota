import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { ms } from 'react-native-size-matters'
import { LinearGradient } from 'expo-linear-gradient'
import { ss } from '../styles/styles'
import { EmptyState, getCategoryLabel, getChartBarLabel, getClampedPercent, getPrefix } from '../configs/utils'

type PerformancePanelProps = {
  data: any
  t: any
  timeType: number
  periodDelta?: number | null
  /** Fixed peer comparison data (all subjects, this week). Overrides data.peer when provided. */
  dailyPeer?: any
}

const getGradeShortKey = (gradeVal: number | null | undefined): string => {
  if (!gradeVal) return ''
  switch (gradeVal) {
    case 1: return 'es_1st'
    case 2: return 'es_2nd'
    case 3: return 'es_3rd'
    case 4: return 'es_4th'
    case 5: return 'es_5th'
    case 6: return 'es_6th'
    case 7: return 'ms_1st'
    case 8: return 'ms_2nd'
    case 9: return 'ms_3rd'
    case 10: return 'hs_1st'
    case 11: return 'hs_2nd'
    case 12: return 'hs_3rd'
    case 13: return 'n_retaker'
    default: return ''
  }
}

const PerformancePanel = ({ data, t, timeType, periodDelta, dailyPeer }: PerformancePanelProps) => {
  const peer = dailyPeer ?? data?.peer
  const [selectedBarIdx, setSelectedBarIdx] = useState<number | null>(null)
  const [selectedCatIdx, setSelectedCatIdx] = useState<number | null>(null)
  const PALETTE = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6']
  const TEXT_PALETTE = ['#065F46', '#92400E', '#991B1B', '#4C1D95', '#1E3A5F']
  const achievementChart = data?.achievementChart || []
  const categoryDistribution = [...(data?.mainCategoryDistribution || [])].sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
  const subCategoryAccuracy = data?.subCategoryAccuracy || []

  const catColors: Record<number, { bg: string; text: string }> = {}
  if (categoryDistribution.length) {
    categoryDistribution.forEach((cat: any, idx: number) => {
      catColors[cat.categoryId] = {
        bg: PALETTE[idx % PALETTE.length],
        text: TEXT_PALETTE[idx % TEXT_PALETTE.length]
      }
    })
  }

  const gradeKey = getGradeShortKey(peer?.grade)
  const gradeLabel = gradeKey
    ? t('grade_average_format', { grade: t(gradeKey), defaultValue: `${t(gradeKey)} 평균` })
    : (peer?.gradeLabel || t('perf.gradeAvg'))

  return (
    <View style={ss.panel}>
      <View style={[ss.section, ss.mt0]}>
        <View style={ss.sectionHead}>
          <View style={ss.sectionTitleWrap}>
            <View style={ss.sectionTitleLine} />
            <Text style={ss.sectionTitle}>{t('perf.weeklyVolume')}</Text>
          </View>
        </View>
        <View style={[ss.card, ss.chartCard]}>
          <View style={ss.chartHead}>
            <View style={ss.chartPill}>
              <Text style={ss.chartPillText}>{t(`perf.${getPrefix(timeType)}`, t('perf.month'))}</Text>
            </View>
            <View style={ss.chartLegend}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[ss.chartLegendIco, ss.chartLegendCurr]} />
                <Text style={ss.chartLegendText}>
                  {t(
                    `perf.this${getPrefix(timeType).charAt(0).toUpperCase() + getPrefix(timeType).slice(1)}`,
                    t('perf.thisMonth')
                  )}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: ms(10) }}>
                <View style={[ss.chartLegendIco, ss.chartLegendPrev]} />
                <Text style={ss.chartLegendText}>{t('perf.classAvg')}</Text>
              </View>
            </View>
          </View>
          <View style={[ss.bars, { overflow: 'visible', position: 'relative' }]}>
            {selectedBarIdx !== null && (
              <View
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                  marginBottom: ms(8),
                  zIndex: 100
                }}
              >
                <View
                  style={{
                    backgroundColor: '#1E293B',
                    paddingVertical: ms(6),
                    paddingHorizontal: ms(12),
                    borderRadius: ms(8),
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: ms(10.5), fontWeight: '700', textAlign: 'center' }}>
                    {getChartBarLabel(timeType, achievementChart[selectedBarIdx].timestamp, selectedBarIdx, t)}  ·  {t('perf.myAcc', 'My')}: {achievementChart[selectedBarIdx].student}  ·  {t('perf.classAvg', 'Avg')}: {achievementChart[selectedBarIdx].classAvg}
                  </Text>
                  <View
                    style={{
                      position: 'absolute',
                      bottom: -ms(4),
                      left: '50%',
                      marginLeft: -ms(4),
                      width: 0,
                      height: 0,
                      borderLeftWidth: ms(4),
                      borderLeftColor: 'transparent',
                      borderRightWidth: ms(4),
                      borderRightColor: 'transparent',
                      borderTopWidth: ms(4),
                      borderTopColor: '#1E293B'
                    }}
                  />
                </View>
              </View>
            )}
            {achievementChart.map((item: any, idx: number) => {
              const max = Math.max(...achievementChart.map((d: any) => Math.max(d.student, d.classAvg)), 1)
              const ch = (item.student / max) * 100
              const pc = (item.classAvg / max) * 100
              const isSelected = selectedBarIdx === idx
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => setSelectedBarIdx(isSelected ? null : idx)}
                  style={[ss.barGroup, { position: 'relative' }]}
                >
                  <View style={[ss.bar, ss.barCurrent, { height: `${ch}%` }, isSelected && { borderTopWidth: 2, borderTopColor: '#FFF' }]} />
                  <View style={[ss.bar, ss.barCompare, { height: `${pc}%` }, isSelected && { borderTopWidth: 2, borderTopColor: '#FFF' }]} />
                </TouchableOpacity>
              )
            })}
          </View>
          <View style={ss.barLabels}>
            {achievementChart.map((item: any, idx: number) => (
              <Text key={idx} style={ss.barLabel}>
                {getChartBarLabel(timeType, item.timestamp, idx, t)}
              </Text>
            ))}
          </View>
          {!achievementChart.length && (
            <EmptyState
              title={t('perf.emptyChart', 'No chart data')}
              description={t('perf.emptyChartDesc', 'There are no solved problems in this period.')}
            />
          )}
        </View>
      </View>

      <View style={[ss.section, ss.mt0]}>
        <View style={ss.sectionHead}>
          <View style={ss.sectionTitleWrap}>
            <View style={ss.sectionTitleLine} />
            <Text style={ss.sectionTitle}>{t('perf.volMainCat')}</Text>
          </View>
        </View>
        <View style={[ss.card, ss.catCard]}>
          <View style={[ss.catBar, { overflow: 'visible', position: 'relative' }]}>
            {selectedCatIdx !== null && categoryDistribution[selectedCatIdx] && (
              <View
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                  marginBottom: ms(8),
                  zIndex: 100
                }}
              >
                <View
                  style={{
                    backgroundColor: '#1E293B',
                    paddingVertical: ms(6),
                    paddingHorizontal: ms(12),
                    borderRadius: ms(8),
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: ms(10.5), fontWeight: '700', textAlign: 'center' }}>
                    {getCategoryLabel(categoryDistribution[selectedCatIdx])}  ·  {t('n_problems_solved', { n: categoryDistribution[selectedCatIdx].solved, defaultValue: `${categoryDistribution[selectedCatIdx].solved}문제 풀이` })}
                  </Text>
                  <View
                    style={{
                      position: 'absolute',
                      bottom: -ms(4),
                      left: '50%',
                      marginLeft: -ms(4),
                      width: 0,
                      height: 0,
                      borderLeftWidth: ms(4),
                      borderLeftColor: 'transparent',
                      borderRightWidth: ms(4),
                      borderRightColor: 'transparent',
                      borderTopWidth: ms(4),
                      borderTopColor: '#1E293B'
                    }}
                  />
                </View>
              </View>
            )}
            {categoryDistribution.map((cat: any, idx: number) => {
              const colors = catColors[cat.categoryId] || { bg: '#ccc', text: '#333' }
              const isSelected = selectedCatIdx === idx
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCatIdx(isSelected ? null : idx)}
                  style={[ss.catSeg, { flex: Math.max(1, cat.percentage || 0), backgroundColor: colors.bg }]}
                >
                  <Text style={ss.catSegText}>{cat.percentage}%</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: ms(2) }}>
            {categoryDistribution.map((cat: any, idx: number) => {
              const colors = catColors[cat.categoryId] || { bg: '#ccc', text: '#333' }
              const isSelected = selectedCatIdx === idx
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCatIdx(isSelected ? null : idx)}
                  style={{ flex: Math.max(1, cat.percentage || 0), alignItems: 'center', paddingHorizontal: ms(2) }}
                >
                  <Text style={[ss.catLabelName, { color: colors.text }]} numberOfLines={2}>
                    {getCategoryLabel(cat)}
                  </Text>
                  <Text style={ss.catLabelPct}>{cat.accuracy}%</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          {!categoryDistribution.length && (
            <EmptyState
              title={t('perf.emptyCategory')}
              description={t('perf.emptyDesc')}
            />
          )}
        </View>
      </View>

      <View style={[ss.section, ss.mt0]}>
        <View style={ss.sectionHead}>
          <View style={ss.sectionTitleWrap}>
            <View style={ss.sectionTitleLine} />
            <Text style={ss.sectionTitle}>{t('perf.accSubCat')}</Text>
          </View>
        </View>
        <View style={[ss.card, ss.midcatCard]}>
          <View style={ss.midcatLegend}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[ss.midcatLegendIco, { backgroundColor: '#F87171' }]} />
              <Text style={ss.midcatLegendText}>~50%</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[ss.midcatLegendIco, { backgroundColor: '#F59E0B' }]} />
              <Text style={ss.midcatLegendText}>~70%</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[ss.midcatLegendIco, { backgroundColor: '#10B981' }]} />
              <Text style={ss.midcatLegendText}>70%+</Text>
            </View>
          </View>

          {subCategoryAccuracy.map((row: any, idx: number) => {
            let barColors: [string, string] = ['#FCA5A5', '#F87171']
            if (row.accuracy >= 70) barColors = ['#34D399', '#10B981']
            else if (row.accuracy >= 50) barColors = ['#FBBF24', '#F59E0B']

            return (
              <View
                key={idx}
                style={[
                  ss.midcatRow,
                  idx === subCategoryAccuracy.length - 1 && { borderBottomWidth: 0 },
                  row.sampleSizeWarning && { opacity: 0.6 }
                ]}
              >
                <View style={ss.midcatRowTop}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={ss.midcatLabel} numberOfLines={1}>
                      {getCategoryLabel(row)}
                    </Text>
                    {row.sampleSizeWarning && (
                      <View style={ss.sampleMini}>
                        <Text style={ss.sampleMiniText}>{t('perf.smallSample')}</Text>
                      </View>
                    )}
                  </View>
                  <View style={ss.midcatMeta}>
                    <Text style={ss.midcatMetaFrac}>
                      {row.solved}/{row.total}
                    </Text>
                    {row.delta !== undefined && row.delta !== null && Number(row.delta) > 0 && (
                      <Text style={ss.trUp}>▲ {row.delta}%p</Text>
                    )}
                    {row.delta !== undefined && row.delta !== null && Number(row.delta) < 0 && (
                      <Text style={ss.trDown}>▼ {Math.abs(Number(row.delta))}%p</Text>
                    )}
                    {(row.delta === undefined || row.delta === null || Number(row.delta) === 0) && (
                      <Text style={ss.trFlat}>-</Text>
                    )}
                  </View>
                </View>
                <View style={ss.midcatBarWrap}>
                  <LinearGradient
                    colors={barColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[ss.midcatFill, { width: `${getClampedPercent(row.accuracy)}%` }]}
                  >
                    <Text style={ss.midcatFillText}>{row.accuracy}%</Text>
                  </LinearGradient>
                </View>
              </View>
            )
          })}
          {!!data.tipText && (
            <View style={ss.midcatTip}>
              <Text style={ss.midcatTipText}>
                💡 <Text style={{ fontWeight: '700' }}>{data.tipText}</Text>
              </Text>
            </View>
          )}
          {!subCategoryAccuracy.length && (
            <EmptyState
              title={t('no_data', 'No data')}
              description=""
            />
          )}
        </View>
      </View>

      {peer && (
        <View style={[ss.section, ss.mt0]}>
          <View style={ss.sectionHead}>
            <View style={ss.sectionTitleWrap}>
              <View style={ss.sectionTitleLine} />
              <Text style={ss.sectionTitle}>{t('perf.peerCompare')}</Text>
            </View>
            <Text style={ss.sectionHint}>{t('perf.anonymous')}</Text>
          </View>
          <View style={[ss.card, ss.peerCard]}>
            <View style={ss.peerBars}>
              <View style={ss.peerRow}>
                <Text style={ss.peerLabel} numberOfLines={1}>{t('perf.myAcc')}</Text>
                <View style={ss.peerBarWrap}>
                  <View
                    style={[ss.peerBar, ss.peerBarMe, { width: `${getClampedPercent(peer.studentAccuracy)}%` }]}
                  >
                    <Text style={ss.peerBarText}>{peer.studentAccuracy}%</Text>
                  </View>
                </View>
              </View>
              <View style={ss.peerRow}>
                <Text style={ss.peerLabel} numberOfLines={1}>{gradeLabel}</Text>
                <View style={ss.peerBarWrap}>
                  <View
                    style={[ss.peerBar, ss.peerBarAvg, { width: `${getClampedPercent(peer.totalAvgAccuracy)}%` }]}
                  >
                    <Text style={ss.peerBarText}>{peer.totalAvgAccuracy}%</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={ss.peerGap}>
              <Text style={ss.peerGapText}>
                {peer.studentAccuracy < peer.totalAvgAccuracy ? (
                  <>
                    {t('perf.toAverage', '평균까지')}{' '}
                    <Text style={ss.arrowDown}>
                      ▼ {(peer.totalAvgAccuracy - peer.studentAccuracy).toFixed(2)}%p
                    </Text>
                    {periodDelta != null && (
                      <>
                        {' · '}{t('perf.thisPeriod', '이번 달')}{' '}
                        <Text style={periodDelta >= 0 ? ss.catchUp : ss.arrowDown}>
                          {periodDelta >= 0 ? '+' : ''}{periodDelta}%p
                        </Text>{' '}
                        {t('perf.catchingUp', '따라잡는 중')}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {t('perf.thanAverage', '평균보다')}{' '}
                    <Text style={ss.catchUp}>
                      ▲ {(peer.studentAccuracy - peer.totalAvgAccuracy).toFixed(2)}%p
                    </Text>{' '}
                    {t('perf.ahead', '앞서 있음')}
                  </>
                )}
              </Text>
            </View>
          </View>
        </View>
      )}

    </View>
  )
}

export default PerformancePanel
