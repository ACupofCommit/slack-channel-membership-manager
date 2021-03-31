import { Middleware, SlackShortcutMiddlewareArgs, SlackViewMiddlewareArgs } from "@slack/bolt"
import { compact, difference, intersection } from "lodash"
import { startView } from "../models/constants.model"
import { getFirstView, getReportArg } from '../views/common.slack-args'
import { getChannelMemberIds, } from "../models/slack.model"
import { getTeam} from "./teams.service"

export const handleShortcut: Middleware<SlackShortcutMiddlewareArgs> = async ({
  body, ack, client,
}) => {
  await ack();
  const {trigger_id} = body

  const viewOpenArg = getFirstView(trigger_id, {'hello': 'world'})
  await client.views.open(viewOpenArg)
}

export const handleSubmitEmails: Middleware<SlackViewMiddlewareArgs> = async ({
  body, ack, client, payload,
}) => {
  if (!body.team?.id) throw new Error('No team.id')
  // const canFetch = await canFetchUsersInTeam(body.team.id)
  // if (!canFetch) return

  await ack()
  //const {channel_id} = responseUrls[0]

  // move to batch
  // await putTeamUsers(client, body.team.id)

  const channelId: string = body.view.state.values[startView.INPUT_CHANNEL][startView.SELECTED_CHANNEL].selected_conversation
  console.log('channelId: ' + JSON.stringify(channelId))

  const value: string = body.view.state.values[startView.INPUT_EMAILS]?.s?.value
  // mm means Membership Member
  const mmEmails = compact(value.split(',').map(em => em.trim()))

  const team = await getTeam(body.team.id)
  if (!team) throw new Error('No team')
  const usersInTeam = team.users
  // console.log('allMemberArr.length: ' + usersInTeam.length)
  // console.log('allMemberArr[].id: ' + usersInTeam.map(o => o.id).join(','))

  const channelMemberIds = await getChannelMemberIds(client, channelId)
  // console.log('channelMemberIdArr.length: ' + channelMemberIds.length)
  // console.log('channelMemberIdArr: ' + channelMemberIds.join(','))

  const channelHumanEmails = compact(channelMemberIds.map(o => {
    const found = usersInTeam.find(wm => wm.id === o)
    return (found && !found.isBot) ? found.email : null
  }))
  // console.log('channelUserEmails: ' + channelHumanEmails.join(','))

  // const channelBotIds = compact(channelMemberIds.map(o => {
  //   const found = usersInTeam.find(wm => wm.id === o)
  //   return (found && found.isBot) ? found.id : null
  // }))
  // console.log('channelBotIds: ' + channelBotIds.join(','))

  const emailToUser = (email: string) => {
    return usersInTeam.find(o => o.email === email) || null
  }

  const mmEmailsInChannel = intersection(mmEmails, channelHumanEmails)
  const usersWillBeRemoved = compact(difference(channelHumanEmails, mmEmailsInChannel).map(emailToUser))
  const emailsWillBeInvited = difference(mmEmails, mmEmailsInChannel)
  const knownUsersWillBeInvited = compact(emailsWillBeInvited.map(emailToUser))
  const unknownEmailsWillBeInvited = emailsWillBeInvited.filter(email => !emailToUser(email))
  console.log('############################################')
  console.log('# Report')
  console.log('############################################')
  console.log(`# teamId: ${team.teamId}`)
  console.log(`# channelId: ${channelId}`)
  console.log(`# mmEmails: ${mmEmails.join(',')}`)
  console.log(`# mmEmailsInChannel: ${mmEmailsInChannel.join(',')}`)
  console.log(`# knownUsersWillBeInvited: ${knownUsersWillBeInvited.join(',')}`)
  console.log(`# unknownEmailsWillBeInvited: ${unknownEmailsWillBeInvited.join(',')}`)
  console.log(`# usersWillBeRemoved: ${usersWillBeRemoved.map(u => u.id).join(',')}`)
  console.log(`# channelHumanEmails: ${channelHumanEmails.join(',')}`)

  const reportData = { mmEmails, mmEmailsInChannel, knownUsersWillBeInvited, unknownEmailsWillBeInvited, usersWillBeRemoved, channelHumanEmails }
  const arg = getReportArg(channelId, body.user.id, reportData)
  await client.chat.postEphemeral(arg)
}
