import React, { useRef, FC } from 'react';
import { View, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import OverallTimeChart from './OverallTimeChart';
import OverallTabHeader from './OverallHeaderTab';
import { QuestionTimeCategoryData } from '@/utils/types';

export interface OverallTimeChartContainerProps {
  isLoading: boolean;
  categories: QuestionTimeCategoryData[];
  isPrint?: boolean;
  onRendered?: () => void;
}

const OverallTimeChartContainer: FC<OverallTimeChartContainerProps> = ({
  isLoading,
  categories,
  isPrint,
  onRendered,
}) => {
  const { t } = useTranslation();
  const rendered = useRef<any>({});

  const handleRendered = (index: number) => {
    rendered.current = { ...rendered.current, [index]: true };
    if (Object.keys(rendered.current).length === categories.length) {
      onRendered?.();
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <OverallTabHeader title={`${t('problem_solving_speed')}`} />
          <View style={styles.loader}>
            <ActivityIndicator size="small" color="#0000ff" />
          </View>
        </View>
      )}

      <FlatList
        data={categories}
        numColumns={1}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.fullItem}>
            <OverallTimeChart
              data={item}
              total={categories.length}
              index={index}
              isPrint={isPrint}
              onRendered={handleRendered}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  loadingContainer: {
    width: '100%',
  },
  loader: {
    height: 300,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  printItem: {
    width: '50%',
    padding: 8,
  },
  fullItem: {
    width: '100%',
  },
});

export default OverallTimeChartContainer;