require(`dotenv`).config();

module.exports = {
  serverUrl: process.env.ELASTIC_APM_SERVER_URL,  // E.g. https://my-deployment-name.apm.us-west2.gcp.elastic-cloud.com
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
  serviceName: process.env.ELASTIC_APM_SERVICE_NAME,
  active: process.env.ELASTIC_APM_ACTIVE === "true",
  logLevel: process.env.ELASTIC_APM_LOG_LEVEL
}