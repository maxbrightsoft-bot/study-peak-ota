import React, { FC } from 'react'
import { View, FlatList, Text } from 'react-native'
import { NotesContainerProps } from '../configs/interfaces'
import NoteItem from './NoteItem'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import Loading from '@/components/Loading'
import { useTranslation } from 'react-i18next'

const NotesContainer: FC<NotesContainerProps> = ({
  data,
  isLoading = false,
  listHeight = 430,
  onLoadMore,
  onCloseTooltip,
  onOpenTooltip,
  onItemClick,
  itemActions,
  examResultData,
  noteIdContextMenu, 
  containerListProps
}) => {
  const { t } = useTranslation()
  const renderItem = ({ item }: any) => {
    const isSelected = noteIdContextMenu === item.id
    return (
      <View style={styles.itemWrapper}>
        <NoteItem
          data={item}
          examResultData={examResultData}
          openTooltip={isSelected}
          actions={itemActions}
          onOpen={onOpenTooltip}
          onClose={onCloseTooltip}
          onItemClick={onItemClick}
        />
      </View>
    )
  }

  return (
    <View style={[styles.container, { height: listHeight }, containerListProps]}>
      {!data?.length ? (
        <Text style={styles.text}>{t('add_new_incorrect_note_prompt')}</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.2}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    flexDirection: 'column',
    borderRadius: '6@ms',
    borderWidth: '1@ms',
    borderColor: palette.grey[100],
  },
  text: {
    color: palette.grey[500],
    fontSize: '16@ms', 
    fontWeight: 600,
    marginTop: '160@ms',
    textAlign: "center"
  },
  itemWrapper: {
    marginBottom: '16@ms'
  }
})

export default NotesContainer
