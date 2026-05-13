import React, { useMemo, useRef, useState, useEffect, memo } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { WebView } from 'react-native-webview'
import { palette } from '@/theme'
import { ceilTo, roundTo } from '@/utils/helpers'
import { formatAccumulatedTimeSplit } from '../configs/helper'
import { MILLISECONDS_PER_HOUR } from '../configs/constants'
import { ScaledSheet } from 'react-native-size-matters'

export type StudyTimeDistribution = {
  name: string
  hours?: number
  percentage?: number
  correctRate?: number
  totalAnsweredQuestions?: number
}

type Props = {
  data: StudyTimeDistribution[]
  colorSubjects: string[]
  isTimerTab?: boolean
  loading: boolean
  emptySliceColor?: string
}

const DistributionItem = ({
  title,
  subTitle,
  staticsNumber,
  unit,
  isLastItem
}: {
  title?: string
  subTitle?: string
  staticsNumber: number
  unit: string
  isLastItem?: boolean
}) => (
  <View style={[styles.statItem, isLastItem && { borderRightWidth: 0 }]}>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue} numberOfLines={1}>
      {subTitle}
    </Text>
    <Text style={styles.statSub}>
      {staticsNumber}
      {unit}
    </Text>
  </View>
)

function getChartHtml(emptyColor: string) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%;background:transparent;overflow:hidden}
  #c{width:100%;height:100%}
</style>
</head>
<body>
<div id="c"></div>
<script>
var chartInstance = null;
var __emptyColor = '${emptyColor}';

function postRN(msg) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }
}

function renderChart(payload) {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }

  var mapped = payload.filter(function(d) { return !d.isEmpty; }).map(function(d) {
    return {
      value: d.value,
      name: d.name,
      isEmpty: false,
      richLabel: '{nm|' + d.name + '}\\n{mv|' + d.mainVal + '}\\n{sv|' + d.subVal + '}',
      itemStyle: { color: d.color },
      _color: d.color
    };
  });

  chartInstance = echarts.init(document.getElementById('c'), null, {
    renderer: 'svg',
    backgroundColor: 'transparent'
  });

  var option = {
    backgroundColor: 'transparent',
    tooltip: { show: false },
    series: [{
      type: 'pie',
      radius: ['30%', '55%'],
      center: ['50%', '50%'],
      padAngle: 2.5,
      itemStyle: { borderRadius: 4 },
      avoidLabelOverlap: true,
      roseType: 'radius',
      label: {
        show: true,
        position: 'outside',
        distanceToLabelLine: 2,
        formatter: function(p) { return p.data.richLabel || ' '; },
        rich: {
          nm: { fontSize: 12, color: '#222222', fontWeight: '500', lineHeight: 20, align: 'center' },
          mv: { fontSize: 16, fontWeight: 'bold', lineHeight: 20, align: 'center', color: '#7036EC' },
          sv: { fontSize: 12, color: '#222222', lineHeight: 16, align: 'center', fontWeight: '500', lineHeight: 20 }
        }
      },
      labelLine: {
        show: true,
        length: 14,
        length2: 18,
        lineStyle: { color: '#71717A', width: 1 }
      },
      emphasis: { scale: false },
      data: mapped
    }]
  };

  chartInstance.setOption(option);
  
  setTimeout(function() {
    try {
      var nonEmpty = payload.filter(function(d) { return !d.isEmpty; });
      var tspans = document.querySelectorAll('#c svg tspan');
      var idx = 0;
      tspans.forEach(function(el) {
        if (el.style && el.style.fontWeight === 'bold' || el.getAttribute('font-weight') === 'bold') {
          if (nonEmpty[idx]) {
            el.style.fill = nonEmpty[idx]._color || nonEmpty[idx].color;
            idx++;
          }
        }
      });
    } catch(e) {}
    postRN({ type: 'RENDERED' });
  }, 100);
}

function handleMessage(e) {
  try {
    var payload = JSON.parse(e.data);
    renderChart(payload);
  } catch(err) {
    console.error('CHART PARSE ERROR', err);
  }
}

document.addEventListener('message', handleMessage);
window.addEventListener('message', handleMessage);

