import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native'
import { WebView } from 'react-native-webview'
import { useTranslation } from 'react-i18next'
import { palette } from '@/theme'
import ArrowRight from '@/assets/iconJSX/arrowRight'
import { ScaledSheet } from 'react-native-size-matters'

interface Question {
  questionOrder: number
  answerOrder: number | null
  topAnswerOrder: number | null
  parentQuestionId?: number
  parentQuestionOrder?: number
}

interface TimelyOrderQuestion {
  questions: Question[]
}

type Props = {
  data: TimelyOrderQuestion[] | null
  loading?: boolean
}

const ORDER_NUMBERS: Record<string, string> = {
  '1': 'the_first',
  '2': 'the_second',
  '3': 'the_third',
  '4': 'the_fourth',
  '5': 'the_fifth',
  '6': 'the_sixth',
  '7': 'the_seventh',
  '8': 'the_eighth',
  '9': 'the_ninth',
  '10': 'the_tenth',
}

const CHART_HEIGHT = 300

function getChartHtml(myLabel: string, topLabel: string, noDataLabel: string) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 100%; height: ${CHART_HEIGHT}px;
    background: #ffffff;
    overflow: hidden;
    font-family: -apple-system, 'Apple SD Gothic Neo', sans-serif;
  }
  #wrap {
    width: 100%;
    height: ${CHART_HEIGHT}px;
    display: flex;
    flex-direction: column;
  }
  #legend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 10px 0 4px;
    flex-shrink: 0;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #374151;
    font-weight: 400;
    white-space: nowrap;
  }
  .legend-line {
    width: 28px;
    height: 4px;
    border-radius: 2px;
    flex-shrink: 0;
  }
  #chart { width: 100%; flex: 1; min-height: 0; }
</style>
</head>
<body>
<div id="wrap">
  <div id="legend">
    <div class="legend-item">
      <span>${myLabel}</span>
      <span class="legend-line" style="background:#B09FFF;"></span>
    </div>
    <div class="legend-item">
      <span>${topLabel}</span>
      <span class="legend-line" style="background:#FF9364;"></span>
    </div>
  </div>
  <div id="chart"></div>
</div>

<script>
var chartInstance = null;
var myLabel = '${myLabel}';
var topLabel = '${topLabel}';
var noDataLabel = '${noDataLabel}';

function postRN(msg) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }
}

function t_problemNumber(payload, number) {
  return payload.labels.problemNumberQuestion.replace('{number}', number);
}

function t_orderNumber(payload, val) {
  var v = String(val);
  if (v === '' || v === 's' || v === 'e') return '';
  return payload.labels.orderNumbers[v] || v;
}

