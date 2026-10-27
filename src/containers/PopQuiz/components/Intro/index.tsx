import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, BackHandler } from 'react-native';
import { palette } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { ScaledSheet } from 'react-native-size-matters';
import usePopQuizIntro from './hooks/usePopQuizIntro';
import { getSolveTargetLabel, navigateToPopQuizList } from '../../helpers';

const PopQuizIntro = () => {
  const {
    t,
    loading,
    quizInfo,
    startLoading,
    handleStart,
    error
  } = usePopQuizIntro();

  useEffect(() => {
    const onBackPress = () => {
      navigateToPopQuizList();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <SafeAreaView />
        <View style={styles.header}>
          <TouchableOpacity onPress={navigateToPopQuizList} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={64} color="#FFF" style={styles.errorIcon} />
          <Text style={styles.errorTitle}>{t('error') || 'Error'}</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity onPress={navigateToPopQuizList} style={styles.errorBackBtn}>
            <Text style={styles.errorBackBtnText}>{t('go_back') || 'Go Back'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!quizInfo) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{t('quiz_not_found')}</Text>
        <TouchableOpacity onPress={navigateToPopQuizList} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{t('go_back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateToPopQuizList} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {quizInfo.teacherAvatar ? (
          <Image source={{ uri: quizInfo.teacherAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {(quizInfo.teacherName || '?').charAt(0)}
            </Text>
          </View>
        )}

        <View style={styles.badges}>
          {!!quizInfo.subjectName && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{quizInfo.subjectName}</Text>
            </View>
          )}
          {!!quizInfo.teacherName && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{quizInfo.teacherName}</Text>
            </View>
          )}
          {!!getSolveTargetLabel(quizInfo.solveTarget, t) && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getSolveTargetLabel(quizInfo.solveTarget, t)}</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{quizInfo.title}</Text>
        
        <Text style={styles.info}>
          {t('pop_quiz_info_format', { count: quizInfo.questionCount || 0, score: quizInfo.totalScore || 0 })}
        </Text>

        <Text style={styles.subtitle}>
          {t('pop_quiz_intro_desc') || '지금 팝퀴즈를 시작해 보세요. 집중해서 최선을 다해 풀어주세요!'}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.startBtn}
          onPress={handleStart}
          disabled={startLoading}
        >
          {startLoading ? (
            <ActivityIndicator size="small" color={palette.main[500]} />
          ) : (
            <>
              <Ionicons 
                name={quizInfo && quizInfo.studentExamSessionId && quizInfo.isSessionFinished ? "eye-outline" : "play"} 
                size={14} 
                color={palette.main[500]} 
              />
              <Text style={styles.startBtnText}>
                {quizInfo && quizInfo.studentExamSessionId && quizInfo.isSessionFinished
                  ? (t('view_result') || 'Xem kết quả')
                  : quizInfo && quizInfo.studentExamSessionId && !quizInfo.isSessionFinished
                  ? (t('resume') || 'Tiếp tục')
                  : (t('start') || '시작하기')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PopQuizIntro;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.main[500],
  },
  avatar: {
    width: '80@ms',
    height: '80@ms',
    borderRadius: '20@ms',
    marginBottom: '24@ms',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarPlaceholder: {
    width: '80@ms',
    height: '80@ms',
    borderRadius: '40@ms',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '24@ms',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarText: {
    color: palette.main[500],
    fontSize: '36@ms',
    fontWeight: 'bold',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: '20@ms',
    paddingTop: '12@ms',
    flexDirection: 'row',
    width: '100%',
  },
  closeButton: {
    width: '32@ms',
    height: '32@ms',
    borderRadius: '16@ms',
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '40@ms',
  },
  badges: {
    flexDirection: 'row',
    marginBottom: '16@ms',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: '12@ms',
    paddingVertical: '6@ms',
    borderRadius: '16@ms',
    marginHorizontal: '4@ms',
  },
  badgeText: {
    color: '#FFF',
    fontSize: '12@ms',
    fontWeight: 'bold',
  },
  title: {
    color: '#FFF',
    fontSize: '24@ms',
    fontWeight: 'bold',
    marginBottom: '12@ms',
    textAlign: 'center',
  },
  info: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '14@ms',
    fontWeight: 'bold',
    marginBottom: '16@ms',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13@ms',
    textAlign: 'center',
    lineHeight: '20@ms',
  },
  errorText: {
    color: '#FFF',
    fontSize: '16@ms',
    fontWeight: 'bold',
    marginBottom: '16@ms',
  },
  backBtn: {
    backgroundColor: '#FFF',
    borderRadius: '20@ms',
    paddingHorizontal: '20@ms',
    paddingVertical: '10@ms',
  },
  backBtnText: {
    color: palette.main[500],
    fontWeight: 'bold',
  },
  footer: {
    padding: '20@ms',
    paddingBottom: '40@ms',
  },
  startBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: '24@ms',
    paddingVertical: '16@ms',
  },
  startBtnText: {
    color: palette.main[500],
    fontSize: '16@ms',
    fontWeight: 'bold',
    marginLeft: '8@ms',
  },
  errorCard: {
    alignItems: 'center',
    paddingHorizontal: '32@ms',
    justifyContent: 'center',
    flex: 1,
  },
  errorIcon: {
    marginBottom: '24@ms',
    opacity: 0.9,
  },
  errorTitle: {
    color: '#FFF',
    fontSize: '22@ms',
    fontWeight: 'bold',
    marginBottom: '12@ms',
    textAlign: 'center',
  },
  errorMessage: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '15@ms',
    textAlign: 'center',
    lineHeight: '22@ms',
    marginBottom: '32@ms',
  },
  errorBackBtn: {
    backgroundColor: '#FFF',
    borderRadius: '24@ms',
    paddingHorizontal: '40@ms',
    paddingVertical: '14@ms',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  errorBackBtnText: {
    color: palette.main[500],
    fontSize: '15@ms',
    fontWeight: 'bold',
  },
});
