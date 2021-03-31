import ms from 'ms'
import { compact } from 'lodash'
import { WebClient } from "@slack/web-api"
import { Member } from 'seratch-slack-types/web-api/UsersListResponse'
import { ConversationsMembersResponse} from 'seratch-slack-types/web-api'
import { UsersListResponse } from 'seratch-slack-types/web-api'
import { User } from '../types/teams.type'
import { TeamModel } from './teams.model'

const slackMemberToUser = (o: Member) => {
  const id = o.id
  if (!id) throw new Error('No id')

  // slackbot
  if (id === 'USLACKBOT') return null


  const email = o.profile?.email
  const isBot = o.is_bot
  if (!isBot && !email) {
    console.log(o)
    throw new Error('User must have email')
  }

  if (isBot) return null

  // @ts-expect-error
  if (o.is_deleted) return null

  return {
    id, email, botId: o.profile?.bot_id, isDeleted: o.deleted,
    isAdmin: o.is_admin, isBot, isOwner: o.is_owner,
  }
}

export const getChannelMemberIds = async (wc: WebClient, channel: string): Promise<string[]> => {
  let cursor: string | undefined = void 0
  let arr: string[] = []
  let i = 0
  do {
    const res: ConversationsMembersResponse = await wc.conversations.members({ channel, cursor, limit: 200 })
    if (!res.members) throw new Error('No members')
    if (!res.response_metadata) throw new Error('No reponse_metadata')
    arr = [...arr, ...res.members]

    cursor = res.response_metadata.next_cursor
    i++
  } while(cursor && i < 15)

  return arr
}

export const getAllUsersInTeam = async (wc: WebClient): Promise<User[]> => {
  let cursor: string | undefined = void 0
  let users: User[] = []
  let i = 0
  do {
    console.log('try: ' + i++)
    const res: UsersListResponse = await wc.users.list({ cursor, limit: 200 })
    if (!res.members) throw new Error('No members')
    if (!res.response_metadata) throw new Error('No reponse_metadata')

    const newUsers = compact(res.members.map(slackMemberToUser))

    users = [...users, ...newUsers]
    cursor = res.response_metadata.next_cursor
    i++
  } while (cursor && i < 20)

  return users
}

export const canFetchUsersInTeam = async (teamId: string) => {
  const tm = new TeamModel()
  const teamFromDB = await tm.getTeam(teamId)
  const team = teamFromDB ? teamFromDB : await tm.createTeam(teamId)

  const now = new Date().getTime()
  const diff = now - new Date(team?.uTime || team.cTime).getTime()
  return !teamFromDB || diff > ms('5m')
}


