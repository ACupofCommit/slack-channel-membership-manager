export type EnvSlsStage = 'local' | 'prod'
export const isEnvSlsStage = (o: any): o is EnvSlsStage =>
  ['local','prod'].includes(o)

export interface Envs {
  ENV_SLS_STAGE: EnvSlsStage
  ENV_REVISION: string
  SCMM_TABLENAME_PREFIX: string
  SCMM_SIGNING_SECRET: string
  SCMM_CLIENT_ID: string
  SCMM_CLIENT_SECRET: string
  SCMM_STATE_SECRET: string
}
