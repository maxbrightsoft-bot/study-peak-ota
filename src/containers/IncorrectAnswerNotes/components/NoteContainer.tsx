import React, { FC } from 'react'
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native'
import { NotesContainerProps } from '../configs/interfaces'
import NoteItem from './NoteItem'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'

const NotesContainer: FC<NotesContainerProps> = ({
  data,
  isLoading = false,
  listHeight = 430,
  onLoadMore,
  onCloseTooltip,
  onOpenTooltip,
  onItemClick,
  itemActions,
  noteIdContextMenu,
  containerListProps
}) => {
  const renderItem = ({ item }: any) => {
    const isSelected = noteIdContextMenu === item.id
    return (
      <View style={styles.itemWrapper}>
        <NoteItem
          data={item}
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
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.2}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    flexDirection: "column",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: palette.grey[100],
    backgroundColor: palette.grey[50],
    padding: 8
  },
  itemWrapper: {
    marginBottom: 8
  }
})

export default NotesContainer
