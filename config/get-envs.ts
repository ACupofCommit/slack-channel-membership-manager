import { Envs, isEnvSlsStage } from "../src/types/env.type"
import { isNotEmptyString } from "../src/utils/typecheck.util"

const {
  ENV_SLS_STAGE='local',
  ENV_REVISION='local-server',
  SCMM_TABLENAME_PREFIX='SCMM-Local',
} = process.env
const {SCMM_SIGNING_SECRET} = process.env
const {SCMM_CLIENT_ID, SCMM_CLIENT_SECRET} = process.env
const {SCMM_STATE_SECRET} = process.env

export const getEnvs = () => {
  // Through the build-time type check here,
  // environment variables can be used in runtime code without additional type checking.
  if(!isEnvSlsStage(ENV_SLS_STAGE)) throw new Error('Check required env: ENV_SLS_STAGE')

  if(!isNotEmptyString(SCMM_SIGNING_SECRET)) throw new Error('Check required env: SCMM_SIGNING_SECRET')
  if(!isNotEmptyString(SCMM_CLIENT_ID)) throw new Error('Check required env: SCMM_CLIENT_ID')
  if(!isNotEmptyString(SCMM_CLIENT_SECRET)) throw new Error('Check required env: SCMM_CLIENT_SECRET')
  if(!isNotEmptyString(SCMM_STATE_SECRET)) throw new Error('Check required env: SCMM_STATE_SECRET')

  const envs: Envs = {
    ENV_SLS_STAGE,
    ENV_REVISION,
    SCMM_TABLENAME_PREFIX,
    SCMM_SIGNING_SECRET,
    SCMM_CLIENT_ID,
    SCMM_CLIENT_SECRET,
    SCMM_STATE_SECRET,
  }

  return envs
}
