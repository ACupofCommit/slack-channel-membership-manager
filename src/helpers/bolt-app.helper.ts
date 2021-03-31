import { WebClient } from "@slack/web-api"
import { getToken } from "../models/oauth-tokens.model"

export const getClientByGroup = async (teamId: string, enterpriseId?: string) => {
  const installation = await getToken(teamId)
    || (enterpriseId ? await getToken(enterpriseId) : void 0)

  if (!installation) throw new Error('No installation by teamId: ' + teamId)

  const token = installation.bot?.token
  if (!token) throw new Error('Can not get token by teamId: ' + teamId)

  return new WebClient(token)
}
