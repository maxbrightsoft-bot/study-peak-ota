import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from './Header'
import useLayoutApp from './hooks/useLayoutApp'

interface Props {
  children?: React.ReactNode
}

const LayoutApp = ({ children }: Props) => {
  const { headerProps } =
    useLayoutApp()

  return (
    <SafeAreaView style={styles.container}>
      <Header headerProps={headerProps}/>
      {children}
    </SafeAreaView>
  )
}

export default LayoutApp

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})
