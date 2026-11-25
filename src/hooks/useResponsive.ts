import { useWindowDimensions } from 'react-native'

export const TABLET_MIN_WIDTH = 600
export const TABLET_WIDE_WIDTH = 768
export const TABLET_CONTENT_MAX_WIDTH = 760
export const TABLET_FORM_MAX_WIDTH = 520
export const TABLET_MODAL_MAX_WIDTH = 540
export const TABLET_SHEET_MAX_WIDTH = 640
export const TABLET_TABBAR_MAX_WIDTH = 680

export const useResponsive = () => {
  const { width, height } = useWindowDimensions()
  const shortestSide = Math.min(width, height)
  const isTablet = shortestSide >= TABLET_MIN_WIDTH || width >= TABLET_WIDE_WIDTH
  const isLandscape = width > height

  return {
    width,
    height,
    shortestSide,
    isTablet,
    isLandscape,
    modalMaxWidth: isTablet ? TABLET_MODAL_MAX_WIDTH : undefined,
    sheetMaxWidth: isTablet ? TABLET_SHEET_MAX_WIDTH : undefined,
    contentMaxWidth: isTablet ? TABLET_CONTENT_MAX_WIDTH : undefined,
    formMaxWidth: isTablet ? TABLET_FORM_MAX_WIDTH : undefined,
    tabBarMaxWidth: isTablet ? TABLET_TABBAR_MAX_WIDTH : undefined
  }
}

export default useResponsive

