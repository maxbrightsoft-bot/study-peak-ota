import { palette } from '@/theme'
import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { ms } from 'react-native-size-matters'
import { LinearGradient } from 'expo-linear-gradient'
import moment from 'moment'
import { ss } from '../styles/styles'
import { EmptyState, tPeriod, getCategoryLabel, getStrengthLabel } from '../configs/utils'

type SummaryPanelProps = {
  data: any
  todayData: any
  dailyWeekActivity?: any[]
  t: any
  timeType: number
  loadingSummary: boolean
}

const SummaryPanel = ({ data, todayData, dailyWeekActivity, t, timeType, loadingSummary }: SummaryPanelProps) => {
  const today = todayData || data?.today
  const [tappedDotIdx, setTappedDotIdx] = useState<number | null>(null)
  const weekActivity = dailyWeekActivity ?? data?.weekActivity ?? []

  if (!today || !data?.period) {
    return (
      <EmptyState
        title={t('perf.emptyTitle', 'No performance data yet')}
        description={t('perf.emptyDesc', 'Solve more problems to generate performance insights.')}
      />
    )
  }

  return (
    <View style={ss.panel}>
      <View style={[ss.section, { paddingTop: ms(16) }]}>
        <View style={ss.todayHeroWrap}>
          <LinearGradient
            colors={['#6F48E9', '#8B6BF1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={ss.todayHero}
          >
            <View style={ss.todayHeroCircle} />
            <Text style={ss.todayLabel}>{t('todayPerf.accuracy')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: ms(6) }}>
              <Text style={ss.todayValue}>{today.accuracy}</Text>
              <Text style={ss.todayValuePct}>%</Text>
            </View>
            <Text style={ss.todayDelta}>
              {t('todayPerf.vs')} {today.isDeltaUp ? '+' : '-'} {today.delta}%
            </Text>

            <View style={ss.todayStats}>
              <View style={ss.todayStat}>
                <Text style={ss.todayStatLabel}>{t('todayPerf.solved')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={ss.todayStatValue}>{today.solved}</Text>
                  <Text style={ss.todayStatValueSub}> {t('problems')}</Text>
                </View>
              </View>
              <View style={ss.todayStat}>
                <Text style={ss.todayStatLabel}>{t('todayPerf.correctWrong')}</Text>
                <Text style={ss.todayStatValue}>
                  {today.correct} / {today.wrong}
                </Text>
              </View>
              <View style={ss.todayStat}>
                <Text style={ss.todayStatLabel}>{t('todayPerf.streak')}</Text>
                <Text style={ss.todayStatValue}>
                  🔥 {today.streak} {t('days')}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      <View style={[ss.section, ss.mt0]}>
        <View style={ss.sectionHead}>
          <View style={ss.sectionTitleWrap}>
            <View style={ss.sectionTitleLine} />
            <Text style={ss.sectionTitle}>{tPeriod(t, timeType, 'performance')}</Text>
          </View>
        </View>
        <View style={ss.statGrid}>
          <View style={ss.statCard}>
            <Text style={ss.statCardLabel}>{tPeriod(t, timeType, 'solved')}</Text>
            {loadingSummary ? (
              <View style={{ backgroundColor: palette.grey[200], width: ms(60), height: ms(24), borderRadius: ms(4), marginTop: ms(4) }} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={ss.statCardValue}>{data.period.solvedCount}</Text>
                <Text style={ss.statCardValueU}>{t('problems')}</Text>
              </View>
            )}
          </View>
          <View style={ss.statCard}>
            <Text style={ss.statCardLabel}>{tPeriod(t, timeType, 'avgAccuracy')}</Text>
            {loadingSummary ? (
              <View style={{ backgroundColor: palette.grey[200], width: ms(80), height: ms(24), borderRadius: ms(4), marginTop: ms(4) }} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={ss.statCardValue}>{data.period.avgAccuracy}</Text>
                <Text style={ss.statCardValueU}>%</Text>
                {data.period.delta !== undefined && data.period.delta !== null && (
                  <Text style={{ fontSize: ms(13), marginLeft: ms(6), fontWeight: '700', color: data.period.delta < 0 ? '#EF4444' : '#10B981' }}>
                    {data.period.delta < 0 ? '▼' : '▲'} {Math.abs(data.period.delta)}%
                  </Text>
                )}
              </View>
            )}
            {loadingSummary ? (
              <View style={{ backgroundColor: palette.grey[200], width: ms(100), height: ms(14), borderRadius: ms(4), marginTop: ms(8) }} />
            ) : (
              <Text style={ss.statCardSub}>
                {tPeriod(t, timeType, 'goal')} {data.period.goalAccuracy}% ·{' '}
                <Text style={{ color: palette.main[600], fontWeight: '700' }}>
                  {Math.max(0, data.period.goalAccuracy - data.period.avgAccuracy).toFixed(1)}%p{' '}
                  {tPeriod(t, timeType, 'toGo')}
                </Text>
              </Text>
            )}
          </View>
          <View style={[ss.statCard, ss.statCardFull, ss.statWeak]}>
            <Text style={ss.statCardLabel}>{tPeriod(t, timeType, 'weakest')}</Text>
            {loadingSummary ? (
              <View style={{ backgroundColor: palette.grey[200], width: '80%', height: ms(24), borderRadius: ms(4), marginTop: ms(4) }} />
            ) : data.period.weakestType && data.period.weakestType.categoryName ? (
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={[ss.statCardValue, ss.statWeakValue]}>{getCategoryLabel(data.period.weakestType)}</Text>
                <Text style={[ss.pctRight, { color: palette.error.main }]}>{data.period.weakestType.accuracy}%</Text>
              </View>
            ) : (
              <Text style={[ss.statCardValue, ss.statWeakValue]}>-</Text>
            )}
          </View>
          <View style={[ss.statCard, ss.statCardFull, ss.statStrong]}>
            <Text style={ss.statCardLabel}>{tPeriod(t, timeType, 'strongest')}</Text>
            {loadingSummary ? (
              <View style={{ backgroundColor: palette.grey[200], width: '80%', height: ms(24), borderRadius: ms(4), marginTop: ms(4) }} />
            ) : data.period.strongestCategory && data.period.strongestCategory.categoryName ? (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={[ss.statCardValue, ss.statStrongValue]}>
                    {(data.period.strongestCategory.subCategoryName || data.period.strongestCategory.categoryName)}
                  </Text>
                  <Text style={[ss.pctRight, { color: '#065F46' }]}>{data.period.strongestCategory.accuracy}%</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: ms(4) }}>
                  <View style={{ backgroundColor: '#D1D5DB', paddingHorizontal: ms(6), paddingVertical: ms(2), borderRadius: ms(4), marginRight: ms(4) }}>
                    <Text style={{ fontSize: ms(11), fontWeight: '600', color: '#4B5563' }}>
                        {t('n_problems_solved', { n: data.period.strongestCategory.total, defaultValue: '{{n}}문제 풀이' })}
                    </Text>
                  </View>
                  {data.period.strongestCategory.sampleSizeWarning && (
                    <View style={ss.sampleBadgeMini}>
                      <Text style={ss.sampleBadgeMiniText}>{tPeriod(t, timeType, 'smallSample')}</Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <Text style={[ss.statCardValue, ss.statStrongValue]}>-</Text>
            )}
          </View>
        </View>
      </View>

      <View style={[ss.section, ss.mt0]}>
        <View style={ss.strength}>
          <Text style={ss.strengthIco}>✨</Text>
          {loadingSummary ? (
            <View style={{ flex: 1, gap: ms(6) }}>
              <View style={{ backgroundColor: palette.grey[200], width: '70%', height: ms(16), borderRadius: ms(4) }} />
              <View style={{ backgroundColor: palette.grey[200], width: '40%', height: ms(16), borderRadius: ms(4) }} />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Text style={ss.strengthText}>
                {data.strengthMessage ? (
                  <Text>{data.strengthMessage}</Text>
                ) : (
                  <>
                    <Text style={{ fontWeight: '700' }}>{t('doing_great', '잘하고 있어요')}</Text>
                    {'\n'}
                    {t('attack_weakness_better_results', '약점을 공략하면 더 좋은 결과가 있을 거예요!')}
                  </>
                )}
              </Text>
              <View style={ss.strengthPills}>
                {(data.strengths || []).map((pill: any, idx: number) => (
                  <View key={idx} style={ss.strengthPill}>
                    <Text style={ss.strengthPillText}>{getStrengthLabel(pill)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={[ss.section, ss.mt0]}>
        <View style={ss.sectionHead}>
          <View style={ss.sectionTitleWrap}>
            <View style={ss.sectionTitleLine} />
            <Text style={ss.sectionTitle}>{t('week.activity')}</Text>
          </View>
          <Text style={ss.sectionHint}>
            {(dailyWeekActivity ?? data?.weekActivity ?? []).filter((d: any) => d.level > 0).length} / 7 {t('week.days')}
          </Text>
        </View>
        <View style={[ss.card, ss.weekCard]}>
          <View style={ss.weekDots}>
            {weekActivity.map((wd: any, idx: number) => {
              let dotStyle: any = ss.wdDot
              if (wd.level === 1) dotStyle = [ss.wdDot, { backgroundColor: '#E5DFFC' }]
              else if (wd.level === 2) dotStyle = [ss.wdDot, { backgroundColor: '#AFA9EC' }]
              else if (wd.level === 3) dotStyle = [ss.wdDot, { backgroundColor: palette.main[500] }]

              if (wd.today) {
                if (wd.level === 3) {
                  dotStyle = [
                    ss.wdDot,
                    { backgroundColor: palette.main[500], borderWidth: 0, width: ms(22), height: ms(22) }
                  ]
                } else {
                  dotStyle = [
                    ss.wdDot,
                    {
                      backgroundColor: '#FFFFFF',
                      borderWidth: 2,
                      borderColor: palette.main[500],
                      borderStyle: 'dashed',
                      width: ms(20),
                      height: ms(20)
                    }
                  ]
                }
              }

              const daysMap = [
                t('sunday'),
                t('monday'),
                t('tuesday'),
                t('wednesday'),
                t('thursday'),
                t('friday'),
                t('saturday')
              ]
              const dayText = daysMap[moment(wd.timestamp).day()] || ''

              const count = wd.count ?? 0
              return (
                <TouchableOpacity
                  key={idx}
                  style={ss.wd}
                  activeOpacity={0.8}
                  onPress={() => setTappedDotIdx(tappedDotIdx === idx ? null : idx)}
                >
                  <Text style={[ss.wdDow, wd.today && { color: palette.main[500], fontWeight: '700' }]}>{dayText}</Text>
                  <View style={wd.today && wd.level === 3 ? ss.wdDotTodayLv3Wrap : null}>
                    <View style={dotStyle as any} />
                  </View>
                  {tappedDotIdx === idx && count > 0 && (
                    <View style={{
                      marginTop: ms(4),
                      backgroundColor: '#1E293B',
                      paddingHorizontal: ms(6),
                      paddingVertical: ms(3),
                      borderRadius: ms(5),
                      alignSelf: 'center'
                    }}>
                      <Text style={{ color: 'white', fontSize: ms(9.5), fontWeight: '700' }}>
                        {count}{t('problems')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
          <View style={ss.weekSummary}>
            <Text style={ss.weekSummaryText}>
              {t('perf.summaryPre')}{' '}
              <Text style={{ color: palette.grey[900], fontWeight: '700' }}>
                {data.weekTotalProblems}{t('problems')}
              </Text>
              {' · '}
              <Text style={{ color: palette.grey[900], fontWeight: '700' }}>
                {Math.floor(data.weekTotalTime / 3600000) > 0
                  ? `${Math.floor(data.weekTotalTime / 3600000)}${t('hour_h')} ${Math.floor((data.weekTotalTime % 3600000) / 60000)}${t('minutes')}`
                  : `${Math.floor(data.weekTotalTime / 60000)}${t('minutes')}`}
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default SummaryPanel
