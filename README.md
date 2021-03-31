# Slack channel membership menager

![logo](./docs/logo-512x512.png)

Membership management application for Slack channels.
based on [@slack/bolt](https://github.com/slackapi/bolt-js).

## Install dependencies

```
$ yarn
```

## Environments

```
export ENV_SLS_STAGE=local
export ENV_REVISION='your-git-revision'

export ENV_SLS_STAGE=local
export ENV_REVISION='local-server'
export SCMM_TABLENAME_PREFIX=SCMM-Local
export SCMM_SIGNING_SECRET=<slack app's signing secret>
export SCMM_CLIENT_ID=<slack app's client id>
export SCMM_CLIENT_SECRET=<slack app's client secret>
export SCMM_STATE_SECRET=<state secret>
```

## Development

**Create Local DynamoDB tables:**
```
$ docker run -p 8000:8000 -p8002:8002 -d \
  -eAWS_REGION=$AWS_DEFAULT_REGION -it --rm \
  instructure/dynamo-local-admin
$ npx ts-node bin/create-dynamodb-table.ts
```

**Run Develoment server:**
```
$ yarn dev
```

Slack app's **Socket mode** enabled is required.

## Deployment

```
$ yarn deploy
```

**Logs from AWS:**
```
$ sam logs -n <function-name> -t
```

## Usage

// TODO
