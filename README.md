# Typescript JIRA API for node.js #

A Typescript wrapper for the Jira Rest API, now in Typescript. I had this as a fork of `jira-client` for a while, but I felt the need to completely split it up to modernize it (as well as give myself an easier time deploying). 

I've tried to keep the api as close to the original api as possible, but sometimes I've had to make compromises. Where possible any legacy calls have been removed, and replaced with what made most sense considering the latest versions of Jira Datacenter, Cloud, Software and Service Desk.

> [!WARNING]  
> Types have been sourced wherever they exist (cloud has more type definitions, either in docs or openapi, than server/datacenter, but no guarantee they are compatible).

If you find any conflicts, or have any suggestions, please feel free to open an issue or a pull request.

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE.md)
[![Documentation](https://img.shields.io/badge/Documentation--green.svg)](https://ts-jira-client.github.io/)
[![Jira Rest API](https://img.shields.io/badge/Jira%20Rest%20API--green.svg)](https://docs.atlassian.com/software/jira/docs/api/REST/latest/)
[![Run tests](https://github.com/aeolun/ts-jira-client/workflows/Test%20and%20release/badge.svg)](https://github.com/aeolun/ts-jira-client/actions)
[![npm](https://img.shields.io/npm/v/ts-jira-client.svg)](https://www.npmjs.com/package/ts-jira-client)
[![Downloads](https://img.shields.io/npm/dm/ts-jira-client.svg)](https://npmjs.com/ts-jira-client)
[![Install Size](https://packagephobia.now.sh/badge?p=ts-jira-client)](https://packagephobia.now.sh/result?p=ts-jira-client)

## Installation ##

Install with the node package manager [pnpm](https://pnpm.io/):

```shell
$ pnpm install ts-jira-client
```

## Examples ##

### Create the JIRA client ###

```typescript
import { JiraApi } from 'ts-jira-client';

// Initialize
var jira = new JiraApi({
  protocol: 'https', // default is https
  host: 'jira.somehost.com', // REQUIRED
  username: 'username',
  password: 'password',
  apiVersion: '2', // default is 2
  strictSSL: true // default is true
});
```

### Find the status of an issue ###

```typescript
async function logIssueName() {
  try {
    const issue = await jira.findIssue(issueNumber);
    console.log(`Status: ${issue.fields.status.name}`);
  } catch (err) {
    console.error(err);
  }
}
logIssueName();
```

## Documentation ##
Can't find what you need in the readme? Check out our documentation here: https://ts-jira-client.github.io/
