import { Dimensions } from 'react-native'

describe('sizeMatters tablet cap', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    jest.resetModules()
  })

  it('keeps standard phone scaling unchanged (375x812)', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 375, height: 812, scale: 3, fontScale: 1 })
    const { ms, s, ScaledSheet } = require('../sizeMatters')

    expect(s(16)).toBeCloseTo((375 / 350) * 16, 4)
    expect(ms(16)).toBeCloseTo(16 + ((375 / 350) * 16 - 16) * 0.5, 4)

    const sheet = ScaledSheet.create({
      btn: { height: '50@ms', fontSize: '16@ms' }
    })
    expect(sheet.btn.height).toBeCloseTo(ms(50), 4)
    expect(sheet.btn.fontSize).toBeCloseTo(ms(16), 4)
  })

  it('caps tablet scaling so buttons and fonts do not blow up (800x1280 & 1024x1366)', () => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 800, height: 1280, scale: 2, fontScale: 1 })
    const tablet800 = require('../sizeMatters')
    expect(tablet800.s(16)).toBeCloseTo((420 / 350) * 16, 4)
    expect(tablet800.ms(16)).toBeCloseTo(17.6, 4)
    expect(tablet800.ms(50)).toBeCloseTo(55, 4)

    jest.resetModules()
    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 1024, height: 1366, scale: 2, fontScale: 1 })
    const tablet1024 = require('../sizeMatters')
    expect(tablet1024.ms(16)).toBeCloseTo(17.6, 4)
    expect(tablet1024.ms(50)).toBeCloseTo(55, 4)
  })
})

