import * as tg from 'generic-type-guard'
import { pickBy } from 'lodash'
import { createLogger } from '../utils/logger';
import { getDDC } from '../utils/common.util';
import { TABLENAME_SCMM_TEAMS as TableName } from './constants.model'
import { isTeam, Team, User } from '../types/teams.type'

const ddc = getDDC()
const logger = createLogger('teams.model')

export class TeamModel {
  public async putMembers(teamId: string, users: User[], cTime?: string) {
    const Item = {
      teamId, users, uTime: cTime || new Date().toISOString(),
      ...pickBy({ cTime })
    }
    await ddc.put({ TableName, Item }).promise()
  }
  public async getTeam(teamId: string) {
    const res = await ddc.get({ TableName, Key: { teamId} }).promise()
    const team = res.Item
    if (!team) return void 0
    if (!isTeam(team)) throw new Error('Wrong Team type')

    return team
  }
  public async createTeam(teamId: string) {
    const now = new Date().toISOString()
    const Item: Team = {
      teamId, users: [], cTime: now, uTime: now,
    }
    await ddc.put({ TableName, Item }).promise()
    return Item
  }
  public async listAll() {
    const res = await ddc.scan({ TableName }).promise()
    const teams = res.Items
    if (!tg.isArray(isTeam)(teams)) {
      throw new Error('Wrong teams type')
    }
    return teams
  }
}
