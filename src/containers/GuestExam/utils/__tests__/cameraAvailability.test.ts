import { isCameraModuleAvailable } from '../cameraAvailability'

jest.mock('expo', () => ({ requireOptionalNativeModule: jest.fn(() => null) }))

describe('isCameraModuleAvailable', () => {
  it('returns false when the native module is missing', () => {
    expect(isCameraModuleAvailable(() => null)).toBe(false)
  })

  it('returns false when the lookup throws', () => {
    expect(
      isCameraModuleAvailable(() => {
        throw new Error('boom')
      })
    ).toBe(false)
  })

  it('returns true when present', () => {
    expect(isCameraModuleAvailable(() => ({}))).toBe(true)
  })
})
