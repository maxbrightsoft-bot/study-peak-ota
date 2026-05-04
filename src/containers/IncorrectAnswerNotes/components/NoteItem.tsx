import React, { FC, useEffect, useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { FontAwesome6 } from '@expo/vector-icons'
import { TooltipProps } from '../configs/types'
import { palette } from '@/theme'
import { ExamResult, NoteResponse } from '@/utils/types'
import MathRender from '@/components/MathRender'

interface NoteItemProps extends TooltipProps<NoteResponse> {
  data: NoteResponse
  openTooltip: boolean
  placement?: string
  actions: any
  examResultData?: ExamResult
  onLoad?: () => void
  onItemClick?: (data: NoteResponse) => void
}

const NoteItem: FC<NoteItemProps> = ({
  data,
  openTooltip,
  actions,
  onClose,
  examResultData,
  onOpen,
  onLoad,
  onItemClick
}) => {
  const { t } = useTranslation()
  const [tooltipVisible, setTooltipVisible] = useState(openTooltip)
  const question = examResultData?.questions.find(i => i.questionOrder === data?.questionOrder)

  const handleMoreClick = () => {
    setTooltipVisible(true)
    onOpen(data)
  }

  const handleItemClick = () => {
    onItemClick?.(data)
  }

  useEffect(() => {
    onLoad?.()
  }, [])

  return (
    // <TouchableOpacity onPress={handleItemClick} style={styles.container}>
    //   <View style={styles.row}>
    //     <View style={styles.textContainer}>
    //       <View style={styles.row}>
    //         <Text style={styles.textLeft}>
    //           {data.examSessionId ? `${t('article')} ${(data.questionGroupIndex ?? 0) + 1}` : `${data.fullName}`}
    //         </Text>
    //         <Text style={styles.textMiddle}>
    //           {data.examSessionId
    //             ? t('number_question', { number: (data.questionOrder || 0) + 1 })
    //             : utcToLocalTime(data.createdAt, `${t('date_format')} HH:mm`)}
    //         </Text>
    //         {data.examSessionId && <Text style={styles.textRight}>{data.categoryName}</Text>}
    //       </View>
    //       <MathRender content={data.content} textColor={palette.grey[700]} />
    //       {/* <Text numberOfLines={1} ellipsizeMode="tail" style={styles.contentText}>
    //         {data.content?.replace(/<[^>]+>/g, '') || ''}
    //       </Text> */}
    //     </View>
    //     {data.isOwned && (
    //       <CustomTooltip
    //         isVisible={tooltipVisible}
    //         actions={actions}
    //         data={data}
    //         onClose={() => {
    //           setTooltipVisible(false)
    //           onClose?.()
    //         }}
    //       >
    //         <TouchableOpacity onPress={handleMoreClick} style={styles.moreButton}>
    //           <Ionicons name="ellipsis-horizontal-sharp" size={20} color={palette.grey[700]} />
    //         </TouchableOpacity>
    //       </CustomTooltip>
    //     )}
    //   </View>
    // </TouchableOpacity>
    <Pressable style={({ pressed }) => [styles.container, pressed && styles.pressed]} onPress={handleItemClick}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>{examResultData?.title || data?.title}</Text>
        <View style={styles.separator} />
        <Text style={styles.headerText}>{examResultData?.subjectName || data?.subjectName}</Text>
      </View>
      <View style={styles.metaRow}>
        <View style={styles.metaLeft}>
          <Text style={styles.number}>
            {t('number_question', {
              number: (data?.questionOrder || 0) + 1
            })}
          </Text>
          <Text style={styles.metaText}>{data.categoryName}</Text>
          <View style={styles.separator} />
          <Text style={styles.metaText}>p.{question?.score ?? data?.score}</Text>
        </View>
        <FontAwesome6 name="angle-right" size={20} color={palette.grey[300]} />
      </View>
      <MathRender content={data.content} textColor={palette.grey[700]} maxLines={1} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
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
    flexWrap: 'wrap'
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
    color: '#111',
  }
})

export default NoteItem
