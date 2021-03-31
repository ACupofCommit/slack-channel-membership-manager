import { App} from "@slack/bolt"
import { initialize } from "../src/bolt-routes/main.bolt-routes"

const boltApp = new App({
  token: process.env.SCMM_BOT_TOKEN,
  signingSecret: process.env.SCMM_SIGNING_SECRET,
  clientId: process.env.SCMM_CLIENT_ID,
  clientSecret: process.env.SCMM_CLIENT_SECRET,
  appToken: process.env.SCMM_APP_LEVEL_TOKEN,
  socketMode: true,
});

boltApp.start().then(() => console.log('⚡️ Bolt app started'))
initialize(boltApp)
