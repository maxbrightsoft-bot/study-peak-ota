import SearchInput from '@/components/Input/SearchInput'
import { palette } from '@/theme'
import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native'
import useNotes from '../hooks/useNotes'
import { GroupedNoteResponse } from '@/utils/types'
import { FontAwesome6 } from '@expo/vector-icons'
import NoteDialog from './NoteDialog'
import GroupedNoteCard from './GroupedNoteCard'
import FilterBottomSheet from './FilterBottomSheet'

export default function IncorrectNotes({ contentRef }: { contentRef?: React.RefObject<FlatList> }) {
  const {
    t,
    notes,
    open,
    search,
    onChangeSearch,
    selectedNote,
    openConfirm,
    subjectValue,
    imageUrl,
    handleChangeSubject,
    subjectNoteOptions,
    categoryNoteOptions,
    toggleConfirmDialog,
    handleCloseDialog,
    handleOpenDialog,
    handleDeleteNote,
    handleSaveNote,
    handleUploadImage,
    isLoadingNotes,
    handleLoadMore,
    isFilterVisible,
    openFilter,
    closeFilter,
    handleApplyFilter,
    filter
  } = useNotes()

  const allSubjects = useMemo(() => {
    return [{ label: t('filter_all'), value: 'all' }, ...subjectNoteOptions]
  }, [subjectNoteOptions])

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F6" />

      <FlatList
        ref={contentRef}
        data={notes as unknown as GroupedNoteResponse[]}
        keyExtractor={(item, index) => `${item.subjectName}-${item.categoryName}-${index}`}
        onEndReached={handleLoadMore}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.topHeaderRow}>
              <View style={styles.searchFlex}>
                <SearchInput
                  value={search}
                  onChangeText={onChangeSearch}
                  placeholder={t('search_incorrect_notes')}
                />
              </View>
              <TouchableOpacity style={styles.filterBtn} onPress={openFilter}>
                <FontAwesome6 name="sliders" size={16} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
              contentContainerStyle={styles.chipScrollContent}
            >
              {allSubjects.map((sub, idx) => {
                const isActive = (subjectValue || 'all') === sub.value
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.subjectChip, isActive && styles.subjectChipActive]}
                    onPress={() => handleChangeSubject(sub.value === 'all' ? null : String(sub.value))}
                  >
                    {sub.label !== '전체' && isActive && (
                      <View style={[styles.chipDot, { backgroundColor: '#FFF' }]} />
                    )}
                    {sub.label !== '전체' && !isActive && (
                      <View style={[styles.chipDot, { backgroundColor: '#D1D5DB' }]} />
                    )}
                    <Text style={[styles.subjectChipText, isActive && styles.subjectChipTextActive]}>
                      {sub.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </>
        }
        renderItem={({ item }) => <GroupedNoteCard item={item} t={t} onOpenDialog={handleOpenDialog} />}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />

      {selectedNote && (
        <NoteDialog
          onSaveNote={handleSaveNote}
          onDeleteNote={toggleConfirmDialog}
          open={open}
          questionOptions={[
            {
              label: t('question_order', {
                number: selectedNote.parentQuestionId
                  ? `${(selectedNote?.parentQuestionOrder || 0) + 1}.${(selectedNote?.questionOrder || 0) + 1}`
                  : `${(selectedNote?.questionOrder || 0) + 1}`
              }),
              value: selectedNote.questionId || 0
            }
          ]}
          handleDeleteNote={handleDeleteNote}
          toggleConfirmDialog={toggleConfirmDialog}
          openConfirm={openConfirm}
          selectedNote={selectedNote}
          isLoadingNotes={isLoadingNotes}
          onClose={handleCloseDialog}
          imageUrl={selectedNote?.imageUrl || imageUrl}
          handleUploadImage={handleUploadImage}
        />
      )}

      <FilterBottomSheet
        isVisible={isFilterVisible}
        onClose={closeFilter}
        onApply={handleApplyFilter}
        initialFilter={filter}
        subjectOptions={subjectNoteOptions}
        categoryOptions={categoryNoteOptions}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#F9FAFB'
  },
  list: {
    padding: 20,
    paddingBottom: 200
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchFlex: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  chipScroll: {
    marginBottom: 20,
  },
  chipScrollContent: {
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  subjectChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  subjectChipText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500'
  },
  subjectChipTextActive: {
    color: '#FFFFFF'
  }
})
