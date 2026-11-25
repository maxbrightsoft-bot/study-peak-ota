import { ApiProfile, MergeDirection, ProfileChoices, ProfileFieldName, ProfileFields, ProfileSide, ProfileSource } from '../configs/types'

/** The fields the backend lets the user pick, in display order, with their label keys. */
export const PROFILE_FIELDS: { name: ProfileFieldName; apiKey: keyof ApiProfile; label: string }[] = [
  { name: 'FullName', apiKey: 'fullName', label: 'full_name' },
  { name: 'PhoneNumber', apiKey: 'phoneNumber', label: 'phone_number' },
  { name: 'ParentName', apiKey: 'parentName', label: 'parent_name' },
  { name: 'ParentPhoneNumber', apiKey: 'parentPhoneNumber', label: 'parent_phone_number' },
  { name: 'ParentEmail', apiKey: 'parentEmail', label: 'parent_email' },
  { name: 'SchoolName', apiKey: 'schoolName', label: 'school_name' },
  { name: 'Grade', apiKey: 'grade', label: 'grade' },
  { name: 'Avatar', apiKey: 'avatar', label: 'avatar' }
]

export const isEmptyValue = (value: ProfileFields[ProfileFieldName]) =>
  value == null || (typeof value === 'string' && !value.trim())

export const fromApiProfile = (profile: ApiProfile): ProfileFields =>
  PROFILE_FIELDS.reduce((fields, { name, apiKey }) => {
    fields[name] = profile[apiKey] ?? null
    return fields
  }, {} as ProfileFields)

/**
 * Mirrors the backend default (AccountLinkRules.MergeProfile): keep the value of the account that stays (`current`
 * here = the staying account); where it is empty, take the merged account's value. Grade: current ?? other.
 */
export const defaultChoices = (current: ProfileFields, other: ProfileFields): Record<string, ProfileSource> =>
  PROFILE_FIELDS.reduce((choices, { name }) => {
    choices[name] = isEmptyValue(current[name]) && !isEmptyValue(other[name]) ? 'Merged' : 'Target'
    return choices
  }, {} as ProfileChoices)

const stayingSide = (direction: MergeDirection): ProfileSide => (direction === 'MergeOtherIntoMe' ? 'current' : 'other')

/** Defaults for a direction, from the signed-in account's and the other account's profile. */
export const defaultChoicesFor = (current: ProfileFields, other: ProfileFields, direction: MergeDirection) =>
  direction === 'MergeOtherIntoMe' ? defaultChoices(current, other) : defaultChoices(other, current)

/** The picker column a choice points at, for this direction. */
export const sideOfChoice = (choice: ProfileSource, direction: MergeDirection): ProfileSide => {
  const staying = stayingSide(direction)
  if (choice === 'Target') return staying
  return staying === 'current' ? 'other' : 'current'
}

/** The choice the backend expects when the user taps a column, for this direction. */
export const choiceForSide = (side: ProfileSide, direction: MergeDirection): ProfileSource =>
  side === stayingSide(direction) ? 'Target' : 'Merged'
