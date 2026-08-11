import { StatusBar, StyleSheet, View } from 'react-native'

import Header from './Header'
import { noLayoutScreens } from '@/navigators/RouteName'
import { currentScreen } from '@/navigators/NavigationHelpers'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import { SafeAreaView } from 'react-native-safe-area-context'
import Watermark from '@/components/Watermark'

import { useNavigationState } from '@react-navigation/native'

interface Props {
  children?: React.ReactNode
  headerProps: any
}

const LayoutApp = ({ children, headerProps }: Props) => {
  const currentRouteName = useNavigationState((state) => {
    if (!state) return undefined
    let route = state.routes[state.index]
    while (route?.state) {
      route = route.state.routes[route.state.index]
    }
    return route?.name
  })

  const isNoLayout = noLayoutScreens.includes(currentRouteName || currentScreen())

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isNoLayout ? '#FFF' : palette.main[600] }
      ]}
      edges={['top']}
    >
      <StatusBar
        barStyle={isNoLayout ? 'dark-content' : 'light-content'}
        backgroundColor={isNoLayout ? '#FFF' : palette.main[600]}
      />
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
    backgroundColor: '#FFF',
    position: 'relative',
  }
})
