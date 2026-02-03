import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { StudyTimeDistribution } from '../configs/types';
import { useTranslation } from 'react-i18next';
import { ceilTo, formatTime } from '../configs/helper';
import { palette } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { ScaledSheet } from 'react-native-size-matters';

type Props = {
  data?: StudyTimeDistribution[];
  loading: boolean;
  isPrint?: boolean;
};

type SubjectItemProps = {
  subject: StudyTimeDistribution;
  isPrint?: boolean;
};

const CircularProgress = ({
  value,
  size = 80,
  stroke = 5,
  mainColor,
  restColor,
  children,
}: any) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={restColor}
          strokeWidth={stroke}
          fill="transparent"
        />
      </Svg>

      <Svg width={size} height={size} style={[styles.svg, styles.progressSvg]}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={mainColor}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>

      <View style={[styles.center, { width: size, height: size }]}>
        {children}
      </View>
    </View>
  );
};

const SubjectItem = ({ subject, isPrint }: SubjectItemProps) => {
  const { t } = useTranslation();
  const isIncrease = subject.change > 0;
  
  const mainColor = isIncrease ? palette.main[700] : palette.main[500];
  const restColor = isIncrease ? palette.main[500] : palette.grey[300];
  const arrowColor = subject.change >= 0 ? palette.success.main : palette.error.main;
  
  const ratio = isIncrease 
    ? ((subject.lastHours ? subject.change || 0 : 1) / (!!subject.lastHours ? subject.lastHours : 1)) * 100 
    : ((subject.hours || 0) / (!!subject.lastHours ? subject.lastHours : 1)) * 100;
  
  const clampedRatio = Math.min(ratio, 100);

  const SubjectNameTooltip = ({ children, title }: { children: React.ReactNode; title: string }) => {
    const [showTooltip, setShowTooltip] = React.useState(false);

    return (
      <Pressable
        onLongPress={() => setShowTooltip(true)}
        onPressOut={() => setShowTooltip(false)}
        style={styles.tooltipContainer}
      >
        {children}
        {showTooltip && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>{title}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.subjectItemContainer}>
      <View style={styles.circularProgressWrapper}>
        <CircularProgress
          value={clampedRatio}
          mainColor={mainColor}
          restColor={restColor}
          size={80}
        >
          <View style={styles.progressText}>
            <Pressable
              onLongPress={() => {
                alert(formatTime((subject.hours || 0) * 60 * 60, t));
              }}
            >
              <Text style={styles.hoursValue} numberOfLines={1}>
                {ceilTo(subject.hours || 0, 2)}
              </Text>
            </Pressable>
            <Text style={styles.hoursUnit}>{t('hour')}</Text>
          </View>
        </CircularProgress>
      </View>
      
      <View style={styles.subjectInfo}>
          <Text style={styles.subjectName} numberOfLines={1}>
            {subject.name}
          </Text>
        
        <View style={styles.changeRow}>
          <Text style={[styles.changeText, { color: arrowColor }]}>
            {`${ceilTo(Math.abs(subject.change), 2)}${t('hour')}`}
          </Text>
          {subject.change !== 0 && (
            <Text style={{ color: arrowColor, fontSize: 16, textAlign: "center" }}>
              {isIncrease ? <MaterialIcons name="arrow-drop-up" size={24} color={palette.success.main} /> : <MaterialIcons name="arrow-drop-down" size={24} color={palette.error.main} />}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const SubjectProgress = ({ data, loading, isPrint }: Props) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('net_study_time_by_subject')}</Text>
      
      <View style={styles.grid}>
        {data.map((subject, index) => (
          <View key={index} style={styles.gridItem}>
            <SubjectItem subject={subject} isPrint={isPrint} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: palette.grey[100],
    padding: "16@ms",
    gap: "16@ms"
  },
  loadingContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    color: palette.grey[900],
  },
  grid: {
    display: "flex",
    flexDirection: 'row',
    justifyContent: "space-between",
    flexWrap: 'wrap',
  },
  gridItem: {
    display: "flex",
    flexDirection: 'row',
    justifyContent: 'center',
    
  },
  subjectItemContainer: {
    display: "flex",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16
  },
  circularProgressWrapper: {
    padding: "10@ms"
  },
  subjectInfo: {
    width: 58,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center"
  },
  svg: {
    position: 'absolute',
  },
  progressSvg: {
    transform: [{ rotateZ: '-90deg' }],
  },
  center: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    width: '60%',
    alignItems: 'center',
  },
  hoursValue: {
    fontSize: 20,
    fontWeight: 600,
    color: palette.grey[900],
    textAlign: 'center',
  },
  hoursUnit: {
    fontSize: 14,
    fontWeight: 500,
    color: palette.grey[500],
  },
  subjectName: {
    fontSize: 20,
    fontWeight: 700,
    color: palette.grey[900],
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: "center"
  },
  changeText: {
    fontWeight: 600,
    fontSize: 14,
  },
  tooltipContainer: {
    position: 'relative',
  },
  tooltip: {
    position: 'absolute',
    top: -30,
    left: -20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1000,
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 12,
  },
});

export default SubjectProgress;