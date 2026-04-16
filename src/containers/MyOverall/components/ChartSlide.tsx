import React, { memo, useEffect, useRef, useState } from 'react'
import { View, Text } from 'react-native'
import WebView from 'react-native-webview'
import { palette } from '@/theme'
import Loading from '@/components/Loading'
import { useTranslation } from 'react-i18next'
import useAuthStore from '@/store/useAuthStore'
import { Language } from '@/utils/enums'

interface Props {
  title: string
  isTimeChart: boolean
  payload: any
}

export const CHART_HTML = (t: any) => `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script src="https://cdn.jsdelivr.net/npm/apexcharts@3.45.2/dist/apexcharts.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      background: transparent;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    #chart { width: 100%; }

    .apexcharts-legend-marker {
      width: 24px !important;
      height: 2px !important;
      border-radius: 0 !important;
      margin-right: 6px !important;
      display: inline-block !important;
      vertical-align: middle !important;
    }
    .apexcharts-legend-text {
      font-size: 14px !important;
      font-weight: 600 !important;
      font-family: sans-serif !important;
      vertical-align: middle !important;
    }
    .apexcharts-xaxis-label tspan,
    .apexcharts-xaxis-label,
    .apexcharts-xaxis text {
      font-family: sans-serif !important;
      font-size: 14px !important;
      fill: #667085 !important;
    }
  </style>
</head>
<body>
  <div id="chart"></div>

  <script>
    var chartInstance = null;

    function normalizeArray(arr, size, fill) {
      if (!arr || !Array.isArray(arr)) return Array(size).fill(fill);
      var r = arr.slice(0, size);
      while (r.length < size) r.push(fill);
      return r;
    }

    function postRN(payload) {
      try {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      } catch(e) {}
    }

    function adjustBottomEdge() {
      setTimeout(function () {
        var text = document.querySelector('.apexcharts-xaxis text:nth-child(4)');
        if (!text) {
          postRN({ type: 'RENDERED' });
          return;
        }
        var y = text.getAttribute('y');
        if (y) text.setAttribute('y', String(parseFloat(y) + 8));
        postRN({ type: 'RENDERED' });
      }, 300);
    }

    function renderChart(data) {
      if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

      var height   = data.height || 300;
      var cats     = normalizeArray(data.categories, 6, '');
      var myData   = normalizeArray(data.myData,  6, 0);
      var avgData  = normalizeArray(data.avgData, 6, 0);
      var myLabel  = data.myLabel  || "${t('my_data')}";
      var avgLabel = data.avgLabel || "${t('avg_data')}";
      var GREY_300 = '#D0D5DD';
      var GREY_500 = '#98A2B3';
      var GREY_700 = '#667085';

      chartInstance = new ApexCharts(document.querySelector('#chart'), {
        chart: {
          height: height,
          type: 'radar',
          toolbar:    { show: false },
          dropShadow: { enabled: true, blur: 1, left: 1, top: 1 },
          animations: { enabled: !data.isPrint },
          background: 'transparent',
          events: {
            mounted: function() { adjustBottomEdge(); },
            updated: function() { adjustBottomEdge(); }
          }
        },
        series: [
          { name: myLabel,  data: myData  },
          { name: avgLabel, data: avgData }
        ],
        colors: ['#3DC674', '#4F8BDE'],
        plotOptions: {
          radar: {
            polygons: {
              strokeWidth:     1,
              strokeColors:    GREY_500,
              connectorColors: GREY_300
            }
          }
        },
        stroke:  { width: 1 },
        fill:    { opacity: 0.2 },
        markers: { size: 3, strokeColors: '#FFFFFF', hover: { size: 6 } },
        dataLabels: { enabled: false },
        yaxis: { show: false, min: 0, max: 100, tickAmount: 1 },
        xaxis: {
          categories: cats,
          labels: {
            show: true,
            style: {
              fontSize:   '14px',
              fontFamily: 'sans-serif',
              colors: [GREY_700, GREY_700, GREY_700, GREY_700, GREY_700, GREY_700]
            }
          }
        },
        legend: {
          show: true,
          position: 'bottom',
          markers:  { width: 24, height: 2, radius: 0 },
          labels:   { useSeriesColors: true },
          fontSize:   '14px',
          fontWeight: 600
        },
        tooltip: {
          enabled: true,
          followCursor: true,
          custom: function(opt) {
            var dpi   = opt.dataPointIndex;
            var label = cats[dpi] || '';
            if (data.tooltipData && data.tooltipData[dpi]) {
              var row     = data.tooltipData[dpi];
              var myV     = row.myValue || 0;
              var avgV    = row.avgValue || 0;
              var myColor  = '#3DC674';
              var avgColor = '#4F8BDE';
              return '<div style="padding:8px;background:#fff;border-radius:4px;">'
                + '<div style="border-bottom:1px solid #f3f3f3;margin-bottom:4px"><strong>' + label + '</strong></div>'
                + '<div style="display:flex;justify-content:space-between">'
                +   '<p style="margin-right:4px"><strong style="color:' + myColor  + '">' + myLabel  + ':</strong></p>'
                +   '<p>' + myV  + '</p>'
                + '</div>'
                + '<div style="display:flex;justify-content:space-between">'
                +   '<p style="margin-right:4px"><strong style="color:' + avgColor + '">' + avgLabel + ':</strong></p>'
                +   '<p>' + avgV + '</p>'
                + '</div>'
                + '</div>';
            }
          }
        }
      });

      chartInstance.render();
    }

    function handleMessage(e) {
      try { renderChart(JSON.parse(e.data)); }
      catch(err) { console.error('CHART PARSE ERROR', err); }
    }

    document.addEventListener('message', handleMessage);
    window.addEventListener('message',   handleMessage);

    postRN({ type: 'READY' });
  <\/script>
</body>
</html>`;

