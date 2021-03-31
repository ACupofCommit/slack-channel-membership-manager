import { InputBlock, ViewsOpenArguments, SectionBlock, ChatPostEphemeralArguments} from '@slack/web-api'
import { CONST_APP_NAME, startView } from '../models/constants.model'
import { User } from '../types/teams.type'

export const getInputContentBlock = (label: string, placeholder: string): InputBlock => {
  return {
    "type": "input",
    "block_id": startView.INPUT_EMAILS,
    "element": {
      action_id: 's',
      "type": "plain_text_input",
      "multiline": true,
      "placeholder": { "type": "plain_text", "text": placeholder, "emoji": true },
    },
    "label": { "type": "plain_text", "text": label, "emoji": true },
  }
}

export const getErrorMsgBlockInView = (msg: string) => {
  const sectionBlock: SectionBlock = {
    "type": "section",
    "text": { type: "plain_text", text: ':warning: ' + msg, emoji: true }
  }
  return sectionBlock
}

export const getFirstView = (trigger_id: string, pm: any): ViewsOpenArguments => {
  return {
    trigger_id,
    view: {
      private_metadata: JSON.stringify(pm),
      "callback_id": startView.SUBMIT,
      "type": "modal",
      "title": { "type": "plain_text", "text": CONST_APP_NAME, "emoji": true },
      "submit": { "type": "plain_text", "text": "Start", "emoji": true  },
      "close": { "type": "plain_text", "text": "Cancel", "emoji": true },
      "blocks": [
        { ...getInputContentBlock("Comma seperated Email", "a@exmaple.com,b@example.com") },
        {
          "block_id": startView.INPUT_CHANNEL,
          "type": "input",
          "optional": true,
          "label": {
            "type": "plain_text",
            "text": `체크할 할 채널을 선택하세요.`,
          },
          "element": {
            "action_id": startView.SELECTED_CHANNEL,
            "type": "conversations_select",
            default_to_current_conversation: true,
            // response_url_enabled: true,
            filter: {
              exclude_bot_users: true,
              exclude_external_shared_channels: true,
              // 보안이 취약한 public 채널에 익명의 누군가가
              // 악의적인 행동 정보(유출 or 타인 비방)을 할 수 있으므로
              // private 채널만 지원한다.
              // 추후에는 관리자가 선택할 수 있도록 제공하면 좋겠다.
              include: ['private'],
            },
          },
        },
      ]
    }
  }
}


const sectionMrkdwn = (text: string): SectionBlock => {
  return {
    "type": "section",
    "text": { "type": "mrkdwn", "text": text },
  }
}

interface IReportData {
  // mm: membership member
  mmEmails: string[]
  mmEmailsInChannel: string[]
  knownUsersWillBeInvited: User[]
  unknownEmailsWillBeInvited: string[]
  usersWillBeRemoved: User[]
  channelHumanEmails: string[]
}

export const getReportArg = (channelId: string, userId: string, reportData: IReportData): ChatPostEphemeralArguments => {
  const { mmEmails, mmEmailsInChannel, knownUsersWillBeInvited, unknownEmailsWillBeInvited, usersWillBeRemoved, channelHumanEmails } = reportData
  const humansWillBeRemoved = usersWillBeRemoved.filter(o => !o.isBot)
  // const botsWillBeRemoved = usersWillBeRemoved.filter(o => o.isBot)

  return {
    text: '',
    channel: channelId,
    user: userId,
    blocks: [
      sectionMrkdwn(`:credit_card: 멤버쉽: *${mmEmails.length}*, 채널 멤버: *${channelHumanEmails.length}*, 채널 멤버쉽 멤버: *${mmEmailsInChannel.length}*`),
      // sectionMrkdwn(`*:credit_card: 채널 내 멤버쉽 유저*: ${mmEmailsInChannel.length}/${mmEmails.length}`),
      sectionMrkdwn(`*:handshake: 초대해야 할 멤버(${knownUsersWillBeInvited.length})*: ${knownUsersWillBeInvited.map(o => o.email).join(',')}`),
      sectionMrkdwn(`*:interrobang: 초대해야 하지만 워크스페이스에 없는 멤버(${unknownEmailsWillBeInvited.length})*: ${unknownEmailsWillBeInvited.join(',')}`),
      sectionMrkdwn(`*:no_entry_sign: 내보내야 할 멤버(${humansWillBeRemoved.length})*: ${humansWillBeRemoved.map(o => `<@${o.id}>`).join(',')}`),
      // sectionMrkdwn(`*:no_entry_sign: 내보내야 할 봇(${botsWillBeRemoved.length})*: ${botsWillBeRemoved.map(o => `@${o.id}`).join(',')}`),
    ]
  }
}

