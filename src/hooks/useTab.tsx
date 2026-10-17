import { useState, useCallback } from 'react'

const useTab = (tabs: { label: string; value: any }[], defaultTab?: any) => {
  const [selected, setSelected] = useState(defaultTab !== undefined ? defaultTab : tabs[0].value)

  const handleChangeTab = useCallback((newValue: any) => {
    setSelected(newValue)
  }, [])

  return { selected, handleChangeTab }
}

export default useTab