export const TIME_CHART_HTML = (t: any) => `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script src="https://cdn.jsdelivr.net/npm/apexcharts@3.45.2/dist/apexcharts.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: #fff; width: 100%; height: 100%; overflow: hidden; }
    #chart { width: 100%; }

    .apexcharts-legend-text {
      font-size: 13px !important;
      font-weight: 600 !important;
      font-family: sans-serif !important;
    }
    .apexcharts-legend-series:nth-child(1) .apexcharts-legend-text {
      color: #3DC674 !important;
    }
    .apexcharts-legend-series:nth-child(2) .apexcharts-legend-text {
      color: #71717A !important;
    }

    .apexcharts-legend-marker {
      width: 24px !important;
      height: 2px !important;
      border-radius: 0 !important;
      margin-right: 6px !important;
      display: inline-block !important;
      vertical-align: middle !important;
    }

    .apexcharts-xaxis-texts-g text:first-child,
    .apexcharts-xaxis-texts-g text:last-child {
      opacity: 0 !important;
    }

    .apexcharts-yaxis line:last-of-type {
      opacity: 0 !important;
    }

    .apexcharts-xaxis-label tspan,
    .apexcharts-xaxis text {
      font-size: 10px !important;
      fill: #71717A !important;
    }
    .apexcharts-yaxis-label tspan,
    .apexcharts-yaxis text {
      font-size: 10px !important;
      fill: #71717A !important;
    }
  </style>
</head>
<body>
  <div id="chart"></div>

  <script>
    var chartInstance = null;

    function normalizeArray(arr, size, fill) {
      if (!arr || !Array.isArray(arr)) return Array(size).fill(fill);
      var r = arr.slice(0, size);
      while (r.length < size) r.push(fill);
      return r;
    }

    function postRN(payload) {
      try {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      } catch(e) {}
    }

    function renderChart(data) {
      if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

      var GREEN      = '#3DC674';
      var GREY_AREA  = '#D0D5DD';
      var GREY_500   = '#71717A';
      var GREEN_FILL = '#ECFDF3';

      var height    = data.height || 350;
      var isPrint   = !!data.isPrint;
      var questions = data.questions || [];
      var maxLength = questions.length;

      var myTimesRaw  = questions.map(function(q) { return q.time    / 1000; });
      var avgTimesRaw = questions.map(function(q) { return q.avgTime / 1000; });
      var myCorrects  = questions.map(function(q) { return q.isCorrect; });
      var categories  = questions.map(function(q) {
        return q.parentQuestionId
          ? ((q.parentQuestionOrder || 0) + 1) + '.' + (q.questionOrder + 1)
          : (q.questionOrder + 1);
      });

      var myTimes  = [null].concat(normalizeArray(myTimesRaw,  maxLength, null)).concat([null]);
      var avgTimes = [null].concat(normalizeArray(avgTimesRaw, maxLength, null)).concat([null]);
      var cats     = [' '].concat(normalizeArray(categories,   maxLength, '')).concat([' ']);

      var allVals  = myTimesRaw.concat(avgTimesRaw).filter(function(v){ return v != null; });
      var maxTime  = allVals.length ? Math.max.apply(null, allVals) : 0;
      var maxValue = maxTime >= 300 ? maxTime + 50 : 300;
      var maxX     = Math.floor(maxValue / 450);
      var x        = Math.max(1, maxX);
      var tickAmount = maxValue / (x * 50) + 1;

      var normalizedCorrects = [null].concat(normalizeArray(myCorrects, maxLength, null)).concat([null]);
      var discreteMarkers = normalizedCorrects.map(function(isCorrect, index) {
        return {
          seriesIndex:    0,
          dataPointIndex: index,
          fillColor:   isCorrect == null ? '#fff'    : isCorrect ? '#3DC674' : '#F04438',
          strokeColor: isCorrect == null ? GREEN      : '#fff',
          size: 4,
          shape: 'circle'
        };
      });

      var myLabel  = data.myLabel  || "${t('my_data')}";
      var avgLabel = data.avgLabel || "${t('avg_data')}";

      chartInstance = new ApexCharts(document.querySelector('#chart'), {
        chart: {
          height: height,
          type: 'line',
          toolbar:    { show: false },
          zoom:       { enabled: false },
          animations: { enabled: !isPrint },
          background: 'transparent',
          events: {
            mounted: function() { postRN({ type: 'RENDERED' }); }
          }
        },

        series: [
          { name: myLabel,  type: 'line', data: myTimes  },
          { name: avgLabel, type: 'area', data: avgTimes }
        ],

        colors: [GREEN, GREY_AREA],

        stroke: {
          width: [1.5, 1],
          curve: 'straight'
        },

        fill: {
          type:    ['solid', 'solid'],
          opacity: [0.08,    0.3]
        },

        grid: { show: false },

        markers: {
          size:        [4, 0],
          colors:      ['#fff', GREY_AREA],
          strokeColors: [GREEN, GREY_AREA],
          strokeWidth: 1.5,
          hover: { size: 6 },
          discrete: discreteMarkers
        },

        dataLabels: { enabled: false },

        legend: {
          show:     true,
          position: 'bottom',
          markers:  { width: 24, height: 2, radius: 0 },
          labels:   {
            useSeriesColors: true
          },
          fontSize:   '13px',
          fontWeight: 600,
          itemMargin: { horizontal: 16, vertical: 8 }
        },

        xaxis: {
          categories: cats,
          axisBorder: { show: true,  color: GREY_500 },
          axisTicks:  { show: true,  color: GREY_500, height: 4 },
          labels: {
            style:    { fontSize: '10px', colors: GREY_500 },
            trim:     false,
            hideOverlappingLabels: false
          },
          tooltip: { enabled: false }
        },

        yaxis: {
          max: maxValue,
          min: 0,
          tickAmount: tickAmount,
          forceNiceScale: true,
          axisBorder: { show: true, color: GREY_500, width: 1 },
          axisTicks:  { show: true, color: GREY_500, width: 5, offsetX: 5 },
          labels: {
            style: { fontSize: '10px', colors: [GREY_500] },
            formatter: function(v) { return v != null ? parseFloat(v).toFixed(0) : ''; }
          }
        },

        tooltip: {
          shared:    true,
          intersect: false,
          followCursor: true,
          x: {
            formatter: function(x, opt) {
              var dpi = opt && opt.dataPointIndex;
              if (dpi > 0 && dpi <= maxLength) {
                return '문제 번호 ' + categories[dpi - 1];
              }
              return '';
            }
          },
          y: {
            formatter: function(y, opt) {
              var dpi  = opt && opt.dataPointIndex;
              var sIdx = opt && opt.seriesIndex;
              if (dpi > 0 && dpi <= maxLength && y != null) {
                var realIdx = dpi - 1;
                var rawMs   = sIdx === 0
                  ? questions[realIdx].time
                  : (questions[realIdx].avgTime || 0);
                return (rawMs / 1000).toFixed(2) + ' seconds';
              }
              return y != null ? parseFloat(y).toFixed(0) + ' seconds' : '';
            }
          }
        }
      });

      chartInstance.render();
    }

    function handleMessage(e) {
      try { renderChart(JSON.parse(e.data)); }
      catch(err) { console.error('TIME_CHART PARSE ERROR', err); }
    }

    document.addEventListener('message', handleMessage);
    window.addEventListener('message',   handleMessage);

    postRN({ type: 'READY' });
  <\/script>
</body>
</html>`;

