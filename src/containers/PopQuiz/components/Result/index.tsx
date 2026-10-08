import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { palette } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { ScaledSheet } from 'react-native-size-matters';
import { Routes } from '@/navigators/RouteName';
import Svg, { Circle } from 'react-native-svg';
import usePopQuizResult from './hooks/usePopQuizResult';
import { ExamStatus } from '@/utils/enums';
import { navigate } from '@/navigators/NavigationHelpers';

const PopQuizResult = () => {
  const {
    t,
    loading,
    resultData,
    handleShare,
    handleRetry,
    fetchResult,
  } = usePopQuizResult();

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={palette.main[500]} />
      </View>
    );
  }

  if (!resultData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{t('result_not_found') || 'Result not found'}</Text>
        <TouchableOpacity onPress={() => navigate(Routes.Auth.Home)} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{t('go_to_home') || 'Go to homepage'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const questionsList = resultData.questions || [];
  const correctAnswersCount = questionsList.filter((q: any) => q.isCorrect).length;
  const totalQuestions = questionsList.length;
  const calculatedScore = questionsList.reduce((sum: number, q: any) => {
    const questionScore = Number(q?.score || 0);
    return q?.isCorrect ? sum + questionScore : sum;
  }, 0);
  const rawScore = Number(resultData?.score ?? 0);
  const score = Math.round(rawScore > 0 ? rawScore : calculatedScore);
  const title = resultData.title || '';

  const percentage = totalQuestions > 0 ? correctAnswersCount / totalQuestions : 0;
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: '#F8F9FA' }} />
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.header}>
          <View style={styles.headerButtonsRow}>
            <TouchableOpacity onPress={() => navigate(Routes.Auth.PopQuiz)} style={styles.headerIconBtn}>
              <Ionicons name="arrow-back" size={24} color={palette.grey[600]} />
            </TouchableOpacity>
            <TouchableOpacity onPress={fetchResult} style={styles.headerIconBtn}>
              <Ionicons name="refresh-outline" size={24} color={palette.grey[600]} />
            </TouchableOpacity>
            <View/>
          </View>
          <Text style={styles.title}>{t('practice_more') || 'Practice more'}</Text>
          <Text style={styles.subtitle}>{title}</Text>
        </View>

        <View style={styles.scoreChartContainer}>
          <View style={styles.chartCircleWrapper}>
            <Svg width="120" height="120" viewBox="0 0 120 120">
              <Circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#F3F4F6"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx="60"
                cy="60"
                r={radius}
                stroke={palette.main[500]}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin="60, 60"
              />
            </Svg>
            <View style={styles.chartInner}>
              <Text style={styles.scoreText}>
                {score}
                <Text style={styles.scoreUnit}>{t('points_unit') || 'pts'}</Text>
              </Text>
              <Text style={styles.scoreDetail}>
                {correctAnswersCount} / {totalQuestions}
                {'\n'}
                {t('correct_answers_count') || 'Correct'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.resultsBox}>
          <Text style={styles.resultsTitle}>{t('result_by_question')}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.resultsList}>
            {questionsList.map((q: any, idx: number) => {
              const isCorrect = q.isCorrect;
              return (
                <View key={q.id || idx} style={styles.resultItem}>
                  <View style={[styles.resultIcon, { backgroundColor: isCorrect ? '#E0E7FF' : '#FCE7F3' }]}>
                    <Ionicons
                      name={isCorrect ? 'checkmark' : 'close'}
                      size={16}
                      color={isCorrect ? palette.main[500] : '#F43F5E'}
                    />
                  </View>
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultItemNumText}>
                      {t('question_number', { number: (q.questionOrder ?? idx) + 1 })}
                    </Text>
                    <Text style={styles.resultItemUnitText}>
                      {Math.round(Number(q?.score || 0))} {t('points_unit') || 'pts'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {resultData.status !== ExamStatus.Completed && (
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
            <Ionicons name="refresh-outline" size={16} color={palette.grey[700]} />
            <Text style={styles.retryBtnText}>{t('retry_quiz')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={16} color="#FFF" />
          <Text style={styles.shareBtnText}>{t('share')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PopQuizResult;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: '24@ms',
    alignItems: 'center',
    paddingTop: '40@ms',
  },
  header: {
    alignItems: 'center',
    marginBottom: '40@ms',
  },
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '16@ms',
  },
  headerIconBtn: {
    padding: '8@ms',
  },
  title: {
    fontSize: '24@ms',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8@ms',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14@ms',
    color: palette.grey[500],
    textAlign: 'center',
  },
  scoreChartContainer: {
    width: '160@ms',
    height: '160@ms',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '40@ms',
  },
  chartCircleWrapper: {
    width: '120@ms',
    height: '120@ms',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: '32@ms',
    fontWeight: 'bold',
    color: palette.main[500],
  },
  scoreUnit: {
    fontSize: '16@ms',
  },
  scoreDetail: {
    fontSize: '12@ms',
    color: palette.grey[500],
    textAlign: 'center',
    marginTop: '4@ms',
  },
  resultsBox: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: '16@ms',
    padding: '24@ms',
  },
  resultsTitle: {
    fontSize: '14@ms',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16@ms',
  },
  resultsList: {
    flexDirection: 'row',
  },
  resultItem: {
    alignItems: 'center',
    marginRight: '16@ms',
    minWidth: '40@ms',
  },
  resultIcon: {
    width: '36@ms',
    height: '36@ms',
    borderRadius: '12@ms',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '8@ms',
  },
  resultTextContainer: {
    alignItems: 'center',
  },
  resultItemNumText: {
    fontSize: '12@ms',
    color: palette.grey[600],
    textAlign: 'center',
    lineHeight: '16@ms',
    fontWeight: '500',
  },
  resultItemUnitText: {
    fontSize: '11@ms',
    color: palette.grey[600],
    textAlign: 'center',
    lineHeight: '16@ms',
  },
  errorText: {
    color: palette.grey[600],
    fontSize: '16@ms',
    fontWeight: 'bold',
    marginBottom: '16@ms',
  },
  backBtn: {
    backgroundColor: palette.main[500],
    borderRadius: '20@ms',
    paddingHorizontal: '20@ms',
    paddingVertical: '10@ms',
  },
  backBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    padding: '20@ms',
    backgroundColor: '#F8F9FA',
  },
  retryBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: '24@ms',
    paddingVertical: '16@ms',
    marginRight: '12@ms',
  },
  retryBtnText: {
    fontWeight: 'bold',
    color: palette.grey[700],
    marginLeft: '6@ms',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.main[500],
    borderRadius: '24@ms',
    paddingVertical: '16@ms',
  },
  shareBtnText: {
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: '6@ms',
  },
});
