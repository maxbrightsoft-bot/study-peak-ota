import moment from 'moment'
import {
  myWindowFor,
  shiftMyWindow,
  canShiftForward,
  goalProgress,
  validateEndTime,
  toServerUtc,
  defaultEndTime,
  compactDuration,
  formatSignedDuration,
  parseGoalMinutes,
  myGoalLabel,
  canEditMyGoal,
  goalRows,
  periodGoalLines,
  ringGoal
} from '../helpers'
import { StudyTimerMyPeriod } from '../enums'

const today = moment().format('YYYY-MM-DD')
test('week window is 7 days ending at anchor', () => {
  expect(myWindowFor(StudyTimerMyPeriod.Week, '2026-10-31')).toEqual({
    period: 'week',
    from: '2026-10-25',
    to: '2026-10-31'
  })
})
test('month window clamps to today', () => {
  expect(myWindowFor(StudyTimerMyPeriod.Month, today).to).toBe(today)
})
test('cannot shift past today', () => {
  const w = myWindowFor(StudyTimerMyPeriod.Week, today)
  expect(canShiftForward(w)).toBe(false)
  expect(shiftMyWindow(w, 1)).toEqual(w)
  expect(shiftMyWindow(w, -1).to).toBe(moment().subtract(7, 'days').format('YYYY-MM-DD'))
})
test('no goal is not 0 %', () => {
  expect(goalProgress(null, 479)).toEqual({
    percent: null,
    ringFraction: 0,
    remaining: null
  })
})
test('goal over 100 %', () => {
  expect(goalProgress(300, 479)).toEqual({
    percent: 160,
    ringFraction: 1,
    remaining: 0
  })
  expect(goalProgress(300, 220)).toEqual({
    percent: 73,
    ringFraction: 220 / 300,
    remaining: 80
  })
})
test('end time rules incl. midnight', () => {
  const start = '2026-10-30T14:10:00' // UTC, no Z
  const now = new Date(Date.UTC(2026, 10, 1, 0, 0))
  expect(validateEndTime(start, new Date(Date.UTC(2026, 9, 30, 15, 30)), now)).toBe(true)
  expect(validateEndTime(start, new Date(Date.UTC(2026, 9, 30, 14, 10)), now)).toBe(false) // = start
  expect(validateEndTime(start, new Date(Date.UTC(2026, 9, 30, 20, 11)), now)).toBe(false) // > 6 h
  expect(
    validateEndTime(
      start,
      new Date(Date.UTC(2026, 9, 30, 15, 0)),
      new Date(Date.UTC(2026, 9, 30, 14, 30))
    )
  ).toBe(false) // future
})
test('run closed after local midnight validates and sends the right UTC string', () => {
  // started 23:10 local (any tz), closed 00:30 next day = +80 min
  const startLocal = new Date(2026, 9, 30, 23, 10)
  const start = toServerUtc(startLocal)
  const endLocal = new Date(2026, 9, 31, 0, 30)
  const now = new Date(2026, 9, 31, 1, 0)
  expect(validateEndTime(start, endLocal, now)).toBe(true)
  expect(toServerUtc(endLocal)).toBe(
    moment.utc(startLocal).add(80, 'minutes').format('YYYY-MM-DDTHH:mm:ss')
  )
})
test('server UTC string has no Z', () => {
  expect(toServerUtc(new Date(Date.UTC(2026, 9, 30, 15, 5, 0)))).toBe('2026-10-30T15:05:00')
})
test('default end = start + 1 h, capped by latestEndAt', () => {
  expect(defaultEndTime('2026-10-30T14:10:00', '2026-10-30T20:10:00').toISOString()).toBe(
    '2026-10-30T15:10:00.000Z'
  )
  expect(defaultEndTime('2026-10-30T14:10:00', '2026-10-30T14:40:00').toISOString()).toBe(
    '2026-10-30T14:40:00.000Z'
  )
})
test('compact duration', () => {
  expect(compactDuration(50)).toBe('50m')
  expect(compactDuration(120)).toBe('2h')
  expect(compactDuration(65)).toBe('1h05')
})
test('signed duration', () => {
  // stub t: interpolates the default value like i18next would without a catalog
  const t = ((_k: string, o: Record<string, unknown>) =>
    String(o.defaultValue).replace(/{{(\w+)}}/g, (_m, n) => String(o[n]))) as never
  expect(formatSignedDuration(67, t)).toBe('+1h 7m')
  expect(formatSignedDuration(-189, t)).toBe('−3h 9m')
  expect(formatSignedDuration(0, t)).toBe('0m')
})

