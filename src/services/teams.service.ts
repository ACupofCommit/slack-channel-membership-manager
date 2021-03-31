import { WebClient } from '@slack/web-api'
import { getAllUsersInTeam } from '../models/slack.model'
import { TeamModel } from '../models/teams.model'

export const getTeam = async (teamId: string) => {
  const tm = new TeamModel()
  const team = await tm.getTeam(teamId)
  return team
}

export const putTeamUsers = async (client: WebClient, teamId: string) => {
  const tm = new TeamModel()
  const users = await getAllUsersInTeam(client)
  const team = await tm.getTeam(teamId)
  console.log(`done putTeamUsers. users.length: ${users.length}`)
  await tm.putMembers(teamId, users, team ? void 0 : new Date().toISOString())
}
