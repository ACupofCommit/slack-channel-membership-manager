import { App } from '@slack/bolt'
import { startView} from '../models/constants.model'
import { handleShortcut, handleSubmitEmails} from '../services/main.service'

export const initialize = (boltApp: App) => {

  // activation
  boltApp.shortcut(startView.OPEN, handleShortcut)
  boltApp.view(startView.SUBMIT, handleSubmitEmails)

  boltApp.error(async (err) => {
    // Check the details of the error to handle cases where you should retry sending a message or stop the app
    console.error('Unknown error catch:')
    console.error(err)
    console.error('JSON.strinfity(err)')
    console.error(JSON.stringify(err))
  })
}