test('parseGoalMinutes accepts whole minutes in 1..900 only', () => {
  expect(parseGoalMinutes('1')).toBe(1)
  expect(parseGoalMinutes('29')).toBe(29)
  expect(parseGoalMinutes('30')).toBe(30)
  expect(parseGoalMinutes(' 240 ')).toBe(240)
  expect(parseGoalMinutes('900')).toBe(900)
  expect(parseGoalMinutes('901')).toBeNull()
  expect(parseGoalMinutes('0')).toBeNull()
  expect(parseGoalMinutes('')).toBeNull()
  expect(parseGoalMinutes('abc')).toBeNull()
  expect(parseGoalMinutes('240.5')).toBeNull()
  expect(parseGoalMinutes('-60')).toBeNull()
})
test('myGoalLabel picks personal, then teacher, then the empty states', () => {
  const base = { dailyMinutes: null, courses: [] }
  const course = { courseId: 1, courseName: 'A', dailyMinutes: 240, isOverride: false }
  expect(myGoalLabel({ ...base, dailyMinutes: 300, personalMinutes: 300, teacherMinutes: 240, isPersonal: true, courses: [course] })).toBe('personal')
  expect(myGoalLabel({ ...base, dailyMinutes: 240, teacherMinutes: 240, isPersonal: false, courses: [course] })).toBe('teacher')
  expect(myGoalLabel({ ...base, dailyMinutes: 240, courses: [course] })).toBe('teacher') // older server: no new fields
  expect(myGoalLabel(base)).toBe('noClass')
  expect(myGoalLabel({ ...base, courses: [{ ...course, dailyMinutes: 0 }] })).toBe('noGoal')
})
test('myGoalLabel in study space shows only the personal goal', () => {
  const base = { dailyMinutes: null, courses: [] }
  const course = { courseId: 1, courseName: 'A', dailyMinutes: 240, isOverride: false }
  expect(myGoalLabel({ ...base, dailyMinutes: 300, personalMinutes: 300, isPersonal: true }, true)).toBe('personal')
  expect(myGoalLabel({ ...base, personalMinutes: null, isPersonal: false }, true)).toBe('spaceNoGoal')
  expect(myGoalLabel(base, true)).toBe('spaceNoGoal') // never noClass in study space
  expect(myGoalLabel({ ...base, dailyMinutes: 240, teacherMinutes: 240, isPersonal: false, courses: [course] }, true)).toBe('spaceNoGoal') // never teacher
  expect(myGoalLabel({ ...base, courses: [{ ...course, dailyMinutes: 0 }] }, true)).toBe('spaceNoGoal') // never noGoal
  expect(myGoalLabel(base, false)).toBe('noClass') // academy behaviour unchanged
})
test('canEditMyGoal only when the server sends isPersonal (older servers have no PUT me/goal)', () => {
  const base = { dailyMinutes: null, courses: [] }
  expect(canEditMyGoal({ ...base, isPersonal: true })).toBe(true)
  expect(canEditMyGoal({ ...base, isPersonal: false })).toBe(true)
  expect(canEditMyGoal(base)).toBe(false)
})

