import { Envs } from "../types/env.type"

// The `as any` type assumption can be used only when the type check completion is guaranteed at build time.

// You can do this by adding a type checking codes to the `serverless.ts` file.
const envs: Envs = process.env as any
export const ENV_SLS_STAGE = envs.ENV_SLS_STAGE
export const ENV_REVISION = envs.ENV_REVISION
export const SCMM_TABLENAME_PREFIX = envs.SCMM_TABLENAME_PREFIX
// SCMM means Channel Membership Manager

// Using AWS Lambda environment variables
// https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/configuration-envvars.html#configuration-envvars-runtime
export const AWS_REGION = process.env.AWS_REGION
export const AWS_LAMBDA_FUNCTION_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME
export const AWS_LAMBDA_FUNCTION_MEMORY_SIZE = process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE
export const AWS_LAMBDA_FUNCTION_VERSION = process.env.AWS_LAMBDA_FUNCTION_VERSION

export const startView = {
  OPEN: 'START_VIEW_OPEN',
  SUBMIT: 'START_VIEW_SUBMIT',
  SELECTED_CHANNEL: 'START_VIEW_SELECTED_CHANNEL', // 채널 변경할 때?
  INPUT_CHANNEL: 'START_VIEW_INPUT_CHANNEL',   // Submit 시 선택된 채널
  INPUT_EMAILS: 'START_VIEW_INPUT_EMAILS'
}

export const CONST_APP_NAME = 'Channel Membership'

export const TABLENAME_SCMM_OAUTH_TOKENS = `${SCMM_TABLENAME_PREFIX}-OAuth-Tokens`
export const TABLENAME_SCMM_CHANNELS = `${SCMM_TABLENAME_PREFIX}-Channels`
export const TABLENAME_SCMM_TEAMS = `${SCMM_TABLENAME_PREFIX}-Teams`
