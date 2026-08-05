import { StatusBar, StyleSheet, View } from 'react-native'

import Header from './Header'
import { noLayoutScreens } from '@/navigators/RouteName'
import { currentScreen } from '@/navigators/NavigationHelpers'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import { SafeAreaView } from 'react-native-safe-area-context'
import Watermark from '@/components/Watermark'

interface Props {
  children?: React.ReactNode
  headerProps: any
}

const LayoutApp = ({ children, headerProps }: Props) => {
  const isNoLayout = noLayoutScreens.includes(currentScreen())

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={palette.main[600]} />
      {!isNoLayout && <Header headerProps={headerProps} />}
      {children}
      <Watermark />
    </SafeAreaView>
  )
}

export default LayoutApp

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.main[600],
    position: 'relative',
  }
})
