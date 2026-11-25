import { TFunction } from 'i18next'
import { getErrorMessage } from '@/utils/helpers'
import { AccountLinksResponse, LinkProvider } from '../configs/types'

type Translate = TFunction<'translation', undefined>

export const CODE_LENGTH = 6
export const MERGE_NOTE_MAX_LENGTH = 500

export const isLinked = (links: AccountLinksResponse | undefined, provider: LinkProvider) =>
  !!links?.links.some(i => i.provider === provider)

/** Unlinking must leave another way to sign in: a password or another provider. */
export const canUnlink = (links: AccountLinksResponse | undefined, provider: LinkProvider) =>
  !!links && isLinked(links, provider) && (links.hasPassword || links.links.some(i => i.provider !== provider))

export const isValidCode = (code: string) => new RegExp(`^\\d{${CODE_LENGTH}}$`).test(code)

/**
 * The backend sends the localized message as the ProblemDetails `title` for 400/403/404/409/429;
 * getErrorMessage would replace 409 with a generic text, so read the title first.
 */
export const getAccountLinkErrorMessage = (t: Translate, error: unknown) => {
  const response = (error as { response?: { status?: number; data?: { title?: unknown } } })?.response
  const status = response?.status
  const title = response?.data?.title
  if (status && [400, 403, 404, 409, 429].includes(status) && typeof title === 'string' && title) {
    try {
      return decodeURIComponent(title)
    } catch {
      return title
    }
  }
  if (status === 429) return t('too_many_code_requests')
  return getErrorMessage(t, error)
}
