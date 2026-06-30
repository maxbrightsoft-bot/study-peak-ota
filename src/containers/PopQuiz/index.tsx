import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { palette } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { ScaledSheet } from 'react-native-size-matters';
import { Routes } from '@/navigators/RouteName';
import usePopQuiz from './hooks/usePopQuiz';
import BottomSheet from '@/components/ModalBase/BottomSheet';
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog';
import * as Clipboard from 'expo-clipboard';
import { toast } from '@/utils/helpers';
import { ExamStatus } from '@/utils/enums';

const PopQuiz = () => {
  const {
    t,
    navigation,
    user,
    code,
    setCode,
    recentQuizzes,
    receivedQuizzes,
    loading,
    selectedQuiz,
    setSelectedQuiz,
    actionLoading,
    popQuizStatusLabel,
    handleStatusChange,
    handleCreateNewPopQuiz,
    isOpenConfirmEnd,
    setIsOpenConfirmEnd,
    proceedOpenModalAndCompleteLive
  } = usePopQuiz()

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
      {!user?.academyDomain && (
        <View style={styles.bannerContainer}>
          <View style={styles.bannerHeader}>
            <Text style={styles.bannerTag}>{t('pop_quiz_banner_tag')}</Text>
          </View>
          <Text style={styles.bannerTitle}>{t('make_pop_quiz')}</Text>
          <Text style={styles.bannerSubtitle}>{t('pop_quiz_banner_desc')}</Text>

          <TouchableOpacity
            style={styles.newQuizButton}
            onPress={handleCreateNewPopQuiz}
          >
            <Ionicons name="add" size={16} color={palette.main[500]} />
            <Text style={styles.newQuizText}>{t('new_pop_quiz')}</Text>
          </TouchableOpacity>

          <View style={styles.bulbIconContainer}>
            <Ionicons name="bulb" size={120} color="rgba(255,255,255,0.1)" />
          </View>
        </View>
      )}

      <View style={styles.joinContainer}>
        <View style={styles.joinHeader}>
          <Ionicons name="flash" size={16} color="#3B82F6" />
          <Text style={styles.joinTitle}>{t('join_with_code')}</Text>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={t('enter_5_digit_code') as string}
            placeholderTextColor={palette.grey[400]}
            value={code}
            onChangeText={setCode}
            maxLength={5}
          />
          <TouchableOpacity
            style={[styles.joinButton, code.length >= 5 ? {} : { opacity: 0.5 }]}
            onPress={() => {
              if (code.length >= 5) {
                navigation.navigate(Routes.Auth.PopQuizIntro, { code });
              }
            }}
          >
            <Text style={styles.joinButtonText}>{t('join')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={palette.main[500]} />
        </View>
      ) : (
        <>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('received_pop_quiz')}</Text>
              {receivedQuizzes.filter(q => !q.isFinished).length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{receivedQuizzes.filter(q => !q.isFinished).length} {t('tab_new').toUpperCase()}</Text>
                </View>
              )}
            </View>

            <View style={styles.quizList}>
              {receivedQuizzes.length === 0 ? (
                <Text style={{ textAlign: 'center', marginVertical: 20, color: palette.grey[500] }}>
                  {t('no_received_pop_quiz') || t('no_created_pop_quiz')}
                </Text>
              ) : (
                receivedQuizzes.map((quiz, idx) => {
                  const author = quiz.authorName || t('badge_mom_parent');
                  const avatarChar = author.charAt(0);
                  return (
                    <View key={idx} style={styles.quizItem}>
                      <View style={[styles.avatar, { backgroundColor: '#E0F2FE' }]}>
                        <Text style={[styles.avatarText, { color: '#0284C7' }]}>
                          {avatarChar}
                        </Text>
                      </View>
                      <View style={styles.quizInfo}>
                        <View style={styles.quizTitleRow}>
                          <Text style={styles.quizItemTitle} numberOfLines={1}>
                            {quiz.title || quiz.name}
                          </Text>
                          <View style={styles.dotRed} />
                        </View>
                        <Text style={styles.quizItemSubtitle}>
                          {author} • {quiz.questionCount || quiz.totalQuestions || 5} {t('quiz_count_unit')}
                          {!!quiz.code && ` • ${t('code')}: ${quiz.code}`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => navigation.navigate(Routes.Auth.PopQuizIntro, { code: quiz.code })}
                      >
                        <Ionicons name="play" size={16} color={palette.main[500]} />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {!user?.academyDomain && (
            <View style={[styles.sectionContainer, { paddingBottom: 40 }]}>
              <Text style={styles.sectionTitle}>{t('my_pop_quiz')}</Text>
              <View style={styles.quizList}>
                {recentQuizzes.length === 0 ? (
                  <Text style={{ textAlign: 'center', marginVertical: 20, color: palette.grey[500] }}>
                    {t('no_created_pop_quiz')}
                  </Text>
                ) : (
                  recentQuizzes.map((quiz, idx) => {
                    const author = quiz.createdBy?.fullName || quiz.authorName || t('badge_mom_parent');
                    const avatarChar = author.charAt(0);
                    return (
                      <TouchableOpacity key={idx} style={styles.quizItem} onPress={() => setSelectedQuiz(quiz)} activeOpacity={0.7}>
                        <View style={[styles.avatar, { backgroundColor: '#E0F2FE' }]}>
                          <Text style={[styles.avatarText, { color: '#0284C7' }]}>
                            {avatarChar}
                          </Text>
                        </View>
                        <View style={styles.quizInfo}>
                          <View style={styles.quizTitleRow}>
                            <Text style={styles.quizItemTitle} numberOfLines={1}>
                              {quiz.title || quiz.name}
                            </Text>
                            {quiz.popQuizStatus === ExamStatus.InProgress && <View style={styles.dotActive} />}
                          </View>
                          <Text style={styles.quizItemSubtitle}>
                            {author} • {quiz.questionCount || quiz.totalQuestions || 0} {t('quiz_count_unit')}
                            {' • '}
                            <Text style={{ color: popQuizStatusLabel(quiz.popQuizStatus).color }}>
                              {popQuizStatusLabel(quiz.popQuizStatus).label}
                            </Text>
                            {!!quiz.code && ` • ${t('code')}: ${quiz.code}`}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={palette.grey[400]} />
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </View>
          )}
        </>
      )}
      </ScrollView>

      <BottomSheet
        isVisible={!!selectedQuiz}
        onClose={() => setSelectedQuiz(null)}
        titleChildren={
          <View style={styles.sheetHeaderContent}>
            <View style={[styles.sheetAvatar, { backgroundColor: '#E0F2FE' }]}>
              <Text style={[styles.avatarText, { color: '#0284C7', fontSize: 20 }]}>
                {(selectedQuiz?.createdBy?.fullName || selectedQuiz?.authorName || '?').charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.sheetTitle} numberOfLines={2}>{selectedQuiz?.title || selectedQuiz?.name}</Text>
              <Text style={styles.sheetSubtitle}>
                {selectedQuiz?.questionCount || selectedQuiz?.totalQuestions || 0} {t('quiz_count_unit')}
                {' • '}
                <Text style={{ color: popQuizStatusLabel(selectedQuiz?.popQuizStatus ?? ExamStatus.Default).color, fontWeight: '600' }}>
                  {popQuizStatusLabel(selectedQuiz?.popQuizStatus ?? ExamStatus.Default).label}
                </Text>
                {!!selectedQuiz?.code && ` • ${t('code')}: ${selectedQuiz.code}`}
              </Text>
            </View>
          </View>
        }
      >
        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <View style={styles.sheetDivider} />

          {actionLoading ? (
            <ActivityIndicator color={palette.main[500]} style={{ marginVertical: 24 }} />
          ) : (
            <>
              {selectedQuiz?.popQuizStatus === ExamStatus.InProgress && !!selectedQuiz?.code && (
                <TouchableOpacity
                  style={styles.sheetAction}
                  onPress={async () => {
                    await Clipboard.setStringAsync(selectedQuiz.code);
                    toast.success(t('the_code_has_been_copied_to_your_clipboard') || 'Mã đã được sao chép vào bộ nhớ tạm');
                  }}
                >
                  <View style={[styles.sheetActionIcon, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="copy-outline" size={20} color="#10B981" />
                  </View>
                  <Text style={styles.sheetActionText}>{t('copy_code')}: {selectedQuiz.code}</Text>
                  <Ionicons name="chevron-forward" size={16} color={palette.grey[400]} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.sheetAction}
                onPress={() => {
                  setSelectedQuiz(null);
                  navigation.navigate(Routes.Auth.PopQuizIntro, { quizId: selectedQuiz?.id });
                }}
              >
                <View style={[styles.sheetActionIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="play-circle-outline" size={20} color="#2563EB" />
                </View>
                <Text style={styles.sheetActionText}>{t('preview_quiz')}</Text>
                <Ionicons name="chevron-forward" size={16} color={palette.grey[400]} />
              </TouchableOpacity>

              {selectedQuiz?.popQuizStatus === ExamStatus.InProgress && (
                <TouchableOpacity
                  style={styles.sheetAction}
                  onPress={() =>
                    Alert.alert(
                      t('complete_quiz'),
                      t('complete_quiz_confirm'),
                      [
                        { text: t('cancel'), style: 'cancel' },
                        { text: t('confirm'), style: 'destructive', onPress: () => handleStatusChange(ExamStatus.Completed) },
                      ]
                    )
                  }
                >
                  <View style={[styles.sheetActionIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#D97706" />
                  </View>
                  <Text style={[styles.sheetActionText, { color: '#D97706' }]}>{t('complete_quiz') || 'Kết thúc Quiz'}</Text>
                </TouchableOpacity>
              )}

              {selectedQuiz?.popQuizStatus === ExamStatus.InProgress && (
                <TouchableOpacity
                  style={styles.sheetAction}
                  onPress={() =>
                    Alert.alert(
                      t('cancel_quiz'),
                      t('cancel_quiz_confirm'),
                      [
                        { text: t('cancel'), style: 'cancel' },
                        { text: t('confirm'), style: 'destructive', onPress: () => handleStatusChange(ExamStatus.Default) },
                      ]
                    )
                  }
                >
                  <View style={[styles.sheetActionIcon, { backgroundColor: '#FEF2F2' }]}>
                    <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                  </View>
                  <Text style={[styles.sheetActionText, { color: '#EF4444' }]}>{t('cancel_quiz')}</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setSelectedQuiz(null)}>
            <Text style={styles.sheetCloseBtnText}>{t('close') || 'Đóng'}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <ConfirmDialog
        open={isOpenConfirmEnd}
        toggle={() => setIsOpenConfirmEnd(false)}
        onConfirm={proceedOpenModalAndCompleteLive}
        text={t('confirm_end_active_pop_quiz') || 'You have an active pop quiz. Do you want to end it and create a new one?'}
        title={t('confirmation')}
        okText={t('yes')}
        cancelText={t('no')}
      />
    </View>
  );
};

export default PopQuiz;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: '20@ms',
  },
  bannerContainer: {
    backgroundColor: palette.main[500],
    borderRadius: '16@ms',
    padding: '20@ms',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: '24@ms',
  },
  bannerHeader: {
    flexDirection: 'row',
    marginBottom: '12@ms',
  },
  bannerTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#FFF',
    paddingHorizontal: '8@ms',
    paddingVertical: '4@ms',
    borderRadius: '8@ms',
    fontSize: '11@ms',
    fontWeight: 'bold',
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: '22@ms',
    fontWeight: 'bold',
    marginBottom: '8@ms',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '13@ms',
    lineHeight: '18@ms',
    marginBottom: '20@ms',
  },
  newQuizButton: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '12@ms',
    paddingVertical: '8@ms',
    borderRadius: '20@ms',
    zIndex: 2,
  },
  newQuizText: {
    color: palette.main[500],
    fontWeight: 'bold',
    marginLeft: '4@ms',
  },
  bulbIconContainer: {
    position: 'absolute',
    right: '-20@ms',
    bottom: '-20@ms',
    zIndex: 1,
  },
  joinContainer: {
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    padding: '16@ms',
    marginBottom: '24@ms',
  },
  joinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '12@ms',
  },
  joinTitle: {
    fontWeight: 'bold',
    fontSize: '14@ms',
    marginLeft: '6@ms',
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: '8@ms',
    paddingHorizontal: '16@ms',
    paddingVertical: '12@ms',
    fontSize: '16@ms',
    marginRight: '8@ms',
    color: '#333',
  },
  joinButton: {
    backgroundColor: palette.main[600],
    paddingHorizontal: '20@ms',
    paddingVertical: '14@ms',
    borderRadius: '8@ms',
  },
  joinButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: '24@ms',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '12@ms',
  },
  sectionTitle: {
    fontSize: '16@ms',
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: '6@ms',
    paddingVertical: '2@ms',
    borderRadius: '4@ms',
    marginLeft: '8@ms',
  },
  badgeText: {
    color: '#FFF',
    fontSize: '10@ms',
    fontWeight: 'bold',
  },
  quizList: {
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    padding: '8@ms',
    marginTop: 24
  },
  quizItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '12@ms',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: '40@ms',
    height: '40@ms',
    borderRadius: '8@ms',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '12@ms',
  },
  avatarText: {
    fontSize: '16@ms',
    fontWeight: 'bold',
  },
  quizInfo: {
    flex: 1,
  },
  quizTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizItemTitle: {
    fontSize: '14@ms',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '4@ms',
  },
  dotRed: {
    width: '6@ms',
    height: '6@ms',
    borderRadius: '3@ms',
    backgroundColor: '#EF4444',
    marginLeft: '4@ms',
    marginTop: '-2@ms',
  },
  dotActive: {
    width: '6@ms',
    height: '6@ms',
    borderRadius: '3@ms',
    backgroundColor: '#10B981',
    marginLeft: '4@ms',
    marginTop: '-2@ms',
  },
  quizItemSubtitle: {
    fontSize: '12@ms',
    color: palette.grey[500],
  },
  playButton: {
    width: '32@ms',
    height: '32@ms',
    borderRadius: '16@ms',
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Bottom sheet styles
  sheetHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: '12@ms',
  },
  sheetAvatar: {
    width: '52@ms',
    height: '52@ms',
    borderRadius: '12@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: '16@ms',
    fontWeight: 'bold',
    color: '#111',
    marginBottom: '4@ms',
  },
  sheetSubtitle: {
    fontSize: '12@ms',
    color: palette.grey[500],
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: '8@ms',
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '14@ms',
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  sheetActionIcon: {
    width: '36@ms',
    height: '36@ms',
    borderRadius: '10@ms',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '12@ms',
  },
  sheetActionText: {
    flex: 1,
    fontSize: '14@ms',
    fontWeight: '500',
    color: '#333',
  },
  sheetCloseBtn: {
    marginTop: '16@ms',
    backgroundColor: '#F3F4F6',
    borderRadius: '10@ms',
    paddingVertical: '13@ms',
    alignItems: 'center',
  },
  sheetCloseBtnText: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#374151',
  }
});
