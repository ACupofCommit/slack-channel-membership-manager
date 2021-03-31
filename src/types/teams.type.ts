import * as tg from 'generic-type-guard'
import { toFinite } from 'lodash'
import { isNotEmptyString, isNotNullObject, isOptionalBoolean, isOptionalNotEmptyString } from '../utils/typecheck.util'

export interface User {
  id: string
  email?: string
  isDeleted?: boolean
  botId?: string
  isBot?: boolean
  isAdmin?: boolean
  isOwner?: boolean
}

export const isUser = (o: unknown): o is User => {
  const m = o as User
  if (!isNotNullObject(m)) return false
  if (!isNotEmptyString(m.id)) return false
  if (!isOptionalNotEmptyString(m.email)) return false
  if (!isOptionalBoolean(m.isDeleted)) return false
  if (!isOptionalNotEmptyString(m.botId)) return false
  if (!isOptionalBoolean(m.isBot)) return false
  if (!isOptionalBoolean(m.isAdmin)) return false
  if (!isOptionalBoolean(m.isOwner)) return false

  return true
}

export interface Team {
  teamId: string
  enterpriseId?: string
  users: User[]
  cTime: string
  uTime: string
}

export const isTeam = (o: unknown): o is Team => {
  const m = o as Team
  if (!isNotNullObject(m)) return false
  if (!tg.isArray(isUser)(m.users)) return false

  return true
}
