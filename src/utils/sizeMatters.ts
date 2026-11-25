import { Dimensions, ImageStyle, RegisteredStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native'

const guidelineBaseWidth = 350
const guidelineBaseHeight = 680
const MAX_SCALE_WIDTH = 420
const MAX_SCALE_HEIGHT = 816

const getWindow = () => {
  const { width = 375, height = 812 } = Dimensions.get('window') || {}
  const shortDimension = Math.min(width < height ? width : height, MAX_SCALE_WIDTH)
  const longDimension = Math.min(width < height ? height : width, MAX_SCALE_HEIGHT)
  return { shortDimension, longDimension }
}

const { shortDimension, longDimension } = getWindow()

export const scale = (size: number): number => (shortDimension / guidelineBaseWidth) * size
export const verticalScale = (size: number): number => (longDimension / guidelineBaseHeight) * size
export const moderateScale = (size: number, factor: number = 0.5): number =>
  size + (scale(size) - size) * factor
export const moderateVerticalScale = (size: number, factor: number = 0.5): number =>
  size + (verticalScale(size) - size) * factor

export const s = scale
export const vs = verticalScale
export const ms = moderateScale
export const mvs = moderateVerticalScale

type Scale = `${number}@s${'r' | ''}`
type VerticalScale = `${number}@vs${'r' | ''}`
type ModerateScale = `${number}@ms${number | ''}${'r' | ''}`
type ModerateVerticalScale = `${number}@mvs${number | ''}${'r' | ''}`
type Size = Scale | VerticalScale | ModerateScale | ModerateVerticalScale
type WithSize<T> = { [P in keyof T]: number extends T[P] ? Size | T[P] : T[P] }
type ScaledViewStyle = WithSize<ViewStyle>
type ScaledTextStyle = WithSize<TextStyle>
type ScaledImageStyle = WithSize<ImageStyle>
type NamedStyles<T> = { [P in keyof T]: ScaledViewStyle | ScaledTextStyle | ScaledImageStyle }

const validScaleSheetRegex = /^(\-?\d+(?:\.\d{1,3})?)@(mv?s(\d+(?:\.\d{1,2})?)?|s|vs)r?$/

const isObject = (val: unknown): val is Record<string, any> =>
  val !== null && typeof val === 'object'

const deepMap = (obj: any, fn: (val: any) => any): any => {
  const deepMapper = (val: any) => (isObject(val) ? deepMap(val, fn) : fn(val))
  if (Array.isArray(obj)) {
    return obj.map(deepMapper)
  }
  if (isObject(obj)) {
    return Object.keys(obj).reduce<Record<string, any>>((res, key) => {
      res[key] = deepMapper(obj[key])
      return res
    }, {})
  }
  return obj
}

const scaleValue = (value: unknown) => {
  if (typeof value !== 'string' || !validScaleSheetRegex.test(value)) {
    return value
  }

  const regexExecResult = validScaleSheetRegex.exec(value)
  if (!regexExecResult) return value

  const size = parseFloat(regexExecResult[1])
  let scaleFunc = regexExecResult[2]
  const rawFactor = regexExecResult[3]
  const factor = rawFactor !== undefined ? parseFloat(rawFactor) : 0.5

  if (rawFactor !== undefined) {
    scaleFunc = scaleFunc.slice(0, -rawFactor.length)
  }

  const shouldRound = value.endsWith('r')
  let result = size

  switch (scaleFunc) {
    case 's':
      result = scale(size)
      break
    case 'vs':
      result = verticalScale(size)
      break
    case 'ms':
      result = moderateScale(size, factor)
      break
    case 'mvs':
      result = moderateVerticalScale(size, factor)
      break
  }

  return shouldRound ? Math.round(result) : result
}

export const ScaledSheet = {
  create<T extends NamedStyles<T> | NamedStyles<any>>(
    stylesObject: T
  ): {
    [P in keyof T]: RegisteredStyle<{
      [S in keyof T[P]]: T[P][S] extends Size ? number : T[P][S]
    }>
  } {
    return StyleSheet.create(deepMap(stylesObject, scaleValue)) as any
  }
}
