import axios from 'axios'

const NEIS_API_BASE_URL = 'https://open.neis.go.kr/hub/schoolInfo'

export interface NeisSchool {
  ATPT_OFCDC_SC_CODE: string
  ATPT_OFCDC_SC_NM: string
  SD_SCHUL_CODE: string
  SCHUL_NM: string
  ENG_SCHUL_NM: string
  SCHUL_KND_SC_NM: string
  LCTN_NM: string
  ORG_RDNMA: string
}

export const searchSchools = async (keyword: string): Promise<NeisSchool[]> => {
  if (!keyword || keyword.length < 2) return []

  try {
    const response = await axios.get(NEIS_API_BASE_URL, {
      params: {
        ...(process.env.EXPO_PUBLIC_NEIS_KEY ? { KEY: process.env.EXPO_PUBLIC_NEIS_KEY } : {}),
        Type: 'json',
        pIndex: 1,
        pSize: 20,
        SCHUL_NM: keyword,
      },
    })

    const data = response.data
    if (data.schoolInfo && data.schoolInfo[1] && data.schoolInfo[1].row) {
      return data.schoolInfo[1].row
    }

    return []
  } catch (error) {
    console.error('Error fetching schools from NEIS:', error)
    return []
  }
}
