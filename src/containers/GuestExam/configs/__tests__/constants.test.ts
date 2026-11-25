import { GUEST_NEXT_STUDENT_SECONDS } from '../constants'

describe('guest result auto-return', () => {
  it('next-student countdown is 10 seconds', () => {
    expect(GUEST_NEXT_STUDENT_SECONDS).toBe(10)
  })
})
