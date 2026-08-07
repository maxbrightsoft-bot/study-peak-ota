import SearchInput from '@/components/Input/SearchInput'
import { palette } from '@/theme'
import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import useNotes from '../hooks/useNotes'
import { GroupedNoteResponse } from '@/utils/types'
import { FontAwesome6 } from '@expo/vector-icons'
import NoteDialog from './NoteDialog'
import GroupedNoteCard from './GroupedNoteCard'
import FilterBottomSheet from './FilterBottomSheet'
import { ScaledSheet } from 'react-native-size-matters'

export default function IncorrectNotes({ contentRef }: { contentRef?: React.RefObject<FlatList | null> }) {
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
    filter,
    refreshGroup,
    removeGroup
  } = useNotes()

  const allSubjects = useMemo(() => {
    return [{ label: t('filter_all'), value: 'all' }, ...subjectNoteOptions]
  }, [subjectNoteOptions])

  const hasActiveFilter = useMemo(() => {
    return !!(
      (filter.subjectNames && filter.subjectNames.length > 0) ||
      (filter.categoryNames && filter.categoryNames.length > 0) ||
      (filter.examTypes && filter.examTypes.length > 0) ||
      filter.startDate ||
      filter.endDate ||
      filter.hasIncorrectOrImage
    )
  }, [filter])

  return (
    <View style={styles.safe}>

      <View style={styles.fixedHeader}>
        <View style={styles.topHeaderRow}>
          <View style={styles.searchFlex}>
            <SearchInput
              value={search}
              onChangeText={onChangeSearch}
              placeholder={t('search_incorrect_notes')}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={openFilter}>
            <FontAwesome6 name="sliders" size={16} color={hasActiveFilter ? "#7C3AED" : "#4B5563"} />
            {hasActiveFilter && <View style={styles.activeFilterDot} />}
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipScrollContent}
        >
          {allSubjects.map((sub, idx) => {
            const isAll = sub.value === 'all'
            const isActive = isAll
              ? subjectValue.length === 0
              : subjectValue.includes(String(sub.value))
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.subjectChip, isActive && styles.subjectChipActive]}
                onPress={() => handleChangeSubject(isAll ? null : String(sub.value))}
              >
                {!isAll && isActive && (
                  <View style={[styles.chipDot, { backgroundColor: '#FFF' }]} />
                )}
                {!isAll && !isActive && (
                  <View style={[styles.chipDot, { backgroundColor: '#D1D5DB' }]} />
                )}
                <Text style={[styles.subjectChipText, isActive && styles.subjectChipTextActive]}>
                  {sub.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <FlatList
        ref={contentRef}
        data={notes as unknown as GroupedNoteResponse[]}
        keyExtractor={(item, index) => `${item.subjectName}-${item.categoryName}-${index}`}
        onEndReached={handleLoadMore}
        contentContainerStyle={[styles.list, notes.length === 0 && styles.listEmpty]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="note-sticky" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>{t('no_data')}</Text>
          </View>
        }
        ListFooterComponent={
          isLoadingNotes ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#7C3AED" />
              <Text style={{ marginTop: 8, color: '#6B7280', fontSize: 13 }}>{t('loading', 'Đang tải...')}</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => <GroupedNoteCard item={item} t={t} onOpenDialog={handleOpenDialog} filter={filter} refreshGroup={refreshGroup} onRemoveGroup={removeGroup} />}
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
    </View>
  )
}

const styles = ScaledSheet.create({
  safe: {
    height: '100%',
    backgroundColor: '#F9FAFB'
  },
  fixedHeader: {
    paddingHorizontal: '20@ms',
    paddingTop: '20@ms',
    backgroundColor: '#F9FAFB',
  },
  list: {
    paddingHorizontal: '20@ms',
    paddingBottom: '200@ms'
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '60@ms',
  },
  emptyText: {
    marginTop: '16@ms',
    fontSize: '15@ms',
    color: '#9CA3AF',
    fontWeight: '500',
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '16@ms',
  },
  searchFlex: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    marginRight: '10@ms',
  },
  filterBtn: {
    width: '48@ms',
    height: '48@ms',
    backgroundColor: '#FFFFFF',
    borderRadius: '24@ms',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: '1@ms',
    borderColor: '#F3F4F6',
    position: 'relative',
  },
  activeFilterDot: {
    position: 'absolute',
    top: '12@ms',
    right: '12@ms',
    width: '8@ms',
    height: '8@ms',
    borderRadius: '4@ms',
    backgroundColor: '#EF4444',
    borderWidth: '1@ms',
    borderColor: '#FFFFFF',
  },
  chipScroll: {
    marginBottom: '20@ms',
  },
  chipScrollContent: {
    paddingRight: '20@ms',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms',
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '20@ms',
    paddingHorizontal: '16@ms',
    paddingVertical: '10@ms',
    borderWidth: '1@ms',
    borderColor: '#F3F4F6',
  },
  subjectChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  chipDot: {
    width: '6@ms',
    height: '6@ms',
    borderRadius: '3@ms',
    marginRight: '6@ms',
  },
  subjectChipText: {
    fontSize: '14@ms',
    color: '#4B5563',
    fontWeight: '500'
  },
  subjectChipTextActive: {
    color: '#FFFFFF'
  }
})