const ChartSlide = memo(({ title, isTimeChart, payload }: Props) => {
  const { t } = useTranslation()
  const webRef = useRef<any>(null)
  const HEIGHT = 350
  const [loading, setLoading] = useState<boolean>(true)
  const hasRendered = useRef(false)
  const isReady = useRef(false)

  useEffect(() => {
    if (!isReady.current && webRef.current) {
      isReady.current = true
      webRef.current.postMessage(JSON.stringify(payload))
    }
  }, [payload])

  return (
    <View
      style={{
        borderRadius: 14,
        backgroundColor: '#FFFF',
        marginBottom: 22,
        overflow: 'hidden'
      }}
    >
      {loading && !hasRendered.current && <Loading isOverlay={false} />}
      <View
        style={{
          backgroundColor: palette.grey[50],
          borderBottomWidth: 1,
          borderColor: palette.grey[200],
          paddingVertical: 8,
          width: '100%'
        }}
      >
        <Text style={{ color: '#222222', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{title}</Text>
      </View>
      <View style={{ height: HEIGHT }}>
        <WebView
          ref={webRef}
          style={{ height: HEIGHT }}
          source={{ html: isTimeChart ? TIME_CHART_HTML(t) : CHART_HTML(t) }}
          thirdPartyCookiesEnabled
          sharedCookiesEnabled
          javaScriptEnabled
          onMessage={(event) => {
            const msg = JSON.parse(event.nativeEvent.data)

            console.log('MESSAGE FROM WEB', msg)

            if (msg.type === 'READY') {
              isReady.current = true
              webRef.current?.postMessage(JSON.stringify(payload))
            }

            if (msg.type === 'RENDERED') {
              isReady.current = true
              setLoading(false)
            }
          }}
        />
      </View>
    </View>
  )
})

export default ChartSlide
