import { palette } from '@/theme'
import { Action } from '@/utils/types'
import { PropsWithChildren } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Divider } from 'react-native-paper'
import { ScaledSheet } from 'react-native-size-matters'
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
      backgroundColor="transparent"
      tooltipStyle={styles.tooltip}
      content={
        <View style={styles.container}>
          {actions.map((action, index) => (
            <>
              <TouchableOpacity
                key={action.label}
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
      <View>{children}</View>
    </Tooltip>
  )
}

const styles = ScaledSheet.create({
  container: {
    paddingVertical: '8@ms'
  },
  button: {
    paddingVertical: '12@ms',
    paddingHorizontal: '35@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tooltip: {
    backgroundColor: '#fff',
    borderRadius: '8@ms',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: '4@ms' },
    shadowOpacity: 0.2,
    shadowRadius: '8@ms',
    elevation: '8@ms'
  },
  containerButton: {
    flexDirection: 'row',
    gap: '12@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontWeight: '700',
    fontSize: '14@ms',
    color: palette.main[500]
  }
})

export default CustomTooltip
