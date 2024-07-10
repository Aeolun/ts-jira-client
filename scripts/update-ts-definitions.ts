import converter from 'api-spec-converter'
import openapiTS from "openapi-typescript";
import * as fs from "fs";
import {mkdirSync} from "node:fs";

converter.convert({
  from: 'wadl',
  to: 'openapi_3',
  source: 'https://docs.atlassian.com/software/jira/docs/api/REST/9.13.0/jira-rest-plugin.wadl',
}).then(result => {
  fs.writeFileSync('openapi.json', result.stringify())

  return result;
}).then(async result => {
  mkdirSync('src/generated', { recursive: true })

  try {
    const schema = await openapiTS('openapi.json', {})
    fs.writeFileSync('src/generated/openapi-server.ts', schema)
  } catch(error) {
    console.error("Error while downloading jira rest api schema", error)
  }

  try {
  const cloudSchema = await openapiTS('https://dac-static.atlassian.com/cloud/jira/platform/swagger-v3.v3.json', {})
    fs.writeFileSync('src/generated/openapi-cloud.ts', cloudSchema)
    } catch(error) {
    console.error("Error while downloading jira cloud api schema", error)

  }
  try {
    const softwareSchema = await openapiTS('https://dac-static.atlassian.com/cloud/jira/software/swagger.v3.json', {})
    fs.writeFileSync('src/generated/openapi-software.ts', softwareSchema)
  } catch(error) {
    console.error("Error while downloading jira software api schema", error)
  }
  try {
    const serviceDeskSchema = await openapiTS('https://dac-static.atlassian.com/cloud/jira/service-desk/swagger.v3.json', {})


    fs.writeFileSync('src/generated/openapi-service-desk.ts', serviceDeskSchema)
  } catch(error) {
    console.error("Error while downloading jira service desk api schema", error)
  }
})
