import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'
import { openSettingRoute } from '../openSettingRoute'

jest.mock('@/navigators/NavigationHelpers', () => ({ navigate: jest.fn() }))

describe('openSettingRoute', () => {
  it('closes the dialog then navigates through the root navigation ref', () => {
    const calls: string[] = []
    ;(navigate as jest.Mock).mockImplementation(() => calls.push('navigate'))
    openSettingRoute(Routes.Auth.CombineGuestResults, () => calls.push('close'))
    expect(calls).toEqual(['close', 'navigate'])
    expect(navigate).toHaveBeenCalledWith(Routes.Auth.CombineGuestResults)
  })
})
