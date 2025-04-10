export type PagingResponse = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export type Language = {
  code: string
  name: string
  fullName: string
  shortName: string
  nativeName: string
  image: string
  momentLangCode: string
}

export * from './academy'
export * from './pusher'
export * from './login'
export * from './user'