describe('goalRows (Today card rows)', () => {
  const base = { dailyMinutes: null, courses: [] }
  test('both goals -> teacher row then my row, each with own progress', () => {
    const rows = goalRows({ ...base, dailyMinutes: 300, personalMinutes: 300, teacherMinutes: 240, isPersonal: true }, false, 120)
    expect(rows.map((r) => r.kind)).toEqual(['teacher', 'personal'])
    expect(rows[0]).toMatchObject({ minutes: 240, percent: 50, remaining: 120, reached: false })
    expect(rows[1]).toMatchObject({ minutes: 300, percent: 40, remaining: 180, reached: false })
  })
  test('reached is per row', () => {
    const rows = goalRows({ ...base, dailyMinutes: 300, personalMinutes: 300, teacherMinutes: 240, isPersonal: true }, false, 250)
    expect(rows[0].reached).toBe(true)
    expect(rows[1].reached).toBe(false)
  })
  test('only teacher goal / only personal goal -> one row', () => {
    expect(goalRows({ ...base, dailyMinutes: 240, teacherMinutes: 240, isPersonal: false }, false, 0).map((r) => r.kind)).toEqual(['teacher'])
    expect(goalRows({ ...base, dailyMinutes: 300, personalMinutes: 300, isPersonal: true }, false, 0).map((r) => r.kind)).toEqual(['personal'])
  })
  test('older server without teacherMinutes: effective goal is the teacher row', () => {
    expect(goalRows({ ...base, dailyMinutes: 240 }, false, 0).map((r) => r.kind)).toEqual(['teacher'])
  })
  test('no goal -> no rows; study space -> personal only', () => {
    expect(goalRows(base, false, 0)).toEqual([])
    expect(goalRows({ ...base, dailyMinutes: 240, teacherMinutes: 240, isPersonal: false }, true, 0)).toEqual([])
    expect(goalRows({ ...base, dailyMinutes: 300, personalMinutes: 300, teacherMinutes: 240, isPersonal: true }, true, 0).map((r) => r.kind)).toEqual(['personal'])
  })
})
describe('periodGoalLines (chart lines)', () => {
  const days = (g: (number | null)[]) => g.map((goalMinutes, i) => ({ date: `2026-11-0${i + 1}T00:00:00`, minutes: 0, goalMinutes }))
  const goal = (personalMinutes: number | null) => ({ dailyMinutes: personalMinutes ?? 240, courses: [], personalMinutes, teacherMinutes: 240, isPersonal: personalMinutes !== null })
  test('teacher line from the last day with a goal; personal line when it differs', () => {
    expect(periodGoalLines(days([null, 240, 240]), goal(300))).toEqual({ teacher: 240, personal: 300 })
  })
  test('same value or no personal goal -> no second line', () => {
    expect(periodGoalLines(days([240]), goal(240))).toEqual({ teacher: 240, personal: null })
    expect(periodGoalLines(days([240]), goal(null))).toEqual({ teacher: 240, personal: null })
  })
  test('no teacher line but personal goal -> personal line only', () => {
    expect(periodGoalLines(days([null]), goal(300))).toEqual({ teacher: null, personal: 300 })
  })
})

describe('ringGoal (ring follows the lower goal until reached, then the higher)', () => {
  test('both goals, lower not reached -> lower', () => {
    expect(ringGoal(240, 300, 100)).toBe(240)
    expect(ringGoal(300, 240, 100)).toBe(240)
  })
  test('lower reached -> higher', () => {
    expect(ringGoal(240, 300, 240)).toBe(300)
    expect(ringGoal(300, 240, 500)).toBe(300)
  })
  test('only one goal -> that goal; none -> null', () => {
    expect(ringGoal(240, null, 500)).toBe(240)
    expect(ringGoal(null, 300, 0)).toBe(300)
    expect(ringGoal(null, null, 0)).toBeNull()
  })
  test('equal goals -> that value; study space (teacher null) -> personal', () => {
    expect(ringGoal(240, 240, 300)).toBe(240)
    expect(ringGoal(null, 180, 200)).toBe(180)
  })
})