function renderChart(payload) {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  var chartEl = document.getElementById('chart');
  var options = {
    chart: {
      type: 'area',
      height: chartEl.offsetHeight || 240,
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: false },
      background: '#ffffff',
      fontFamily: "-apple-system, 'Apple SD Gothic Neo', sans-serif",
      events: {
        mounted: function() {
          setTimeout(function() {
            postRN({ type: 'RENDERED' });
          }, 100);
        }
      }
    },
    series: payload.series,
    colors: ['#B09FFF', '#FF9364'],
    stroke: {
      curve: 'smooth',
      width: [2, 2]
    },
    fill: {
      type: ['solid', 'gradient'],
      opacity: [0, 1],
      gradient: {
        type: 'vertical',
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.0,
        stops: [0, 100]
      }
    },
    markers: { size: 0 },
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      shared: false,
      y: {
        formatter: function(val, opts) {
          if (!opts || opts.dataPointIndex <= 0 || val == null) return null;
          var label = payload.yLabelMap[val];
          return label ? t_problemNumber(payload, label) : noDataLabel;
        }
      }
    },
    xaxis: {
      categories: payload.categories,
      labels: {
        style: { fontSize: '12px', colors: '#9CA3AF' },
        formatter: function(val) { return t_orderNumber(payload, val); }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      crosshairs: { show: false },
      tooltip: { enabled: false }
    },
    yaxis: {
      labels: {
        style: { fontSize: '12px', colors: '#9CA3AF' },
        formatter: function(val) {
          if (val == null) return '';
          var label = payload.yLabelMap[val];
          return label ? t_problemNumber(payload, label) : '';
        }
      }
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
      padding: { left: 10, right: 16 }
    },
    theme: { mode: 'light' }
  };

  chartInstance = new ApexCharts(chartEl, options);
  chartInstance.render();
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
script.src = 'https://cdn.jsdelivr.net/npm/apexcharts@3.54.0/dist/apexcharts.min.js';
script.onload = function() {
  postRN({ type: 'READY' });
};
script.onerror = function() {
  var s2 = document.createElement('script');
  s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/apexcharts/3.54.0/apexcharts.min.js';
  s2.onload = function() {
    postRN({ type: 'READY' });
  };
  document.head.appendChild(s2);
};
document.head.appendChild(script);
</script>
</body>
</html>`;
}

function buildPayload(
  questions: Question[],
  labels: {
    myOrder: string
    topOrder: string
    problemNumberQuestion: string
    noData: string
    orderNumbers: Record<string, string>
  }
) {
  const cloned = [...questions]
    .sort((a, b) => a.questionOrder - b.questionOrder)
    .map((q, index) => ({
      ...q,
      questionOrder: index,
      answerOrder: q.answerOrder ?? 0,
      topAnswerOrder: q.topAnswerOrder ?? 0,
    }))

  const total = cloned.length

  const myAnswered = [...cloned]
    .filter((q) => q.answerOrder !== 0)
    .sort((a, b) => a.answerOrder - b.answerOrder || a.questionOrder - b.questionOrder)

  const topAnswered = [...cloned]
    .filter((q) => q.topAnswerOrder !== 0)
    .sort((a, b) => a.topAnswerOrder - b.topAnswerOrder || a.questionOrder - b.questionOrder)

  const mySeriesData: (number | null)[] = [
    null,
    ...myAnswered.map((q) => total - q.questionOrder),
    ...cloned.filter((q) => q.answerOrder === 0).map(() => null),
    null,
  ]

  const topSeriesData: (number | null)[] = [
    null,
    ...topAnswered.map((q) => total - q.questionOrder),
    ...cloned.filter((q) => q.topAnswerOrder === 0).map(() => null),
    null,
  ]

  const categories = [
    '',
    ...questions.map((q) =>
      q.parentQuestionId
        ? `${(q.parentQuestionOrder || 0) + 1}.${(q.questionOrder || 0) + 1}`
        : String((q.questionOrder || 0) + 1)
    ),
    '',
  ]

  const yLabelMap: Record<number, string> = {}
  cloned.forEach((q) => {
    const yVal = total - q.questionOrder
    yLabelMap[yVal] = q.parentQuestionId
      ? `${(q.parentQuestionOrder || 0) + 1}.${(q.questionOrder || 0) + 1}`
      : String((q.questionOrder || 0) + 1)
  })

  return {
    series: [
      { name: labels.myOrder, data: mySeriesData },
      { name: labels.topOrder, data: topSeriesData },
    ],
    categories,
    yLabelMap,
    labels,
  }
}

const ChartItem = React.memo(({ payload, labels }: { payload: any, labels: any }) => {
  const [loading, setLoading] = useState(true)
  const webRef = useRef<WebView>(null)
  const isReady = useRef(false)
  const hasRendered = useRef(false)
  const pendingPayload = useRef<any>(null)
  const loadingTimeout = useRef<NodeJS.Timeout | null>(null)

  const html = useMemo(() => getChartHtml(labels.myOrder, labels.topOrder, labels.noData), [labels])

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
        <ActivityIndicator
          color="#7C3AED"
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <WebView
        ref={webRef}
        style={styles.webview}
        source={{ html }}
        scrollEnabled={false}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled={true}
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

const SolutionOrderChart: React.FC<Props> = ({ data, loading = false }) => {
  const { t } = useTranslation()
  const [dataChartIndex, setDataChartIndex] = useState(0)

  useEffect(() => {
    if (!data) return
    if (dataChartIndex >= data.length) setDataChartIndex(0)
  }, [data])

  const questions = data?.[dataChartIndex]?.questions ?? []

  const labels = useMemo(() => ({
    myOrder: t('my_problem_solving_order'),
    topOrder: t('top_rankings_problem_solving_order'),
    problemNumberQuestion: t('problem_number_question', { number: '{number}' }),
    noData: t('no_data'),
    orderNumbers: Object.fromEntries(
      Object.entries(ORDER_NUMBERS).map(([k, v]) => [k, t(v)])
    ),
  }), [t])

  const payload = useMemo(() => buildPayload(questions, labels), [questions, labels])

  const handlePrev = useCallback(() => {
    setDataChartIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  const handleNext = useCallback(() => {
    if (!data) return
    setDataChartIndex((prev) => Math.min(prev + 1, data.length - 1))
  }, [data])

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={{ height: CHART_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#7C3AED" />
        </View>
      </View>
    )
  }

  if (!data || data.length === 0) return null

  const isFirst = dataChartIndex === 0
  const isLast = dataChartIndex === (data.length - 1)

  return (
    <View>
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
        <Text style={{ color: palette.main[600], fontSize: 16, fontWeight: '600' }}>{t('solution_order')}</Text>
      </View>

      <View style={styles.card}>
        <ChartItem payload={payload} labels={labels} />

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.circleBtn, isFirst && styles.circleBtnDisabled]}
            onPress={handlePrev}
            disabled={isFirst}
            activeOpacity={0.8}
          >
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <ArrowRight color={"#FFF"} width={20} height={20} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.circleBtn, isLast && styles.circleBtnDisabled]}
            onPress={handleNext}
            disabled={isLast}
            activeOpacity={0.8}
          >
            <ArrowRight color={"#FFF"} width={20} height={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}


export default SolutionOrderChart
const styles = ScaledSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14@ms',
    paddingVertical: '20@ms',
  },
  chartContainer: {
    height: CHART_HEIGHT,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  hidden: {
    display: 'none',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    paddingTop: '12@ms',
  },
  circleBtn: {
    width: '44@ms',
    height: '44@ms',
    borderRadius: '22@ms',
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnDisabled: {
    backgroundColor: '#C4B5FD',
  },
  circleBtnText: {
    color: '#FFFFFF',
    fontSize: '24@ms',
    lineHeight: '28@ms',
    fontWeight: '400',
    marginTop: '-2@ms',
  },
})