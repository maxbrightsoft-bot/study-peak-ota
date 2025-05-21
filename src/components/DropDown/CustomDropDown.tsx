import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import React, { ReactNode, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, Platform, UIManager, LayoutAnimation } from 'react-native'

type Props = {
  expanded: boolean
  onPress: () => void
  title?: ReactNode
  children: ReactNode
  subHeader?: ReactNode
  styleCard?: any
  styleExpand?: any
}

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true)
}

const CustomDropDown = ({ expanded, onPress, title, children, subHeader, styleCard, styleExpand }: Props) => {
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }, [expanded])

  return (
    <View style={[styles.card, styleCard]}>
      <TouchableOpacity style={styles.header} onPress={onPress}>
        {title}
        <Ionicons
          style={{ padding: 12 }}
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={palette.grey[700]}
        />
      </TouchableOpacity>

      {!expanded && subHeader}
      {expanded && <View style={[styles.expandedContainer, styleExpand]}>{children}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  expandedContainer: {
    overflow: 'hidden',
    // marginTop: 10
  }
})

export default CustomDropDown
