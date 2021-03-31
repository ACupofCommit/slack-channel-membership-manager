import type { AWS } from '@serverless/typescript'
import { getEnvs } from './config/get-envs'
import packageJson from './package.json'

const {SCMM_TABLENAME_PREFIX, ENV_SLS_STAGE} = getEnvs()
const {AWS_DEFAULT_REGION} = process.env
if (!AWS_DEFAULT_REGION) throw new Error('Check required env: AWS_DEFAULT_REGION')

console.log('REGION: ' + AWS_DEFAULT_REGION)
const serverlessConfiguration: AWS = {
  service: packageJson.name,
  frameworkVersion: '2',
  custom: {
    webpack: {
      packager: 'yarn',
      webpackConfig: './webpack.config.js',
      packagerOptions: {
        noFrozenLockfile: true,
      },
      includeModules: {
        forceExclude: ['aws-sdk'],
      },
    },
    "serverless-offline": {
      lambdaPort: process.env.HTTP_PORT
        ? Number(process.env.HTTP_PORT) + 2
        : 3002,
    },
  },
  // Add the serverless-webpack plugin
  plugins: [
    'serverless-webpack',
    'serverless-offline',
    'serverless-pseudo-parameters',
  ],
  // https://www.serverless.com/framework/docs/deprecations/
  variablesResolutionMode: '20210219',
  provider: {
    name: 'aws',
    stage: ENV_SLS_STAGE,
    // @ts-expect-error
    region: AWS_DEFAULT_REGION,
    lambdaHashingVersion: '20201221',
    runtime: 'nodejs12.x',
    apiGateway: {
      shouldStartNameWithService: true,
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      // https://www.serverless.com/framework/docs/providers/aws/guide/variables#reference-variables-in-javascript-files
    },
    iam: {
      role: {
        statements: [{
          Effect: 'Allow',
          Action: [
            'dynamodb:DescribeTable',
            'dynamodb:Query',
            'dynamodb:Scan',
            'dynamodb:GetItem',
            'dynamodb:PutItem',
            'dynamodb:UpdateItem',
            'dynamodb:DeleteItem',
          ],
          Resource: [
            `arn:aws:dynamodb:#{AWS::Region}:#{AWS::AccountId}:table/${SCMM_TABLENAME_PREFIX}-*`
          ],
        }]
      }
    },
  },
  functions: {
    slack: {
      handler: 'src/handlers/serverless-handler.index',
      events: [
        ...['post','get','put','delete','options'].map(method => ({
          http: {
            method, path: '/slack/{pathname+}',
          }
        })),
      ],
      environment: {
        ...getEnvs(),
      }
    },
    batch: {
      handler: 'src/handlers/batch-handler.index',
      events: [
        {
          schedule: {
            rate: 'rate(5 minutes)'
          }
        }
      ],
      environment: {
        ...getEnvs(),
      }
    }
  }
}

module.exports = serverlessConfiguration
