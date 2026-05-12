import React from 'react'
import { View, Text, Pressable, TouchableOpacity } from 'react-native'
import { StudySpaceTabList, TabList } from '../configs/constants'
import useMyData from '../hooks/useMyData'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import PerformanceData from '../components/PerformanceDataTab'
import TabPanel from '@/components/Tab/TabPanel'
import TimeData from '../components/TimeDataTab'
import AddChatIcon from '@/assets/iconJSX/addChat'
import IncorrectNotes from '../components/IncorrectNotes'
import CreateExamNoteDialog from '../components/CreateExamNoteDialog'
import HeaderAction from '@/layouts/components/HeaderAction'

const MyData = () => {
  const {
    t,
    imageUrl,
    selected,
    examList,
    questions,
    contentRef,
    examOptions,
    courseOptions,
    academyDomain,
    handleChangeCourse,
    questionOptions,
    handleSaveNote,
    courseIdSelected,
    examSessionIdSelected,
    handleChangeExam,
    handleUploadImage,
    handleCloseCreateNote,
    handleOpenCreateNote,
    openCreateNote,
    handleReadyPrint,
    handleChangeTab,
    handleRemoveImage,
    isAdminOrNonAcademy
  } = useMyData()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('statistics')}</Text>
        <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
          <HeaderAction />
          {!!academyDomain && <TouchableOpacity onPress={() => handleOpenCreateNote()}>
            <AddChatIcon width={24} height={24} color="#222222" />
          </TouchableOpacity>}
        </View>

      </View>
      <View style={styles.tabs}>
        {(!!academyDomain ? TabList : StudySpaceTabList).map(({ label, value }, index) => {
          if (value === 1 && isAdminOrNonAcademy) return null

          const active = value === selected

          return (
            <Pressable
              key={index}
              onPress={() => handleChangeTab(value)}
              style={[styles.tabButton, active && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t(label)}</Text>
            </Pressable>
          )
        })}
      </View>

      <TabPanel value={selected} index={0}>
        {selected === 0 && <TimeData contentRef={contentRef} handleReadyPrint={handleReadyPrint} />}
      </TabPanel>

      <TabPanel value={selected} index={1}>
        {selected === 1 && <PerformanceData contentRef={contentRef} handleReadyPrint={handleReadyPrint} />}
      </TabPanel>
      <TabPanel value={selected} index={2}>
        {!openCreateNote && <IncorrectNotes contentRef={contentRef} />}
      </TabPanel>

      <CreateExamNoteDialog
        open={openCreateNote}
        onClose={handleCloseCreateNote}
        handleUploadImage={handleUploadImage}
        examList={examList}
        imageUrl={imageUrl}
        questions={questions}
        courseOptions={courseOptions}
        handleChangeCourse={handleChangeCourse}
        examSessionValue={examSessionIdSelected}
        handleChangeExam={handleChangeExam}
        questionOptions={questionOptions}
        courseValue={courseIdSelected}
        onSaveNote={handleSaveNote}
        examOptions={examOptions}
        handleRemoveImage={handleRemoveImage}
      />
    </View>
  )
}

export default MyData

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#222222'
  },
  tabs: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12
  },
  tabButtonActive: {
    backgroundColor: palette.sub[400]
  },
  tabText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: palette.grey[400]
  },
  tabTextActive: {
    color: '#FFF'
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D0D0C8',
    borderRadius: 6,
    gap: 4
  },
  printText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6d6e6f'
  }
})
