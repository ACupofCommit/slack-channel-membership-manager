import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Installation } from '@slack/oauth'
import { createLogger } from '../utils/logger';
import { getDDC } from '../utils/common.util';
import { isOAuthToken, KeyType } from '../types/oauth-tokens.type'
import { TABLENAME_SCMM_OAUTH_TOKENS as TableName } from './constants.model'

const ddc = getDDC()
const logger = createLogger('oauth-tokens.model')

export const setToken = async (key: string, keyType: KeyType, installation: Installation<'v2'>) => {
  const Item = { key, keyType, installation }
  const params: DocumentClient.PutItemInput = { TableName, Item }
  await ddc.put(params).promise()
}

export const getToken = async (key: string) => {
  logger.debug(`getAT. key: ${key}`)
  const params: DocumentClient.GetItemInput = { TableName, Key: { key }}
  const { Item } = await ddc.get(params).promise()
  if (!Item) return void 0

  if (!isOAuthToken(Item)) throw new Error(`Can not get token by key: ${key}`)

  return Item.installation
}
