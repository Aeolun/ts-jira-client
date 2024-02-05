import converter from 'api-spec-converter'
import openapiTS from "openapi-typescript";
import * as fs from "fs";

converter.convert({
  from: 'wadl',
  to: 'openapi_3',
  source: 'https://docs.atlassian.com/software/jira/docs/api/REST/9.13.0/jira-rest-plugin.wadl',
}).then(result => {
  fs.writeFileSync('openapi.json', result.stringify())

  return result;
}).then(async result => {
  const schema = await openapiTS('openapi.json', {})
  const cloudSchema = await openapiTS('https://dac-static.atlassian.com/cloud/jira/platform/swagger-v3.v3.json', {})
  const softwareSchema = await openapiTS('https://dac-static.atlassian.com/cloud/jira/software/swagger.v3.json?_v=1.6844.0-0.1297.0', {})
  const serviceDeskSchema = await openapiTS('https://dac-static.atlassian.com/cloud/jira/service-desk/swagger.v3.json', {})
  fs.writeFileSync('src/generated/openapi-server.ts', schema)
  fs.writeFileSync('src/generated/openapi-cloud.ts', cloudSchema)
  fs.writeFileSync('src/generated/openapi-software.ts', softwareSchema)
  fs.writeFileSync('src/generated/openapi-service-desk.ts', serviceDeskSchema)
})
