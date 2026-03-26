import { formatTimeDiff, formatTimeSecond } from '@/utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import React, { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import { AnswerItemProps } from '../configs/types';
import { palette, red } from '@/theme/colors';

const AnswerItem: FC<AnswerItemProps> = ({
  data,
  nextData,
  isLast,
  index,
  effectSize,
}) => {
  const { t } = useTranslation();

  const isSelected = !!data.selectedAnswers?.length || !!data.textualAnswers?.length;

  const getResponseColor = (signal: number) => {
    switch (signal) {
      case 0:
        return '#6B0861'
      case 1:
        return '#DB4D4D'
      case 2:
        return '#FEAF06'
      case 3:
        return '#3ACB46'
      case 4:
        return '#5D5D5B'
      default:
        return palette.grey[700]
    }
  }

  const getProblemCategoryLabel = (problem: number) => {
    switch (problem) {
      case 1:
        return t('easy_problem');
      case 3:
        return t('trick_problem');
      case 2:
        return t('differential_problem');
      case 0:
        return t('general_problem');
      case 4:
        return t('difficult_problem');
      case 5:
        return t('super_difficult_problem');
      default:
        return '';
    }
  };

  const getOverallColor = (rate: number) => {
    switch (rate) {
      case 1:
        return '#DB4D4D'
      case 2:
        return '#FEAF06'
      case 3:
        return '#3ACB46'
      default:
        return palette.grey[700]
    }
  }

  const getProblemCategoryColor = (problem: number) => {
    switch (problem) {
      case 1:
        return '#1EE288';
      case 3:
        return '#FEAF06';
      case 2:
        return '#F34B4B';
      case 0:
        return '#DDDDDD';
      case 4:
      case 5:
        return '#FF0000';
      default:
        return '#DDDDDD';
    }
  };

  const getAnswerStatusIcon = () => {
    if (data.isCorrect && isSelected) {
      return (
        <Fragment>
          <Ionicons name="checkmark-circle-sharp" size={16} color="#10B981" />
          <Text style={[styles.statusText, styles.correctText]}>{t('correct')}</Text>
        </Fragment>
      );
    }
    if (!data.isCorrect && isSelected) {
      return (
        <Fragment>
          <Ionicons name="close-circle-sharp" size={16} color="#EF4444" />
          <Text style={[styles.statusText, styles.incorrectText]}>{t('incorrect')}</Text>
        </Fragment>
      );
    }
    return (
      <Fragment>
        <Ionicons name="remove-circle-outline" size={16} color="#6B7280" />
        <Text style={[styles.statusText, styles.noSolutionText]}>{t('no_solution')}</Text>
      </Fragment>
    );
  };

  const getStarIcon = () => {
    return data.isStar ? (
      <Ionicons name="star" size={16} color="#F59E0B" />
    ) : (
      <Ionicons name="star-outline" size={16} color="#9CA3AF" />
    );
  };

  const getDurationText = () => {
    if (data.duration != 0) {
      let textColor = data.answerResponseSignal !== null ? getResponseColor(data.answerResponseSignal) : '#9E9E9E'
      return (
        <Text style={[styles.durationText, { color: textColor }]}>
          {formatTimeSecond(Math.round(data.duration), t)}
        </Text>
      );
    }
    return <Text style={styles.noTimeText}>{t('no_time')}</Text>;
  };

  const getComparisonText = () => {
    if (data.duration != 0 && data.topDuration) {
      let textColor = data.answerResponseSignal !== null ? getResponseColor(data.answerResponseSignal) : '#9E9E9E'
      
      return (
        <Text style={[styles.durationText, { color: textColor }]}>
          {formatTimeDiff(data.duration, data.topDuration, t)}
        </Text>
      );
    }
    return <Text style={styles.noTimeText}>-</Text>;
  };

  const getOverallRateText = () => {
    const overallColor = getOverallColor(data?.overallCorrectRate);
    const skipRate = data.skipRate?.toFixed(2) ?? '0.00';

    return (
      <View style={styles.overallContainer}>
        <Text style={[styles.overallRate, { color: overallColor }]}>
          {`${data.overallCorrectRate?.toFixed(2)}%`}
        </Text>
        <Text style={styles.skipRate}>{`(${skipRate}%)`}</Text>
      </View>
    );
  };

  const renderCategories = () => {
    if (!effectSize?.problemCategories) return null;

    return (
      <View style={styles.categoriesContainer}>
        {effectSize.problemCategories.map((problem: number, idx: number) => (
          <View
            key={idx}
            style={[styles.categoryChip, { borderColor: getProblemCategoryColor(problem) }]}
          >
            <Text style={styles.categoryText}>{getProblemCategoryLabel(problem)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const questionNumber = data.parentQuestionId
    ? `${(data.parentQuestionOrder || 0) + 1}.${(data.questionOrder || 0) + 1}`
    : `${(data.questionOrder || 0) + 1}`;

  const borderBottomColor =
    data?.questionGroupIndex !== nextData?.questionGroupIndex && !isLast
      ? '#E4E7EC'
      : 'transparent';

  return (
    <View style={[styles.container, { borderBottomColor, borderBottomWidth: 1 }]}>
      <View style={styles.row}>
        <View style={styles.column1}>
          <View style={styles.questionInfo}>
            {getStarIcon()}
            <Text style={styles.questionOrder}>
              {t('number_question', { number: questionNumber })}
            </Text>
            <Text style={styles.indexText}>({index + 1})</Text>
          </View>
        </View>

        <View style={styles.column2}>
          <View style={styles.statusContainer}>
            {getAnswerStatusIcon()}
          </View>
        </View>

        <View style={styles.column3}>
          <View style={styles.timeContainer}>
            {getDurationText()}
          </View>
        </View>

        <View style={styles.column4}>
          <View style={styles.timeContainer}>
            {getComparisonText()}
          </View>
        </View>

        <View style={styles.column5}>
          <View style={styles.rateContainer}>
            {getOverallRateText()}
          </View>
          <View style={styles.categoriesWrapper}>
            {renderCategories()}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    minHeight: 60,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: palette.grey[100]
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  column1: {
    flex: 1.2,
  },
  column2: {
    flex: 1,
  },
  column3: {
    flex: 1,
  },
  column4: {
    flex: 1,
  },
  column5: {
    flex: 1.5,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  questionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8,
    flexWrap: 'wrap'
  },
  questionOrder: {
    fontSize: 12,
    fontWeight: '500',
    color: '#414E62',
  },
  indexText: {
    fontSize: 11,
    color: '#6B7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flexWrap: 'wrap'
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center'
  },
  correctText: {
    color: '#10B981',
  },
  incorrectText: {
    color: '#EF4444',
  },
  noSolutionText: {
    color: '#6B7280',
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  noTimeText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  rateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  overallContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flexWrap: 'wrap'
  },
  overallRate: {
    fontSize: 11,
    fontWeight: '600',
  },
  skipRate: {
    fontSize: 10,
    color: red[900],
  },
  categoriesWrapper: {
    width: '100%',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  categoryChip: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  categoryText: {
    fontSize: 11,
    color: '#374151',
  },
});

export default AnswerItem;