import { LoginResponse } from '@/utils/types/login'

export type LinkProvider = 'Google' | 'Apple'

export type AccountLinksResponse = {
  links: { provider: LinkProvider }[]
  hasPassword: boolean
}

export type LinkGoogleBody = {
  token: string
  googleId: string
  email: string
}

/** `POST api/auth/links/google/unlink/send-code` answer: opaque id of the emailed challenge. */
export type UnlinkGoogleChallenge = {
  unlinkToken: string
}

export type UnlinkGoogleBody = {
  unlinkToken: string
  code: string
}

export type LinkAppleBody = {
  token: string
}

/** Body of the 409 from `POST api/auth/links/{provider}` when the provider account belongs to another account. */
export type LinkConflict = {
  conflictToken: string
  otherAccountMaskedEmail: string
  message?: string
}

/** Profile as the conflicts/profiles route returns it (camelCase). */
export type ApiProfile = {
  fullName?: string | null
  phoneNumber?: string | null
  parentName?: string | null
  parentPhoneNumber?: string | null
  parentEmail?: string | null
  schoolName?: string | null
  grade?: number | null
  avatar?: string | null
}

/** The fields the user may pick, named as the backend expects them in `profileChoices`. */
export type ProfileFieldName =
  | 'FullName'
  | 'PhoneNumber'
  | 'ParentName'
  | 'ParentPhoneNumber'
  | 'ParentEmail'
  | 'SchoolName'
  | 'Grade'
  | 'Avatar'

export type ProfileFields = Record<ProfileFieldName, string | number | null | undefined>

/** Target = the account that stays, Merged = the account that is closed. */
export type ProfileSource = 'Target' | 'Merged'

export type ProfileChoices = Record<string, ProfileSource>

export type MergeDirection = 'MergeOtherIntoMe' | 'MergeMeIntoOther'

/** Which picker column a value comes from: the signed-in account or the other one. */
export type ProfileSide = 'current' | 'other'

export type ConflictProfiles = {
  current: ApiProfile
  other: ApiProfile
}

export type ConflictVerifyBody = {
  conflictToken: string
  code: string
  direction: MergeDirection
  profileChoices: ProfileChoices
}

export type ConflictVerifyResponse = {
  direction: MergeDirection
  providerLinked: boolean
  loginResponse?: LoginResponse | null
}
