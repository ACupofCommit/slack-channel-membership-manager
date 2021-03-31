import { CreateTableInput } from 'aws-sdk/clients/dynamodb'
import { getDD } from '../src/utils/common.util'
import { TABLENAME_SCMM_OAUTH_TOKENS, TABLENAME_SCMM_CHANNELS, TABLENAME_SCMM_TEAMS } from '../src/models/constants.model'

const paramInstallations: CreateTableInput = {
  AttributeDefinitions: [
    { AttributeName: 'key', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'key', KeyType: 'HASH' },
  ],
  BillingMode: 'PAY_PER_REQUEST',
  TableName: TABLENAME_SCMM_OAUTH_TOKENS,
  StreamSpecification: {
    StreamEnabled: false,
  },
}

const paramChannels: CreateTableInput = {
  BillingMode: 'PAY_PER_REQUEST',
  TableName: TABLENAME_SCMM_CHANNELS,
  AttributeDefinitions: [
    { AttributeName: 'enterpriseId', AttributeType: 'S' },
    { AttributeName: 'teamId', AttributeType: 'S' },
    { AttributeName: 'channelId', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'channelId', KeyType: 'HASH' },
  ],
  GlobalSecondaryIndexes: [
    {
      Projection: { ProjectionType: 'KEYS_ONLY' },
      IndexName: 'IndexTeamId',
      KeySchema: [
        { AttributeName: 'teamId', KeyType: 'HASH' },
      ],
    },
    {
      Projection: { ProjectionType: 'KEYS_ONLY' },
      IndexName: 'IndexEnterpriseId',
      KeySchema: [
        { AttributeName: 'enterpriseId', KeyType: 'HASH' },
      ],
    },
  ],
  StreamSpecification: {
    StreamEnabled: false
  },
}

const teamsParam: CreateTableInput = {
  BillingMode: 'PAY_PER_REQUEST',
  TableName: TABLENAME_SCMM_TEAMS,
  AttributeDefinitions: [
    { AttributeName: 'teamId', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'teamId', KeyType: 'HASH' },
  ],
  StreamSpecification: {
    StreamEnabled: false
  },
}

const run = async () => {
  console.log('Start create dynamoDB tables!')
  const ddb = getDD()

  await ddb.createTable(teamsParam).promise()
  console.log("Table Created: " + teamsParam.TableName)

  await ddb.createTable(paramInstallations).promise()
  console.log("Table Created: " + paramInstallations.TableName)

  await ddb.createTable(paramChannels).promise()
  console.log("Table Created: " + paramChannels.TableName)
}

if (require.main === module) {
  if (!process.env.AWS_DEFAULT_REGION) {
    console.log('AWS_DEFAULT_REGION is required')
    process.exit(1)
  }
  console.log('AWS_DEFAULT_REGION: ' + process.env.AWS_DEFAULT_REGION)
  console.log('DYNAMODB_ENDPOINT: ' + process.env.DYNAMODB_ENDPOINT)
  run().catch(err => console.error(err))
}
