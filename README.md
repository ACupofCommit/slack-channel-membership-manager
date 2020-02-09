# slack-channel-membership
Beyond private channel

## 1. Environment

```
export AWS_DEFAULT_REGION=us-west-2
export AWS_ACCESS_KEY_ID=AKXXXXXXXXXXXXXXXXUU
export AWS_SECRET_ACCESS_KEY=M4xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx6Y

export SCM_SLACK_ACCESS_TOKEN=<slack bot token. only for test>
export SCM_LAMBDA_EXCUTION_ROLE_ARN=<get this from terraform state>

export TF_VAR_SCM_PROJECT_NAME=slack-channel-membership
export TF_VAR_SCM_MANAGER_EMAIL=<your email address>
```

## 2. Development

### 2.1. Run development server
```
$ yarn install
$ yarn dev
```

Open `http://localhost:3005` in your browser.

### 2.2. Get public URLs for exposing your local web server
Use the tunneling solution like [ngrok](https://ngrok.com/)
to allow Slack to send requests to your development server.

```
$ ngrok http 3005
```

### 2.3. Set Slack app
- Slack Commands: `<development server endpoint>/slack/command`
- Interactive Components: `<development server endpoint>/slack/action`


## 3. Infrastructure

```
$ terraform init
```
