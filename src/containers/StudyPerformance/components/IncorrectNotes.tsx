import SearchInput from '@/components/Input/SearchInput'
import { palette } from '@/theme'
import React from 'react'
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, StatusBar, Pressable } from 'react-native'
import CustomSelect from '@/components/Select/CustomSelect'
import useNotes from '../hooks/useNotes'
import { NoteResponse } from '@/utils/types'
import { FontAwesome6 } from '@expo/vector-icons'
import MathRender from '@/components/MathRender'
import SortIcon from '@/assets/iconJSX/sort'
import NoteDialog from './NoteDialog'
import { OrderBy } from '@/utils/enums'

const NoteCard = ({
  t,
  item,
  onOpenDialog
}: {
  t: any
  item: NoteResponse
  onOpenDialog: (item?: NoteResponse | undefined) => void
}) => (
  <Pressable style={({ pressed }) => [styles.container, pressed && styles.pressed]} onPress={() => onOpenDialog(item)}>
    <View style={styles.metaRow}>
      <View style={styles.metaLeft}>
        <Text style={styles.number}>
          {t('number_question', {
            number: (item?.questionOrder || 0) + 1
          })}
        </Text>
        <Text style={styles.metaText}>{item.categoryName}</Text>
        <View style={styles.separator} />
        <Text style={styles.metaText}>p.{item?.score}</Text>
      </View>
      <FontAwesome6 name="angle-right" size={20} color={palette.grey[300]} />
    </View>
    <MathRender fontSize={14} content={item.content} textColor={palette.grey[700]} />
    <View style={styles.headerRow}>
      <Text style={styles.headerText}>{item?.subjectName}</Text>
      <View style={styles.separator} />
      <Text style={styles.headerText}>{item?.title}</Text>
    </View>
  </Pressable>
)

export default function IncorrectNotes({ contentRef }: { contentRef?: React.RefObject<FlatList> }) {
  const {
    t,
    notes,
    open,
    search,
    onChangeSearch,
    handleSort,
    selectedNote,
    openConfirm,
    subjectValue,
    imageUrl,
    filter,
    categoryValue,
    handleChangeSubject,
    handleChangeCategory,
    categoryNoteOptions,
    subjectNoteOptions,
    toggleConfirmDialog,
    handleCloseDialog,
    handleOpenDialog,
    handleDeleteNote,
    handleSaveNote,
    handleUploadImage,
    isLoadingNotes,
    handleLoadMore
  } = useNotes()

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F6" />

      <FlatList
        ref={contentRef}
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <SearchInput
              style={styles.search}
              value={search}
              onChangeText={onChangeSearch}
              placeholder="오답노트 검색"
            />

            <View style={styles.filterRow}>
              <CustomSelect
                placeholder="과목"
                style={[styles.filter, subjectValue]}
                options={subjectNoteOptions}
                value={subjectValue}
                onValueChange={handleChangeSubject}
              />
              <CustomSelect
                placeholder="세부 카테고리"
                style={styles.filter}
                options={categoryNoteOptions}
                value={categoryValue}
                onValueChange={handleChangeCategory}
              />
            </View>
            <TouchableOpacity style={styles.sortBtn} activeOpacity={0.7} onPress={() => handleSort()}>
              <Text style={styles.sortText}>{filter.sortColumnDirection === OrderBy.DESC ? "최근 순" : "오래된 순"}</Text>
              <SortIcon />
            </TouchableOpacity>
          </>
        }
        renderItem={({ item }) => <NoteCard item={item} t={t} onOpenDialog={handleOpenDialog} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: palette.bg[100]
  },
  list: {
    padding: 20,
    paddingBottom: 200
  },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4
  },
  search: {
    backgroundColor: '#FFFFFF'
  },
  chipActive: {
    backgroundColor: '#1A1A1A'
  },
  filter: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    borderWidth: 1,
    minWidth: 100,
    borderColor: palette.grey[200]
  },
  chipText: {
    fontSize: 13,
    color: '#3A3A3A',
    fontWeight: '500'
  },
  chipTextActive: {
    color: '#FFFFFF'
  },
  chipArrow: {
    fontSize: 9,
    color: '#3A3A3A'
  },

  sortRow: {
    alignItems: 'flex-end',
    marginBottom: 10
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.grey[200],
    alignSelf: 'flex-end',
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4
  },
  sortText: {
    fontSize: 12,
    color: '#222222',
    fontWeight: '400'
  },
  sortIcon: {
    fontSize: 13,
    color: '#3A3A3A'
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    gap: 12
  },

  pressed: {
    opacity: 0.85
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: -10
  },
  headerText: {
    fontSize: 12,
    lineHeight: 20,
    color: palette.grey[400],
    fontWeight: 500
  },
  separator: {
    width: 1,
    height: 10,
    backgroundColor: palette.grey[400],
    marginHorizontal: 10
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6
  },

  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  number: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 25,
    color: palette.grey[900],
    marginRight: 12
  },

  metaText: {
    fontSize: 12,
    color: palette.grey[500]
  },

  description: {
    fontSize: 20,
    color: '#111'
  }
})
