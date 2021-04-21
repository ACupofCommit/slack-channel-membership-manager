import { App, ExpressReceiver } from '@slack/bolt'
import serverlessExpress from '@vendia/serverless-express'
import { getEnvs } from '../../config/get-envs'
import { initialize } from '../bolt-routes/main.bolt-routes'
import { getClientByGroup } from '../helpers/bolt-app.helper'
import { getToken, setToken } from '../models/oauth-tokens.model'
import { putTeamUsers } from '../services/teams.service'
import { isInstallationV2, KeyType } from '../types/oauth-tokens.type'

const {SCMM_CLIENT_ID, SCMM_SIGNING_SECRET} = getEnvs()
const {SCMM_CLIENT_SECRET, SCMM_STATE_SECRET} = getEnvs()

// Initialize your custom receiver
export const expressReceiver = new ExpressReceiver({
  signingSecret: SCMM_SIGNING_SECRET,
  // The `processBeforeResponse` option is required for all FaaS environments.
  // It allows Bolt methods (e.g. `app.message`) to handle a Slack request
  // before the Bolt framework responds to the request (e.g. `ack()`). This is
  // important because FaaS immediately terminate handlers after the response.
  processBeforeResponse: true,

  clientId: SCMM_CLIENT_ID,
  clientSecret: SCMM_CLIENT_SECRET,
  stateSecret: SCMM_STATE_SECRET,
  scopes: ['app_mentions:read','chat:write','commands','groups:read','users:read','users:read.email'],
  installationStore: {
    storeInstallation: async (installation) => {
      console.log('New installation!')
      const {isEnterpriseInstall, enterprise, team} = installation
      const key = isEnterpriseInstall ? enterprise?.id : team?.id
      const keyType: KeyType = isEnterpriseInstall ? 'enterprise' : 'team'
      if (!key) throw new Error(`No key when isEnterpriseInstall: ${isEnterpriseInstall}`)
      console.log(`key: ${key}, keyType: ${keyType}`)

      if (!isInstallationV2(installation)) throw new Error('installation is not v2')

      await setToken(key, keyType, installation)

      const teamId = team?.id
      if (teamId) {
        // Fetch initial all team's members
        const client = await getClientByGroup(teamId, installation.enterprise?.id)
        await putTeamUsers(client, teamId)
      }
    },
    fetchInstallation: async (installQuery) => {
      console.log('called fetchInstallation()')
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId) {
        const installation = await getToken(installQuery.enterpriseId)
        if (!installation) throw new Error('No installation by enterpriseId')
        return installation
      }

      if (!installQuery.teamId) throw new Error('No installQuery.teamId')

      const installation = await getToken(installQuery.teamId)
      if (!installation) throw new Error('No installation by teamId')
      return installation
    },
  },
})

const boltApp = new App({
  receiver: expressReceiver,
})

initialize(boltApp)

// Handle the Lambda function event
export const index = serverlessExpress({
  app: expressReceiver.app
});
