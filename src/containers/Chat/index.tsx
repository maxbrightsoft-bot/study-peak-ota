import SearchInput from '@/components/Input/SearchInput'
import React, { useMemo, useCallback } from 'react'
import { View, Text, FlatList, ScrollView, TouchableOpacity, Image, Modal, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import useConversationList from './hooks/useConversationList'
import useChatContainer from './hooks/useChatContainer'
import { TabList, getCategoryTitle } from './configs/constants'
import { palette } from '@/theme'
import { ConversationType } from '@/utils/enums'
import { ConversationsResponse } from '@/utils/types'
import AddChatIcon from '@/assets/iconJSX/addChat'
import useCreateQuestionConversationDialog from './hooks/useCreateQuestionConversationDialog'
import CreateQuestionConversationDialog from './components/dialog/CreateQuestionConversationDialog'
import ChatContainer from './components/ChatContainer'
import moment from 'moment'
import { ScaledSheet } from 'react-native-size-matters'
import MathRender from '@/components/MathRender'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import TextTooltip from '@/components/Tooltip/TextTooltip'
import { ConversationListSkeleton } from '@/components/Skeleton'

const getConversationTitle = (
  conversation: ConversationsResponse,
  t: (key: string, options?: any) => string
): string => {
  if (!conversation) return ''

  if (conversation.textbookId || conversation.textbookName) {
    return conversation.textbookName || t('textbook_inquiry')
  }

  if (conversation.examId || conversation.examTitle || conversation.examSessionId) {
    return conversation.examTitle || t('exam_inquiry')
  }
  if (conversation.courseId || conversation.courseName) {
    const cat = getCategoryTitle(t, conversation.category)
    const baseCourse = conversation.courseName || t('class_inquiry')
    return cat ? `${baseCourse} • ${cat}` : baseCourse
  }

  const isTeacherChat =
    !conversation.studentExamSessionId &&
    !conversation.studentTextbookSessionId &&
    !conversation.courseId &&
    !conversation.examSessionId &&
    (conversation.type === ConversationType.StaffStudent ||
      conversation.type === ConversationType.TeacherStudent ||
      !!conversation.teacherId ||
      !!conversation.teacherName ||
      !!(conversation as any).mainTeacherCourseName)

  if (isTeacherChat) {
    const teacherName = conversation.teacherName || (conversation as any).mainTeacherCourseName
    return teacherName ? `${t('teacher')}: ${teacherName}` : t('teacher')
  }

  if (conversation.category) {
    return getCategoryTitle(t, conversation.category)
  }

  return t('general_inquiry')
}

const isImagePath = (value?: string) => {
  if (!value) return false

  const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))|(file:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i

  return imageRegex.test(value)
}

const Card = React.memo(({
  conversation,
  t,
  onPress
}: {
  conversation: ConversationsResponse,
  t: any,
  onPress: (conversation: ConversationsResponse) => void
}) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(conversation)} activeOpacity={0.8}>
    <View style={styles.cardHeader}>
      <Image
        source={{
          uri: conversation?.mainTeacherCourseAvatar || conversation?.teacherAvatar
        }}
        style={styles.avatar}
      />
      <View style={styles.cardHeaderContent}>
        <View style={styles.titleRow}>
          <Text style={styles.teacherName} numberOfLines={1}>
            {conversation?.mainTeacherCourseName || conversation.teacherName || (
              !conversation.courseId &&
              !conversation.examId &&
              !conversation.textbookId &&
              !conversation.teacherId &&
              conversation.type !== ConversationType.StaffStudent &&
              conversation.type !== ConversationType.TeacherStudent
                ? t('general_inquiry')
                : t('teacher')
            )}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {!!conversation.totalUnReadMessage && !conversation.isCompleted && conversation.totalUnReadMessage > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{conversation.totalUnReadMessage}</Text>
              </View>
            )}
            <Text style={styles.timeText}>{moment.utc(conversation.lastMessage?.createdAt || conversation?.createdAt).fromNow()}</Text>
          </View>
        </View>
        <TextTooltip
          text={conversation.examTitle || getConversationTitle(conversation, t)}
          numberOfLines={1}
          textStyle={styles.cardCategory}
          containerStyle={{ alignSelf: 'flex-start' }}
        />
      </View>
    </View>

    <View style={styles.cardBody}>
      <View style={styles.messagePreview}>
        {isImagePath(conversation.lastMessage?.content || '') ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="image-outline" size={16} color={palette.grey[500]} />
            <Text style={{ color: palette.grey[500], fontSize: 13 }}>{t('image')}</Text>
          </View>
        ) : (
          <MathRender content={conversation.lastMessage?.content || t('no_message')} isChat maxLines={2} />
        )}
      </View>
      <View style={styles.cardInfoRow}>
        {conversation.isCompleted ? (
          <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9' }]}>
            <Text style={[styles.statusBadgeText, { color: '#94A3B8' }]}>
              {t('tab_completed', 'Done')}
            </Text>
          </View>
        ) : (conversation.totalUnReadMessage || 0) > 0 ? (
          <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.statusBadgeText, { color: '#B91C1C' }]}>
              {t('tab_new', 'New')}
            </Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.statusBadgeText, { color: '#B45309' }]}>
              {t('tab_unanswered', 'Unans')}
            </Text>
          </View>
        )}

        {conversation?.question && (
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>
              {t("problem_number_question", {
                number: (conversation.question.questionOrder || 0) + 1
              })}
            </Text>
          </View>
        )}
        {(conversation.studentTotalAttemptTime || 0) > 1 && (
          <View
            style={[
              styles.attemptBadge,
              { backgroundColor: conversation.isSelected ? palette.main[50] : palette.red[100] }
            ]}
          >
            <Text
              style={[
                styles.attemptText,
                { color: conversation.isSelected ? palette.main[700] : palette.red[900] }
              ]}
            >
              {`#${conversation.studentAttemptNumber + 1}/${conversation.studentTotalAttemptTime}`}
            </Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
))

