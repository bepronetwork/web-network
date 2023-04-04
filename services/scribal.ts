import Scribal from "@taikai/scribal";

const ScribalConfig = {
  logService: {
    console: {
      silent: false,
      logLevel: (process.env.LOG_LEVEL || 'debug') as any,
    },
    elastic: {
      silent: process.env.LOG_TO_ELASTIC === 'false',
      level: (process.env.LOG_LEVEL || 'debug') as any,
    },
    file: {
      silent: process.env.LOG_TO_FILE === 'false',
      logLevel: (process.env.LOG_LEVEL || 'debug') as any,
      logFileDir: process.env.LOG_FILE_DIR || 'logs',
      logDailyRotation: process.env.DAILY_ROTATION_FILE === 'true',
      logDailyRotationOptions: {
        maxSize: process.env.DAILY_ROTATION_FILE_MAX_SIZE || '20m',
        datePattern: process.env.DAILY_ROTATION_FILE_DATE_PATTERN || 'YYYY-MM-DD',
      },
    },
  }
}

export default (() => {
  const appName = process.env.LOG_APP_NAME || `bepro-events`;
  const hostname = process.env.LOG_HOST_NAME || `localhost`;

  const scribal = new Scribal([]);
  scribal.init({appName, hostname, version: '*', ...ScribalConfig.logService});

  return scribal;
})()