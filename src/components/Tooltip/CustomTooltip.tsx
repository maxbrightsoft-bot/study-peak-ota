import { palette } from '@/theme'
import { Action } from '@/utils/types'
import { PropsWithChildren } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Divider } from 'react-native-paper'
import Tooltip from 'react-native-walkthrough-tooltip'

interface Props extends PropsWithChildren {
  isVisible: boolean
  onClose: () => void
  actions: Action<any>[]
  data?: any
}

const CustomTooltip = ({ isVisible, onClose, children, data, actions }: Props) => {
  return (
    <Tooltip
      isVisible={isVisible}
      content={
        <View style={styles.container}>
          {actions.map((action, index) => (
            <>
              <TouchableOpacity
                onPress={() => {
                  action?.onPress?.(data)
                  onClose()
                }}
                style={styles.button}
              >
                <View style={styles.containerButton}>
                  {action.startIcon}
                  <Text style={action.textStyle ?? styles.text}>{action.label}</Text>
                </View>
              </TouchableOpacity>
              {index !== actions.length - 1 && <Divider />}
            </>
          ))}
        </View>
      }
      onClose={onClose}
      placement="top"
    >
      {children}
    </Tooltip>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 35,
    justifyContent: 'center',
    alignItems: 'center'
  },
  containerButton: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontWeight: '700',
    fontSize: 14,
    color: palette.main[500]
  }
})

export default CustomTooltip