var script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/echarts@6.0.0/dist/echarts.min.js';
script.onload = function() {
  postRN({ type: 'READY' });
};
script.onerror = function() {
  setTimeout(function() {
    var s2 = document.createElement('script');
    s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/echarts/6.0.0/echarts.min.js';
    s2.onload = function() {
      postRN({ type: 'READY' });
    };
    document.head.appendChild(s2);
  }, 1000);
};
document.head.appendChild(script);
</script>
</body>
</html>`;
}

const CHART_HEIGHT = 300

const ChartItem = memo(({ payload, emptySliceColor }: { payload: any, emptySliceColor: string }) => {
  const [loading, setLoading] = useState(true)
  const webRef = useRef<WebView>(null)
  const isReady = useRef(false)
  const hasRendered = useRef(false)
  const pendingPayload = useRef<any>(null)
  const loadingTimeout = useRef<NodeJS.Timeout | null>(null)

  const html = useMemo(() => getChartHtml(emptySliceColor), [emptySliceColor])

  useEffect(() => {
    pendingPayload.current = payload
    if (isReady.current && webRef.current) {
      setLoading(true)
      hasRendered.current = false
      webRef.current.postMessage(JSON.stringify(payload))
    }
  }, [payload])

  useEffect(() => {
    if (loading && !hasRendered.current) {
      loadingTimeout.current = setTimeout(() => {
        setLoading(false)
        hasRendered.current = true
      }, 5000)
    } else {
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current)
    }
    return () => {
      if (loadingTimeout.current) clearTimeout(loadingTimeout.current)
    }
  }, [loading])

  return (
    <View style={styles.chartContainer}>
      {loading && !hasRendered.current && (
        <ActivityIndicator style={StyleSheet.absoluteFillObject} />
      )}
      <WebView
        ref={webRef}
        style={styles.webview}
        source={{ html }}
        scrollEnabled={false}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onLoadEnd={() => {
          if (loading) {
            setTimeout(() => {
              hasRendered.current = true
              setLoading(false)
            }, 1000)
          }
        }}
        onMessage={(event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data)
            if (msg.type === 'READY') {
              if (!isReady.current) {
                isReady.current = true
                const data = pendingPayload.current ?? payload
                webRef.current?.postMessage(JSON.stringify(data))
              }
            }
            if (msg.type === 'RENDERED') {
              hasRendered.current = true
              setLoading(false)
              if (loadingTimeout.current) clearTimeout(loadingTimeout.current)
            }
          } catch (e) { }
        }}
      />
    </View>
  )
})

const SubjectDistribution = ({
  data,
  loading,
  colorSubjects,
  isTimerTab = true,
  emptySliceColor = '#6BCCFE'
}: Props) => {
  const { t } = useTranslation()

  const payload = useMemo(() => {
    if (!data?.length) return []
    return data.map((item, i) => {
      const color = colorSubjects[i]
      const isEmpty = !item.percentage && !item.hours && !item.correctRate

      const timeFormatted = formatAccumulatedTimeSplit((item.hours || 0) * MILLISECONDS_PER_HOUR, t)
      const mainVal = isTimerTab ? `${timeFormatted.value}${timeFormatted.unit}` : `${roundTo(item.correctRate || 0, 1)}%`

      const subVal = isTimerTab
        ? `${ceilTo(item.percentage || 0, 2)}%`
        : `${item.totalAnsweredQuestions || 0}${t('question(s)')}`

      return { value: item.percentage || 0, name: item.name, mainVal, subVal, color, isEmpty }
    })
  }, [data, colorSubjects, isTimerTab, t])

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator />
      </View>
    )
  }

  if (!data || data.length === 0) return null

  const most = data[0]
  const least = data[data.length - 1]

  return (
    <View style={styles.card}>
      <ChartItem payload={payload} emptySliceColor={emptySliceColor} />

      <View style={styles.statsRow}>
        {isTimerTab ? (
          <>
            <DistributionItem
              title={t('most_studied_subject')}
              subTitle={most.name}
              staticsNumber={formatAccumulatedTimeSplit((most.hours || 0) * MILLISECONDS_PER_HOUR, t).value}
              unit={formatAccumulatedTimeSplit((most.hours || 0) * MILLISECONDS_PER_HOUR, t).unit}
            />
            <DistributionItem
              title={t('least_studied_subject')}
              subTitle={least.name}
              staticsNumber={formatAccumulatedTimeSplit((least.hours || 0) * MILLISECONDS_PER_HOUR, t).value}
              unit={formatAccumulatedTimeSplit((least.hours || 0) * MILLISECONDS_PER_HOUR, t).unit}
            />
            <DistributionItem
              title={t('study_imbalance_rate')}
              subTitle={t('imbalance_rate', {
                rate: ceilTo((most.hours || 0) / (least.hours || 1), 2)
              })}
              staticsNumber={formatAccumulatedTimeSplit(Math.abs((most.hours || 0) - (least.hours || 0)) * MILLISECONDS_PER_HOUR, t).value}
              isLastItem
              unit={formatAccumulatedTimeSplit(Math.abs((most.hours || 0) - (least.hours || 0)) * MILLISECONDS_PER_HOUR, t).unit}
            />
          </>
        ) : (
          <>
            <DistributionItem
              title={t('highest_accuracy_rate')}
              subTitle={most.name}
              staticsNumber={most.correctRate || 0}
              unit="%"
            />
            <DistributionItem
              title={t('lowest_accuracy_rate')}
              subTitle={least.name}
              staticsNumber={least.correctRate || 0}
              unit="%"
            />
            <DistributionItem
              title={t('accuracy_rate_difference')}
              subTitle={t('imbalance_rate', {
                rate: ceilTo((most.correctRate || 0) / (least.correctRate || 1), 2)
              })}
              staticsNumber={roundTo((most.correctRate || 0) - (least.correctRate || 0), 2)}
              unit="%"
              isLastItem
            />
          </>
        )}
      </View>
    </View>
  )
}

export default SubjectDistribution

const styles = ScaledSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: '20@ms',
    padding: '16@ms',
    gap: '4@ms'
  },
  chartContainer: {
    height: CHART_HEIGHT,
    overflow: 'hidden'
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  webviewHidden: {
    display: 'none'
  },
  divider: {
    height: '1@ms',
    backgroundColor: '#F3F4F6',
    marginVertical: '12@ms'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statItem: {
    flex: 1,
    gap: '4@ms',
    alignItems: 'center',
    borderRightWidth: '1@ms',
    borderColor: palette.grey[100]
  },
  statTitle: {
    fontSize: '12@ms',
    color: '#222222',
    textAlign: 'center'
  },
  statValue: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#222222',
    textAlign: 'center',
  },
  statSub: {
    fontSize: '12@ms',
    color: palette.grey[400],
  }
})
