import { ScheduledHandler } from 'aws-lambda'
import ms from 'ms'
import { TeamModel } from '../models/teams.model'
import { putTeamUsers } from '../services/teams.service'
import { getClientByGroup } from '../helpers/bolt-app.helper'

export const index: ScheduledHandler = async (event) => {
  const teams = await new TeamModel().listAll()
  const now = new Date().getTime()
  const promises = teams.map(async team => {
    const diff = now - new Date(team.uTime).getTime()
    if (diff < ms('20m')) return

    const client = await getClientByGroup(team.teamId, team.enterpriseId)
    await putTeamUsers(client, team.teamId)
  })
  await Promise.all(promises)
}
