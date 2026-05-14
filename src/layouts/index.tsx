import { StatusBar, StyleSheet, View } from 'react-native'

import Header from './Header'
import { noLayoutScreens } from '@/navigators/RouteName'
import { currentScreen } from '@/navigators/NavigationHelpers'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  children?: React.ReactNode
  headerProps: any
}

const LayoutApp = ({ children, headerProps }: Props) => {
  const isNoLayout = noLayoutScreens.includes(currentScreen())

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={palette.main[600]} />
      {!isNoLayout && <Header headerProps={headerProps} />}
      {children}
    </View>
  )
}

export default LayoutApp

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  }
})