export default function Question() {
  const {
    t,
    search,
    selectedConversation,
    conversations,
    loadingList,
    onChangeSearch,
    getConversationList,
    courses,
    handleChangeSelectedConversation,
    setSelectedConversation,
    selectedTab,
    handleChangeTab,
    handleLoadMore,
    loadingMore,
    hasMore,
  } = useConversationList()

  const { isLoadingMessages, chatListProps, inputProps, chatHeaderProps, handleLoadMoreMessages, getMessageConversation } = useChatContainer({
    conversation: selectedConversation
  })

  const {
    openConversationDialog: openQuestionConversationDialog,
    toggleConversationDialog: toggleQuestionConversationDialog,
    closeConversationDialog: closeQuestionConversationDialog,
    openCreateConversationDialog,
    exams,
    questions,
    handleChangeExam,
    handleChangeCourse: handleChangeCourseQuestionConversation,
    handleCreateQuestionConversation,
    courseIdSelected: courseIdSelectedQuestionConversation,
    examSessionIdSelected,
    courseOptions: courseOptionsQuestionConversationDialog,
    categoryOptions,
    questionOptions,
    examOptions,
    openExistingConvModal,
    lastActiveConversation,
    handleGoToExistingConversation,
    handleCreateNewAnyway,
    handleCloseExistingConvModal,
  } = useCreateQuestionConversationDialog({
    courses,
    getConversationList,
    onSelectConversation: handleChangeSelectedConversation,
    onRefreshConversation: (conv) => {
      setSelectedConversation(undefined);
      setTimeout(() => setSelectedConversation(conv), 50);
    }
  })

  useFocusEffect(
    useCallback(() => {
      handleChangeTab(TabList[0].value)
    }, [handleChangeTab])
  )

  const handleCloseChatContainer = useCallback(() => {
    setSelectedConversation(undefined)
    getConversationList()
  }, [getConversationList, setSelectedConversation])

  const conversationFilters = useMemo(() => {
    switch (selectedTab) {
      case 'new':
        return conversations.filter((conversation) => !conversation.isCompleted && (conversation.totalUnReadMessage || 0) > 0)
      case 'unanswered':
        return conversations.filter((conversation) => !conversation.isCompleted && (conversation.totalUnReadMessage || 0) === 0)
      case 'completed':
        return conversations.filter((conversation) => conversation.isCompleted)
      case 'all':
      default:
        return conversations
    }
  }, [conversations, selectedTab])

  return (
    <View style={styles.container}>
      <View style={[styles.header]}>
        <Text style={styles.headerTitle}>{t('question')}</Text>
        <TouchableOpacity style={styles.floatingButton} onPress={openCreateConversationDialog}>
          <AddChatIcon />
          <Text style={styles.floatingButtonText}>{t('ask_question')}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ backgroundColor: palette.bg[100], flex: 1, paddingHorizontal: 20, paddingTop: 30, gap: 16 }}>
        <View style={styles.tabsContainer}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal
            style={{ flexDirection: 'row' }}
            contentContainerStyle={{ gap: 8 }}
          >
            {TabList.map(({ label, value, countColor }, index) => {
              let count = 0;
              if (value === 'all') {
                count = conversations.length;
              } else if (value === 'new') {
                count = conversations.filter(c => !c.isCompleted && (c.totalUnReadMessage || 0) > 0).length;
              } else if (value === 'unanswered') {
                count = conversations.filter(c => !c.isCompleted && (c.totalUnReadMessage || 0) === 0).length;
              } else if (value === 'completed') {
                count = conversations.filter(c => c.isCompleted).length;
              }

              return (
                <TouchableOpacity key={index} style={[styles.tabs, value === selectedTab && styles.activeTabWrapper]} onPress={() => handleChangeTab(value)} activeOpacity={0.7}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={[styles.tab, value === selectedTab && styles.activeTab]}>{t(label)}</Text>
                    <Text style={[styles.tabCount, { color: countColor, opacity: value === selectedTab ? 1 : 0.7 }]}>{count}</Text>
                  </View>
                  {value === selectedTab && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <SearchInput value={search} onChangeText={onChangeSearch} placeholder={t('search_for')} />
          </View>
          {/* <TouchableOpacity style={styles.filterButton} onPress={handleOpenFilterModal}>
            {filterCount && (
              <View style={styles.filterCountButton}>
                <Text style={styles.filterButtonText}>{filterCount}</Text>
              </View>
            )}
            <FilterIcon />
          </TouchableOpacity> */}
        </View>

        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          data={loadingList ? [] : conversationFilters}
          keyExtractor={(item) => `${item.id}`}
          renderItem={({ item }) => (
            <Card
              conversation={item}
              t={t}
              onPress={handleChangeSelectedConversation}
            />
          )}
          onEndReached={hasMore && !loadingList ? handleLoadMore : undefined}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            loadingList ? (
              <ConversationListSkeleton count={4} />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={60} color={palette.grey[300]} />
                <Text style={styles.emptyText}>{t('no_data')}</Text>
              </View>
            )
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={palette.main[600]} />
              </View>
            ) : null
          }
        />
      </View>
      <CreateQuestionConversationDialog
        t={t}
        open={openQuestionConversationDialog}
        courseOptions={courseOptionsQuestionConversationDialog}
        categoryOptions={categoryOptions}
        questionOptions={questionOptions}
        examOptions={examOptions}
        toggleDialog={closeQuestionConversationDialog}
        handleChangeExam={handleChangeExam}
        handleCreateConversation={handleCreateQuestionConversation}
        handleChangeCourse={handleChangeCourseQuestionConversation}
        exams={exams}
        courses={courses}
        questions={questions}
        examSessionValue={examSessionIdSelected}
        courseValue={courseIdSelectedQuestionConversation}
      />
      {/* Existing active conversation confirm modal */}
      <Modal
        visible={openExistingConvModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseExistingConvModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleCloseExistingConvModal}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('existing_conversation', t('ask_a_question'))}</Text>
            <Text style={styles.modalDesc}>
              {t('ask_start_new_or_continue_conversation')}
            </Text>
            {lastActiveConversation?.examTitle ? (
              <Text style={styles.modalSubDesc}>{lastActiveConversation.examTitle}</Text>
            ) : lastActiveConversation?.courseName ? (
              <Text style={styles.modalSubDesc}>{lastActiveConversation.courseName}</Text>
            ) : (lastActiveConversation?.teacherName || (lastActiveConversation as any)?.mainTeacherCourseName || lastActiveConversation?.type === ConversationType.StaffStudent || lastActiveConversation?.type === ConversationType.TeacherStudent || !!(lastActiveConversation as any)?.teacherId) ? (
              <Text style={styles.modalSubDesc}>
                {lastActiveConversation?.teacherName || (lastActiveConversation as any)?.mainTeacherCourseName
                  ? `${t('teacher')}: ${lastActiveConversation?.teacherName || (lastActiveConversation as any)?.mainTeacherCourseName}`
                  : t('teacher')}
              </Text>
            ) : (
              <Text style={styles.modalSubDesc}>{t('general_inquiry')}</Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnOutline} onPress={handleCreateNewAnyway} activeOpacity={0.8}>
                <Text style={styles.modalBtnOutlineText}>{t('start_new_conversation')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleGoToExistingConversation} activeOpacity={0.8}>
                <Text style={styles.modalBtnPrimaryText}>{t('continue_last_conversation')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {!!selectedConversation ? (
        <ChatContainer
          t={t}
          open={!!selectedConversation}
          onClose={handleCloseChatContainer}
          isLoadingMessages={isLoadingMessages}
          handleLoadMoreMessages={handleLoadMoreMessages}
          chatListProps={chatListProps}
          inputProps={inputProps}
          chatHeaderProps={chatHeaderProps}
        />
      ) : null}
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '16@ms',
    paddingHorizontal: '20@ms',
    borderBottomWidth: '1@ms',
    borderColor: palette.grey[100]
  },
  headerTitle: {
    fontSize: '20@ms',
    fontWeight: 'bold',
    color: "#222"
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '4@ms'
  },
  tabs: {
    alignItems: 'center',
    marginRight: '20@ms',
    paddingBottom: '8@ms',
    position: 'relative'
  },
  activeTabWrapper: {
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3@ms',
    backgroundColor: palette.main[600],
    borderTopLeftRadius: '3@ms',
    borderTopRightRadius: '3@ms'
  },
  attemptBadge: {
    paddingHorizontal: '8@ms',
    paddingVertical: '4@ms',
    borderRadius: '20@ms'
  },
  attemptText: {
    fontSize: '11@ms',
    fontWeight: '600'
  },
  tab: {
    fontSize: '16@ms',
    color: palette.grey[500],
    fontWeight: '600',
    textAlign: 'center'
  },
  activeTab: {
    color: palette.main[600],
    fontWeight: '700'
  },
  tabCount: {
    fontSize: '14@ms',
    fontWeight: '700'
  },
  statusBadge: {
    paddingHorizontal: '8@ms',
    paddingVertical: '4@ms',
    borderRadius: '6@ms',
  },
  statusBadgeText: {
    fontSize: '11@ms',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: palette.red[900],
    borderRadius: '10@ms',
    paddingHorizontal: '6@ms',
    paddingVertical: '2@ms',
    minWidth: '20@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: '11@ms',
    fontWeight: 'bold',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '16@ms'
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ECECF1',
    borderRadius: '25@ms',
    paddingHorizontal: '16@ms',
    height: '40@ms'
  },
  filterButton: {
    marginLeft: '10@ms',
    backgroundColor: '#ECECF1',
    borderRadius: '20@ms',
    padding: '10@ms'
  },
  filterCountButton: {
    width: '20@ms',
    height: '20@ms',
    borderRadius: '43@ms',
    backgroundColor: '#3DC674',
    position: 'absolute',
    top: '-10@ms',
    right: '-10@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterButtonText: {
    fontSize: '12@ms',
    color: '#fff'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16@ms',
    padding: '16@ms',
    marginBottom: '16@ms',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '12@ms'
  },
  avatar: {
    width: '44@ms',
    height: '44@ms',
    borderRadius: '22@ms',
    marginRight: '12@ms',
    backgroundColor: palette.grey[200]
  },
  cardHeaderContent: {
    flex: 1,
    justifyContent: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4@ms'
  },
  teacherName: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: palette.grey[900],
    flex: 1,
    marginRight: '8@ms'
  },
  timeText: {
    fontSize: '12@ms',
    color: palette.grey[500]
  },
  cardCategory: {
    fontSize: '13@ms',
    color: palette.main[600],
    fontWeight: '600'
  },
  cardBody: {
    backgroundColor: palette.grey[50],
    padding: '12@ms',
    borderRadius: '12@ms',
    gap: '8@ms'
  },
  messagePreview: {
    justifyContent: 'center'
  },
  cardInfoRow: {
    flexDirection: 'row',
    gap: '8@ms',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  infoBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: '8@ms',
    paddingVertical: '4@ms',
    borderRadius: '6@ms',
    borderWidth: '1@ms',
    borderColor: palette.grey[200]
  },
  infoBadgeText: {
    fontSize: '11@ms',
    fontWeight: '600',
    color: palette.grey[700]
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '60@ms',
    gap: '12@ms'
  },
  emptyText: {
    fontSize: '15@ms',
    fontWeight: '500',
    color: palette.grey[500]
  },
  floatingButton: {
    margin: 0,
    backgroundColor: palette.main[600],
    paddingHorizontal: '12@ms',
    paddingVertical: '8@ms',
    borderRadius: '100@ms',
    flexDirection: 'row',
    alignSelf: 'flex-end',
    gap: '5@ms'
  },
  floatingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '14@ms'
  },
  // Existing conversation confirm modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24@ms'
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: '16@ms',
    padding: '24@ms',
    width: '100%',
    gap: '12@ms'
  },
  modalTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#202B37'
  },
  modalDesc: {
    fontSize: '14@ms',
    color: '#4B5565',
    lineHeight: '22@ms'
  },
  modalSubDesc: {
    fontSize: '13@ms',
    color: '#97A1AF'
  },
  modalActions: {
    flexDirection: 'row',
    gap: '10@ms',
    marginTop: '8@ms'
  },
  modalBtnOutline: {
    flex: 1,
    borderWidth: '1.5@ms',
    borderColor: palette.main[600],
    borderRadius: '10@ms',
    paddingVertical: '12@ms',
    paddingHorizontal: '8@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBtnOutlineText: {
    color: palette.main[600],
    fontWeight: '600',
    fontSize: '14@ms',
    textAlign: 'center'
  },
  modalBtnPrimary: {
    flex: 1,
    backgroundColor: palette.main[600],
    borderRadius: '10@ms',
    paddingVertical: '12@ms',
    paddingHorizontal: '8@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBtnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: '14@ms',
    textAlign: 'center'
  }
})

