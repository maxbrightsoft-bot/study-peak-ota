import { TypeNotificationEnum } from '@/containers/Home/configs/constants'
import { DEFAULT_NOTICE_TAB, isPersonalNoticeTab, noticeTab, PERSONAL_NOTICE_TAB, TabList } from '../constants'

jest.mock('@/containers/Home/configs/constants', () => ({
  TypeNotificationEnum: { Academy: 1, Class: 2, Student: 3 }
}))

describe('Notice tabs (I1)', () => {
  test('the personal tab is listed first, but the drawer still opens on the institute notice by default', () => {
    expect(TabList[0].value).toBe(PERSONAL_NOTICE_TAB)
    expect(noticeTab(DEFAULT_NOTICE_TAB)).toEqual(
      expect.objectContaining({ label: 'institute_notice', type: [TypeNotificationEnum.Academy] })
    )
  })

  test('noticeTab finds a tab by value and falls back to the default for an unknown value', () => {
    expect(noticeTab(PERSONAL_NOTICE_TAB).label).toBe('wrong_note_bell_tab_notifications')
    expect(noticeTab(99).value).toBe(DEFAULT_NOTICE_TAB)
  })

  test('only the personal tab is personal (it must not mark academy notices read)', () => {
    expect(isPersonalNoticeTab(PERSONAL_NOTICE_TAB)).toBe(true)
    expect(TabList.filter((tab) => isPersonalNoticeTab(tab.value))).toHaveLength(1)
  })
})
