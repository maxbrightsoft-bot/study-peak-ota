import { useState, useCallback } from 'react'

const useTab = (tabs: { label: string; value: any }[]) => {
  const [selected, setSelected] = useState(tabs[0].value)

  const handleChangeTab = useCallback((newValue: any) => {
    setSelected(newValue)
  }, [])

  return { selected, handleChangeTab }
}

export default useTab
