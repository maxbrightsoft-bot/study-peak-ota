import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  content: string
}

const PolicyViewer = ({ open, onClose, title, content }: Props) => {
  return (
    <SlideDrawerRoot visible={open} onClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[200]} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>

        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.contentText}>{content}</Text>
        </ScrollView>
      </View>
    </SlideDrawerRoot>
  )
}

export default PolicyViewer

const styles = ScaledSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#eee'
  },
  headerTitle: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#222',
    flex: 1,
    textAlign: 'center'
  },
  backButton: {
    width: '24@ms'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: '20@ms',
    paddingTop: '20@ms',
    paddingBottom: '40@ms'
  },
  contentText: {
    fontSize: '13@ms',
    lineHeight: '20@ms',
    color: '#333',
    fontWeight: '400'
  },
})
