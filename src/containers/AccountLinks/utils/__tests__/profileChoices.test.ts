import {
  choiceForSide,
  defaultChoices,
  defaultChoicesFor,
  fromApiProfile,
  sideOfChoice
} from '../profileChoices'
import { ProfileFields } from '../../configs/types'

const empty: ProfileFields = {
  FullName: null,
  PhoneNumber: null,
  ParentName: null,
  ParentPhoneNumber: null,
  ParentEmail: null,
  SchoolName: null,
  Grade: null,
  Avatar: null
}

describe('defaultChoices', () => {
  it('keeps the staying value and falls back to the other one when empty', () => {
    expect(
      defaultChoices(
        { ...empty, FullName: 'A', SchoolName: null, Grade: 3 },
        { ...empty, FullName: 'B', SchoolName: 'S', PhoneNumber: '010', Grade: 5 }
      )
    ).toEqual({
      FullName: 'Target',
      PhoneNumber: 'Merged',
      ParentName: 'Target',
      ParentPhoneNumber: 'Target',
      ParentEmail: 'Target',
      SchoolName: 'Merged',
      Grade: 'Target',
      Avatar: 'Target'
    })
  })

  it('treats blank strings as empty and keeps Target when both are empty', () => {
    const result = defaultChoices({ ...empty, FullName: '  ' }, { ...empty, FullName: 'B', ParentName: '' })
    expect(result.FullName).toBe('Merged')
    expect(result.ParentName).toBe('Target')
  })

  it('Grade: current ?? other (0 is not used as a grade, null falls back)', () => {
    expect(defaultChoices({ ...empty, Grade: null }, { ...empty, Grade: 4 }).Grade).toBe('Merged')
    expect(defaultChoices({ ...empty, Grade: 2 }, { ...empty, Grade: null }).Grade).toBe('Target')
  })
})

describe('direction helpers', () => {
  const current = { ...empty, FullName: 'Me', SchoolName: null }
  const other = { ...empty, FullName: 'Other', SchoolName: 'S' }

  it('MergeOtherIntoMe: the current account stays', () => {
    const choices = defaultChoicesFor(current, other, 'MergeOtherIntoMe')
    expect(choices.FullName).toBe('Target')
    expect(choices.SchoolName).toBe('Merged')
    expect(sideOfChoice('Target', 'MergeOtherIntoMe')).toBe('current')
    expect(sideOfChoice('Merged', 'MergeOtherIntoMe')).toBe('other')
    expect(choiceForSide('current', 'MergeOtherIntoMe')).toBe('Target')
  })

  it('MergeMeIntoOther: the other account stays', () => {
    const choices = defaultChoicesFor(current, other, 'MergeMeIntoOther')
    expect(choices.FullName).toBe('Target')
    expect(choices.SchoolName).toBe('Target')
    expect(sideOfChoice('Target', 'MergeMeIntoOther')).toBe('other')
    expect(choiceForSide('current', 'MergeMeIntoOther')).toBe('Merged')
    expect(choiceForSide('other', 'MergeMeIntoOther')).toBe('Target')
  })
})

describe('fromApiProfile', () => {
  it('maps the camelCase API profile to the backend field names', () => {
    expect(fromApiProfile({ fullName: 'A', grade: 3, avatar: 'x.png' })).toEqual({
      ...empty,
      FullName: 'A',
      Grade: 3,
      Avatar: 'x.png'
    })
  })
})
