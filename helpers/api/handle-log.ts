const Levels = {log: 'LOG', info: 'INFO', error: 'ERROR'};

const output = (level: string, message: string|any, rest) => {
  const msg = rest.length ? message : 'No message';
  
  if (!rest.length || !rest)
    rest = message;

  const string = `(${level}) (${new Date().toISOString()}) ${msg}\n`;
  console.log(string, rest);
  
}

const info = (message?, ...rest: any) => output(Levels.info, message, rest);
const error = (message?, ...rest: any) => output(Levels.error, message, rest);
const log = (message?, ...rest: any) => output(Levels.log, message, rest);

export {info, error, log};