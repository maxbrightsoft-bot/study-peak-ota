import SearchInput from '@/components/Input/SearchInput'
import React, { useMemo, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'
import useConversationList from './hooks/useConversationList'
import useChatContainer from './hooks/useChatContainer'
import { TabList } from './configs/constants'
import useTab from '@/hooks/useTab'
import { palette } from '@/theme'
import { ConversationsResponse } from '@/utils/types'
import BotIcon from '@/assets/iconJSX/bot'
import AddChatIcon from '@/assets/iconJSX/addChat'
import useCreateQuestionConversationDialog from './hooks/useCreateQuestionConversationDialog'
import CreateQuestionConversationDialog from './components/dialog/CreateQuestionConversationDialog'
import ChatContainer from './components/ChatContainer'
import moment from 'moment'
import { ScaledSheet } from 'react-native-size-matters'
import MathRender from '@/components/MathRender'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const getConversationTitle = (
  conversation: ConversationsResponse,
  t: (key: string, options?: any) => string
): string => {
  if (!conversation) return ''

  const isOnlyConversationStudentWithTeacher =
    !conversation.studentExamSessionId &&
    !conversation.studentTextbookSessionId &&
    !conversation.courseId &&
    !conversation.examSessionId &&
    !!conversation.studentId &&
    !!conversation.teacherId

  if (isOnlyConversationStudentWithTeacher) {
    return conversation.teacherName || t('teacher')
  }

  if (conversation.textbookId) {
    return conversation.textbookName || t('textbook_inquiry')
  }

  if (conversation.examId) {
    return conversation.examTitle || t('exam_inquiry')
  }
  if (conversation.courseId) {
    return conversation.courseName || t('class_inquiry')
  }

  if (conversation.category) {
    return t(conversation.category)
  }

  return ''
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
            {conversation?.mainTeacherCourseName || conversation.teacherName || t('teacher')}
          </Text>
          <Text style={styles.timeText}>{moment(conversation.createdAt).fromNow()}</Text>
        </View>
        <Text style={styles.cardCategory} numberOfLines={1}>
          {conversation.examTitle || getConversationTitle(conversation, t)}
        </Text>
      </View>
    </View>

    <View style={styles.cardBody}>
      <View style={styles.messagePreview}>
        {isImagePath(conversation.lastMessage || '') ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="image-outline" size={16} color={palette.grey[500]} />
            <Text style={{ color: palette.grey[500], fontSize: 13 }}>{t('image')}</Text>
          </View>
        ) : (
          <MathRender content={conversation.lastMessage || t('no_message')} isChat maxLines={2} />
        )}
      </View>
      <View style={styles.cardInfoRow}>
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
    onChangeSearch,
    getConversationList,
    courses,
    handleChangeSelectedConversation,
    setSelectedConversation,
  } = useConversationList()

  const { isLoadingMessages, chatListProps, inputProps, chatHeaderProps, handleLoadMoreMessages } = useChatContainer({
    conversation: selectedConversation
  })
  const insets = useSafeAreaInsets()

  const {
    openConversationDialog: openQuestionConversationDialog,
    toggleConversationDialog: toggleQuestionConversationDialog,
    exams,
    questions,
    handleChangeExam,
    handleChangeCourse: handleChangeCourseQuestionConversation,
    handleCreateQuestionConversation,
    courseIdSelected: courseIdSelectedQuestionConversation,
    examSessionIdSelected,
    courseOptions: courseOptionsQuestionConversationDialog,
    questionOptions,
    examOptions
  } = useCreateQuestionConversationDialog({
    courses,
    getConversationList
  })

  const { selected, handleChangeTab } = useTab(TabList)

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
    switch (selected) {
      case TabList[1].value:
        return conversations.filter((conversation) => !conversation.isCompleted)
      case TabList[2].value:
        return conversations.filter((conversation) => conversation.isCompleted)
      default:
        return conversations
    }
  }, [conversations, selected])

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.headerTitle}>{t('question')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <BotIcon />
            <Text style={styles.headerSub}>{t('chatbot')}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.floatingButton} onPress={toggleQuestionConversationDialog}>
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
            {TabList.map(({ label, value }, index) => (
              <TouchableOpacity key={index} style={[styles.tabs, value === selected && styles.activeTabWrapper]} onPress={() => handleChangeTab(value)} activeOpacity={0.7}>
                <Text style={[styles.tab, value === selected && styles.activeTab]}>{t(label)}</Text>
                {value === selected && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            ))}
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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {conversationFilters.length > 0 ? (
            conversationFilters.map((conversation) => (
              <Card
                conversation={conversation}
                key={conversation.id}
                t={t}
                onPress={handleChangeSelectedConversation}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={60} color={palette.grey[300]} />
              <Text style={styles.emptyText}>{t('no_data')}</Text>
            </View>
          )}
        </ScrollView>
      </View>
      <CreateQuestionConversationDialog
        t={t}
        open={openQuestionConversationDialog}
        courseOptions={courseOptionsQuestionConversationDialog}
        questionOptions={questionOptions}
        examOptions={examOptions}
        toggleDialog={toggleQuestionConversationDialog}
        handleChangeExam={handleChangeExam}
        handleCreateConversation={handleCreateQuestionConversation}
        handleChangeCourse={handleChangeCourseQuestionConversation}
        exams={exams}
        courses={courses}
        questions={questions}
        examSessionValue={examSessionIdSelected}
        courseValue={courseIdSelectedQuestionConversation}
      />
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
    marginRight: '12@ms',
    color: "#222"
  },
  headerSub: {
    fontSize: '20@ms',
    color: palette.grey[400]
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
  }
})
